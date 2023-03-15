import React from 'react';
import './Background.css';

/*	RESSOURCES	*/
import BackgroundImg from './Ressources/background.png';
import img_lgiband from './Ressources/lgiband.png';
import img_gkehren from './Ressources/gkehren.png';
import img_jbach from './Ressources/jbach.png';
import img_genouf from './Ressources/genouf.png';

export const AvatarData = [
	{
		avatar: img_genouf
	},
	{
		avatar: img_lgiband
	},
	{
		avatar: img_gkehren
	},
	{
		avatar: img_jbach,
	},
];


export default function Background() {
	return (
		<div>
			<div className="main_background">
				<img src={BackgroundImg} className="img_background"/>
				<div className='our_team'>
					<p className='title_team' >Our team</p>
					<div className='picture_team'>
						<div className='twoteam'>
							<div className='profile_team'>
								<img src={img_lgiband}/>
								<p>Leo Giband</p>
							</div>
							<div className='profile_team'>
								<img src={img_gkehren}/>
								<p>Guillaume Kehren</p>
							</div>
						</div>
						<div className='twoteam'>
							<div className='profile_team'>
								<img src={img_jbach}/>
								<p>Josephine Bach</p>
							</div>
							<div className='profile_team'>
								<img src={img_genouf}/>
								<p>Gabriel Enouf</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}