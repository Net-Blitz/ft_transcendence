import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChannelDto } from "./Channel";
import Notification from "../Notification/Notification";
import InviteUser from "./InviteUser";
import DropdownMenu from "./DropdownMenu";

function UsersList({ channel, socket }: { channel: string; socket: any }) {
	const [userInfo, setUserInfo] = useState<any>();
	const [channelInfo, setChannelInfo] = useState<ChannelDto>();
	const [users, setUsers] = useState<any>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [notification, setNotification] = useState({ message: "", type: "" });
	const [BanUsers, setBanUsers] = useState<any>([]);

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
			fetchBan();
		};
		const fetchBan = async () => {
			const reponse = await axios.get(
				"http://localhost:3333/chat/bans/" + channel,
				{ withCredentials: true }
			);
			setBanUsers(reponse.data);
		};
		fetchData();
		fetchChannel();

		const interval = setInterval(fetchChannel, 5000);
		return () => clearInterval(interval);
	}, [channel, userInfo?.id]);

	useEffect(() => {
		const me = users?.find((user: any) => user.id === userInfo?.id);
		if (me?.role === "admin") {
			setIsAdmin(true);
		} else {
			setIsAdmin(false);
		}
	}, [users, userInfo?.id]);

	const handleUnban = async (login: string) => {
		socket?.emit("ToUnban", {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		setNotification({
			message: login + " has been unbanned",
			type: "success",
		});
	};

	return (
		<>
			<Notification
				message={notification.message}
				type={notification.type}
			/>
			<div className="middle">
				<div className="top">
					<p>Users list</p>
				</div>
				<ul className="users">
					{users.map((user: any) => (
						<li className="person" key={user.id}>
							<Link to={"/profile/" + user.username}>
								<div className="users-list">
									<img
										className="friend-img"
										src={user.avatar}
										alt="avatar"
									/>
									<span className="name">
										{user.username}
									</span>
									<span className="role">{user.role}</span>
								</div>
							</Link>
							<DropdownMenu
								channel={channel}
								socket={socket}
								user={user}
								userInfo={userInfo}
								isAdmin={isAdmin}
								channelInfo={channelInfo}
								setNotification={setNotification}
							/>
						</li>
					))}
					{BanUsers.map((user: any) => (
						<li className="person" key={user.id}>
							<Link to={"/profile/" + user.username}>
								<div className="users-list">
									<img
										className="friend-img"
										src={user.avatar}
										alt="avatar"
									/>
									<span className="name">
										{user.username}
									</span>
									<span className="role">Banned</span>
								</div>
							</Link>
							{((isAdmin && user.role === "user") ||
								(userInfo?.id === channelInfo?.ownerId &&
									user.role !== "owner")) && (
								<button
									onClick={() => handleUnban(user.username)}
								>
									Unban
								</button>
							)}
						</li>
					))}
				</ul>
				{channelInfo?.state === "PRIVATE" &&
					userInfo.id === channelInfo.ownerId && (
						<InviteUser channelName={channelInfo.name} />
					)}
			</div>
		</>
	);
}

export default UsersList;
