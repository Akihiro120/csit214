import { JSX } from "react";
import Landing from "../resource/Landing.svg?react";
import Takeoff from "../resource/Takeoff.svg?react";

export interface FlightSearchResult {
	flight_id: string;
	dept_city: string;
	arr_city: string;
	base_fare: string;
	dept_time: string;
	arr_time: string;
}

interface Props {
	className?: string;
	onclick?: () => void;
	flight?: FlightSearchResult;
	lite?: boolean;
}
export function SearchResult({ className, onclick, flight, lite }: Props): JSX.Element | null {
	if (!flight) {
		return null; // Or return some placeholder content
	}

	return (
		<div
			onClick={onclick}
			className={`${className} bg-white flex ${lite ? "" : "outline-(--accent) hover:outline shadow-md/25 p-2 rounded-xl"}`}
		>
			<FlightLocation
				city={flight.dept_city}
				time={flight.dept_time}
				icon={<Takeoff className="w-10 h-10 text-(--accent)" />}
				lite={lite}
			/>
			<div className="flex-1 flex flex-col">
				{/* duration */}
				{!lite && <div className="self-center">{calculateDuration(flight.dept_time, flight.arr_time)}</div>}
				{/* arrow */}
				<div className="flex-1 flex items-center justify-center">
					<div className="h-0.5 bg-(--accent) w-full relative">
						<div
							className="absolute top-1/2 right-0 -translate-y-1/2 w-0 h-0
									  border-t-[5px] border-t-transparent
									  border-b-[5px] border-b-transparent
									  border-l-[8px] border-l-(--accent)"
						></div>
					</div>
				</div>
				{/* price */}
				{!lite && <div className="self-center">{flight.base_fare}</div>}
			</div>
			<FlightLocation
				city={flight.arr_city}
				time={flight.arr_time}
				icon={<Landing className="w-10 h-10 text-(--accent)" />}
				lite={lite}
			/>
		</div>
	);
}
function FlightLocation({
	city,
	time,
	icon,
	lite,
}: {
	city: string;
	time: string;
	icon: React.ReactNode;
	lite?: boolean;
}): JSX.Element {
	return (
		<div className="flex flex-col items-center px-2">
			<div className={lite ? "p-1" : "p-2"}>{city}</div>
			{icon}
			<div className={lite ? "p-1" : "p-2"}>{time}</div>
		</div>
	);
}

// helper function to calculate the duration between two times
function calculateDuration(deptTime: string, arrTime: string) {
	// Helper function to parse time string (HH:MMam/pm) into minutes since midnight
	const parseTime = (timeStr: string) => {
		const lowerTime = timeStr.toLowerCase();
		const period = lowerTime.includes("am") ? "am" : "pm";
		const [hoursStr, minutesStr] = lowerTime.replace(period, "").split(":");

		let hours = parseInt(hoursStr, 10);
		const minutes = parseInt(minutesStr, 10);

		// Handle 12 AM/PM conversion
		if (period === "pm" && hours !== 12) {
			hours += 12;
		} else if (period === "am" && hours === 12) {
			// Midnight case
			hours = 0;
		}

		return hours * 60 + minutes; // Total minutes since midnight
	};

	const startMinutes = parseTime(deptTime);
	let endMinutes = parseTime(arrTime);

	// Handle overnight case
	if (endMinutes < startMinutes) {
		endMinutes += 24 * 60; // Add minutes in a day
	}

	const durationMinutes = endMinutes - startMinutes;

	// Calculate hours and remaining minutes for the output format
	const hours = Math.floor(durationMinutes / 60);
	const minutes = durationMinutes % 60;

	// Format the output string
	let output = "";
	if (hours > 0) {
		output += `${hours}h`;
	}
	// Always include minutes if they exist, or if hours is zero
	if (minutes > 0 || hours === 0) {
		// Special case: If duration is 0, make sure to output "0m"
		if (hours === 0 && minutes === 0 && deptTime === arrTime) {
			output += "0m";
		} else if (minutes > 0) {
			output += `${minutes}m`;
		} else if (hours > 0 && minutes === 0) {
			// Ensure "Xh0m" format when minutes are zero but hours exist
			output += "0m";
		}
	}

	// Handle the edge case where the calculation results in empty string (should be 0m)
	if (output === "" && durationMinutes === 0) {
		return "0m";
	}

	return output;
}
