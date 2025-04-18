import { JSX } from "react";

interface Props {
	onclick: () => void;
	children?: React.ReactNode;
}

export function ActionButton({ onclick, children }: Props): JSX.Element {
	return (
		<button
			onClick={onclick}
			className="text-white bg-(--accent) hover:bg-(--hover-button) shadow-md/25 p-2 rounded-md"
		>
			{children}
		</button>
	);
}
