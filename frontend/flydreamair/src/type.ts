export interface SelectedDates {
    selectedDeptDate: Date | null;
    selectedRetDate: Date | null;
}

export interface SelectedDate  {
    selectedDeptDate: Date | null;
}

export interface FlightSearchResult {
    flight_id: string;
    dept_city: string;
    arr_city: string;
    base_fare: string;
    dept_time: string;
    arr_time: string;
}