import React from "react";
import './Login.css';
import Background from "./Components/Background/Background";
import { AuthStart, Auth2fa } from "./Components/Auth/Auth";

export function LoginStart() {
	return (
		<div>
			<div className="login_auth_start"><AuthStart/></div>
			<div className="login_background"><Background/></div>
		</div>
	);
}

export function Login2fa() {
	return (
		<div>
			<div className="login_auth_2fa"><Auth2fa/></div>
			<div className="login_background"><Background/></div>
		</div>
	);
}