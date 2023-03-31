import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChannelDto } from "./Channel";
import Invite from "./Invite";

export interface MessageDto {
	username: string;
	content: string;
}

function Chat() {
	const [socket, setSocket] = useState<Socket>();
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [userInfo, setUserInfo] = useState<any>();
	const [channel, setChannel] = useState<ChannelDto>();
	const [userChannel, setUserChannel] = useState<any>();
	const [isAdmin, setIsAdmin] = useState(false);
	const { name } = useParams<{ name: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};
		const fetchChannel = async () => {
			const response = await axios.get<any>(
				"http://localhost:3333/chat/channel/" + name,
				{ withCredentials: true }
			);
			setChannel(response.data.channel);
			setUserChannel(response.data.users);
		};
		fetchData();
		fetchChannel();
	}, [channel?.name, name, socket, userInfo?.username]);

	useEffect(() => {
		const newSocket = io("http://localhost:3334");
		setSocket(newSocket);

		newSocket?.emit("join", {
			channel: name,
			username: userInfo?.username,
		});
		newSocket?.emit("chat", {
			username: "Server",
			content: userInfo?.username + " has join the channel",
			channel: name,
		});

		return () => {
			newSocket.disconnect();
		};
	}, [name, userInfo?.username]);

	const handleDisconnect = async () => {
		try {
			await axios.delete("http://localhost:3333/chat/leave/" + name, {
				withCredentials: true,
			});
		} catch (error) {
			console.error(error);
		}
		navigate("/chat");
	};

	useEffect(() => {
		if (!socket) return;

		const fetchChannel = async () => {
			const response = await axios.get<any>(
				"http://localhost:3333/chat/channel/" + name,
				{ withCredentials: true }
			);
			setChannel(response.data.channel);
			setUserChannel(response.data.users);
		};

		const handleMessage = (message: MessageDto) => {
			setMessages([...messages, message]);
			if (message.username === "Server") {
				fetchChannel();
			}
		};

		const me = userChannel?.find((user: any) => user.id === userInfo?.id);
		if (me?.role === "admin") {
			setIsAdmin(true);
		} else {
			setIsAdmin(false);
		}

		socket.on("chat", handleMessage);
		socket.on("kick", (data: any) => {
			if (data.username === userInfo?.username) {
				handleDisconnect();
			}
		});

		return () => {
			socket.off("chat", handleMessage);
		};
	}, [
		messages,
		name,
		navigate,
		socket,
		userChannel,
		userInfo?.id,
		userInfo?.username,
	]);

	const sendMessage = (message: MessageDto) => {
		socket?.emit("chat", { ...message, channel: name });
	};

	const filtereduserChannel = userChannel?.filter(
		(user: any) => user.id !== userInfo?.id
	);

	const handlePromote = async (login: string) => {
		try {
			await axios.post(
				"http://localhost:3333/chat/admin/promote/" + name,
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
			channel: name,
			login: login,
		});
	};

	const handleBan = async (login: string) => {
		socket?.emit("ToBan", {
			username: userInfo.username,
			channel: name,
			login: login,
		});
	};

	return (
		<div>
			<h1>Chat: {name}</h1>
			<h2>Users in channel:</h2>
			<ul>
				{filtereduserChannel?.map((user: any) => (
					<li key={user.id}>
						<div className="friend-info">
							<Link to={"/profile/" + user.login}>
								<img
									className="friend-img"
									src={user.avatar}
									alt="avatar"
								/>
								<span className="friend-username">
									{user.username}
								</span>
							</Link>
						</div>
						<span className="friend-info">Role: {user.role}</span>
						{userInfo?.id === channel?.ownerId && (
							<>
								<button
									onClick={() => handlePromote(user.login)}
								>
									Promote
								</button>
								<button onClick={() => handleBan(user.login)}>
									Ban
								</button>
								<button onClick={() => handleKick(user.login)}>
									Kick
								</button>
								<button>Mute</button>
							</>
						)}
						{user.role === "user" && isAdmin === true && (
							<>
								<button onClick={() => handleBan(user.login)}>
									Ban
								</button>
								<button onClick={() => handleKick(user.login)}>
									Kick
								</button>
								<button>Mute</button>
							</>
						)}
						<button>Block</button>
					</li>
				))}
			</ul>
			<button onClick={handleDisconnect}>Back</button>
			{channel?.state === "PRIVATE" &&
				userInfo.id === channel.ownerId && (
					<Invite channelName={channel.name}></Invite>
				)}
			<MessageInput sendMessage={sendMessage} userInfo={userInfo} />
			<Messages messages={messages} />
		</div>
	);
}

export default Chat;
