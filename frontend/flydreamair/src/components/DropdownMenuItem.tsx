import { useDropdownContext } from "../context/dropdownContext";

export function DropdownMenuItem({
	className,
	content,
	onClick,
}: {
	className?: string;
	content: string;
	onClick: () => void;
}) {
	const { setActiveButtonId } = useDropdownContext();

	return (
		<div
			onClick={() => {
				setActiveButtonId(null);
				onClick();
			}} // Set the state when clicked
			className={`${className} text-center p-1 cursor-default`}
		>
			{content}
		</div>
	);
}
