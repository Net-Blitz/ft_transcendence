import { Controller, Get, Param, Patch, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { FriendService } from "./friend.service";
import { GetUser } from "src/auth/decorator";

@Controller("friend")
export class FriendController {
	constructor(private friendService: FriendService) {}

	@Post("add/:login")
	async AddFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return this.friendService.AddFriend(login, req, res, user);
	}

	@Post("remove/:login")
	async RemoveFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return this.friendService.RemoveFriend(login, req, res, user);
	}

	@Patch("accept/:login")
	async AcceptFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return this.friendService.AcceptFriend(login, req, res, user);
	}

	@Patch("decline/:login")
	async DeclineFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return this.friendService.DeclineFriend(login, req, res, user);
	}

	@Get("friends")
	async GetFriends(
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return this.friendService.GetFriends(req, res, user);
	}
}
