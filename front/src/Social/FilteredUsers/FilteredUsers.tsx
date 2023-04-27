import React from 'react';
import './FilteredUsers.css';
import { AddFriends } from '../AddFriends/AddFriends';

interface userDataInt {
	username: string;
	experience: number;
	state: string;
	avatar: string;
}

interface FilteredUsersProps {
	searchQuery: string;
	filteredUsers: userDataInt[];
}

export const FilteredUsers: React.FC<FilteredUsersProps> = ({
	searchQuery,
	filteredUsers,
}) => {
	return (
		<div>
			{searchQuery.length > 0 && (
				<ul className="allFriendsSearch">
					{filteredUsers.map((user, index) => {
						const level = user.experience / 10000;
						return (
							<div className="friendsInfoAll">
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
										<p>{user.state.toLowerCase()}</p>
									</div>
								</div>
								<AddFriends username={user.username} />
							</div>
						);
					})}
				</ul>
			)}
		</div>
	);
};
