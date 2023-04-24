import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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
			<div className="chat-popup center">
				<label className="chat-close" onClick={ClosePopup}>
					&times;
				</label>
				<h2>New Direct Message</h2>
				<div className="chat-content-dm">
					<input
						type="text"
						placeholder="Search a user"
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
						}}
					/>
					<ul className="chat-users">
						{searchResults.map((user) => (
							<li className="chat-person" key={user.id}>
								<Link to={'/profile/' + user.username}>
									<div className="chat-users-list">
										<img
											className="chat-friend-img"
											src={user.avatar}
											alt="avatar"
										/>
										<span className="chat-name">
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
				</div>
			</div>
		</div>
	);
}

export default PopupDM;
