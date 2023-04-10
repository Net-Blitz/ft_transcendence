import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

/*	COMPONENTS	*/
import MainPage from './MainPage/MainPage';
import { Login, Login2fa, Config, Config2fa } from './Login/Login';
import { AuthRoutes } from './utils/PrivateRoutes';
import { useSelector } from 'react-redux';
/*	HOOKS	*/
import { useGetUser } from './utils/hooks';
/*	SELECTORS	*/
import { selectUser } from './utils/redux/selectors';

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

	if (status !== 'resolved' && status !== 'notAuth') return <div></div>;
	return (
		<Routes>
			<Route element={<AuthRoutes />}>
				<Route path="/" element={<MainPage />} />
				<Route path="/login/config" element={<Config />} />{' '}
				<Route path="/login/2faconfig" element={<Config2fa />} />
			</Route>
			<Route path="/login/2fa/:login" element={<Login2fa />} />
			<Route path="/login" element={<Login />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default App;
