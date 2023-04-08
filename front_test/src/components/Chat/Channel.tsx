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

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

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

		fetchData();
		fetchChannels();
		const interval = setInterval(fetchChannels, 5000);
		return () => clearInterval(interval);
	}, [userInfo?.username]);

	return (
		<div>
			<JoinnedChannels ChannelsList={channels} userInfo={userInfo} />
		</div>
	);
}

export default Channel;
