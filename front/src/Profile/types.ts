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
