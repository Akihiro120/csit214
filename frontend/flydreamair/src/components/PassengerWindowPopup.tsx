import { ActionButton } from "./ActionButton";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
	className?: string;
}
export function PassengersInputBox({ className }: Props) {

	return (
		<label
			className={`${className} cursor-text grid grid-cols-1 grid-rows-[auto_auto] justify-items-start rounded-sm border-black border p-1 gap-x-1 text-black`}
		>
			<div className="text-sm text-[#ffffff99]">
      <span>Passengers</span>
			</div>
			<ChangeValueButton onClick={() => setPassengers((prev) => Math.min(prev + 1, 9))}>
				<Plus />
			</ChangeValueButton>
			<ChangeValueButton onClick={() => setPassengers((prev) => Math.max(prev - 1, 1))}>
				<Minus />
			</ChangeValueButton>
		</label>
	);
}

function ChangeValueButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
	const [isActive, setIsActive] = useState(false);

	return (
		<button
			type="button"
			/* set to active on click */
			onMouseDown={() => {
				setIsActive(true);
			}}
			onMouseUp={() => {
				setIsActive(false);
			}}
			onClick={onClick}
			className="relative rounded-sm p-2 w-8 h-8 border border-white justify-self-center self-center row-span-2 text-3xl"
		>
			<motion.div
				variants={{
					default: { opacity: 0 },
					hover: { opacity: 0.16 },
					active: { opacity: 0.22 },
				}}
				initial="default"
				whileHover={isActive ? "active" : "hover"}
				animate={isActive ? "active" : "default"}
				className={`absolute z-30 top-0 left-0 w-full h-full rounded-[inherit] bg-white`}
			></motion.div>
			{children}
		</button>
	);
}
