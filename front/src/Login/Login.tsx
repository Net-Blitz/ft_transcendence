import React from 'react';
import './Login.css';
/*	COMPONENTS	*/
import Background from './Components/Background/Background';
import { AuthStart, Auth2fa, AuthNameAvatar, AuthNo2fa } from './Components/Auth/Auth';

interface LoginPages {
	[key: string]: JSX.Element;
}

const Login = () => {
	const loginPages: LoginPages = {
		'/start': <AuthStart/>,
		'/2fa': <Auth2fa/>,
		'/name&avatar': <AuthNameAvatar/>,
		'/no2fa': <AuthNo2fa/>
	}

	return(
		<div>
			{loginPages[window.location.pathname]}
			<div className='login-background'><Background/></div>
		</div>
	);
}

export default Login;