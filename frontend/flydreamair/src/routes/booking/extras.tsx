import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { ExtraCard } from '../../components/ExtraCard';
import netflixImage from '../../resource/netflix.png';
import steakImage from '../../resource/steak.png';
import { FlightUpgradeOptions } from '../../type';
import apiClient from '../../utils/axios';

export const Route = createFileRoute('/booking/extras')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [selectedFood, setSelectedFood] = useState<string>('Steak 1');
    const [selectedEntertainment, setSelectedEntertaiment] = useState<string>('Netflix');
    const [selectedBaggage, setSelectedBaggage] = useState<string>('10kg');
    const [selectedCarryOn, setSelectedCarryOn] = useState<string>('7kg');

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
                            selectedCard={selectedFood}
                            setSelectedCard={setSelectedFood}
                        />
                    ))}
                </div>
            </div>
            {/* column 2 */}
            <div className="flex flex-col gap-4">
                <div className="text-3xl">Food</div>
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
                className="self-end w-[120px] h-12"
                onClick={async () => {
                    const data: FlightUpgradeOptions = {
                        meal: selectedFood,
                        entertainment: selectedEntertainment,
                        baggage: selectedBaggage,
                        carry_on: selectedCarryOn,
                    };
                    const response = await apiClient.post('/api/flights', data);
                    if (response.status === 200) {
                        navigate({ to: '/booking/payment' });
                    }
                }}
            >
                continue
            </ActionButton>
        </div>
    );
}
