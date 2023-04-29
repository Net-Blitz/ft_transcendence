import React from 'react';

interface userDataInt {
	username: string;
	level: number;
	status: string;
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
				<ul>
					{filteredUsers.map((user, index) => (
						<li key={index}>
							<p>{user.username}</p>
							<p>{user.level}</p>
							<p>{user.status}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
