export interface MainInfoProps {
	avatar: string;
	username: string;
}

export interface InfoElementProps {
	title: string;
	content: string;
	isToggle?: boolean;
	border?: boolean;
}

export interface SimpleToggleProps {
	toggled: boolean;
	onClick: (isToggled: boolean) => void;
}

export interface BasicFrameProps {
	height: string;
	width: string;
	title: string;
	children: React.ReactNode;
}

export interface AchievementProps {
	img: string;
	title: string;
	description: string;
	lock?: boolean;
}
