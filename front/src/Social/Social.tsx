import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Social.css';

const MainFrame = ({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) => {
	return (
		<div className="main-frame">
			<h1>{title}</h1>
			{children}
		</div>
	);
};

interface NavbarProps {
	navbarStatus: string;
	setNavbarStatus: (status: string) => void;
}

const Navbar = ({ navbarStatus, setNavbarStatus }: NavbarProps) => {
	const navigate = useNavigate();
	return (
		<div className="navbar">
			<div className="navbarLeft">
				<button
					className={
						navbarStatus === 'Myfriends' ? 'active' : 'inactive'
					}
					onClick={() => setNavbarStatus('Myfriends')}>
					My friends
				</button>
				<button
					className={
						navbarStatus === 'Received' ? 'active' : 'inactive'
					}
					onClick={() => setNavbarStatus('Received')}>
					Received
				</button>
				<button
					className={
						navbarStatus === 'BlockedUsers' ? 'active' : 'inactive'
					}
					onClick={() => setNavbarStatus('BlockedUsers')}>
					Blocked Users
				</button>
			</div>
			<button
				className={'addFriends'}
				onClick={() => navigate('/addfriends')}>
				Add Friends
			</button>
		</div>
	);
};

export const Social = () => {
	const [navbarStatus, setNavbarStatus] = useState('Myfriends');

	return (
		<div className="friends">
			<MainFrame title="Friends">
				<Navbar
					navbarStatus={navbarStatus}
					setNavbarStatus={setNavbarStatus}
				/>
			</MainFrame>
		</div>
	);
};
