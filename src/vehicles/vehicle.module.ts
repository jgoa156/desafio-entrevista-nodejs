import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { ParkingLotModule } from 'src/parking-lots/parking-lot.module';
import { ParkingTicketModule } from 'src/parking-tickets/parking-ticket.module';

@Module({
	imports: [TypeOrmModule.forFeature([Vehicle]), ParkingTicketModule],
	providers: [VehicleService],
	controllers: [VehicleController],
	exports: [TypeOrmModule, VehicleService],
})
export class VehicleModule { }