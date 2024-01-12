import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Validate } from 'class-validator';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { ParkingLot } from 'src/parking-lots/entities/parking-lot.entity';

@Entity()
export class ParkingTicket {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	entryTime: Date;

	@Column({ type: 'timestamp', nullable: true })
	exitTime: Date;

	// Relationships
	@ManyToOne(() => ParkingLot, (parkingLot) => parkingLot.parkingTickets)
	@JoinColumn({ name: 'parkingLotId' })
	parkingLot: ParkingLot;

	@ManyToOne(() => Vehicle, (vehicle) => vehicle.parkingTickets)
	@JoinColumn({ name: 'vehicleId' })
	vehicle: Vehicle;
}
