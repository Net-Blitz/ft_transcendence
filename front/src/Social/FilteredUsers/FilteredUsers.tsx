import React from 'react';
import './FilteredUsers.css';
import { Link } from 'react-router-dom';
import { User } from '../types';

//Ressources
import add_blue from '../Ressources/add_blue.svg';

interface FilteredUsersProps {
	AddFriendFunction: (username: string) => Promise<void>;
	searchQuery: string;
	users: User[];
	friends: User[];
	userInfo: User | undefined;
	pending: User[];
	blocked: User[];
	demands: User[];
}

export const FilteredUsers: React.FC<FilteredUsersProps> = ({
	AddFriendFunction,
	searchQuery,
	users,
	friends,
	userInfo,
	pending,
	demands,
	blocked,
}) => {
	const filteredUsers = users.filter(
		(user) =>
			user.id !== userInfo?.id &&
			!friends.some((friend) => friend.id === user.id) &&
			!pending.some((pending) => pending.id === user.id) &&
			!demands.some((demand) => demand.id === user.id) &&
			!blocked.some((block) => block.id === user.id) &&
			user.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<>
			<div>
				{searchQuery.length > 0 && (
					<ul className="allFriendsSearch">
						{filteredUsers.map((user, index) => {
							const level = user.experience / 10000;
							return (
								<div className="friendsInfoAll" key={index}>
									<div className="friendsInfoNomsg">
										<Link
											className="customLink"
											to={'/profile/' + user.username}>
											<img
												className="imgUser"
												src={`http://localhost:3333/${user.avatar}`}
												alt="username avatar"
											/>
											<div className="friendsInfoTxt">
												<div className="friendsInfoSpe">
													<p>Pseudo</p>
													<p>{user.username}</p>
												</div>
												<div className="friendsInfoSpe">
													<p>Level</p>
													<p>{level}</p>
												</div>
												<div className="friendsInfoSpe">
													<p>Status</p>
													<p>
														{user.state.toLowerCase()}
													</p>
												</div>
											</div>
										</Link>
										<button
											className="addUser"
											onClick={() =>
												AddFriendFunction(user.username)
											}>
											<img
												src={add_blue}
												alt="all user"
											/>
										</button>
									</div>
								</div>
							);
						})}
					</ul>
				)}
			</div>
		</>
	);
};
