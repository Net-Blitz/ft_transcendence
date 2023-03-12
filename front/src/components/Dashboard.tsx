import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

interface User {
	avatar: string;
	elo: number;
	id: number;
	wins: number;
	losses: number;
	status: string;
	twoFactor: boolean;
	username: string;
}

interface UpdateUserDto {
	username?: string;
	avatar?: string;
}

function Dashboard() {
	const [userInfo, setUserInfo] = useState<User>();
	const [newUserInfo, setNewUserInfo] = useState<UpdateUserDto>({});

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get("http://localhost:3333/users/me", {
				withCredentials: true,
			});
			setUserInfo(response.data);
		};
		fetchData();
	}, []);
	//console.log(userInfo);

	const handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = event.target;
		setNewUserInfo((prevState: any) => ({ ...prevState, [name]: value }));
	};

	const handleUpdateClick = async () => {
		await axios.put("http://localhost:3333/users/update", newUserInfo, {
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'PUT',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});
		const response = await axios.get("http://localhost:3333/users/me", {
			withCredentials: true,
		});
		setUserInfo(response.data);
		setNewUserInfo({});
	};

	return (
		<div>
			<h1>Dashboard</h1>
			<h2>User information:</h2>
			{userInfo ? (
				<div>
					<img className="user-img" src={userInfo.avatar} alt="avatar" />
					<h3>Username: {userInfo.username}</h3>
					<p>Elo: {userInfo.elo}</p>
					<p>Wins: {userInfo.wins}</p>
					<p>Losses: {userInfo.losses}</p>

					<input
						type="text"
						placeholder="New username"
						name="username"
						value={newUserInfo.username || ""}
						onChange={handleInputChange}
					/>
					<input
						type="text"
						placeholder="New avatar URL"
						name="avatar"
						value={newUserInfo.avatar || ""}
						onChange={handleInputChange}
					/>
					<button onClick={handleUpdateClick}>Update</button>
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
};

export default Dashboard;
