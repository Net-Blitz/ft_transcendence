import { ReactNode, createContext, useState } from "react";
import { MessageDto } from "../../Chat/Messages";

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
}

type MessagesContextType = {
	messages: MessageDto[];
	setMessages: React.Dispatch<React.SetStateAction<MessageDto[]>>;
	SaveChannel: ChannelDto[];
	setSaveChannel: React.Dispatch<React.SetStateAction<ChannelDto[]>>;
}

export const MessagesContext = createContext<MessagesContextType>({
	messages: [],
	setMessages: () => {},
	SaveChannel: [],
	setSaveChannel: () => {},
});

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
	const [messages, setMessages] = useState<MessageDto[]>([]);
	const [SaveChannel, setSaveChannel] = useState<ChannelDto[]>([]);

	return (
		<MessagesContext.Provider value={{ messages, setMessages, SaveChannel, setSaveChannel }}>
			{children}
		</MessagesContext.Provider>
	);
};
