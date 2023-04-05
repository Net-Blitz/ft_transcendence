import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

/*	COMPONENTS	*/
import MainPage from './MainPage/MainPage';
import Contact from './Contact/Contact';
import Login from './Login/Login';
import Chat from './Chat/Chat';
import Game from './Game/Game';
import Notification from './Notification/Notification';
import Navbar from './Components/Navbar/Navbar';
import { AuthRoutes} from './utils/PrivateRoutes';
import { useSelector } from 'react-redux';
/*	HOOKS	*/
import { useGetUser } from './utils/hooks';
/*	SELECTORS	*/
import { selectUser } from './utils/redux/selectors';

function App(this: any) {
	useGetUser();
	const status = useSelector(selectUser).status;
	const currentPath = window.location.pathname;

	if (status !== 'resolved' && status !== 'notAuth')
		return (<div></div>);
	return (
		<div>
			<Routes>
				<Route element={<AuthRoutes />}>
					<Route path="/"element={<> <Navbar /> <MainPage /></>} />
					<Route path="/login/2fa" element={<Login />} />
					<Route path="/login/name&avatar" element={<Login />} /> {/** @TODO Changer le path */}
					<Route path="/login/2faconfig" element={<Login />} />
					<Route path="/contact" element={<> <Navbar /> <Contact /></>} />
					<Route path="/chat" element={<> <Navbar /> <Chat /></>} />
					<Route path="/game" element={<> <Navbar /> <Game /></>} />
					<Route path="/notification" element={<> <Navbar /> <Notification /></>} />
				</Route>
				<Route path="/login" element={<Login />} />
			</Routes>
		</div>
	);
}

export default App;
