import { IsString, IsNotEmpty, IsIn, IsOptional } from "class-validator";

export class QueueDto {

	@IsNotEmpty()
	@IsString()
	login: string;

	@IsNotEmpty()
	@IsString()
	@IsIn(["1v1", "2v2"])
	readonly mode: string;

	@IsNotEmpty()
	@IsString()
	bonus1: string;

	@IsNotEmpty()
	@IsString()
	bonus2: string;

}

export class QueueObject {

	id: number;
	login: string;
	mode: string;
	bonus1: boolean;
	bonus2: boolean;
	elo: number;
}