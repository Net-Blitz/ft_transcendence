import { useEffect, useState } from "react";
import axios from "axios";
import JoinnedChannels from "./Joinnedchannel";

export interface ChannelDto {
	id: number;
	name: string;
	state: string;
	ownerId: number;
}

function Channel() {
	const [channels, setChannels] = useState<ChannelDto[]>([]);
	

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

	useEffect(() => {
		fetchChannels();

		const interval = setInterval(fetchChannels, 5000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div>
			<JoinnedChannels ChannelsList={channels} />
		</div>
	);
}

export default Channel;
