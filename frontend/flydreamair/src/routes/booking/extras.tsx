import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { ExtraCard } from '../../components/ExtraCard';
import netflixImage from '../../resource/netflix.png';
import steakImage from '../../resource/steak.png';
import { FlightUpgradeOptions, SessionData } from '../../type';
import apiClient from '../../utils/axios';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

export const Route = createFileRoute('/booking/extras')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [selectedMeal, setSelectedMeal] = useState<string>('Steak 1');
    const [selectedEntertainment, setSelectedEntertaiment] = useState<string>('Netflix');
    const [selectedBaggage, setSelectedBaggage] = useState<string>('10kg');
    const [selectedCarryOn, setSelectedCarryOn] = useState<string>('7kg');
    const [session, setSession] = useState<SessionData | undefined>();

    // fetching session one more fkn time because the ticket is in root, not here, and we need it to get the passenger data to update...
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiClient.get('/api/booking/session');

                // Assuming response.data is an object matching SessionData
                if (response.data && Object.keys(response.data).length > 0) {
                    console.log('Existing session found via GET:', response.data);
                    
                    // If response.data already has the session structure, use it directly
                    const sessionData = response.data.currentBooking || response.data;
                    setSession(sessionData as SessionData);
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


    const submitRequest = async (extras: FlightUpgradeOptions) => {
        try {
            // First, update the session data by adding the extras to the first passenger
            if (session && session.passengers && session.passengers.length > 0) {
                // Create a copy of the current session
                const updatedSession = { ...session };
                
                // Remove any nested currentBooking to prevent recursion
                if ('currentBooking' in updatedSession) {
                    delete updatedSession.currentBooking;
                }
                
                // Update the first passenger with the extras
                updatedSession.passengers = [...(updatedSession.passengers || [])];
                updatedSession.passengers[0] = {
                    ...updatedSession.passengers[0],
                    options: extras
                };
                
                // Send the updated session to the server
                const response = await apiClient.post('/api/booking/extras', {
                    currentBooking: updatedSession
                });
                
                console.log('Extras submitted successfully:', response.data);
                
                // Update local session state
                setSession(updatedSession);
                
                // Navigate to payment page
                navigate({ to: '/booking/payment' });
            } else {
                console.error('No session or passenger data available');
                alert('Unable to add extras: session data is missing');
            }
        } catch (error) {
            console.error('Error saving session data via POST:', error);
            let errorMessage = 'An error occurred while saving search details.';
            if (error instanceof AxiosError && error.response?.data?.error) {
                errorMessage = `Error: ${error.response.data.error}`;
            } else if (error instanceof Error) {
                errorMessage = `Error: ${error.message}`;
            }
            console.log(errorMessage);
        }
    };

    return (
        <div className="flex flex-col gap-16">
            {/* column 1 */}
            <div className="flex flex-col gap-4">
                <div className="text-3xl">Food</div>
                <div className="flex gap-4 ml-10">
                    {['Steak 1', 'Steak 2', 'Steak 3', 'Steak 4', 'Steak 5'].map((text) => (
                        <ExtraCard
                            src={steakImage}
                            text={text}
                            selectedCard={selectedMeal}
                            setSelectedCard={setSelectedMeal}
                        />
                    ))}
                </div>
            </div>
            {/* column 2 */}
            <div className="flex flex-col gap-4">
                <div className="text-3xl">Entertainment</div>
                <div className="flex gap-4 ml-10">
                    {['Netflix', 'Netflix +', 'Netflix ++'].map((text) => (
                        <ExtraCard
                            src={netflixImage}
                            text={text}
                            selectedCard={selectedEntertainment}
                            setSelectedCard={setSelectedEntertaiment}
                        />
                    ))}
                </div>
            </div>
            {/* column 3 */}
            <div className="flex flex-col gap-4">
                <div className="text-3xl">Baggage</div>
                <div className="flex gap-4 ml-10">
                    {['10kg', '20kg', '30kg', '40kg'].map((text) => (
                        <ExtraCard
                            text={text}
                            selectedCard={selectedBaggage}
                            setSelectedCard={setSelectedBaggage}
                        />
                    ))}
                </div>
            </div>
            {/* column 4 */}
            <div className="flex flex-col gap-4">
                <div className="text-3xl">Carry On</div>
                <div className="flex gap-4 ml-10">
                    {['7kg', '14kg'].map((text) => (
                        <ExtraCard
                            text={text}
                            selectedCard={selectedCarryOn}
                            setSelectedCard={setSelectedCarryOn}
                        />
                    ))}
                </div>
            </div>
            <ActionButton
                hoverOverlayTheme="light"
                onClick={() => {
                    const extras: FlightUpgradeOptions = {
                        meal: selectedMeal,
                        entertainment: selectedEntertainment,
                        baggage: selectedBaggage,
                        carry_on: selectedCarryOn,
                    };
                    submitRequest(extras);
                }}
            >
                continue
            </ActionButton>
        </div>
    );
}

