import React, { ReactNode, useEffect, useState } from 'react';
import './Messagerie.css';
import { DmElement } from './Dm/DmElement';
import { ChannelElement } from './Channel/ChannelElement';
import { Socket, io } from 'socket.io-client';

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
	const [socket, setSocket] = useState<Socket>();

	useEffect(() => {
		const newSocket = io('http://localhost:3334');
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	if (!socket) return <div>Loading...</div>;

	return (
		<div className="messagerie">
			<MainFrame title="Messagerie">
				<Navbar
					navbarStatus={navbarStatus}
					setNavbarStatus={setNavbarStatus}
				/>
				{navbarStatus === 'privateMessage' ? (
					<DmElement socket={socket} />
				) : (
					<ChannelElement socket={socket} />
				)}
			</MainFrame>
		</div>
	);
};
