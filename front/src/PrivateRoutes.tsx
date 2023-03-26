import { Navigate, Outlet } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

async function isAuthenticated() {
	try {
		const response = await axios.get('http://localhost:3333/auth/verify', {
			withCredentials: true,
		});
		if (response.data === 'OK') return true;
		return false;
	} catch (error) {
		return false;
	}
}

function PrivateRoutes() {
	const [isAuth, setIsAuth] = useState<boolean>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function checkAuth() {
			const auth = await isAuthenticated();
			setIsAuth(auth);
			setIsLoading(false);
		}
		checkAuth();
	}, []);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return !isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoutes;
