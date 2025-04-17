interface Props {
	children?: React.ReactNode;
}

export const Navbar = ({ children }: Props) => {
	return (
		<div className="w-full h-full bg-(--primary) text-white flex items-center p-4 gap-4 rounded-b-xl shadow-md/25 ">
			<div className="">Icon</div>
			<div className="grow">Fly Dream Air</div>
			{children}
			<div className="">Sign in </div>
		</div>
	);
};
