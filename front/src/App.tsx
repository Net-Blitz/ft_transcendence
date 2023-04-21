import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

/*	COMPONENTS	*/
import MainPage from './MainPage/MainPage';
import Contact from './Contact/Contact';
import { Login, Login2fa, Config, Config2fa } from './Login/Login';
import Chat from './Chat/Chat';
import AppLayout from './AppLayout';
import GameRoute from './Game/GameRoute';
import Notification from './Notification/Notification';
import { Profile } from './Profile/Profile';
import { AuthRoutes } from './utils/PrivateRoutes';
import { useSelector } from 'react-redux';
/*	HOOKS	*/
import { useGetUser } from './utils/hooks';
/*	SELECTORS	*/
import { selectUser } from './utils/redux/selectors';
/* SOCKET */
import { io, Socket } from 'socket.io-client';
import { Manager } from "socket.io-client";

const NotFound = () => {
	return (
		<div>
			<h1>404 NOT FOUND</h1>
		</div>
	);
};

function App(this: any) {
	useGetUser();
	const status = useSelector(selectUser).status;
	const currentPath = window.location.pathname;

	const socketQueue: Socket = io("http://localhost:3333/queue", {transports: ['websocket'], withCredentials: true});
	const socketGame: Socket = io("http://localhost:3333/game", {transports: ['websocket'], withCredentials: true});

	if (status !== 'resolved' && status !== 'notAuth') return <div></div>;
	return (
		<div>
			<Routes>
				<Route element={<AuthRoutes />}>
					<Route
						path="/"
						element={
							<AppLayout>
								{' '}
								<MainPage />
							</AppLayout>
						}
					/>
					<Route path="/login/config" element={<Config />} />
					<Route path="/login/2faconfig" element={<Config2fa />} />
					<Route
						path="/contact"
						element={
							<AppLayout>
								{' '}
								<Contact />
							</AppLayout>
						}
					/>
					<Route
						path="/chat"
						element={
							<AppLayout>
								{' '}
								<Chat />
							</AppLayout>
						}
					/>
					<Route
						path="/game"
						element={<GameRoute socketQueue={socketQueue} socketGame={socketGame}/>}
					/>
					<Route
						path="/notification"
						element={
							<AppLayout>
								{' '}
								<Notification />
							</AppLayout>
						}
					/>
					<Route
						path="/profile"
						element={
							<AppLayout>
								{' '}
								<Profile />
							</AppLayout>
						}
					/>
				</Route>
				<Route path="/login" element={<Login />} />
				<Route path="/login/2fa/:login" element={<Login2fa />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	);
}

export default App;
