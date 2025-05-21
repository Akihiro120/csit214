import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { ExtraCard } from '../../components/ExtraCard';
import netflixImage from '../../resource/netflix.png';
import steakImage from '../../resource/steak.png';
import { FlightUpgradeOptions } from '../../type';
import apiClient from '../../utils/axios';
import { AxiosError } from 'axios';

export const Route = createFileRoute('/booking/extras')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [selectedMeal, setSelectedMeal] = useState<string>('Steak 1');
    const [selectedEntertainment, setSelectedEntertaiment] = useState<string>('Netflix');
    const [selectedBaggage, setSelectedBaggage] = useState<string>('10kg');
    const [selectedCarryOn, setSelectedCarryOn] = useState<string>('7kg');


    const submitRequest = async (extras: FlightUpgradeOptions) => {
        try {
            const response = await apiClient.post('/api/booking/extras', {
                extras,
            });
            console.log('POST /api/booking/extras response:', response.data);
            if (response.data && response.status === 200) {
                console.log('Session data updated successfully:', response.data);
                navigate({ to: '/booking/payment' }); // Navigate to the summary page
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
    }

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

