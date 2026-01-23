export const withBase = (path: string) =>
	path?.startsWith("/")
		? `${import.meta.env.BASE_URL}${path.slice(1)}`
		: path;
