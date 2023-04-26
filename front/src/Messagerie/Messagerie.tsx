import React, { ReactNode, useState } from 'react';
import './Messagerie.css';
import { DmElement } from './Dm/DmElement';

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
	return (
		<div className="navbar">
			<button
				className={
					navbarStatus === 'privateMessage' ? 'active' : 'inactive'
				}
				onClick={() => setNavbarStatus('privateMessage')}>
				Private Message
			</button>
			<button
				className={navbarStatus === 'channel' ? 'active' : 'inactive'}
				onClick={() => setNavbarStatus('channel')}>
				Channel
			</button>
		</div>
	);
};

export const Messagerie = () => {
	const [navbarStatus, setNavbarStatus] = useState('privateMessage');

	return (
		<div className="messagerie">
			<MainFrame title="Messagerie">
				<Navbar
					navbarStatus={navbarStatus}
					setNavbarStatus={setNavbarStatus}
				/>
				{navbarStatus === 'privateMessage' ? <DmElement /> : undefined}
			</MainFrame>
		</div>
	);
};
