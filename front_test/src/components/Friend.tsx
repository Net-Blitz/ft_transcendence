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
	const [userInfo, setUserInfo] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const [friends, setFriends] = useState<User[]>([]);

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
	const fetchFriends = async () => {
		try {
			const response = await axios.get<User[]>(
				"http://localhost:3333/users/friends",
				{ withCredentials: true }
			);
			setFriends(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

		fetchData();
		fetchUsers();
		fetchFriends();
	}, []);

	const AddFriend = async (username: string) => {
		try {
			const response = await axios.post(
				"http://localhost:3333/users/addfriend/" + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchFriends();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const RemoveFriend = async (username: string) => {
		try {
			const response = await axios.post(
				"http://localhost:3333/users/removefriend/" + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchFriends();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const filteredUsers = users.filter(
		(users) =>
			users.id !== userInfo?.id &&
			!friends.some((friend) => friend.id === users.id)
	);

	return (
		<div>
			<h1>List of friends</h1>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						<div className="friend-info">
							<img
								className="friend-img"
								src={friend.avatar}
								alt="avatar"
							/>
							<span className="friend-username">
								{friend.username}
							</span>
						</div>
						<button
							className="add-friend"
							onClick={() => RemoveFriend(friend.login)}
						>
							Remove friend
						</button>
					</li>
				))}
			</ul>
			<h1>List of users</h1>
			<ul>
				{filteredUsers.map((user) => (
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
