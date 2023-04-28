import React, { ReactNode } from 'react';
import { SearchBar } from './SearchBar/SearchBar';

const MainFrame = ({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) => {
	return (
		<div className="main-frame">
			<h1>{title}</h1>
			{children}
		</div>
	);
};

export const AddFriends = () => {
	return (
		<div className="friends">
			<MainFrame title="Friends">
				<SearchBar />
			</MainFrame>
		</div>
	);
};
