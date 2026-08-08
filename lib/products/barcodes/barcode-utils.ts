export const generateEan13 = (): string => {
	const digits: number[] = [];
	for (let i = 0; i < 12; i += 1) {
		digits.push(i === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10));
	}
	const sum = digits.reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 1 : 3), 0);
	const check = (10 - (sum % 10)) % 10;
	return [...digits, check].join('');
};
