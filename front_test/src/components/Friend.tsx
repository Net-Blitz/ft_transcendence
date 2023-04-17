import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { Link } from "react-router-dom";

export interface User {
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
	const [pending, setPending] = useState<User[]>([]);
	const [demands, setDemand] = useState<User[]>([]);

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
			const response = await axios.get(
				"http://localhost:3333/friend/friends",
				{ withCredentials: true }
			);
			setFriends(response.data.friendsList);
			setPending(response.data.pendingList);
			setDemand(response.data.demandList);
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

		const interval = setInterval(fetchFriends, 5000);
		return () => clearInterval(interval);
	}, []);

	const AddFriend = async (username: string) => {
		try {
			const response = await axios.post(
				"http://localhost:3333/friend/add/" + username,
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
				"http://localhost:3333/friend/remove/" + username,
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

	const AcceptFriend = async (username: string) => {
		try {
			const response = await axios.patch(
				"http://localhost:3333/friend/accept/" + username,
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

	const DeclineFriend = async (username: string) => {
		try {
			const response = await axios.patch(
				"http://localhost:3333/friend/decline/" + username,
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
			!friends.some((friend) => friend.id === users.id) &&
			!pending.some((pending) => pending.id === users.id) &&
			!demands.some((demand) => demand.id === users.id)
	);

	return (
		<div>
			<h1>List of friends</h1>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						<div className="friend-info">
							<Link to={"/profile/" + friend.login}>
								<img
									className="friend-img"
									src={friend.avatar}
									alt="avatar"
								/>
								<span className="friend-username">
									{friend.username}
								</span>
							</Link>
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
			<h1>List of Requests</h1>
			<ul>
				{pending.map((friend) => (
					<li key={friend.id}>
						<div className="friend-info">
							<Link to={"/profile/" + friend.login}>
								<img
									className="friend-img"
									src={friend.avatar}
									alt="avatar"
								/>
								<span className="friend-username">
									{friend.username}
								</span>
							</Link>
						</div>
						<button
							className="add-friend"
							onClick={() => AcceptFriend(friend.login)}
						>
							Accept
						</button>
						<button
							className="add-friend"
							onClick={() => DeclineFriend(friend.login)}
						>
							Reject
						</button>
					</li>
				))}
			</ul>
			<h1>List of demands</h1>
			<ul>
				{demands.map((friend) => (
					<li key={friend.id}>
						<div className="friend-info">
							<Link to={"/profile/" + friend.login}>
								<img
									className="friend-img"
									src={friend.avatar}
									alt="avatar"
								/>
								<span className="friend-username">
									{friend.username}
								</span>
							</Link>
						</div>
						<h3>Waiting</h3>
					</li>
				))}
			</ul>
			<h1>List of users</h1>
			<ul>
				{filteredUsers.map((user) => (
					<li key={user.id}>
						<div className="friend-info">
							<Link to={"/profile/" + user.login}>
								<img
									className="friend-img"
									src={user.avatar}
									alt="avatar"
								/>
								<span className="friend-username">
									{user.username}
								</span>
							</Link>
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
