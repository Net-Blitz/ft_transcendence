import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChannelDto } from "./Channel";

function UsersList({ channel }: any, { socket }: any) {
	const [userInfo, setUserInfo] = useState<any>();
	const [channelInfo, setChannelInfo] = useState<ChannelDto>();
	const [users, setUsers] = useState<any>([]);
	const [openUsername, setOpenUsername] = useState<string>("");
	const [isAdmin, setIsAdmin] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};
		const fetchChannel = async () => {
			const response = await axios.get(
				"http://localhost:3333/chat/channel/" + channel,
				{ withCredentials: true }
			);
			setChannelInfo(response.data.channel);
			setUsers(response.data.users);
		};
		fetchData();
		fetchChannel();

		const me = users?.find((user: any) => user.id === userInfo?.id);
		if (me?.role === "admin") {
			setIsAdmin(true);
		} else {
			setIsAdmin(false);
		}

		const interval = setInterval(fetchChannel, 5000);
		return () => clearInterval(interval);
	}, [channel, userInfo?.id, users]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpenUsername("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [dropdownRef]);

	const handleToggleDropdown = (username: string) => {
		if (openUsername === username) {
			setOpenUsername("");
		} else {
			setOpenUsername(username);
		}
	};

	const filtereduserChannel = users?.filter(
		(user: any) => user.id !== userInfo?.id
	);

	const handlePromote = async (login: string) => {
		try {
			await axios.post(
				"http://localhost:3333/chat/admin/promote/" + channel,
				{
					login: login,
				},
				{ withCredentials: true }
			);
			alert(login + " is now administator of the channel");
		} catch (error) {
			console.error(error);
		}
	};

	const handleKick = async (login: string) => {
		socket?.emit("ToKick", {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		alert(login + " has been kicked from the channel");
	};

	const handleBan = async (login: string) => {
		socket?.emit("ToBan", {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		alert(login + " has been banned from the channel");
	};

	const handleUnban = async (login: string) => {
		socket?.emit("ToUnban", {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		alert(login + " has been unbanned from the channel");
	};

	const handleMute = async (login: string) => {
		socket?.emit("ToMute", {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		alert(login + " has been muted from the channel");
	};

	const handleUnmute = async (login: string) => {
		socket?.emit("ToUnmute", {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		alert(login + " has been unmuted from the channel");
	};

	return (
		<>
			<div className="top">
				<p>Users list</p>
			</div>
			<ul className="users">
				{filtereduserChannel.map((user: any) => (
					<li className="person" key={user.id}>
						<Link to={"/profile/" + user.username}>
							<div className="users-list">
								<img
									className="friend-img"
									src={user.avatar}
									alt="avatar"
								/>
								<span className="name">{user.username}</span>
								<span className="role">{user.role}</span>
							</div>
						</Link>
						{(userInfo?.id === channelInfo?.ownerId ||
							(user.role === "admin" && isAdmin === true)) && (
							<div
								className="dropdown-menu-container"
								ref={dropdownRef}
							>
								<div
									className="dropdown-menu-header"
									onClick={() =>
										handleToggleDropdown(user.username)
									}
								>
									<span>Options</span>
									<i
										className={`arrow ${
											openUsername === user.username
												? "up"
												: "down"
										}`}
									/>
								</div>
								{openUsername === user.username && (
									<ul className="dropdown-menu-options">
										<li
											onClick={() =>
												handlePromote(user.username)
											}
										>
											Make Admin
										</li>
										<li
											onClick={() =>
												handleBan(user.username)
											}
										>
											Ban
										</li>
										<li
											onClick={() =>
												handleKick(user.username)
											}
										>
											Kick
										</li>
										<li
											onClick={() =>
												handleMute(user.username)
											}
										>
											Mute
										</li>
										<li
											onClick={() =>
												handleUnmute(user.username)
											}
										>
											Unmute
										</li>
									</ul>
								)}
							</div>
						)}
					</li>
				))}
			</ul>
		</>
	);
}

export default UsersList;
