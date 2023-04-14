import { useEffect, useState } from "react";
import axios from "axios";
import JoinnedChannels from "./Joinnedchannel";
import DirectMessage, { DirectMessageDto } from "./DirectMessage";
import { io } from "socket.io-client";

export interface ChannelDto {
	id: number;
	name: string;
	state: string;
	ownerId: number;
	ChatUsers: any[];
}

function Channel() {
	const [channels, setChannels] = useState<ChannelDto[]>([]);
	const [userInfo, setUserInfo] = useState<any>();
	const [DMList, setDMList] = useState<DirectMessageDto[]>([]);
	const [socket, setSocket] = useState<any>();

	useEffect(() => {
		const newSocket = io("http://localhost:3334");
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

		const fetchChats = async () => {
			try {
				const Channels = await axios.get<ChannelDto[]>(
					"http://localhost:3333/chat/channels",
					{ withCredentials: true }
				);
				setChannels(Channels.data);
				const DMS = await axios.get<DirectMessageDto[]>(
					"http://localhost:3333/chat/dm",
					{ withCredentials: true }
				);
				setDMList(DMS.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
		fetchChats();
		const interval = setInterval(fetchChats, 5000);
		return () => clearInterval(interval);
	}, [userInfo?.username]);

	return (
		<div>
			<JoinnedChannels ChannelsList={channels} userInfo={userInfo} />
			<DirectMessage
				DMList={DMList}
				userInfo={userInfo}
				socket={socket}
			/>
		</div>
	);
}

export default Channel;
