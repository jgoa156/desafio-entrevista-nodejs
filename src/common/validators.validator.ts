import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { VehicleType } from './enums.enum';

@ValidatorConstraint({ name: 'IsCNPJ', async: false })
export class IsCNPJ implements ValidatorConstraintInterface {
	validate(cnpj: string, args: ValidationArguments) {
		const numericCnpj = cnpj.replace(/\D/g, '');
		if (numericCnpj.length !== 14) {
			return false;
		}

		// Checksum
		const calculateChecksum = (slice) => {
			const length = slice.length;

			let checksum = 0;
			let pos = length - 7;

			for (let i = length; i >= 1; i--) {
				checksum += slice.charAt(length - i) * pos--;

				if (pos < 2) pos = 9;
			}

			return (checksum % 11 < 2 ? 0 : 11 - (checksum % 11));
		}

		const firstDigit = calculateChecksum(numericCnpj.slice(0, 12));
		const secondDigit = calculateChecksum(numericCnpj.slice(0, 13));

		return parseInt(numericCnpj.charAt(12)) === firstDigit &&
			parseInt(numericCnpj.charAt(13)) === secondDigit;
	}

	defaultMessage(args: ValidationArguments) {
		return "Invalid CNPJ";
	}
}

@ValidatorConstraint({ name: 'IsLicensePlate', async: false })
export class IsLicensePlate implements ValidatorConstraintInterface {
	validate(plate: string, args: ValidationArguments) {
		const regexes = [
			/^[a-zA-Z]{3}[0-9]{4}$/, // Normal
			/^[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{1}[0-9]{2}$/, // Mercosul cars
			/^[a-zA-Z]{3}[0-9]{2}[a-zA-Z]{1}[0-9]{1}$/, // Mercosul motorcycles
		];

		let result = false;
		regexes.forEach((regex) => {
			if (regex.test(plate)) {
				result = true;
			}
		});

		return result;
	}

	defaultMessage(args: ValidationArguments) {
		return "Invalid vehicle plate";
	}
}

@ValidatorConstraint({ name: 'IsCNPJ', async: false })
export class IsVehicleType implements ValidatorConstraintInterface {
	validate(type: string, args: ValidationArguments) {
		return (Object.values<string>(VehicleType).includes(type))
	}

	defaultMessage(args: ValidationArguments) {
		return "Invalid vehicle type (must be either 'Car' or 'Motorcycle')";
	}
}