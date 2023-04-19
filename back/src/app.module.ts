import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { GameModule } from './game/game.module';
import { QueueModule } from './queue/queue.module';
import { FileModule } from "./file/file.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule,
		PrismaModule,
		UserModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: "120min" },
		}),
		GameModule,
		QueueModule,
		FileModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "public"),
			serveRoot: "/public",
		}),
	],
})
export class AppModule {};
