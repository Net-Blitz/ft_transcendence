import React, { useEffect, useState } from 'react';
import { AvatarData } from '../../Background/Background';
import './Carousel.css';

const Carousel = () => {
	/*	HOOK settings	*/
	const [currentIndex, setCurrentIndex] = useState(0);
	const [avatar, setAvatar] = useState(AvatarData);
	const [length, setLenght] = useState(avatar.length);

	useEffect(() => {
		setLenght(avatar.length);
	}, [avatar]);

	const prev = () => {
		if (currentIndex !== 0) setCurrentIndex(currentIndex - 1);
	};

	const next = () => {
		if (currentIndex + 1 < length) setCurrentIndex(currentIndex + 1);
	};

	const renderAvatar = (index: number, setting: string) => {
		if (index < 0 || index >= length) {
			return <div className={`avatar ${setting} empty`}></div>;
		} else {
			return (
				<div
					className={`avatar ${setting}`}
					style={{
						backgroundImage: `url(${avatar[index].avatar})`,
						backgroundPosition: 'center',
						backgroundSize: 'cover',
					}}
					onClick={
						setting === 'left'
							? prev
							: setting === 'right'
							? next
							: undefined
					}></div>
			);
		}
	};

	const handleChange = (event: any) => {
		const file = event.target.files[0];
		if (file)
		{
			const reader = new FileReader();
			reader.addEventListener("load", function() {
				let newAvatar = [...avatar];
				newAvatar.splice(currentIndex, 0, {avatar: reader.result});
				setAvatar(newAvatar);
			});
			reader.readAsDataURL(file);
		}
	}

	return (
		<div className="carousel-wrapper">
			<div className="carousel-element">
				{renderAvatar(currentIndex - 1, 'left')}
				{renderAvatar(currentIndex, '')}
				{renderAvatar(currentIndex + 1, 'right')}
			</div>
			<label htmlFor="inputTag">
				Download your avatar
				<input
					id="inputTag" 
					type="file" 
					accept=".png, .jpg, .jpeg"
					onChange={handleChange}
				/>
			</label>
		</div>
	);
};

export default Carousel;
