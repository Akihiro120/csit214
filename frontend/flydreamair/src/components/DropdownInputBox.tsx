import { motion } from "motion/react";
import { useDropdownContext } from "../context/dropdownContext";
import DropdownArrow from "../resource/DropdownArrow.svg?react";

interface Props {
	className?: string;
	id: string;
	svg: React.ReactNode;
	label: string;
	name: string;
	value: string;
}
export function DropdownInputBox({ className, id, svg, label, name, value }: Props) {
	const { activeButtonId } = useDropdownContext();

	return (
		<label
			className={`${className} w-full h-full grid grid-cols-[3rem_1fr_3rem] grid-rows-[auto_auto] justify-items-start rounded-sm border border-white p-1 gap-x-1 text-white`}
		>
			<div className="w-[2.5rem] h-[2.5rem] col-start-1 row-start-1 row-span-2 self-center justify-self-center">
				{svg}
			</div>
			<div className="text-sm text-[#ffffff99]">{label}</div>
			<input readOnly className="text-xl row-start-2" name={name} value={value} />
			{/* dropdown arrow */}
			<motion.div
				variants={{
					normal: { rotate: 0 },
					active: { rotate: 180 },
				}}
				animate={activeButtonId === id ? "active" : "normal"}
				transition={{
					type: "tween",
					duration: 0.2,
				}}
				className=" w-5 h-5 self-center justify-self-center col-start-3 row-start-1 row-span-2"
			>
				<DropdownArrow />
			</motion.div>
		</label>
	);
}
