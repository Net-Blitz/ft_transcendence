import {
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import * as sharp from "sharp";
import { FileService } from "./file.service";

@Controller("file")
export class FileController {

	constructor(private fileservice: FileService) {}

	@Post("check")
	@UseInterceptors(FileInterceptor("file"))
	async checkFile(@UploadedFile() file: Express.Multer.File) {
		return (await this.fileservice.checkFile(file));
	}
}
