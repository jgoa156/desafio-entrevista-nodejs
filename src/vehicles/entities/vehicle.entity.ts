import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ParkingLot } from 'src/parking-lots/entities/parking-lot.entity';
import { ParkingTicket } from 'src/parking-tickets/entities/parking-ticket.entity';

// Validators
import { IsLicensePlate, IsVehicleType } from 'src/common/validators.validator';

// Enums
import { VehicleType } from 'src/common/enums.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Vehicle {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@ApiProperty()
	@IsNotEmpty()
	brand: string;

	@Column()
	@ApiProperty()
	@IsNotEmpty()
	model: string;

	@Column({ unique: true })
	@ApiProperty()
	@IsNotEmpty()
	@Validate(IsLicensePlate)
	plate: string;

	@Column()
	@ApiProperty()
	@IsNotEmpty()
	color: string;

	@Column({
		type: "enum",
		enum: VehicleType
	})
	@ApiProperty()
	@IsNotEmpty()
	@Validate(IsVehicleType)
	@Transform((value) => value.value.toLowerCase())
	type: VehicleType;

	// Relationships
	@OneToMany(() => ParkingTicket, (ticket) => ticket.vehicle)
	parkingTickets: ParkingTicket[];
}
