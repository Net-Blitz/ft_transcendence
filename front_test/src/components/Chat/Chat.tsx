import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChannelDto } from "./Channel";

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

		// useless if we update the channel when we receive a message from the server (see handleMessage below)
		//const interval = setInterval(fetchChannel, 5000);
		//return () => clearInterval(interval);
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

		socket.on("chat", handleMessage);

		return () => {
			socket.off("chat", handleMessage);
		};
	}, [messages, name, navigate, socket, userInfo?.username]);

	const sendMessage = (message: MessageDto) => {
		socket?.emit("chat", { ...message, channel: name });
	};

	const filtereduserChannel = userChannel?.filter(
		(user: any) => user.id !== userInfo?.id
	);

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
						<button className="add-friend">Block</button>
					</li>
				))}
			</ul>
			<button onClick={handleDisconnect}>Back</button>
			<MessageInput sendMessage={sendMessage} userInfo={userInfo} />
			<Messages messages={messages} />
		</div>
	);
}

export default Chat;
