import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController {
	constructor(private readonly vehicleService: VehicleService) { }

	@Get()
	findAll(): Promise<Vehicle[]> {
		return this.vehicleService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: number): Promise<Vehicle | undefined> {
		return this.vehicleService.findOne(+id);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: false }))
	create(@Body() vehicle: Vehicle): Promise<Vehicle> {
		return this.vehicleService.create(vehicle);
	}

	@Post(':id/exit')
	exit(@Param('id') id: number): Promise<Vehicle | undefined> {
		return this.vehicleService.exit(id);
	}

	@Put(':id')
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
	update(@Param('id') id: number, @Body() vehicle: Vehicle): Promise<Vehicle | undefined> {
		return this.vehicleService.update(+id, vehicle);
	}

	@Delete(':id')
	remove(@Param('id') id: number): Promise<void> {
		return this.vehicleService.remove(+id);
	}
}
