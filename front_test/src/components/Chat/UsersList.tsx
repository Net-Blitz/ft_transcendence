import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function UsersList({ channel }: any) {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		const fetchChannel = async () => {
			const response = await axios.get<any>(
				"http://localhost:3333/chat/channel/" + channel,
				{ withCredentials: true }
			);
			setUsers(response.data.users);
		};
		fetchChannel();

		const interval = setInterval(fetchChannel, 5000);
		return () => clearInterval(interval);
	}, [channel]);

	return (
		<>
			<div className="top">
				<p>Users list</p>
			</div>
			<ul className="users">
				{users.map((user: any) => (
					<Link to={"/profile/" + user.username}>
						<li className="person" key={user.id}>
							<img
								className="friend-img"
								src={user.avatar}
								alt="avatar"
							/>
							<span className="name">{user.username}</span>
						</li>
					</Link>
				))}
			</ul>
		</>
	);
}

export default UsersList;
