import { ConflictException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository, ArrayContains } from "typeorm";
import { ParkingLot } from "./entities/parking-lot.entity";
import { VehicleService } from "src/vehicles/vehicle.service";
import { CustomHttpException } from "src/common/CustomHttpException.exception";
import { ParkingTicketService } from "src/parking-tickets/parking-ticket.service";
import { TicketsFilter } from "src/common/enums.enum";
import { ParkingTicket } from "src/parking-tickets/entities/parking-ticket.entity";

@Injectable()
export class ParkingLotService {
	constructor(
		@InjectRepository(ParkingLot)
		private readonly parkingLotRepository: Repository<ParkingLot>,

		private readonly vehicleService: VehicleService,

		private readonly parkingTicketService: ParkingTicketService,
	) { }

	// Core methods
	async findAll(tickets?: TicketsFilter): Promise<ParkingLot[]> {
		return await this.filterTickets(tickets)().getMany();
	}

	async findOne(id: number, tickets: TicketsFilter = TicketsFilter.NONE): Promise<ParkingLot | undefined> {
		return await this.filterTickets(tickets)().andWhere('parkingLot.id = :id', { id }).getOneOrFail();
	}

	async create(parkingLot: ParkingLot): Promise<ParkingLot> {
		if (await this.isCnpjDuplicated(parkingLot.cnpj)) {
			throw new ConflictException("CNPJ already in use");
		}

		return await this.parkingLotRepository.save(parkingLot);
	}

	async parkVehicle(id: number, vehicleId: number): Promise<ParkingLot | undefined | any> {
		const parkingLot = await this.findOne(id, TicketsFilter.ALL); // Should be TicketsFilter.OPEN, read line 143
		if (!parkingLot) {
			throw new NotFoundException("Parking Lot doesn't exist");
		}

		const vehicle = await this.vehicleService.findOne(vehicleId);
		if (!vehicle) {
			throw new NotFoundException("Vehicle doesn't exist");
		}

		// Checking if vehicle is already in this parking lot
		const currentParkingTicket = await this.parkingTicketService.findCurrentTicket(vehicle.id);
		if (currentParkingTicket && currentParkingTicket.parkingLot.id == parkingLot.id) {
			throw new CustomHttpException("Vehicle already in this parking lot", 202);
		}

		// Checking vehicle capacity
		const { cars, motorcycles } = await this.countVehicles(parkingLot);

		if ((vehicle.type == "car" && cars < parkingLot.carCapacity) ||
			vehicle.type == "motorcycle" && motorcycles < parkingLot.motorcycleCapacity) {
			/* For this scenario, we ignore if the vehicle is in another parking lot,
			simply moving it to this one */

			// Closing previous parking ticket, if there is one
			if (currentParkingTicket) {
				currentParkingTicket.exitTime = new Date();
				await this.parkingTicketService.save(currentParkingTicket);
			}

			// Creating parking ticket
			const newParkingTicket = await this.parkingTicketService.create(parkingLot, vehicle);

			return {
				message: "Vehicle parked successfully",
				parkingTicket: {
					...newParkingTicket,
					parkingLot: { ...newParkingTicket.parkingLot, parkingTickets: undefined },
					vehicle: { ...newParkingTicket.vehicle }
				}
			};
		}

		throw new ConflictException(`${vehicle.type} capacity is full`);
	}

	async empty(id: number): Promise<ParkingLot | undefined | any> {
		const parkingLot = await this.findOne(id, TicketsFilter.ALL);
		if (!parkingLot) {
			throw new NotFoundException("Parking Lot doesn't exist");
		}

		await parkingLot.parkingTickets.forEach(async (ticket) => {
			if (ticket.exitTime == null) {
				ticket.exitTime = new Date();
				await this.parkingTicketService.save(ticket);
			}
		});

		return { message: "Parking lot emptied successfully" };
	}

	async summary(id: number, date: string, perHour: boolean): Promise<any> {
		const tickets = await this.parkingTicketService.findAllTicketsByParkingLot(id, date);

		const _date = date == "alltime" ? null : new Date(date);
		const start = date == "alltime" ? new Date(new Date(-8640000000000000).setUTCHours(0, 0, 0, 0)) : new Date(_date.setUTCHours(0, 0, 0, 0));
		const end = date == "alltime" ? new Date(new Date().setUTCHours(23, 59, 59, 999)) : new Date(_date.setUTCHours(23, 59, 59, 999));

		const isBetween = (hour: Date, start: Date, end: Date) => hour >= start && hour <= end;

		function countTickets() {
			let carsParked = 0;
			let carsUnparked = 0;
			let motorcyclesParked = 0;
			let motorcyclesUnparked = 0;

			tickets.forEach((ticket) => {
				if (ticket.entryTime && isBetween(ticket.entryTime, start, end)) {
					if (ticket.vehicle.type == "car") carsParked++;
					else motorcyclesParked++;
				}

				if (ticket.exitTime && isBetween(ticket.exitTime, start, end)) {
					if (ticket.vehicle.type == "car") carsUnparked++;
					else motorcyclesUnparked++;
				}
			});

			return {
				carsParked,
				carsUnparked,
				motorcyclesParked,
				motorcyclesUnparked
			};
		}

		function countTicketsPerHour() {
			let _hour;
			let countsTemplate = {
				carsParked: 0,
				carsUnparked: 0,
				motorcyclesParked: 0,
				motorcyclesUnparked: 0
			};

			let info = {};

			tickets.forEach((ticket) => {
				if (ticket.entryTime && isBetween(ticket.entryTime, start, end)) {
					_hour = ticket.entryTime.getHours();

					if (!info.hasOwnProperty(_hour)) {
						info[_hour] = { ...countsTemplate };
					}

					if (ticket.vehicle.type == "car") info[_hour].carsParked++;
					else info[_hour].motorcyclesParked++;
				}

				if (ticket.exitTime && isBetween(ticket.exitTime, start, end)) {
					_hour = ticket.exitTime.getHours();

					if (!info.hasOwnProperty(_hour)) {
						info[_hour] = { ...countsTemplate };
					}

					if (ticket.vehicle.type == "car") info[_hour].carsUnparked++;
					else info[_hour].motorcyclesUnparked++;
				}
			});

			return info;
		}

		return perHour.toString() === "true" ? countTicketsPerHour() : countTickets();
	}

	async update(id: number, parkingLot: ParkingLot): Promise<ParkingLot | undefined> {
		if (!await this.findOne(id)) {
			throw new NotFoundException("Parking Lot doesn't exist");
		}

		if (parkingLot.cnpj !== undefined && await this.isCnpjDuplicated(parkingLot.cnpj, id)) {
			throw new ConflictException("CNPJ already in use");
		}

		await this.parkingLotRepository.update(id, parkingLot);
		return await this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.parkingLotRepository.delete(id);
	}

	// Extra methods
	filterTickets(tickets: TicketsFilter) {
		/* Note: I did want to use the repository method but the nested
		where condition simply did not work. Here's a thread on GitHub
		where people are discussing the same problem I encountered:
		https://github.com/typeorm/typeorm/issues/3890 */

		const filterOptions = {
			"all": () => this.parkingLotRepository
				.createQueryBuilder("parkingLot")
				.leftJoinAndSelect("parkingLot.parkingTickets", "parkingTickets")
				.leftJoinAndSelect("parkingTickets.vehicle", "vehicle"),
			"open": () => this.parkingLotRepository.createQueryBuilder("parkingLot")
				.leftJoinAndSelect("parkingLot.parkingTickets", "parkingTickets")
				.leftJoinAndSelect("parkingTickets.vehicle", "vehicle")
				.andWhere('parkingTickets.exitTime IS NULL'),
			"closed": () => this.parkingLotRepository.createQueryBuilder("parkingLot")
				.leftJoinAndSelect("parkingLot.parkingTickets", "parkingTickets")
				.leftJoinAndSelect("parkingTickets.vehicle", "vehicle")
				.andWhere('parkingTickets.exitTime IS NOT NULL'),
			"none": () => this.parkingLotRepository
				.createQueryBuilder("parkingLot")
		};

		return filterOptions[tickets];
	}

	async isCnpjDuplicated(cnpj: string, id: number | null = null): Promise<boolean> {
		let existingParkingLot;

		if (id !== null) {
			existingParkingLot = await this.parkingLotRepository.findOne({ where: { cnpj, id: Not(id) } });
		} else {
			existingParkingLot = await this.parkingLotRepository.findOne({ where: { cnpj } });
		}

		return !!existingParkingLot;
	}

	async countVehicles(parkingLot: ParkingLot): Promise<any> {
		return {
			cars: parkingLot.parkingTickets.reduce((count: number, ticket: ParkingTicket) => count + (ticket.vehicle.type == "car" && ticket.exitTime == null ? 1 : 0), 0) as number,
			motorcycles: parkingLot.parkingTickets.reduce((count: number, ticket: ParkingTicket) => count + (ticket.vehicle.type == "motorcycle" && ticket.exitTime == null ? 1 : 0), 0) as number
		}
	}
}
