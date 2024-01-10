require("dotenv").config();
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Parking Lots
import { ParkingLotModule } from './parking-lots/parking-lot.module';
import { VehicleModule } from './vehicles/vehicle.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'mysql',
				host: configService.get("MYSQL_HOST"),
				port: +configService.get("MYSQL_PORT"),
				username: configService.get("MYSQL_USER"),
				password: configService.get("MYSQL_PASSWORD"),
				database: configService.get("MYSQL_DB"),
				entities: ['dist/**/*.entity{.ts,.js}'],
				synchronize: true,
			}),
			inject: [ConfigService]
		}),
		ParkingLotModule,
		VehicleModule
	],
	/*controllers: [AppController],
	providers: [AppService],*/
})
export class AppModule { }