import React, { useEffect, useState } from 'react';
import QRCodeSVG from 'qrcode.react';
import axios from 'axios';
import './QrCode.css';

const QrCode = () => {
	const [qrCodeUrl, setQrCodeUrl] = useState('');

	useEffect(() => {
		async function fetchQR() {
			try {
				const { data } = await axios.post(
					'http://localhost:3333/auth/2fa/setup',
					{},
					{
						withCredentials: true,
					}
				);
				setQrCodeUrl(data.otpAuthUrl);
			} catch (error) {
				alert('2FA already enabled');
			}
		}
		fetchQR();
	}, []);

	return (
		<div className="qrcode-wrapper">
			<QRCodeSVG value={qrCodeUrl} bgColor="#F9DA49" />
			<p>
				Scan the QR Code<br></br>This will generate a code that you will
				have to fill bellow
			</p>
		</div>
	);
};

export default QrCode;
