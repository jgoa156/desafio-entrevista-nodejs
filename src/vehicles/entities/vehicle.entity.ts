import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ParkingLot } from 'src/parking-lots/entities/parking-lot.entity';

// Validators
import { IsLicensePlate, IsVehicleType } from 'src/common/validators.validator';

// Enums
import { VehicleType } from 'src/common/enums.enum';

@Entity()
export class Vehicle {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsNotEmpty()
	brand: string;

	@Column()
	@IsNotEmpty()
	model: string;

	@Column({ unique: true })
	@IsNotEmpty()
	@Validate(IsLicensePlate)
	plate: string;

	@Column()
	@IsNotEmpty()
	color: string;

	@Column({
		type: "enum",
		enum: VehicleType
	})
	@IsNotEmpty()
	@Validate(IsVehicleType)
	@Transform((value) => value.value.toLowerCase())
	type: VehicleType;

	// Relationship
	@ManyToOne(() => ParkingLot, (parkingLot) => parkingLot.vehicles, { nullable: true })
	@JoinColumn({ name: 'parkingLotId' })
	parkingLot: ParkingLot;
}
