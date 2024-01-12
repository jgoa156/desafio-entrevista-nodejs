import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
	.setTitle('Parking Lot REST API')
	.setDescription('Parking Lot REST API made using NodeJS, NestJS, TypeORM and MySQL')
	.setVersion('1.0')
	.build();

export const createSwaggerDocument = (app) => {
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api-docs', app, document);
};
