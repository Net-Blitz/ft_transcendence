import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

interface User {
	avatar: string;
	elo: number;
	id: number;
	wins: number;
	losses: number;
	status: string;
	twoFactor: boolean;
	username: string;
	login: string;
}

function Friend() {
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get<User[]>(
					"http://localhost:3333/users/login",
					{ withCredentials: true }
				);
				setUsers(response.data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchUsers();
	}, []);

	const AddFriend = async (username: string) => {
		console.log("friend: " + username);
		try {
			const response = await axios.post(
				"http://localhost:3333/users/addfriend/" + username,
				{ withCredentials: true }
			);
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			<h1>List of users</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id}>
						<div className="friend-info">
							<img
								className="friend-img"
								src={user.avatar}
								alt="avatar"
							/>
							<span className="friend-username">
								{user.username}
							</span>
							<span className="friend-elo">Elo: {user.elo}</span>
						</div>
						<button
							className="add-friend"
							onClick={() => AddFriend(user.login)}
						>
							Add friend
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Friend;
