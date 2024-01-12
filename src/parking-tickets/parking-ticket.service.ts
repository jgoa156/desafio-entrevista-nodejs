import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, IsNull, Repository } from "typeorm";
import { ParkingTicket } from "./entities/parking-ticket.entity";
import { ParkingLot } from "src/parking-lots/entities/parking-lot.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";

@Injectable()
export class ParkingTicketService {
	constructor(
		@InjectRepository(ParkingTicket)
		private readonly parkingTicketRepository: Repository<ParkingTicket>,
	) { }

	// Core methods
	async findOne(id: number): Promise<ParkingTicket | undefined> {
		return await this.parkingTicketRepository.findOne({ where: { id }, relations: ["vehicles"] });
	}

	async findCurrentTicket(vehicleId: number): Promise<ParkingTicket | undefined> {
		return await this.parkingTicketRepository.findOne({ where: { exitTime: IsNull(), vehicle: { id: vehicleId } }, relations: ["parkingLot", "vehicle"] });
	}

	async findAllTicketsByParkingLot(parkingLotId: number, date: string): Promise<ParkingTicket[] | undefined> {
		if (date == "alltime") {
			return await this.parkingTicketRepository
				.createQueryBuilder("parkingTicket")
				.leftJoinAndSelect("parkingTicket.vehicle", "vehicle")
				.andWhere("parkingTicket.parkingLot.id = :parkingLotId", { parkingLotId })
				.getMany();
		}

		const _date = new Date(date);
		const start = new Date(_date.setUTCHours(0, 0, 0, 0));
		const end = new Date(_date.setUTCHours(23, 59, 59, 999));

		return await this.parkingTicketRepository
			.createQueryBuilder("parkingTicket")
			.leftJoinAndSelect("parkingTicket.vehicle", "vehicle")
			.where("(parkingTicket.entryTime BETWEEN :start AND :end OR parkingTicket.exitTime BETWEEN :start AND :end)", { start, end })
			.andWhere("parkingTicket.parkingLot.id = :parkingLotId", { parkingLotId })
			.getMany();
	}

	async create(parkingLot: ParkingLot, vehicle: Vehicle): Promise<ParkingTicket> {
		const ticket = new ParkingTicket();
		ticket.entryTime = new Date();
		ticket.vehicle = vehicle;
		ticket.parkingLot = parkingLot;

		return this.parkingTicketRepository.save(ticket);
	}

	async save(parkingTicket: ParkingTicket): Promise<ParkingTicket> {
		return await this.parkingTicketRepository.save(parkingTicket);
	}
}
