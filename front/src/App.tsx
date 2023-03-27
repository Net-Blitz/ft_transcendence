import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

/*	COMPONENTS	*/
import MainPage from './MainPage/MainPage';
import Login from './Login/Login';
import { AuthRoutes } from './utils/PrivateRoutes';
import { useGetUser } from './utils/hooks';

function App(this: any) {
	useGetUser();
	return (
		<Routes>
			<Route element={<AuthRoutes />}>
				<Route path="/" element={<MainPage />} />
				<Route path="/login/2fa" element={<Login />} />
				<Route path="/login/name&avatar" element={<Login />} />
				<Route path="/login/2faconfig" element={<Login />} />
			</Route>
			<Route path="/login" element={<Login />} />
		</Routes>
	);
}

export default App;
