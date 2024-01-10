import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsNotEmpty, IsPositive, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

// Validators
import { IsCNPJ } from "../../common/validators.validator";

@Entity()
export class ParkingLot {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsNotEmpty()
	name: string;

	@Column({ unique: true })
	@IsNotEmpty()
	@Validate(IsCNPJ)
	@Transform((value) =>
		value.value.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"))
	cnpj: string;

	@Column()
	@IsNotEmpty()
	address: string;

	@Column()
	@IsNotEmpty()
	phone: string;

	@Column()
	@IsPositive()
	@IsNotEmpty()
	motorcycleCapacity: number;

	@Column()
	@IsPositive()
	@IsNotEmpty()
	carCapacity: number;

	// Relationship
	@OneToMany(() => Vehicle, (vehicle) => vehicle.parkingLot)
	vehicles: Vehicle[];
}
