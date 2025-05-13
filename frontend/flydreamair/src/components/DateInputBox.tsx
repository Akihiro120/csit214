interface Props {
    className?: string;
    svg: React.ReactNode;
    label: string;
    value: string;
    onClick?: () => void;
    name: string;
}
export function DateInputBox({ className, svg, label, value, onClick, name }: Props) {
    return (
        <button type="button" onClick={onClick} className={`${className}`}>
            <label
                className={`cursor-pointer grid grid-cols-[3rem_1fr] grid-rows-[auto_auto] justify-items-start rounded-sm border border-white p-1 gap-x-1 text-white`}
            >
                <div className="w-[2.5rem] h-[2.5rem] col-start-1 row-start-1 row-span-2 self-center justify-self-center">
                    {svg}
                </div>
                <div className="text-sm text-[#ffffff99]">{label}</div>
                <input
                    readOnly
                    className="w-full text-xl row-start-2 pointer-events-none"
                    tabIndex={-1}
                    name={name}
                    value={value}
                ></input>
            </label>
        </button>
    );
}
