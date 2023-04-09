import { Controller, Get, Param, Patch, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { FriendService } from "./friend.service";
import { GetUser } from "src/auth/decorator";

@Controller("friend")
export class FriendController {
	constructor(private friendService: FriendService) {}

	@Post("add/:login")
	async AddFriend(
		@Param("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.AddFriend(login, res, user);
	}

	@Post("remove/:login")
	async RemoveFriend(
		@Param("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.RemoveFriend(login, res, user);
	}

	@Patch("accept/:login")
	async AcceptFriend(
		@Param("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.AcceptFriend(login, res, user);
	}

	@Patch("decline/:login")
	async DeclineFriend(
		@Param("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.DeclineFriend(login, res, user);
	}

	@Get("friends")
	async GetFriends(@Res() res: Response, @GetUser() user: any) {
		return await this.friendService.GetFriends(res, user);
	}

	@Post("block/:username")
	async BlockUser(
		@Param("username") username: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.BlockUser(username, res, user);
	}

	@Post("unblock/:username")
	async UnblockUser(
		@Param("username") username: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.UnblockUser(username, res, user);
	}

	@Get("blocked")
	async GetBlocked(@Res() res: Response, @GetUser() user: any) {
		return await this.friendService.GetBlockedUsers(res, user);
	}

	@Get("blockbyme/:username")
	async GetIBlocked(
		@Param("username") username: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.friendService.UserBlockThisUser(username, res, user);
	}
}
