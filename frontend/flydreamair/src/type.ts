export interface SelectedDates {
    selectedDeptDate: Date | null;
    selectedRetDate: Date | null;
}

export interface SelectedDate {
    selectedDeptDate: Date | null;
}

export interface FlightSearchResult {
    flight_id: string;
    dept_city: string;
    arr_city: string;
    base_fare?: string;
    dept_time: string;
    arr_time: string;
}

export interface FlightUpgradeOptions {
    meal: string;
    baggage: string;
    carry_on: string;
    entertainment: string;
}

export interface Passenger {
    name: string;
    email: string;
    phone?: string;
    seat?: string;
    class?: string;
    extras?: FlightUpgradeOptions;
}

export interface SessionData {
    initialized: number;
    to?: string;
    dept_city?: string;
    from?: string;
    arr_city?: string;
    dept_date?: string;
    dept_time?: string;
    arr_time?: string;
    flight_time?: string;
    ret_date?: string;
    // add return flight later
    flight_id?: string;
    num_passengers?: number;
    isReturn?: boolean;
    passengers?: Passenger[];
    search_time_stamp?: number;
}
