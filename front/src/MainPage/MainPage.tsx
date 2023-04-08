import React from 'react';
import { useSelector } from 'react-redux';
import './MainPage.css';
/*	SELECTORS	*/
import { selectUserData } from '../utils/redux/selectors';

const MainPage = () => {
	const user = useSelector(selectUserData);
	return (
		<div className='mainpage-wrapper'>
			<p>{user.username}</p>
			<img src={user.avatar} alt="avatar" />
		</div>
	);
}

export default MainPage;