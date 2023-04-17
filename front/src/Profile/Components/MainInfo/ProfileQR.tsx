import React, { useEffect, useState } from 'react';
import QRCodeSVG from 'qrcode.react';
import axios from 'axios';
import './ProfileQR.css';
/* Components */
import Input from '../../../Login/Components/Auth/Input/Input';
import Button from '../../../Login/Components/Auth/Button/Button';
/* Ressources */
import closeQR from './Ressources/closeQR.svg';
import padlock from './Ressources/padlock.svg';

interface ProfileQRProps {
	handleTrigger: () => void;
}

export const ProfileQR = ({ handleTrigger }: ProfileQRProps) => {
	const me = document.getElementsByClassName('popup');
	const toggleState = document.querySelector<HTMLInputElement>(
		'.simpletoggle-wrapper input[type="checkbox"]'
	);
	const [qrCodeUrl, setQrCodeUrl] = useState('');
	const [inputError, setInputError] = useState('');

	useEffect(() => {
		window.onclick = (event: any) => {
			if (event.target === me[0]) {
				resetTrigger();
			}
		};
	}, [me, handleTrigger]);

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

	const resetTrigger = () => {
		handleTrigger();
		toggleState!.checked = false; // Point d'exclamation permet de garantir que l'élément existe
	};

	return (
		<div className="profileqr-wrapper">
			<img src={closeQR} alt="close-button" onClick={resetTrigger} />
			<h2>2FA Status</h2>
			<QRCodeSVG value={qrCodeUrl} bgColor="#F9DA49" size={68} />
			<p style={{ width: '363px' }}>
				<span style={{ fontWeight: 600 }}>Scan the Qr Code</span>
				<br />
				This will generate a code that you will have to fill bellow
				<br />
				<br />
				<span style={{ fontStyle: 'italic' }}>
					If you're unable to scan the code, you can still enable 2FA
					by manually entering the code{' '}
					<span style={{ fontWeight: 600 }}>XXXXX</span>
				</span>
				<br />
				<br />
				Please note that this method takes longer and is less secure
				than scanning the QR code. Keep your account safe by choosing
				the QR code option whenever possible.
			</p>
			<Input
				input_title="Generated Code"
				placeholder="enter the generated code"
				icon={padlock}
				error={inputError}
			/>
			<Button
				content="Enable 2FA"
				href=""
				absolut={true}
				bottom={false}
				onClick={resetTrigger}
			/>
		</div>
	);
};
