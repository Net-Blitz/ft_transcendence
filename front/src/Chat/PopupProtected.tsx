import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import close from '../Profile/Components/MainInfo/Ressources/close.svg';

interface PopupProtectedProps {
	channel: string;
	socket: any;
	userInfo: any;
	setSelectedChannel: (channel: string) => void;
	setMessages: (messages: any[]) => void;
	SaveChannel: string[];
	setSaveChannel: (channels: string[]) => void;
	setAlert: (Alert: { message: string; type: 'success' | 'error' }) => void;
}

function PopupProtected({
	channel,
	socket,
	userInfo,
	setSelectedChannel,
	setMessages,
	SaveChannel,
	setSaveChannel,
	setAlert,
}: PopupProtectedProps) {
	const [Password, setPassword] = useState(''); // <--- Password for protected channel
	const [ChannelName, setChannelName] = useState(channel); // <--- Name of protected channel
	const PopupRef = useRef<HTMLDivElement>(null); // <--- Ref for protected channel

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				PopupRef.current &&
				!PopupRef.current.contains(event.target as Node)
			) {
				setChannelName('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [PopupRef]);

	const ClosePopupPassword = () => {
		setChannelName('');
	};

	const JoinProtectedChannel = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();
		try {
			await axios.post(
				'http://localhost:3333/chat/join/' + ChannelName,
				{ state: 'PROTECTED', password: Password },
				{ withCredentials: true }
			);
			setSelectedChannel(ChannelName);
			setMessages([]);
			socket?.emit('join', {
				channel: ChannelName,
				username: userInfo?.username,
			});
			setChannelName('');
			setSaveChannel([...SaveChannel, ChannelName]);
			setAlert({
				message: 'You joinned ' + ChannelName,
				type: 'success',
			});
		} catch (error) {
			setAlert({
				message: 'Wrong password',
				type: 'error',
			});
		}
	};

	return (
		<>
			{ChannelName !== '' && (
				<div ref={PopupRef} className="chat-overlay">
					<img
						src={close}
						alt="close-button"
						className="chat-close"
						onClick={ClosePopupPassword}
					/>
					<h2>Protected Channel</h2>
					<div className="chat-content">
						<form onSubmit={JoinProtectedChannel}>
							<label>
								<p>Enter the password of the channel</p>
								<input
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="Enter password"
									value={Password}
									type="password"
								/>
							</label>
							<button type="submit">Join</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default PopupProtected;
