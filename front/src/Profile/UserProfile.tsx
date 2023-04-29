import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useAxios } from '../utils/hooks';
import './UserProfile.css';
/*	Components	*/
import { MainFrame } from '../Messagerie/Messagerie';
import { MainInfo } from './Components/MainInfo/MainInfo';
import { MiddleInfo } from './Components/MiddleInfo/MiddleInfo';
import { MatchHistory } from './Components/MatchHistory/MatchHistory';

export const UserProfile = () => {
	const { username } = useParams();
	const [user, setUser] = useState({});

	const {
		isLoading,
		data,
		error,
	}: { isLoading: boolean; data: any; error: boolean } = useAxios(
		'http://localhost:3333/users/username/' + username
	);

	useEffect(() => {
		if (data) data.avatar = 'http://localhost:3333/' + data.avatar;
		setUser(data);
	}, [data]);

	if (isLoading && !error) return <div></div>;

	return (
		<>
			<MainFrame title={username + "'s Profile"}>
				<MainInfo userProfile={true} userData={user} />
				<MiddleInfo userData={user} />
				<MatchHistory userData={user} />
			</MainFrame>
		</>
	);
};
