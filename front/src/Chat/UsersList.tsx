import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChannelDto } from './Chat';
import Alert from './Alert';
import InviteUser from './InviteUser';
import DropdownMenu from './DropdownMenu';

function UsersList({ channel, socket }: { channel: string; socket: any }) {
	const [userInfo, setUserInfo] = useState<any>();
	const [channelInfo, setChannelInfo] = useState<ChannelDto>();
	const [users, setUsers] = useState<any>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [alert, setAlert] = useState({ message: '', type: '' });
	const [BanUsers, setBanUsers] = useState<any>([]);

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get('http://localhost:3333/users/me', {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};
		const fetchChannel = async () => {
			const response = await axios.get(
				'http://localhost:3333/chat/channel/' + channel,
				{ withCredentials: true }
			);
			setChannelInfo(response.data.channel);
			setUsers(response.data.users);
			fetchBan();
		};
		const fetchBan = async () => {
			const reponse = await axios.get(
				'http://localhost:3333/chat/bans/' + channel,
				{ withCredentials: true }
			);
			setBanUsers(reponse.data);
		};
		fetchData();
		fetchChannel();

		const interval = setInterval(fetchChannel, 5000);
		return () => clearInterval(interval);
	}, [channel, userInfo?.id]);

	useEffect(() => {
		const me = users?.find((user: any) => user.id === userInfo?.id);
		if (me?.role === 'admin') {
			setIsAdmin(true);
		} else {
			setIsAdmin(false);
		}
	}, [users, userInfo?.id]);

	const handleUnban = async (login: string) => {
		socket?.emit('ToUnban', {
			username: userInfo.username,
			channel: channel,
			login: login,
		});
		setAlert({
			message: login + ' has been unbanned',
			type: 'success',
		});
	};

	return (
		<>
			<Alert message={alert.message} type={alert.type} />
			<div className="chat-middle">
				<div className="chat-top">
					<p>Users list</p>
				</div>
				<ul className="chat-users">
					{users.map((user: any) => (
						<li className="chat-person" key={user.id}>
							<Link to={'/profile/' + user.username}>
								<div className="chat-users-list">
									<img
										className="chat-friend-img"
										src={
											'http://localhost:3333/' +
											user.avatar
										}
										alt="avatar"
									/>
									<span className="chat-name">
										{user.username}
									</span>
									<span className="chat-role">
										{user.role}
									</span>
								</div>
							</Link>
							<DropdownMenu
								channel={channel}
								socket={socket}
								user={user}
								userInfo={userInfo}
								isAdmin={isAdmin}
								channelInfo={channelInfo}
								setAlert={setAlert}
							/>
						</li>
					))}
					{BanUsers.map((user: any) => (
						<li className="chat-person" key={user.id}>
							<Link to={'/profile/' + user.username}>
								<div className="chat-users-list">
									<img
										className="chat-friend-img"
										src={
											'http://localhost:3333/' +
											user.avatar
										}
										alt="avatar"
									/>
									<span className="chat-name">
										{user.username}
									</span>
									<span className="chat-role">Banned</span>
								</div>
							</Link>
							{((isAdmin && user.role === 'user') ||
								(userInfo?.id === channelInfo?.ownerId &&
									user.role !== 'owner')) && (
								<button
									onClick={() => handleUnban(user.username)}>
									Unban
								</button>
							)}
						</li>
					))}
				</ul>
				{channelInfo?.state === 'PRIVATE' &&
					userInfo.id === channelInfo.ownerId && (
						<InviteUser channelName={channelInfo.name} />
					)}
			</div>
		</>
	);
}

export default UsersList;
