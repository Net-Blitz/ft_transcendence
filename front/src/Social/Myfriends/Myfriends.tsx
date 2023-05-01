import React, { useState } from 'react';
import { User } from '../types';
import { BlockedPopUp } from '../BlockedPopUp/BlockedPopUp';
import { Link } from 'react-router-dom';
import './Myfriends.css';

//Ressources
import block_blue from '../Ressources/block_blue.svg';
import game_blue from '../Ressources/game_blue.svg';
import cancel_blue from '../Ressources/cancel_blue.svg';

interface MyFriendsProps {
	RemoveFriend: (username: string) => Promise<void>;
	BlockFriend: (username: string) => Promise<void>;
	friends: User[];
	showBlockModal: boolean;
	setShowBlockModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export const MyFriends = ({
	RemoveFriend,
	friends,
	BlockFriend,
	showBlockModal,
	setShowBlockModal,
}: MyFriendsProps) => {
	const [friendBlockedUsername, setfriendBlockedUsername] = useState('');
	return (
		<>
			<ul
				className={`allmyFriendsSearch ${
					showBlockModal ? 'popUpBlockActive' : 'popUpBlockInactive'
				}`}>
				{friends.map((friend, index) => {
					const level = friend.experience / 10000;
					return (
						<div className="myFriendsInfoAll" key={friend.id}>
							<div className="firstRowMyFriends">
								<div className="myFriendsInfo">
									<Link
										to={'/profile/' + friend.username}
										className="customLink">
										<img
											className="myFriendsImgUser"
											src={`http://localhost:3333/${friend.avatar}`}
											alt="avatar"
										/>
										<div className="myFriendsInfoTxt">
											<div className="myFriendsInfoSpe">
												<p>Pseudo</p>
												<p>{friend.username}</p>
											</div>
											<div className="myFriendsInfoSpe">
												<p>Level</p>
												<p>{level}</p>
											</div>
											<div className="myFriendsInfoSpe">
												<p>Status</p>
												<p>
													{friend.state.toLowerCase()}
												</p>
											</div>
										</div>
									</Link>
								</div>
								<div className="myFriendsButton">
									<button className="myFriendsadd playGameButton">
										<img
											className={
												friend.state.toLowerCase() ===
												'playing'
													? 'active'
													: 'inactive'
											}
											src={game_blue}
											alt="play with this user"
										/>
									</button>
									<button
										className="myFriendsadd"
										onClick={() =>
											RemoveFriend(friend.username)
										}>
										<img
											src={cancel_blue}
											alt="remove this user from my friend list"
										/>
									</button>
									<button
										className="myFriendsadd"
										onClick={
											() => {
												setShowBlockModal(true);
												setfriendBlockedUsername(
													friend.username
												);
											}
											// BlockFriend(friend.username)
										}>
										<img
											src={block_blue}
											alt="block this user"
										/>
									</button>
								</div>
							</div>
							<div className="secondRowMyFriends">
								<div className="chatProfileButtonMyFriends">
									<button className="profileButtonMyFriend">
										View Profile
									</button>
									<button className="chatButtonMyFriend">
										Chat
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</ul>
			{showBlockModal && (
				<BlockedPopUp
					BlockFriend={BlockFriend}
					friendBlockedUsername={friendBlockedUsername}
					setShowBlockModal={setShowBlockModal}
				/>
			)}
		</>
	);
};