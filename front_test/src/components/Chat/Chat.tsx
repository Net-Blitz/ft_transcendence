import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Messages from "./Messages";

function Chat() {
	const [socket, setSocket] = useState<Socket>();
	const [messages, setMessages] = useState<string[]>([]);

	const sendMessage = (value: string) => {
		socket?.emit("message", value);
	};

	useEffect(() => {
		const socket = io("http://localhost:3334");
		setSocket(socket);
	}, [setSocket]);

	const messageListener = (message: string) => {
		setMessages([...messages, message]);
	};

	useEffect(() => {
		socket?.on("message", messageListener);
		return () => {
			socket?.off("message", messageListener);
		};
	}, [messageListener]);

	return (
		<div>
			<h1>Chat</h1>
			<MessageInput sendMessage={sendMessage} />
			<Messages messages={messages} />
		</div>
	);
}

export default Chat;
