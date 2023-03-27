import { Controller, Delete, Get, Param, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { GetUser } from "src/auth/decorator";

@Controller("chat")
export class ChatController {
	constructor(private chatService: ChatService) {}

	@Post("create/:channel")
	async CreateChannel(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.chatService.CreateChannel(channel, res, user);
	}

	@Post("join/:channel")
	async JoinChannel(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
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
