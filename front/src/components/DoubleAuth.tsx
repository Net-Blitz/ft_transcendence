import React, { useState } from "react";
import QRCode from "qrcode.react";
import axios from "axios";

function DoubleAuth() {
	const [qrCodeUrl, setQrCodeUrl] = useState("");
	const [verificationCode, setVerificationCode] = useState("");

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
			//console.log(error);
		}
	}

	async function verify2fa() {
		try {
			const { data } = await axios.post(
				"http://localhost:3333/auth/2fa/verify",
				{ verificationCode },
				{ withCredentials: true }
			);
			//console.log(data);
		} catch (error) {
			//console.log(error);
		}
	}

	return (
		<div>
			<button onClick={generateQRCode}>Générer le QR Code</button>
			{qrCodeUrl && <QRCode value={qrCodeUrl} />}
			<input
				type="text"
				value={verificationCode}
				onChange={(e) => setVerificationCode(e.target.value)}
				placeholder="Entrez le code de vérification ici"
			/>
			<button onClick={verify2fa}>
				Vérifier le code de vérification
			</button>
		</div>
	);
}

export default DoubleAuth;
