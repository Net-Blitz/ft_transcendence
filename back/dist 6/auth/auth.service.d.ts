import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "./dto";
import { CookieDto } from "./decorator/cookie.dto";
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    Auth42Callback(res: Response, code: string): Promise<void>;
    getUserInfo(res: Response, token: string): Promise<void>;
    createUser(res: Response, user: UserDto): Promise<void>;
    signToken(res: Response, user: UserDto): Promise<{
        access_token: string;
    }>;
    setup2fa(res: Response, user: any): Promise<Response<any, Record<string, any>>>;
    verify2fa(res: Response, user: any, code: string): Promise<Response<any, Record<string, any>>>;
    verify2falogin(res: Response, login: string, key: string): Promise<Response<any, Record<string, any>>>;
    remove2fa(res: Response, cookie: CookieDto): Promise<Response<any, Record<string, any>>>;
    getUserCheat(res: Response, username: string): Promise<import(".prisma/client").User | {
        access_token: string;
    }>;
    adminCreateUser(res: Response, username: string, file: any): Promise<Response<any, Record<string, any>>>;
}
