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

const Login = () => {
	const loginPages: LoginPages = {
		'/login': <AuthStart />,
		'/login/2fa': <Auth2fa />,
		'/login/name&avatar': <AuthNameAvatar />,
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

export default Login;
