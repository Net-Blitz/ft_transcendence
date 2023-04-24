import React, { useState } from "react";
import QRCode from "qrcode.react";
import axios from "axios";
import "./DoubleAuth.css";

function DoubleAuth() {
	const [qrCodeUrl, setQrCodeUrl] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [message, setMessage] = useState("");

	async function generateQRCode() {
		try {
			const { data } = await axios.post(
				"http://localhost:3333/auth/2fa/setup",
				{},
				{
					withCredentials: true,
				}
			);
			setQrCodeUrl(data.otpAuthUrl);
		} catch (error) {
			setMessage("2FA already enabled");
		}
	}

	async function verify2fa() {
		try {
			await axios.post(
				"http://localhost:3333/auth/2fa/verify",
				{ verificationCode },
				{ withCredentials: true }
			);
			setMessage("Code verified");
		} catch (error) {
			setMessage("Invalid code");
		}
	}

	async function disable2FA() {
		try {
			await axios.delete("http://localhost:3333/auth/2fa/disable", {
				withCredentials: true,
			});
			setMessage("2FA disabled");
		} catch (error) {
			setMessage("Error while disabling 2FA");
		}
	}

	return (
		<div className="container">
			<button onClick={generateQRCode}>Générer le QR Code</button>
			<div className="qr-code">
				{qrCodeUrl && <QRCode value={qrCodeUrl} />}
			</div>
			<button onClick={disable2FA}>Supprimer la 2FA</button>
			<input
				type="text"
				value={verificationCode}
				onChange={(e) => setVerificationCode(e.target.value)}
				placeholder="Entrez le code de vérification ici"
			/>
			<button onClick={verify2fa}>
				Vérifier le code de vérification
			</button>
			{message && <p>{message}</p>}
		</div>
	);
}

export default DoubleAuth;
