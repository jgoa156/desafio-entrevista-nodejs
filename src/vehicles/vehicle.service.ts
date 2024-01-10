import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehicleService {
	constructor(
		@InjectRepository(Vehicle)
		private readonly vehicleRepository: Repository<Vehicle>,
	) { }

	// Core methods
	async findAll(): Promise<Vehicle[]> {
		return await this.vehicleRepository.find({ relations: ["parkingLot"] });
	}

	async findOne(id: number): Promise<Vehicle | undefined> {
		return await this.vehicleRepository.findOne({ where: { id }, relations: ["parkingLot"] });
	}

	async create(vehicle: Vehicle): Promise<Vehicle> {
		if (await this.isPlateDuplicated(vehicle.plate)) {
			throw new ConflictException("Plate already in use");
		}

		return await this.vehicleRepository.save(vehicle);
	}

	async save(vehicle: Vehicle): Promise<Vehicle> {
		return await this.vehicleRepository.save(vehicle);
	}

	async update(id: number, vehicle: Vehicle): Promise<Vehicle | undefined> {
		if (!await this.findOne(id)) {
			throw new NotFoundException("Vehicle doesn't exist");
		}

		if (vehicle.plate !== undefined && await this.isPlateDuplicated(vehicle.plate, id)) {
			throw new ConflictException("Plate already in use");
		}

		await this.vehicleRepository.update(id, vehicle);
		return await this.findOne(id);
	}

	async exit(id: number): Promise<Vehicle | undefined> {
		const vehicle = await this.findOne(id);
		if (!vehicle) {
			throw new NotFoundException("Vehicle doesn't exist");
		}

		vehicle.parkingLot = null;
		return await this.vehicleRepository.save(vehicle);
	}

	async remove(id: number): Promise<void> {
		await await this.vehicleRepository.delete(id);
	}

	// Extra methods
	async isPlateDuplicated(plate: string, id: number | null = null): Promise<boolean> {
		let existingVehicle;

		if (id !== null) {
			existingVehicle = await this.vehicleRepository.findOne({ where: { plate, id: Not(id) } });
		} else {
			existingVehicle = await this.vehicleRepository.findOne({ where: { plate } });
		}

		return !!existingVehicle;
	}
}
