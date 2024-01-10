import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ParkingLot } from './entities/parking-lot.entity';
import { VehicleService } from 'src/vehicles/vehicle.service';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { CustomHttpException } from 'src/common/CustomHttpException.exception';

@Injectable()
export class ParkingLotService {
	constructor(
		@InjectRepository(ParkingLot)
		private readonly parkingLotRepository: Repository<ParkingLot>,

		private readonly vehicleService: VehicleService,
	) { }

	// Core methods
	async findAll(): Promise<ParkingLot[]> {
		return await this.parkingLotRepository.find({ relations: ["vehicles"] });
	}

	async findOne(id: number): Promise<ParkingLot | undefined> {
		return await this.parkingLotRepository.findOne({ where: { id }, relations: ["vehicles"] });
	}

	async create(parkingLot: ParkingLot): Promise<ParkingLot> {
		if (await this.isCnpjDuplicated(parkingLot.cnpj)) {
			throw new ConflictException("CNPJ already in use");
		}

		return await this.parkingLotRepository.save(parkingLot);
	}

	async addVehicle(id: number, vehicleId: number): Promise<ParkingLot | undefined> {
		const parkingLot = await this.findOne(id);
		if (!parkingLot) {
			throw new NotFoundException("Parking Lot doesn't exist");
		}

		const vehicle = await this.vehicleService.findOne(vehicleId);
		if (!vehicle) {
			throw new NotFoundException("Vehicle doesn't exist");
		}

		// Checking if vehicle is already in this parking lot
		if (vehicle.parkingLot && vehicle.parkingLot.id === parkingLot.id) {
			throw new CustomHttpException("Vehicle already in this parking lot", 202);
		}

		// Checking vehicle capacity
		const { cars, motorcycles } = await this.countVehicles(parkingLot);

		if ((vehicle.type == "car" && cars < parkingLot.carCapacity) ||
			vehicle.type == "motorcycle" && motorcycles < parkingLot.motorcycleCapacity) {
			/* For this scenario, we ignore if the vehicle is in another parking lot,
			simply moving it to this one */

			vehicle.parkingLot = parkingLot;
			await this.vehicleService.save(vehicle);

			return await this.findOne(id);
		}

		throw new ConflictException(`${vehicle.type} capacity is full`);
	}

	async empty(id: number): Promise<ParkingLot | undefined> {
		const parkingLot = await this.findOne(id);
		if (!parkingLot) {
			throw new NotFoundException("Parking Lot doesn't exist");
		}

		await parkingLot.vehicles.forEach(async (vehicle) => {
			vehicle.parkingLot = null;
			await this.vehicleService.save(vehicle);
		});

		return { ...await this.findOne(id), vehicles: [] };
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
			cars: parkingLot.vehicles.reduce((count: number, vehicle: Vehicle) => count + (vehicle.type == "car" ? 1 : 0), 0) as number,
			motorcycles: parkingLot.vehicles.reduce((count: number, vehicle: Vehicle) => count + (vehicle.type == "motorcycle" ? 1 : 0), 0) as number
		}
	}
}
