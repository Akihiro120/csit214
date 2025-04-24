interface Props {
	className?: string;
	svg: React.ReactNode;
	label: string;
	value: string;
	onClick?: () => void;
}
export function DateInputBox({ className, svg, label, value, onClick }: Props) {
	return (
		<label
			className={`${className} cursor-text grid grid-cols-[3rem_1fr] grid-rows-[auto_auto] justify-items-start rounded-sm border border-white p-1 gap-x-1 text-white`}
		>
			<div className="w-[2.5rem] h-[2.5rem] col-start-1 row-start-1 row-span-2 self-center justify-self-center">
				{svg}
			</div>
			<div className="text-sm text-[#ffffff99]">{label}</div>
			<input onClick={onClick} readOnly className="text-xl row-start-2" name="date" value={value}></input>
		</label>
	);
}
