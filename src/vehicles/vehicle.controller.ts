import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe } from "@nestjs/common";
import { Vehicle } from "./entities/vehicle.entity";
import { VehicleService } from "./vehicle.service";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

@Controller("vehicles")
export class VehicleController {
	constructor(private readonly vehicleService: VehicleService) { }

	@Get()
	@ApiOperation({ summary: "Get all vehicles", description: "Retrieve a list of vehicles" })
	@ApiResponse({ status: 200, description: "Returns a list of vehicles" })
	findAll(): Promise<Vehicle[]> {
		return this.vehicleService.findAll();
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a vehicle by ID", description: "Retrieve details of a vehicle by ID" })
	@ApiParam({ name: "id", type: "number", description: "Vehicle ID" })
	@ApiResponse({ status: 200, description: "Returns details of a vehicle" })
	findOne(@Param("id") id: number): Promise<Vehicle | undefined> {
		return this.vehicleService.findOne(+id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new vehicle", description: "Create a new vehicle with the provided details" })
	@ApiBody({ type: Vehicle })
	@ApiResponse({ status: 201, description: "Returns the created vehicle" })
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: false }))
	create(@Body() vehicle: Vehicle): Promise<Vehicle> {
		return this.vehicleService.create(vehicle);
	}

	@Post(":id/unpark")
	@ApiOperation({ summary: "Unpark a vehicle from parking", description: "Unpark a vehicle from parking by ID" })
	@ApiParam({ name: "id", type: "number", description: "Vehicle ID" })
	@ApiResponse({ status: 200, description: "Returns the updated vehicle details" })
	unpark(@Param("id") id: number): Promise<Vehicle | undefined> {
		return this.vehicleService.unpark(id);
	}

	@Put(":id")
	@ApiOperation({ summary: "Update a vehicle by ID", description: "Update a vehicle by ID with the provided details" })
	@ApiParam({ name: "id", type: "number", description: "Vehicle ID" })
	@ApiBody({ type: Vehicle })
	@ApiResponse({ status: 200, description: "Returns the updated vehicle details" })
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
	update(@Param("id") id: number, @Body() vehicle: Vehicle): Promise<Vehicle | undefined> {
		return this.vehicleService.update(+id, vehicle);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a vehicle by ID", description: "Delete a vehicle by ID" })
	@ApiParam({ name: "id", type: "number", description: "Vehicle ID" })
	@ApiResponse({ status: 204, description: "Vehicle deleted successfully" })
	remove(@Param("id") id: number): Promise<void> {
		return this.vehicleService.remove(+id);
	}
}
