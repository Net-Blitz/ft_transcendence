import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { v4 as uuidv4 } from 'uuid';

interface AvatarProps {
	url: any;
	source: string;
}

const generateSeed = () => {
	return uuidv4();
}

const createAvatarObject = (seed: string) :AvatarProps => {
	return {
		url: createAvatar(adventurer, {
			seed: seed,
			size: 32,
			randomizeIds: true,
		}).toDataUriSync(),
		source: 'default',
	};
}

export const useGenerateAvatars = (number: number) => {
	let AvatarData: AvatarProps[] = useMemo(() => {
		let avatars: AvatarProps[] = [];
		for(let i = 0; i < number; i++)
		{
			let seed = generateSeed();
			avatars.push(createAvatarObject(seed));
		}
		return (avatars);
	}, [number]);
	return (AvatarData);
}
