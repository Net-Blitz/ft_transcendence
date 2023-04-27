import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
export declare class PrismaService extends PrismaClient {
    constructor(config: ConfigService);
    cleandDb(): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload]>;
}
