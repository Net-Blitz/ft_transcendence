import { useEffect, useState } from "react";
import axios from "axios";
import JoinnedChannels from "./Joinnedchannel";

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
	const [ban, setBan] = useState<any[]>();

	const fetchData = async () => {
		const response = await axios.get("http://localhost:3333/users/me", {
			withCredentials: true,
		});
		setUserInfo(response.data);
	};

	useEffect(() => {
		const fetchChannels = async () => {
			try {
				const response = await axios.get<ChannelDto[]>(
					"http://localhost:3333/chat/channels",
					{ withCredentials: true }
				);
				setChannels(response.data);
			} catch (error) {
				console.error(error);
			}
		};

		const fetchBan = async () => {
			if (!userInfo?.username) return;
			const response = await axios.get(
				"http://localhost:3333/chat/ban/" + userInfo?.username,
				{
					withCredentials: true,
				}
			);
			setBan(response.data);
		};
		const fetchAll = async () => {
			await fetchData();
			await fetchChannels();
			await fetchBan();
		};

		fetchAll();

		const interval = setInterval(fetchAll, 5000);
		return () => clearInterval(interval);
	}, [setChannels, userInfo?.username]);

	return (
		<div>
			<JoinnedChannels
				ChannelsList={channels}
				userInfo={userInfo}
				ban={ban}
			/>
		</div>
	);
}

export default Channel;
