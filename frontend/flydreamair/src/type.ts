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
    base_fare: string;
    dept_time: string;
    arr_time: string;
}

export interface FlightUpgradeOptions {
    meal: string;
    baggage: string;
    carry_on: string;
    entertainment: string;
}

export interface Passanger {
    name: string;
    email: string;
    phone?: string;
    seat?: string;
    options?: FlightUpgradeOptions;
}

export interface SessionData {
    initialized: number;
    to?: string;
    toCity?: string;
    from?: string;
    fromCity?: string;
    deptDate?: string;
    deptTime?: string;
    arrTime?: string;
    flightTime?: string;
    retDate?: string;
    // add return flight later
    flight_id?: string;
    numPassengers?: number;
    isReturn?: boolean;
    passengers?: Passanger[];
}
