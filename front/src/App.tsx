import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

/*	COMPONENTS	*/
import Login from './Login/Login';
import PrivateRoutes from './PrivateRoutes';

function App(this: any) {
	return (
		<Routes>
			<Route element={<PrivateRoutes />}>
				<Route path="/" element={<Login />} />
				<Route path="/login/2fa" element={<Login />} />
				<Route path="/login/name&avatar" element={<Login />} />
				<Route path="/login/2faconfig" element={<Login />} />
			</Route>
			<Route path="/login" element={<Login />} />
		</Routes>
	);
}

export default App;
