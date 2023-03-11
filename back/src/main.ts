import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { verifyToken } from "./auth/middleware/verifyToken.middleware";
import { NextFunction, Request, Response } from "express";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: "http://localhost:8080",
		preflightContinue: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		credentials: true,
	});
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.method === "OPTIONS") {
			res.sendStatus(200);
		} else {
			next();
		}
	});

	app.use(cookieParser());
	//app.use(verifyToken);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);
	await app.listen(3333);
}
bootstrap();
