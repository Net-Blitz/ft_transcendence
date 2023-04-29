import React from 'react';
import axios from 'axios';
import './Profile.css';
/*	COMPONENTS	*/
import { MainInfo } from './Components/MainInfo/MainInfo';
import { MiddleInfo } from './Components/MiddleInfo/MiddleInfo';
import { MatchHistory } from './Components/MatchHistory/MatchHistory';

export const Profile = () => {
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
				<MainInfo />
				<MiddleInfo />
				<MatchHistory />
			</div>
		</div>
	);
};
