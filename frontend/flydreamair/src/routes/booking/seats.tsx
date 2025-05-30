import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { SeatLayout } from '../../components/SeatLayout';
import Plane from '../../resource/plane.svg?react';
import { Passenger, SessionData } from '../../type';
import apiClient from '../../utils/axios';

// Define the structure of a single seat from the API
interface ApiSeat {
    seat_number: string;
    status: boolean; // Assuming true means booked, false means available
}

// Define the structure expected by SeatLayout component
interface SeatLayoutSeat {
    id: string;
    booked: boolean;
}

export const Route = createFileRoute('/booking/seats')({
    component: Seats,
});

function Seats() {
    const [seatMapData, setSeatMapData] = useState<SeatLayoutSeat[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<SessionData | undefined>();
    const navigate = useNavigate();
    const [passengers, setPassengers] = useState<Passenger[]>([]);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiClient.get('/api/booking/session');

                // Assuming response.data is an object matching SessionData
                if (response.data && Object.keys(response.data).length > 0) {
                    console.log('Existing session found via GET:', response.data);
                    setSession(response.data.currentBooking as SessionData); // Cast if necessary, or ensure backend sends correct type
                } else {
                    console.log('GET /api/booking/session returned empty or invalid data.');
                    navigate({ to: '/' }); // Navigate if session is not found or invalid
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error checking session via GET:', error.message);
                } else {
                    console.error('An unexpected error occurred:', error);
                }
                // Consider navigating away on error as well if session is critical
                navigate({ to: '/' });
            }
        };
        fetchSession();
    }, [navigate]);

    console.log(session);

    useEffect(() => {
        let isMounted = true; // Flag to prevent state updates on unmounted component

        const fetchSeatData = async () => {
            setIsLoading(true);

            try {
                const seatsResponse = await apiClient.get<{ seats: ApiSeat[] }>(
                    '/api/booking/seats'
                );
                if (seatsResponse.status !== 200) {
                    throw new Error(`Error fetching seat data: ${seatsResponse.status}`);
                }

                if (!isMounted) return;
                console.log('Seat data fetched successfully:', seatsResponse.data);
                const transformedSeats = seatsResponse.data.seats.map((seat) => ({
                    id: seat.seat_number,
                    booked: seat.status, // Assuming status=true means booked
                }));

                setSeatMapData(transformedSeats);
            } catch (seatError) {
                if (!isMounted) return;
                console.error('Error fetching seat data:', seatError);
            }

            if (isMounted) {
                setIsLoading(false);
            }
        };

        fetchSeatData();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array ensures this runs once on mount

    if (isLoading) {
        return <div>Loading seat map...</div>;
    }

    const submitRequest = async (passengers: Passenger[]) => {
        try {
            const postResponse = await apiClient.post('/api/booking/seats', {
                passengers: passengers,
            });

            if (postResponse.status >= 200 && postResponse.status < 300) {
                navigate({ to: '/booking/extras' });
            } else {
                alert(
                    `Failed to save search details. Server responded with status: ${postResponse.status}`
                );
            }
        } catch (error) {
            console.error('Error saving session data via POST:', error);
            let errorMessage = 'An error occurred while saving search details.';
            console.log(errorMessage);
            if (error instanceof AxiosError && error.response?.data?.error) {
                errorMessage = `Error: ${error.response.data.error}`;
            } else if (error instanceof Error) {
                errorMessage = `Error: ${error.message}`;
            }
        }
    };

    // Render seat map if data is available
    return (
        <div>
            <div className="h-550 flex justify-center relative overflow-hidden">
                <Plane className="absolute h-800 -z-1 -top-70" />
                {seatMapData ? (
                    <SeatLayout
                        seatMap={seatMapData}
                        className="mt-40"
                        passengers={passengers}
                        setPassengers={setPassengers}
                    />
                ) : (
                    <div>No seat data available.</div> // Fallback if data is null after loading
                )}
            </div>
            <div className="fixed bottom-12 right-12 z-1">
                {passengers.length > 0 && (
                    <ActionButton
                        hoverOverlayTheme="light"
                        className="px-6 w-[120px] h-12"
                        onClick={() => {
                            submitRequest(passengers);
                        }}
                    >
                        Continue
                    </ActionButton>
                )}
            </div>
        </div>
    );
}
