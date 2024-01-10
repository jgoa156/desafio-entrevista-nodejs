import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { ParkingLot } from './entities/parking-lot.entity';
import { ParkingLotService } from './parking-lot.service';

@Controller('parking-lots')
export class ParkingLotController {
	constructor(private readonly parkingLotService: ParkingLotService) { }

	@Get()
	findAll(): Promise<ParkingLot[]> {
		return this.parkingLotService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: number): Promise<ParkingLot | undefined> {
		return this.parkingLotService.findOne(+id);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: false }))
	create(@Body() parkingLot: ParkingLot): Promise<ParkingLot> {
		return this.parkingLotService.create(parkingLot);
	}

	@Post(':id/add/:vehicleId')
	addVehicle(@Param('id') id: number, @Param('vehicleId') vehicleId: number): Promise<ParkingLot | undefined> {
		return this.parkingLotService.addVehicle(id, vehicleId);
	}

	@Post(':id/empty')
	empty(@Param('id') id: number): Promise<ParkingLot | undefined> {
		return this.parkingLotService.empty(id);
	}

	@Put(':id')
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
	update(@Param('id') id: number, @Body() parkingLot: ParkingLot): Promise<ParkingLot | undefined> {
		return this.parkingLotService.update(+id, parkingLot);
	}

	@Delete(':id')
	remove(@Param('id') id: number): Promise<void> {
		return this.parkingLotService.remove(+id);
	}
}
