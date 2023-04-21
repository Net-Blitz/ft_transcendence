import { useEffect, useState } from "react";
import "./Notification.css";

function Notification({ message, type }: { message: string; type: string }) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (message) {
			setShow(true);
			const timer = setTimeout(() => {
				setShow(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	return (
		<>
			<div className={`notification ${type} ${show ? "show" : ""}`}>
				<p>{message}</p>
			</div>
		</>
	);
}

export default Notification;
