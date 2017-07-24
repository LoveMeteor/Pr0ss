export const isValidEmail = value => {
	const filter = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return filter.test(value);
};

export const isValidPassword = (value, min_length) => {
	if(!value || value === "" || value.length < min_length)
		return false;
	return true;
};

export const isValidPhone = value => {
	const filter = /^([0-9\(\)\/\+ \-]*)$/; 
	return filter.test(value);
};