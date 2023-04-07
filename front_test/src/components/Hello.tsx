import axios from "axios";
import { useNavigate } from "react-router-dom";

function Hello() {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/dashboard");
	};
	const handleLogout = () => {
		axios.get("http://localhost:3333/users/logout", { withCredentials: true })
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
		});
		navigate("/login");
	};

	const handleGame = () => {
		axios.get("http://localhost:3333/queues/joinable", { withCredentials: true })
		.then((res) => {
			if (res.data.canJoin)
				navigate("/lobby", { state: { mode: "1v1", login: res.data.login } } );
			if (res.data.reason === "playing")
				navigate("/game", { state: { gameId: res.data.gameId, login: res.data.login } } );
		})
		.catch((err) => {
			console.log(err);
		});
	};

	const handleGaming = () => {
		navigate("/game", {state: {gameId: 1, login: "jean"}})
	};

	return (
		<div>
			<h1>Hello</h1>
			<p>Login success</p>
			<button onClick={handleClick}>Dashboard</button>
			<button onClick={handleLogout}>Logout</button>
			<button onClick={() => navigate("/search")}>SearchUser</button>
			<button onClick={() => navigate("/2fa")}>2FA</button>
			<button onClick={handleGame}>JoinGame</button>
			<button onClick={handleGaming}>Gaming</button>
		</div>
	);
};

export default Hello;
