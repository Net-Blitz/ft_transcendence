import React from 'react';
import './Navbar.css';

import { Link, useLocation } from 'react-router-dom';
// import './Navbar.css';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../utils/redux/selectors';
import logo from './Ressources/logo.svg';
import avatar from './Ressources/avatar.svg';
// Inactive
import chat_blue from './Ressources/chat_blue.svg';
import contact_blue from './Ressources/contact_blue.svg';
import game_blue from './Ressources/game_blue.svg';
import notif_blue from './Ressources/notif_blue.svg';
// Active
import chat_white from './Ressources/chat_white.svg';
import contact_white from './Ressources/contact_white.svg';
import game_white from './Ressources/game_white.svg';
import notif_white from './Ressources/notif_white.svg';

const Navbar = () => {
	/* 	SELECTORS	*/
	const userData = useSelector(selectUserData);
	//   const avatar = useSelector(selectUserData).pseudo;
	const location = useLocation();
	const currentPath = location.pathname;
	const buttons = [
		{ content: 'Home', href: '/', imgSrc: logo },
		{
			content: 'Social',
			href: '/social',
			imgSrc: contact_blue,
			activeImgSrc: contact_white,
		},
		{
			content: 'Game',
			href: '/game',
			imgSrc: game_blue,
			activeImgSrc: game_white,
		},
		{
			content: 'Chat',
			href: '/chat',
			imgSrc: chat_blue,
			activeImgSrc: chat_white,
		},
		{ content: 'Profile', href: '/profile', imgSrc: userData.avatar },
	];

	return (
		<div className="parent_container">
			<div className="background_navbar">
				{buttons.map((button) => {
					return (
						<Link
							key={button.content}
							to={button.href}
							className={button.content}>
							{(() => {
								//IIFE : function that is defined and executed after its creation
								const isMatchingPath =
									currentPath === button.href &&
									button.href !== '/' &&
									button.href !== '/profile';

								return button.content === 'Profile' ? (
									<div>
										<div className="profile-img">
											<img
												src={
													isMatchingPath
														? button.activeImgSrc
														: button.imgSrc
												}
												alt={button.content}
											/>
										</div>
										<p>{userData.username}</p>
									</div>
								) : (
									<div
										className={
											isMatchingPath
												? 'active'
												: 'inactive'
										}>
										<img
											src={
												isMatchingPath
													? button.activeImgSrc
													: button.imgSrc
											}
											alt={button.content}
										/>
									</div>
								);
							})()}
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default Navbar;
