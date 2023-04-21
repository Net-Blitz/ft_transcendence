import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

interface DropdownMenuProps {
	channel: string;
	socket: any;
	user: any;
	userInfo: any;
	isAdmin: boolean;
	channelInfo: any;
	setAlert: (Alert: { message: string; type: string }) => void;
}

function DropdownMenu({
	channel,
	socket,
	user,
	userInfo,
	isAdmin,
	channelInfo,
	setAlert,
}: DropdownMenuProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [openUsername, setOpenUsername] = useState<string>('');
	const [isBlocked, setIsBlocked] = useState<boolean>(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpenUsername('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, [dropdownRef]);

	const handleToggleDropdown = (username: string) => {
		if (openUsername === username) {
			setOpenUsername('');
		} else {
			setOpenUsername(username);
		}
	};

	const handlePromote = async (username: string) => {
		try {
			await axios.post(
				'http://localhost:3333/chat/admin/promote/' + channel,
				{
					username: username,
				},
				{ withCredentials: true }
			);
			setAlert({
				message: username + ' has been promoted',
				type: 'success',
			});
		} catch (error) {
			console.error(error);
			setAlert({
				message: 'An error occured',
				type: 'error',
			});
		}
	};

	const handleDemote = async (username: string) => {
		try {
			await axios.post(
				'http://localhost:3333/chat/admin/demote/' + channel,
				{
					username: username,
				},
				{ withCredentials: true }
			);
			setAlert({
				message: username + ' has been demoted',
				type: 'success',
			});
		} catch (error) {
			console.error(error);
			setAlert({
				message: 'An error occured',
				type: 'error',
			});
		}
	};

	const handleKick = async (username: string) => {
		socket?.emit('ToKick', {
			username: userInfo.username,
			channel: channel,
			login: username,
		});
		setAlert({
			message: username + ' has been kicked',
			type: 'success',
		});
	};

	const handleBan = async (username: string) => {
		socket?.emit('ToBan', {
			username: userInfo.username,
			channel: channel,
			login: username,
		});
		setAlert({
			message: username + ' has been banned',
			type: 'success',
		});
	};

	const handleMute = async (username: string) => {
		socket?.emit('ToMute', {
			username: userInfo.username,
			channel: channel,
			login: username,
		});
		setAlert({
			message: username + ' has been muted',
			type: 'success',
		});
	};

	const handleUnmute = async (username: string) => {
		socket?.emit('ToUnmute', {
			username: userInfo.username,
			channel: channel,
			login: username,
		});
		setAlert({
			message: username + ' has been unmuted',
			type: 'success',
		});
	};

	const handleBlock = async (username: string) => {
		try {
			await axios.post(
				'http://localhost:3333/friend/block/' + username,
				{},
				{ withCredentials: true }
			);
			setAlert({
				message: username + ' has been blocked',
				type: 'success',
			});
		} catch (error) {
			console.error(error);
			setAlert({
				message: 'An error occured',
				type: 'error',
			});
		}
	};

	const handleUnblock = async (username: string) => {
		try {
			await axios.post(
				'http://localhost:3333/friend/unblock/' + username,
				{},
				{ withCredentials: true }
			);
			setAlert({
				message: username + ' has been unblocked',
				type: 'success',
			});
		} catch (error) {
			console.error(error);
			setAlert({
				message: 'An error occured',
				type: 'error',
			});
		}
	};

	useEffect(() => {
		const getIsBlocked = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/friend/blockbyme/' + user.username,
					{ withCredentials: true }
				);
				setIsBlocked(response.data.isBlocked);
			} catch (error) {
				console.error(error);
			}
		};
		getIsBlocked();
	}, [setAlert, user?.username]);

	return (
		<>
			{user.username !== userInfo.username && (
				<div className="chat-dropdown-menu-container" ref={dropdownRef}>
					<div
						className="chat-dropdown-menu-header"
						onClick={() => handleToggleDropdown(user.username)}>
						<span>Options</span>
						<i
							className={`chat-arrow ${
								openUsername === user.username ? 'up' : 'down'
							}`}
						/>
					</div>
					{openUsername === user.username && (
						<ul className="chat-dropdown-menu-options">
							{isBlocked ? (
								<li
									onClick={() =>
										handleUnblock(user.username)
									}>
									Unblock
								</li>
							) : (
								<li onClick={() => handleBlock(user.username)}>
									Block
								</li>
							)}
							{((isAdmin && user.role === 'user') ||
								(userInfo?.id === channelInfo?.ownerId &&
									user.role !== 'owner')) && (
								<>
									<li
										onClick={() =>
											handleBan(user.username)
										}>
										Ban
									</li>
									{user.role === 'user' ? (
										<li
											onClick={() =>
												handlePromote(user.username)
											}>
											Make Admin
										</li>
									) : (
										<li
											onClick={() =>
												handleDemote(user.username)
											}>
											Remove Admin
										</li>
									)}
									<li
										onClick={() =>
											handleKick(user.username)
										}>
										Kick
									</li>
									<li
										onClick={() =>
											handleMute(user.username)
										}>
										Mute
									</li>
									<li
										onClick={() =>
											handleUnmute(user.username)
										}>
										Unmute
									</li>
								</>
							)}
						</ul>
					)}
				</div>
			)}
		</>
	);
}

export default DropdownMenu;
