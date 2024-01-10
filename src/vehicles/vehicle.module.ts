import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Vehicle])],
	providers: [VehicleService],
	controllers: [VehicleController],
	exports: [TypeOrmModule, VehicleService],
})
export class VehicleModule { }