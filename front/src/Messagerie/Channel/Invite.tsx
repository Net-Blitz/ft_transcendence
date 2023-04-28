import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { ChannelDto, ChannelsContext } from './ChannelsUtils';
import { Socket } from 'socket.io-client';
import close from '../../Profile/Components/MainInfo/Ressources/close.svg';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../utils/redux/selectors';

function Invite({ socket }: { socket: Socket }) {
	const [Invites, setInvites] = useState<any[]>([]);
	const { SaveChannel, setSaveChannel, setMessages, setSelectedChannel } =
		useContext(ChannelsContext);
	const connectedUser = useSelector(selectUserData);

	useEffect(() => {
		const fetchInvites = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/chat/invites',
					{ withCredentials: true }
				);
				setInvites(response.data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchInvites();
		const interval = setInterval(fetchInvites, 2500);
		return () => clearInterval(interval);
	}, []);

	const getMessages = async (Channel: ChannelDto) => {
		try {
			const response = await axios.get(
				'http://localhost:3333/chat/channel/messages/' + Channel.id,
				{ withCredentials: true }
			);
			response.data.map((message: any) => {
				return (
					message.userId === connectedUser.id
						? (message.username = connectedUser.username)
						: (message.username = ''),
					(message.content = message.message)
				);
			});
			setMessages(response.data.reverse());
		} catch (error) {
			console.log(error);
		}
	};

	const JoinPrivateChannel = async (Channel: ChannelDto) => {
		try {
			await axios.post(
				'http://localhost:3333/chat/join/' + Channel.name,
				{ state: 'PRIVATE' },
				{ withCredentials: true }
			);
			setSelectedChannel(Channel);
			getMessages(Channel);
			socket?.emit('join', {
				channel: Channel.name,
				username: connectedUser.username,
			});
			setSaveChannel([...SaveChannel, Channel]);
		} catch (error) {
			console.log(error);
		}
	};

	const DeclineInvite = async (Channel: ChannelDto) => {
		try {
			axios.delete('http://localhost:3333/chat/decline/' + Channel.name, {
				withCredentials: true,
			});
		} catch (error) {
			console.error(error);
		}
		setInvites(Invites.filter((channel) => channel.name !== Channel.name));
	};

	return (
		<>
			{Invites.map((invite, index) => (
				<div
					className="dm-list-element"
					style={{ justifyContent: 'space-around' }}
					key={index}>
					<h4>You are intive to {invite.channels.name}</h4>
					<span
						style={{ color: '#fdfad0' }}
						className="chat-accept-invite"
						onClick={() => JoinPrivateChannel(invite.channels)}>
						&#10003;
					</span>
					<img
						src={close}
						alt="decline invite"
						onClick={() => DeclineInvite(invite.channels)}></img>
				</div>
			))}
		</>
	);
}

export default Invite;
