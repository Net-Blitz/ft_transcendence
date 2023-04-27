import { useEffect, useState } from 'react';

import './AddFriends.css';
import axios from 'axios';

//Ressources
import add_blue from '../Ressources/add_blue.svg';

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

interface AddFriendsProps {
	username: string;
}

export const AddFriends: React.FC<AddFriendsProps> = ({ username }) => {
	const [userInfo, setUserInfo] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const [pending, setPending] = useState<User[]>([]);
	const [demands, setDemand] = useState<User[]>([]);
	const [friends, setFriends] = useState<User[]>([]);

	const fetchUsers = async () => {
		try {
			const response = await axios.get<User[]>(
				'http://localhost:3333/users/login',
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
				'http://localhost:3333/friend/friends',
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
			const response = await axios.get('http://localhost:3333/users/me', {
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

	const AddFriend = async (event: React.MouseEvent<HTMLButtonElement>) => {
		console.log('username', username);
		try {
			const response = await axios.post(
				'http://localhost:3333/friend/add/' + username,
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

	return (
		<button className="addUser" onClick={AddFriend}>
			<img src={add_blue} alt="all user" />
		</button>
	);
};
