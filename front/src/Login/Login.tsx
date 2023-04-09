import React from 'react';
import './Login.css';
/*	COMPONENTS	*/
import Background from './Components/Background/Background';
import {
	AuthStart,
	Auth2fa,
	AuthNameAvatar,
	Auth2faConfig,
} from './Components/Auth/Auth';

interface LoginPages {
	[key: string]: JSX.Element;
}

export const Login = () => {
	const loginPages: LoginPages = {
		'/login': <AuthStart />,
		'/login/config': <AuthNameAvatar />,
		'/login/2faconfig': <Auth2faConfig />,
	};
	return (
		<div>
			{loginPages[window.location.pathname]}
			<div className="login-background">
				<Background />
			</div>
		</div>
	);
};

export const Login2fa = () => {
	return (
		<div>
			<Auth2fa />
			<div className="login-background">
				<Background />
			</div>
		</div>
	);
};
