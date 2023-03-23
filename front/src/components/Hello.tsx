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
		axios.post("http://localhost:3333/queues/add", {mode: "1v1"}, { withCredentials: true })
		.then((res) => {
			console.log(res);
			navigate("/lobby");
		})
		.catch((err) => {
			console.log(err);
		});
	};
	return (
		<div>
			<h1>Hello</h1>
			<p>Login success</p>
			<button onClick={handleLogout}>Logout</button>
			<button onClick={() => navigate("/search")}>SearchUser</button>
			<button onClick={() => navigate("/lobby")}>2FA</button>
			<button onClick={handleClick}>Dashboard</button>
			<button onClick={handleGame}>JoinGame</button>
		</div>
	);
};

export default Hello;
