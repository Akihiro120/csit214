import { JSX } from "react";
import Barcode from "../resource/Barcode.svg?react";
import { FlightSearchResult, SearchResult } from "./SearchResult";

interface Props {
	className?: string;
	flight: FlightSearchResult;
	ticketInfo: TicketInfo;
}
export interface TicketInfo {
	name: string;
	seat: string;
	class: string;
	meal: string;
	entertainment: string;
	baggage: string;
}

export function Ticket({ className, flight, ticketInfo }: Props): JSX.Element {
	return (
		<div className={`${className} flex flex-col drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] w-[300px]`}>
			{/* passenger name card */}
			<div className="flex justify-center items-center relative h-[100px] overflow-hidden rounded-t-2xl">
				<BottomCorners shadow="shadow-[0_0_0_200px_var(--accent)]" />
				<div className="text-2xl text-white">{ticketInfo.name}</div>
			</div>
			{/* flight details card */}
			{/* top corners cut */}
			<div className="flex justify-center items-center relative h-[30px] overflow-hidden">
				<TopCorners shadow="shadow-[0_0_0_200px_#ffffff]" />
			</div>
			{/* actual flight details */}
			<div className="flex flex-col items-center bg-white gap-6">
				<SearchResult className="w-full" lite flight={flight} />
				<div className="flex justify-center gap-4 flex-wrap">
					<TextField label="Seat" value={ticketInfo.seat} className="w-[45%]" />
					<TextField label="Class" value={ticketInfo.class} className="w-[45%]" />
					<TextField label="Meal" value={ticketInfo.meal} className="flex-1" />
					<TextField label="Entertainment" value={ticketInfo.entertainment} className="flex-1" />
					<TextField label="Baggage" value={ticketInfo.baggage} className="flex-1" />
				</div>
			</div>
			{/* bottom corners cut */}
			<div className="flex items-center relative h-[30px] overflow-hidden">
				<BottomCorners shadow="shadow-[0_0_0_200px_#ffffff]" />
			</div>
			{/* dashed line */}
			<div className="bg-white w-[284px] self-center">
				<div className="h-[1px] bg-repeat-x bg-[length:100%_1px] bg-[position:0_0] bg-[repeating-linear-gradient(to_right,var(--accent)_0,var(--accent)_8px,transparent_8px,transparent_12px)]"></div>
			</div>
			{/* barcode */}
			<div className="flex justify-center items-center relative h-[100px] overflow-hidden rounded-b-2xl">
				<Barcode />
				<TopCorners shadow="shadow-[0_0_0_200px_#ffffff]" />
			</div>
		</div>
	);
}
function TopCorners({ shadow }: { shadow: string }): JSX.Element {
	return (
		<>
			<div
				className={`absolute z-[-10] w-[16px] h-[16px] left-[-8px] top-[-8px] ${shadow} rounded-[1000px]`}
			></div>
			<div
				className={`absolute z-[-10] w-[16px] h-[16px] right-[-8px] top-[-8px] ${shadow} rounded-[1000px]`}
			></div>
		</>
	);
}

function BottomCorners({ shadow }: { shadow: string }): JSX.Element {
	return (
		<>
			<div
				className={`absolute z-[-10] w-[16px] h-[16px] left-[-8px] bottom-[-8px] ${shadow} rounded-[1000px]`}
			></div>
			<div
				className={`absolute z-[-10] w-[16px] h-[16px] right-[-8px] bottom-[-8px] ${shadow} rounded-[1000px]`}
			></div>
		</>
	);
}
function TextField({ label, value, className }: { label: string; value: string; className?: string }): JSX.Element {
	return (
		<div className={`flex flex-col items-center ${className}`}>
			<div className="text-xs font-bold text-(--accent)">{label}</div>
			<div className="">{value}</div>
		</div>
	);
}
