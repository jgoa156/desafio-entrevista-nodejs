import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, Res, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger";
import { ParkingLot } from "./entities/parking-lot.entity";
import { ParkingLotService } from "./parking-lot.service";
import { TicketsFilter } from "src/common/enums.enum";

@Controller("parking-lots")
export class ParkingLotController {
	constructor(private readonly parkingLotService: ParkingLotService) { }

	@Get()
	@ApiOperation({ summary: "Get all parking lots", description: "Retrieve a list of parking lots" })
	@ApiQuery({ name: "tickets", enum: TicketsFilter, required: false, description: "Filter by ticket status" })
	@ApiResponse({ status: 200, description: "Returns a list of parking lots" })
	findAll(@Query("tickets") tickets: TicketsFilter = TicketsFilter.NONE): Promise<ParkingLot[]> {
		return this.parkingLotService.findAll(tickets);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a parking lot by ID", description: "Retrieve details of a parking lot by ID" })
	@ApiParam({ name: "id", type: "number", description: "Parking lot ID" })
	@ApiQuery({ name: "tickets", enum: TicketsFilter, required: false, description: "Filter by ticket status" })
	@ApiResponse({ status: 200, description: "Returns details of a parking lot" })
	findOne(@Param("id") id: number, @Query("tickets") tickets: TicketsFilter = TicketsFilter.NONE): Promise<ParkingLot | undefined> {
		return this.parkingLotService.findOne(+id, tickets);
	}

	@Get(":id/summary")
	@ApiOperation({ summary: "Get parking lot summary", description: "Retrieve a summary of a parking lot" })
	@ApiParam({ name: "id", type: "number", description: "Parking lot ID" })
	@ApiQuery({ name: "date", required: false, description: "Filter by date (default: alltime)" })
	@ApiQuery({ name: "perHour", type: "boolean", required: false, description: "Enable per hour summary (default: false)" })
	@ApiResponse({ status: 200, description: "Returns the parking lot summary" })
	summary(@Param("id") id: number, @Query("date") date: string = "alltime", @Query("perHour") perHour: boolean = false): Promise<any[]> {
		return this.parkingLotService.summary(+id, date, perHour);
	}

	@Post()
	@ApiOperation({ summary: "Create a new parking lot", description: "Create a new parking lot with the provided details" })
	@ApiBody({ type: ParkingLot })
	@ApiResponse({ status: 201, description: "Returns the created parking lot" })
	create(@Body() parkingLot: ParkingLot): Promise<ParkingLot> {
		return this.parkingLotService.create(parkingLot);
	}

	@Post(":id/park/:vehicleId")
	@ApiOperation({ summary: "Park a vehicle in a parking lot", description: "Park a vehicle in a parking lot by ID" })
	@ApiParam({ name: "id", type: "number", description: "Parking lot ID" })
	@ApiParam({ name: "vehicleId", type: "number", description: "Vehicle ID" })
	@ApiResponse({ status: 200, description: "Returns the updated parking lot details" })
	parkVehicle(@Param("id") id: number, @Param("vehicleId") vehicleId: number): Promise<ParkingLot | undefined> {
		return this.parkingLotService.parkVehicle(id, vehicleId);
	}

	@Post(":id/empty")
	@ApiOperation({ summary: "Empty a parking lot", description: "Empty a parking lot by ID" })
	@ApiParam({ name: "id", type: "number", description: "Parking lot ID" })
	@ApiResponse({ status: 200, description: "Returns the updated parking lot details" })
	empty(@Param("id") id: number): Promise<ParkingLot | undefined> {
		return this.parkingLotService.empty(id);
	}

	@Put(":id")
	@ApiOperation({ summary: "Update a parking lot by ID", description: "Update a parking lot by ID with the provided details" })
	@ApiParam({ name: "id", type: "number", description: "Parking lot ID" })
	@ApiBody({ type: ParkingLot })
	@ApiResponse({ status: 200, description: "Returns the updated parking lot details" })
	@UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
	update(@Param("id") id: number, @Body() parkingLot: ParkingLot): Promise<ParkingLot | undefined> {
		return this.parkingLotService.update(+id, parkingLot);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a parking lot by ID", description: "Delete a parking lot by ID" })
	@ApiParam({ name: "id", type: "number", description: "Parking lot ID" })
	@ApiResponse({ status: 204, description: "Parking lot deleted successfully" })
	remove(@Param("id") id: number): Promise<void> {
		return this.parkingLotService.remove(+id);
	}
}
