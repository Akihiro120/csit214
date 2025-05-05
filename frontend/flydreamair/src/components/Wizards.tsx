import { JSX } from "react";
import Clock from "../resource/Clock.svg?react";
import Payment from "../resource/Payment.svg?react";
import Seat from "../resource/Seat.svg?react";
import Suitcase from "../resource/Suitcase.svg?react";

interface Props {
	className?: string;
	progress: "date" | "seat" | "extras" | "payment";
}

export function Wizards({ className, progress }: Props): JSX.Element {
	return (
		<div className={`${className} flex gap-2 items-center`}>
			<Clock className="text-(--accent)" />
			<Line highlight={progress !== "date"} />
			<Seat className={progress === "date" ? "text-[#313131]" : "text-(--accent)"} />
			<Line highlight={progress === "extras" || progress === "payment"} />
			<Suitcase
				className={progress === "extras" || progress == "payment" ? "text-(--accent)" : "text-[#313131]"}
			/>
			<Line highlight={progress === "payment"} />
			<Payment
				className={progress === "extras" || progress == "payment" ? "text-(--accent)" : "text-[#313131]"}
			/>
		</div>
	);
}
function Line({ className, highlight }: { className?: string; highlight?: boolean }): JSX.Element {
	return (
		<div
			className={`${className} h-[4px] w-[20px] shrink-0 rounded-lg ${highlight ? "bg-(--accent)" : "bg-[#313131]"}`}
		></div>
	);
}
