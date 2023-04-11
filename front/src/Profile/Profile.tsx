import React from 'react';
import './Profile.css';
/*	COMPONENTS	*/
import { MainInfo } from './Components/MainInfo/MainInfo';

export const Profile = () => {
	return (
		<div className="profile-wrapper">
			<h1>My Profile</h1>
			<div className="content-wrapper">
				<MainInfo />
			</div>
		</div>
	);
};
