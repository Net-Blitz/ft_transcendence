import React from "react";
import './Login.css';
import Background from "./Components/Background/Background";
import { AuthStart, Auth2fa } from "./Components/Auth/Auth";

interface LoginPages {
	[key: string]: JSX.Element;
}

const Login = () => {
	const loginPages: LoginPages = {
		"/start": <AuthStart/>,
		"/2fa": <Auth2fa/>
	}

	return(
		<div>
			<div className="login_auth_start">{loginPages[window.location.pathname]}</div>
			<div className="login_background"><Background/></div>
		</div>
	);
}

export default Login;