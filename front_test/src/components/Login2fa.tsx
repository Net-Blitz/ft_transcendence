import React, { useState } from "react";
import axios from "axios";
import "./DoubleAuth.css"
import { useNavigate  } from "react-router-dom";
import Cookies from "js-cookie";

function Login2fa() {
	const [verificationCode, setVerificationCode] = useState("");
	const [message, setMessage] = useState("");
	const searchParams = new URLSearchParams(window.location.search);
	const login = searchParams.get("login");
	const navigate = useNavigate();

	async function verify2fa() {
		try {
			const { data } = await axios.post(
				"http://localhost:3333/auth/2fa/verify?login=" + login,
				{ verificationCode }
			);
			Cookies.set("jwt", data.access_token);
			setMessage("Code verified");
			navigate("/");
		} catch (error) {
			setMessage("Invalid code");
		}
	}
	return (
		<div className="container">
			<h1>Verification 2FA</h1>
			<input
				type="text"
				value={verificationCode}
				onChange={(e) => setVerificationCode(e.target.value)}
				placeholder="Entrez le code de vérification ici"
			/>
			<button onClick={verify2fa}>Vérifier le code de vérification</button>
			{message && <p>{message}</p>}
		</div>
	);
}

export default Login2fa;
