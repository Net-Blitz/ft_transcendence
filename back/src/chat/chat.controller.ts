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
		if (state === "PUBLIC" || state === "PRIVATE")
			return await this.chatService.CreateChannel(
				channel,
				state,
				res,
				user
			);
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
		@Body("state") state: string,
		@Body("password") password: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		console.log({ password });
		console.log({ state });
		if (password && state === "PROTECTED") {
			return await this.chatService.JoinProtectedChannel(
				channel,
				password,
				res,
				user
			);
		} else if (state === "PRIVATE") {
			return await this.chatService.JoinPrivateChannel(
				channel,
				res,
				user
			);
		} else if (state === "PUBLIC") {
			return await this.chatService.JoinChannel(channel, res, user);
		} else {
			return res.status(400).json({ message: "Invalid channel state" });
		}
	}

	@Post("invite/:channel")
	async InviteUser(
		@Param("channel") channel: string,
		@Body("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.chatService.InviteToChannel(
			channel,
			login,
			res,
			user
		);
	}

	@Delete("decline/:channel")
	async DeclineInvite(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.chatService.DeclineInvite(channel, res, user);
	}

	@Get("invites")
	async GetInvites(@Res() res: Response, @GetUser() user: any) {
		return await this.chatService.GetInvites(res, user);
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
