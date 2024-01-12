import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
	.setTitle('Your API Title')
	.setDescription('Your API Description')
	.setVersion('1.0')
	.build();

export const createSwaggerDocument = (app) => {
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api-docs', app, document);
};