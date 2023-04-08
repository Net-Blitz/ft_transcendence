import React, { useEffect, useState } from 'react';
import './Carousel.css';
/*	Functions	*/
import { useGenerateAvatars } from './genAvatars';
/*	Ressources	*/
import refresh from './Ressources/refresh.png';

const Carousel = () => {
	/*	HOOK settings	*/
	const [currentIndex, setCurrentIndex] = useState(0);
	const [avatar, setAvatar] = useState(useGenerateAvatars(12));
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
						backgroundImage: `url('${avatar[index].url}')`,
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

	// const checkFile = async (file: any) => {
	// 	const formData = new FormData();
	// 	formData.append('file', file);

	// 	try {
	// 		const response = await axios.post(
	// 			'http://localhost:3333/file/check',
	// 			formData,
	// 			{
	// 				withCredentials: true,
	// 			}
	// 		);
	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// };

	const handleChange = (event: any) => {
		const file = event.target.files[0];
		console.log(file.name, file.type, file.size);
		if (file) {
			const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
			const allowedSize = 2 * 1024 * 1024;
			if (allowedTypes.includes(file.type) && file.size <= allowedSize) {
				const img = new Image();
				img.src = URL.createObjectURL(file);
				img.onload = () => {
					if (img.width > 400 || img.height > 400)
						alert('Image too big (max 400x400)');
					else {
						const reader = new FileReader();
						reader.addEventListener('load', function () {
							let newAvatar = [...avatar];
							newAvatar.splice(currentIndex, 0, {
								url: reader.result,
								source: 'imported',
								type: file.type,
							});
							setAvatar(newAvatar);
						});
						reader.readAsDataURL(file);
					}
				};
			} else
				alert('File not supported (png, jpg, jpeg) or too big (> 2Mo)');
		}
	};

	const handleRefresh = () => {
		let newAvatar = useGenerateAvatars(12);
		for (let i = 0; i < avatar.length; i++) {
			if (avatar[i].source === 'imported')
				newAvatar.splice(i, 0, avatar[i]);
		}
		setAvatar(newAvatar);
	};

	return (
		<div className="carousel-wrapper">
			<div className="carousel-element">
				{renderAvatar(currentIndex - 1, 'left')}
				{renderAvatar(currentIndex, '')}
				{renderAvatar(currentIndex + 1, 'right')}
			</div>
			<div className="carousel-refresh">
				<label htmlFor="inputTag">
					Download your avatar
					<input
						id="inputTag"
						type="file"
						accept=".png, .jpg, .jpeg"
						onChange={handleChange}
					/>
				</label>
				<img src={refresh} alt="refresh logo" onClick={handleRefresh} />
			</div>
		</div>
	);
};

export default Carousel;
