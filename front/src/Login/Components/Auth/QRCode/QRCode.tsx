import React from 'react';
import './QRCode.css';

const QRCode = () => {
	return (
		<div className="qrcode-wrapper">
			<div className="QRCode"></div>
			<p>
				Scan the QR Code<br></br>This will generate a code that you will
				have to fill bellow
			</p>
		</div>
	);
};

export default QRCode;
