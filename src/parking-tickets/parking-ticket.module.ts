import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingTicket } from './entities/parking-ticket.entity';
import { ParkingTicketService } from './parking-ticket.service';
import { VehicleModule } from 'src/vehicles/vehicle.module';

@Module({
	imports: [TypeOrmModule.forFeature([ParkingTicket])],
	providers: [ParkingTicketService],
	exports: [TypeOrmModule, ParkingTicketService],
})
export class ParkingTicketModule { }