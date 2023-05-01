import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FilteredUsers } from '../FilteredUsers/FilteredUsers';
import { selectEnv } from '../../utils/redux/selectors';
import { useSelector } from 'react-redux';

interface userDataInt {
	username: string;
	level: number;
	status: string;
}

export const SearchBar = () => {
	const [users, setUsers] = useState<{ username: string }[]>([]);
	const [filteredUsername, setFilteredUsername] = useState<
		{ username: string }[]
	>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredUsers, setFilteredUsers] = useState<userDataInt[]>([]);
	const env = useSelector(selectEnv);

	//fetch all users
	useEffect(() => {
		async function fetchUsers() {
			try {
				const response = await axios.get(
					'http://' + env.host + ':' + env.port +'/users/all/pseudo',
					// http://' + env.host + ':' + env.port +'/users/username/jojo25
					{
						withCredentials: true,
					}
				);
				const usersData = response.data;
				setUsers(usersData);
			} catch (error) {
				console.error(error);
			}
		}
		fetchUsers();
	}, []);

	//Filter users
	useEffect(() => {
		const results = users.filter((user) =>
			user.username.toLowerCase().includes(searchQuery.toLowerCase())
		);
		setFilteredUsername(results);
	}, [searchQuery, users]);

	const handleInputChange = (event: any) => {
		setSearchQuery(event.target.value);
	};
	console.log('All users:', users);

	//fetch all the data of a user
	useEffect(() => {
		const fetchUserData = async () => {
			const usersData: userDataInt[] = [];
			for (const user of filteredUsername) {
				try {
					const response = await axios.get(
						`http://${env.host}:${env.port}/users/username/${user.username}`,
						{
							withCredentials: true,
						}
					);
					usersData.push(response.data);
				} catch (error) {
					console.error(error);
				}
			}

			setFilteredUsers(usersData);
		};
		fetchUserData();
	}, [filteredUsername]);

	return (
		<div>
			<input
				type="text"
				placeholder="Search"
				value={searchQuery}
				onChange={handleInputChange}
			/>
			<FilteredUsers
				searchQuery={searchQuery}
				filteredUsers={filteredUsers}
			/>
		</div>
	);
};
