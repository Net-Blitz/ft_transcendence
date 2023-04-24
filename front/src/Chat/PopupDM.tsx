import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import close from '../Profile/Components/MainInfo/Ressources/close.svg';

function PopupDM({ ClosePopup, setAlert, userInfo }: any) {
	const [users, setUsers] = useState<any[]>([]);
	const PopupRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [blocked, setBlocked] = useState<any[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			const response = await axios.get(
				'http://localhost:3333/users/login',
				{
					withCredentials: true,
				}
			);
			setUsers(
				response.data.filter(
					(user: any) => user.username !== userInfo?.username
				)
			);
		};
		fetchUsers();

		const fetchBlocked = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3333/friend/blocked',
					{
						withCredentials: true,
					}
				);
				setBlocked(response.data);
			} catch (error) {}
		};
		fetchBlocked();
	}, [userInfo?.username]);

	const handleDM = async (username: string) => {
		if (blocked?.find((blocked: any) => blocked.username === username)) {
			setAlert({
				message: 'You are blocked from this user',
				type: 'error',
			});
			return;
		}
		try {
			await axios.post(
				'http://localhost:3333/chat/dm/create',
				{ username: username },
				{ withCredentials: true }
			);
			setAlert({
				message: 'DM created',
				type: 'success',
			});
			ClosePopup();
		} catch (error) {
			setAlert({
				message: 'DM already exist',
				type: 'error',
			});
		}
	};

	useEffect(() => {
		const searchUsers = (searchTerm: string) => {
			const results = users.filter((user) =>
				user.username.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setSearchResults(results);
		};

		searchUsers(searchTerm);
	}, [searchTerm, users]);

	return (
		<div ref={PopupRef} className="chat-overlay">
			<img
				src={close}
				alt="close-button"
				className="chat-close"
				onClick={ClosePopup}
			/>
			<h2>New Direct Message</h2>
			<div className="chat-content">
				<form>
					<label>
						<p>Search User</p>
						<input
							type="text"
							placeholder="Search a user"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
							}}
						/>
					</label>
					<ul className="chat-users">
						{searchResults.map((user) => (
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
										<span
											className="chat-name"
											style={{ color: '#0a3d62' }}>
											{user.username}
										</span>
									</div>
								</Link>
								<button
									onClick={() => {
										handleDM(user.username);
									}}
									value={user.username}
									className="chat-btn btn-primary">
									DM
								</button>
							</li>
						))}
					</ul>
				</form>
			</div>
		</div>
	);
}

export default PopupDM;
