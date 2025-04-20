import { JSX } from "react";
export interface FlightSearchResult {
	flight_id: string;
	dept_city: string;
	arr_city: string;
	base_fare: string;
	dept_time: string;
	arr_time: string;
}


interface Props {
	onclick: () => void;
	flight?: FlightSearchResult;
}


// [{"flight_id":"0bb64108-0df4-421c-b058-36ba1471f582","dept_city":"Melbourne Tullamarine Airport","arr_city":"Sydney Airport","base_fare":"90.00","dept_time":"07:11:00","arr_time":"08:13:00"},{"flight_id":"997d7618-9400-4e3a-b9fa-305d1ec4c46d","dept_city":"Melbourne Tullamarine Airport","arr_city":"Sydney Airport","base_fare":"90.00","dept_time":"11:11:00","arr_time":"12:13:00"},{"flight_id":"e8bfe81a-ab09-4c0d-b19a-4a13647973e0","dept_city":"Melbourne Tullamarine Airport","arr_city":"Sydney Airport","base_fare":"90.00","dept_time":"14:00:00","arr_time":"15:02:00"},{"flight_id":"eaf238be-6392-4dc6-8a0d-77a0d749dcbe","dept_city":"Melbourne Tullamarine Airport","arr_city":"Sydney Airport","base_fare":"90.00","dept_time":"18:34:00","arr_time":"19:36:00"}]
export function SearchResult({ onclick, flight }: Props): JSX.Element {
	return (
		<div
			onClick={onclick}
			className="text---accent stroke-accent bg-(white) hover:stroke-1 shadow-md/25 p-2 rounded-md">
			<div className="text-sm text-gray-500">Departing: {flight.dept_city}</div>
			<div className="text-sm text-gray-500">Departure Time: {flight.dept_time}</div>
			<div className="text-sm text-gray-500">Arrival: {flight.arr_city}</div>
			<div className="text-sm text-gray-500">Arrival Time: {flight.arr_time}</div>
			<div className="text-sm text-gray-500">Price: {flight.base_fare}</div>
		</div>
	);
}
