import { ReactNode, createContext, useEffect, useState } from 'react';
import { MessageDto } from '../../Chat/Messages';
import axios from 'axios';

export interface ChannelDto {
	id: number;
	name: string;
	state: string;
	ownerId: number;
}

export interface userInfoDto {
	id: number;
	username: string;
	avatar: string;
	role?: string;
}

type ChannelsContextType = {
	messages: MessageDto[];
	setMessages: React.Dispatch<React.SetStateAction<MessageDto[]>>;
	SaveChannel: ChannelDto[];
	setSaveChannel: React.Dispatch<React.SetStateAction<ChannelDto[]>>;
	ChannelList: ChannelDto[];
	setChannelList: React.Dispatch<React.SetStateAction<ChannelDto[]>>;
	selectedChannel: ChannelDto;
	setSelectedChannel: React.Dispatch<React.SetStateAction<ChannelDto>>;
};

export const ChannelsContext = createContext<ChannelsContextType>({
	messages: [],
	setMessages: () => {},
	SaveChannel: [],
	setSaveChannel: () => {},
	ChannelList: [],
	setChannelList: () => {},
	selectedChannel: { id: 0, name: '', state: '', ownerId: 0 },
	setSelectedChannel: () => {},
});

export const ChannelsProvider = ({ children }: { children: ReactNode }) => {
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [SaveChannel, setSaveChannel] = useState<ChannelDto[]>([]);
	const [ChannelList, setChannelList] = useState<ChannelDto[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<ChannelDto>({
		id: 0,
		name: '',
		state: '',
		ownerId: 0,
	});

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const Channels = await axios.get<ChannelDto[]>(
					'http://localhost:3333/chat/channels',
					{ withCredentials: true }
				);
				setChannelList(Channels.data);
			} catch (error) {
				console.error(error);
			}
		};

		fetchChats();
		const interval = setInterval(fetchChats, 2500);
		return () => clearInterval(interval);
	}, [setChannelList]);

	return (
		<ChannelsContext.Provider
			value={{
				messages,
				setMessages,
				SaveChannel,
				setSaveChannel,
				ChannelList,
				setChannelList,
				selectedChannel,
				setSelectedChannel,
			}}>
			{children}
		</ChannelsContext.Provider>
	);
};
