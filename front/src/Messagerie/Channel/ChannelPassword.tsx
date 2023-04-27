import { useContext, useEffect, useState } from 'react';
import { ChannelDto, MessagesContext } from './ChannelsUtils';
import axios from 'axios';
/*	Ressources	*/
import close from '../../Profile/Components/MainInfo/Ressources/close.svg';
import search from '../Ressources/search.svg';

const InputPassword = ({
	icon,
	content,
	password,
	setPassword,
}: {
	icon: string;
	content: string;
	password: string;
	setPassword: (password: string) => void;
}) => {
	return (
		<>
			<div className="input-flat">
				<img src={icon} alt="search icon" />
				<input
					type="password"
					placeholder={content}
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
				/>
			</div>
		</>
	);
};

export const ChannelPassword = ({
	handleChannelPasswordTrigger,
	Channel,
}: {
	handleChannelPasswordTrigger: () => void;
	Channel: ChannelDto;
}) => {
	const me = document.getElementsByClassName('popup');
	const [password, setPassword] = useState('');
	const { SaveChannel, setSaveChannel } = useContext(MessagesContext);

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				handleChannelPasswordTrigger();
			}
		};
	}, [me, handleChannelPasswordTrigger]);

	const handleJoinProtected = async (
		Channel: ChannelDto,
		password: string
	) => {
		if (!Channel) return;
		if (Channel.state !== 'PROTECTED') return;
		if (!password) return;
		try {
			await axios.post(
				'http://localhost:3333/chat/join/' + Channel.name,
				{ state: 'PROTECTED', password: password },
				{ withCredentials: true }
			);
			setSaveChannel([...SaveChannel, Channel]);
			handleChannelPasswordTrigger();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="new-dm">
			<img
				src={close}
				alt="close-button"
				onClick={handleChannelPasswordTrigger}
			/>
			<h3>Join {Channel.name}</h3>
			<InputPassword
				icon={search}
				content="Password"
				password={password}
				setPassword={setPassword}
			/>
			<div className="new-dm-buttons">
				<button onClick={() => handleJoinProtected(Channel, password)}>
					Join
				</button>
				<button onClick={handleChannelPasswordTrigger}>Cancel</button>
			</div>
		</div>
	);
};
