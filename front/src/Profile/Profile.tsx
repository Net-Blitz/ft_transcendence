import React from 'react';
import './Profile.css';
/*	COMPONENTS	*/
import { MainInfo } from './Components/MainInfo/MainInfo';
import { MiddleInfo } from './Components/MiddleInfo/MiddleInfo';

export const Profile = () => {
	return (
		<div className="profile-wrapper">
			<h1>My Profile</h1>
			<div className="main-wrapper">
				<MainInfo />
				<MiddleInfo />
			</div>
		</div>
	);
};
