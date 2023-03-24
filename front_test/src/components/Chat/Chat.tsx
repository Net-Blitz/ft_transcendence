import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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

		if (socket) {
			socket?.emit("chat", {
				username: "Server",
				content: userInfo?.username + " has join the channel",
				channel: name,
			});
		}

		const interval = setInterval(fetchChannel, 5000);
		return () => clearInterval(interval);
	}, [channel?.name, name]);

	useEffect(() => {
		const newSocket = io("http://localhost:3334");
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

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

		const handleMessage = (message: MessageDto) => {
			setMessages([...messages, message]);
		};

		socket.on("chat", handleMessage);
		socket?.emit("join", { channel: name, username: userInfo?.username });

		return () => {
			socket.off("chat", handleMessage);
		};
	}, [messages, name, navigate, socket, userInfo?.username]);

	const sendMessage = (message: MessageDto) => {
		socket?.emit("chat", { ...message, channel: name });
	};

	return (
		<div>
			<h1>Chat: {name}</h1>
			<h2>Users in channel:</h2>
			<ul>
				{userChannel?.map((user: any) => (
					<li key={user.id}>{user.username}</li>
				))}
			</ul>
			<button onClick={handleDisconnect}>Back</button>
			<MessageInput sendMessage={sendMessage} userInfo={userInfo} />
			<Messages messages={messages} />
		</div>
	);
}

export default Chat;
