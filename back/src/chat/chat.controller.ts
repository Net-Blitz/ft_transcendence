import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Res,
} from "@nestjs/common";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { GetUser } from "src/auth/decorator";

@Controller("chat")
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Post("create/:channel")
	async CreateChannel(
		@Param("channel") channel: string,
		@Body("state") state: string,
		@Body("password") password: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		console.log({ state });
		console.log("ALED: ", state);
		if (state === "PUBLIC")
			return await this.chatService.CreateChannel(channel, res, user);
		else if (state === "PROTECTED")
			return await this.chatService.CreateProtectedChannel(
				channel,
				password,
				res,
				user
			);
		else return res.status(400).json({ message: "Invalid channel state" });
	}

	@Post("join/:channel")
	async JoinChannel(
		@Param("channel") channel: string,
		@Body("password") password: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		console.log({ password });
		if (password) {
			console.log("private channel");
			return await this.chatService.JoinProtectedChannel(
				channel,
				password,
				res,
				user
			);
		} else {
			console.log("public channel");
		}
		return await this.chatService.JoinChannel(channel, res, user);
	}

	@Delete("leave/:channel")
	async LeaveChannel(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.chatService.LeaveChannel(channel, res, user);
	}

	@Get("channels")
	async getChannels(@Res() res: Response) {
		return await this.chatService.getChannels(res);
	}

	@Get("channel/:channel")
	async getChannel(@Param("channel") channel: string, @Res() res: Response) {
		return await this.chatService.getChannel(channel, res);
	}
}
