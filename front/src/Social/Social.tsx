import React, { useState, useEffect } from 'react';
import './Social.css';
import { AddFriends } from './AddFriends/AddFriends';
import { Received } from './Received/Received';
import { MyFriends } from './Myfriends/Myfriends';
import { Demands } from './Demands/Demands';
import { BlockedUser } from './BlockedUser/BlockedUser';
import { User, MainFrame, Navbar } from './types';
import axios from 'axios';
import { selectEnv } from '../utils/redux/selectors';
import { useSelector } from 'react-redux';

export const Social = () => {
	const [userInfo, setUserInfo] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const [friends, setFriends] = useState<User[]>([]);
	const [pending, setPending] = useState<User[]>([]);
	const [demands, setDemand] = useState<User[]>([]);
	const [blocked, setBlocked] = useState<User[]>([]);
	const [showBlockModal, setShowBlockModal] = useState(false);
	const [navbarStatus, setNavbarStatus] = useState('Myfriends');
	const env = useSelector(selectEnv);

	const fetchUsers = async () => {
		try {
			const response = await axios.get<User[]>(
				'http://' + env.host + ':' + env.port + '/users/login',
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
				'http://' + env.host + ':' + env.port + '/friend/friends',
				{ withCredentials: true }
			);
			setFriends(response.data.friendsList);
			setPending(response.data.pendingList);
			setDemand(response.data.demandList);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchBlocked = async () => {
		try {
			const response = await axios.get(
				'http://' + env.host + ':' + env.port + '/friend/blocked',
				{ withCredentials: true }
			);
			setBlocked(response.data.blockedList);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get('http://' + env.host + ':' + env.port + '/users/me', {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};

		fetchData();
		fetchUsers();
		fetchFriends();
		fetchBlocked();
		const interval = setInterval(fetchFriends, 5000);
		return () => clearInterval(interval);
	}, []);

	const AddFriendFunction = async (username: string) => {
		try {
			const response = await axios.post(
				'http://' + env.host + ':' + env.port + '/friend/add/' + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchBlocked();
			fetchFriends();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const BlockFriend = async (username: string) => {
		console.log(username);
		try {
			const response = await axios.post(
				'http://' + env.host + ':' + env.port + '/friend/block/' + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchBlocked();
			fetchFriends();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const UnBlockFriend = async (username: string) => {
		console.log(username);
		try {
			const response = await axios.post(
				'http://' + env.host + ':' + env.port + '/friend/unblock/' + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchBlocked();
			fetchFriends();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const RemoveFriend = async (username: string) => {
		try {
			const response = await axios.post(
				'http://' + env.host + ':' + env.port + '/friend/remove/' + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchBlocked();
			fetchFriends();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const AcceptFriend = async (username: string) => {
		console.log('Accept username', username);
		try {
			const response = await axios.patch(
				'http://' + env.host + ':' + env.port + '/friend/accept/' + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchFriends();
			fetchBlocked();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const DeclineFriend = async (username: string) => {
		try {
			const response = await axios.patch(
				'http://' + env.host + ':' + env.port + '/friend/decline/' + username,
				{},
				{ withCredentials: true }
			);
			fetchUsers();
			fetchFriends();
			fetchBlocked();
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="social">
			<MainFrame title="Friends" showBlockModal={showBlockModal}>
				{navbarStatus !== 'AddFriends' && (
					<Navbar
						navbarStatus={navbarStatus}
						setNavbarStatus={setNavbarStatus}
					/>
				)}
				{navbarStatus === 'Received' && (
					<Received
						AcceptFriend={AcceptFriend}
						DeclineFriend={DeclineFriend}
						pending={pending}
					/>
				)}
				{navbarStatus === 'Demands' && <Demands demands={demands} />}
				{navbarStatus === 'BlockedUsers' && (
					<BlockedUser
						blocked={blocked}
						users={users}
						UnBlockFriend={UnBlockFriend}
					/>
				)}
				{navbarStatus === 'Myfriends' && (
					<MyFriends
						RemoveFriend={RemoveFriend}
						friends={friends}
						BlockFriend={BlockFriend}
						showBlockModal={showBlockModal}
						setShowBlockModal={setShowBlockModal}
					/>
				)}
				{navbarStatus === 'AddFriends' && (
					<AddFriends
						AddFriendFunction={AddFriendFunction}
						setNavbarStatus={setNavbarStatus}
						blocked={blocked}
						users={users}
						friends={friends}
						userInfo={userInfo}
						pending={pending}
						demands={demands}
					/>
				)}
			</MainFrame>
		</div>
	);
};
