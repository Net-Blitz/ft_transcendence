import { IsInt, IsNumber, IsAlphanumeric, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { isInt32Array } from "util/types";

export class CookieDto {
  
	@IsNotEmpty()
  	login: string;
	 
	@IsNotEmpty()
  	username: string;

	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	id: number;
}