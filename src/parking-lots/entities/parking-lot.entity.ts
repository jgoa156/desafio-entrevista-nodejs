import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsInt, IsNotEmpty, IsPositive, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { ParkingTicket } from 'src/parking-tickets/entities/parking-ticket.entity';

// Validators
import { IsCNPJ } from "../../common/validators.validator";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ParkingLot {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@ApiProperty()
	@IsNotEmpty()
	name: string;

	@Column({ unique: true })
	@ApiProperty()
	@IsNotEmpty()
	@Validate(IsCNPJ)
	@Transform((value) =>
		value.value.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"))
	cnpj: string;

	@Column()
	@ApiProperty()
	@IsNotEmpty()
	address: string;

	@Column()
	@ApiProperty()
	@IsNotEmpty()
	phone: string;

	@Column()
	@ApiProperty()
	@IsInt()
	@IsPositive()
	@IsNotEmpty()
	motorcycleCapacity: number;

	@Column()
	@ApiProperty()
	@IsInt()
	@IsPositive()
	@IsNotEmpty()
	carCapacity: number;

	// Relationships
	@OneToMany(() => ParkingTicket, (ticket) => ticket.parkingLot)
	parkingTickets: ParkingTicket[];
}
