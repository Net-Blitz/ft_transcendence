import React, { useEffect, useState } from 'react';
import { AvatarData } from '../../Background/Background';
import './Carousel.css';

const Carousel = () => {
	/*	FILES	*/
	const avatar = AvatarData;
	/*	HOOK settings	*/
	const [currentIndex, setCurrentIndex] = useState(0);
	const [length, setLenght] = useState(avatar.length);

	useEffect(() => {
		setLenght(avatar.length);
	}, avatar);

	const prev = () => {
		if (currentIndex !== 0)
			setCurrentIndex(currentIndex - 1);
	};

	const next = () => {
		if (currentIndex + 1 < length)
			setCurrentIndex(currentIndex + 1);
	}

	const renderAvatar = (index: number, setting: string) => {
		if (index < 0 || index >= length)
		{
			return (
				<div
					className={`avatar ${setting} empty`}
				></div>
			);
		}
		else
		{
			return (
				<div
					className={`avatar ${setting}`}
					style={{
						backgroundImage: `url(${avatar[index].avatar})`,
						backgroundPosition: 'center',
						backgroundSize: 'cover'
					}}
					onClick={setting === 'left' ? prev : setting === 'right' ? next : undefined}
				></div>
			);
		}
	}

	return (
		<div className='carousel-wrapper'>
			<div className='carousel-element'>
				{renderAvatar(currentIndex - 1, 'left')}
				{renderAvatar(currentIndex, '')}
				{renderAvatar(currentIndex + 1, 'right')}
			</div>
			<button>Download your avatar</button>
		</div>
	);
};

export default Carousel;