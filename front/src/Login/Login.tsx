import React from 'react';
import { useSelector } from 'react-redux';
import './Login.css';
/*	COMPONENTS	*/
import Background from './Components/Background/Background';
import {
	AuthStart,
	Auth2fa,
	AuthNameAvatar,
	Auth2faConfig,
} from './Components/Auth/Auth';
import { selectUser } from '../utils/redux/selectors';

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
