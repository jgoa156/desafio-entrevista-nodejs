import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createSwaggerDocument } from '../swagger/swagger.config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	createSwaggerDocument(app);

	await app.listen(process.env.PORT);
}
bootstrap();
