import { useState } from "react";
import axios from "axios";
import "./Dashboard.css"

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

function SearchUser() {
	const [username, setUsername] = useState<string>("");
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleSearch = async () => {
		setIsLoading(true);
		try {
			const response = await axios.get(`http://localhost:3333/users/login/${username}`, {
				withCredentials: true,
		});
			setUser(response.data);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
			<button onClick={handleSearch}>Rechercher</button>
			{isLoading ? (
				<p>Chargement...</p>
			) : user ? (
				<div>
					<h2>{user.username}</h2>
					<img className="user-img" src={user.avatar} alt="Avatar" />
					<p>elo: {user.elo}</p>
					<p>wins: {user.wins}</p>
					<p>losses: {user.losses}</p>
				</div>
			) : null}
		</div>
	);
};

export default SearchUser;
