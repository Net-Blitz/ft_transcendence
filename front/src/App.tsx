import React, { useEffect, useState } from 'react';
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
import GamePopUp from './Game/GamePopUp';
import GameInvitation from './Game/GameInvitation';

const NotFound = () => {
	return (
		<div>
			<h1>404 NOT FOUND</h1>
		</div>
	);
};

function App(this: any) {
	useGetUser();
	const user = useSelector(selectUser);
	const currentPath = window.location.pathname;
	const [reload, setReload] = useState(false);
	const [socketQueue, setSocketQueue] = useState<Socket>({} as Socket);
	const [socketGame, setSocketGame] = useState<Socket>({} as Socket);
	const env = {host: process.env.REACT_APP_BACK_HOST, port: process.env.REACT_APP_BACK_PORT}
	// transportOptions: { polling: { extraHeaders: { 'Access-Control-Allow-Origin': '*' } } }
	
	useEffect(() => {
		if (user.status === 'resolved' && user.auth)
		{				
			setSocketQueue(io("http://" + env.host + ":" + env.port + "/queue", {transports: ['websocket'], withCredentials: true}));
			setSocketGame(io("http://" + env.host + ":" + env.port + "/game", {transports: ['websocket'], withCredentials: true}));
		}
	}, [user]);
	// console.log("ENV", env, process.env);
	if (user.status !== 'resolved' && user.status !== 'notAuth') return <div></div>;
	return (
		<div>
			<GamePopUp socketQueue={socketQueue} reload={reload} setReload={setReload} />
			<GameInvitation socketQueue={socketQueue} />
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
						element={<GameRoute socketQueue={socketQueue} socketGame={socketGame} reload={reload} setReload={setReload} env={env}/>}
					/>
					<Route
						path="/Notification"
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
