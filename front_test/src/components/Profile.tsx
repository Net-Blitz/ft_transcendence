import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useParams } from "react-router-dom";

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

function Profile() {
	const { username } = useParams<{ username: string }>();
	const [userInfo, setUserInfo] = useState<User>();

	useEffect(() => {
		const fetchData = async () => {
			const response = await axios.get(
				"http://localhost:3333/users/username/" + username,
				{
					withCredentials: true,
				}
			);
			setUserInfo(response.data);
		};
		fetchData();
	}, [username]);

	return (
		<div>
			<h1>Profile: {username}</h1>
			<h2>User information:</h2>
			{userInfo ? (
				<div>
					<img
						className="user-img"
						src={userInfo.avatar}
						alt="avatar"
					/>
					<h3>Username: {userInfo.username}</h3>
					<p>Elo: {userInfo.elo}</p>
					<p>Wins: {userInfo.wins}</p>
					<p>Losses: {userInfo.losses}</p>
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
}

export default Profile;
