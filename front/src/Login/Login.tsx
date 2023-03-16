import React from "react";
import './Login.css';
import Background from "./Components/Background/Background";
import { AuthStart, Auth2fa, AuthNameAvatar } from "./Components/Auth/Auth";
import { useLocation } from "react-router-dom";

interface LoginPages {
	[key: string]: JSX.Element;
}

const Login = () => {
	const loginPages: LoginPages = {
		"/start": <AuthStart/>,
		"/2fa": <Auth2fa/>,
		"/name&avatar": <AuthNameAvatar/>
	}

	return(
		<div>
			{loginPages[window.location.pathname]}
			<div className="login_background"><Background/></div>
		</div>
	);
}

export default Login;