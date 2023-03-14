import React from "react";
import './Login.css';
import Background from "./Background/Background";
import Auth from "./Auth/Auth";

export default function Login() {
	return (
		<div>
			<div className="auth_log"><Auth/></div>
			<div className="background_log"><Background/></div>
		</div>
	);
}