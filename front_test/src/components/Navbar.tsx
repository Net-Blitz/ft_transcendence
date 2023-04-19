import React, { useState } from "react";
import axios from "axios";
import "./DoubleAuth.css"
import { useNavigate  } from "react-router-dom";
import Cookies from "js-cookie";

function Navbar() {
	const [verificationCode, setVerificationCode] = useState("");
	const searchParams = new URLSearchParams(window.location.search);
	const login = searchParams.get("login");
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

export default Navbar;
