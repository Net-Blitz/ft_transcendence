
export const inputProtectionPseudo = (input: string) : string => {
	const regexLetters = /^[a-zA-Z0-9_]+$/;
	if (!regexLetters.test(input))
		return ('Bad characters');
	const regexLenght = /^.{3,14}$/;
	if (!regexLenght.test(input))
		return ('Bad length');
		
	return ('');
}

export const inputProtectionQR = (input: string) : string => {
	const regexQR = /^\d*(?:\s?\d\s?)*$/; // 0-9, space, max 3 spaces
	if (!regexQR.test(input))
		return ('Bad input');
	return ('');
}