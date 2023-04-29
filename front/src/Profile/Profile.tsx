import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Profile.css';
/*	Components	*/
import { MainInfo } from './Components/MainInfo/MainInfo';
import { MiddleInfo } from './Components/MiddleInfo/MiddleInfo';
import { MatchHistory } from './Components/MatchHistory/MatchHistory';
import { selectUserData } from '../utils/redux/selectors';

export const Profile = () => {
	const userConnected = useSelector(selectUserData);
	const handleLogout = async () => {
		await axios.get('http://localhost:3333/users/logout', {
			withCredentials: true,
		});
		window.location.reload();
	};

	return (
		<div className="profile-wrapper">
			<h1>My Profile</h1>
			<button className="profile-logout" onClick={handleLogout}>
				Logout
			</button>
			<div className="main-wrapper">
				<MainInfo userProfile={false} userData={userConnected} />
				<MiddleInfo userData={userConnected} />
				<MatchHistory userData={userConnected} />
			</div>
		</div>
	);
};
