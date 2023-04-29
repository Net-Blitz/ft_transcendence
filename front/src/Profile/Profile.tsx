import React from 'react';
import { useSelector } from 'react-redux';
import './Profile.css';
/*	Components	*/
import { MainInfo } from './Components/MainInfo/MainInfo';
import { MiddleInfo } from './Components/MiddleInfo/MiddleInfo';
import { MatchHistory } from './Components/MatchHistory/MatchHistory';
import { selectUserData } from '../utils/redux/selectors';

export const Profile = () => {
	const userConnected = useSelector(selectUserData);

	return (
		<div className="profile-wrapper">
			<h1>My Profile</h1>
			<div className="main-wrapper">
				<MainInfo userProfile={false} userData={userConnected} />
				<MiddleInfo />
				<MatchHistory />
			</div>
		</div>
	);
};
