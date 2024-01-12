import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLot } from './entities/parking-lot.entity';
import { ParkingLotService } from './parking-lot.service';
import { ParkingLotController } from './parking-lot.controller';
import { VehicleModule } from 'src/vehicles/vehicle.module';
import { ParkingTicketModule } from 'src/parking-tickets/parking-ticket.module';

@Module({
	imports: [TypeOrmModule.forFeature([ParkingLot]), VehicleModule, ParkingTicketModule],
	providers: [ParkingLotService],
	controllers: [ParkingLotController],
	exports: [TypeOrmModule, ParkingLotService],
})
export class ParkingLotModule { }