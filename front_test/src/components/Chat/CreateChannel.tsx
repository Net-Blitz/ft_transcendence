import axios from "axios";
import React, { useRef, useState } from "react";

function CreateChannel({
	ClosePopup,
	setAlert,
}: {
	ClosePopup: () => void;
	setAlert: (Alert: { message: string; type: string }) => void;
}) {
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [privacy, setPrivacy] = useState("PUBLIC");
	const PopupRef = useRef<HTMLDivElement>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			let state = "PUBLIC";
			switch (privacy) {
				case "PUBLIC":
					state = "PUBLIC";
					break;
				case "PROTECTED":
					state = "PROTECTED";
					break;
				case "PRIVATE":
					state = "PRIVATE";
					break;
			}
			await axios.post(
				"http://localhost:3333/chat/create/" + name,
				{ state, password },
				{ withCredentials: true }
			);
			setName("");
			setPassword("");
			setPrivacy("PUBLIC");
			ClosePopup();
			setAlert({
				message: "Channel " + name + " created",
				type: "success",
			});
		} catch (error) {
			setAlert({
				message: "Channel " + name + " already exist",
				type: "error",
			});
		}
	};

	return (
		<div ref={PopupRef} className="overlay">
			<div className="popup center">
				<label className="close" onClick={ClosePopup}>
					&times;
				</label>
				<h2>Create a Channel</h2>
				<div className="content">
					<form onSubmit={handleSubmit}>
						<label>
							Create a channel:
							<input
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter channel name"
								value={name}
								type="text"
							/>
						</label>
						<label>
							Privacy:
							<select
								value={privacy}
								onChange={(e) => setPrivacy(e.target.value)}
							>
								<option value="PUBLIC">Public</option>
								<option value="PROTECTED">Protected</option>
								<option value="PRIVATE">Private</option>
							</select>
						</label>

						{privacy === "PROTECTED" && (
							<input
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								value={password}
								type="password"
							/>
						)}
						<button type="submit">Create</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default CreateChannel;
