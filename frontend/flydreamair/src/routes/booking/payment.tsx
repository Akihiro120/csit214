import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ActionButton } from '../../components/ActionButton';
import Aexpress from '../../resource/Aexpress.png';
import Mastercard from '../../resource/Mastercard.svg?react';
import Visa from '../../resource/Visa.svg?react';
import apiClient from '../../utils/axios';

export const Route = createFileRoute('/booking/payment')({
    component: RouteComponent,
});

function isCreditCard(value: string): boolean {
    value = value.replace(/\D/g, '');
    if (value.length < 13 || value.length > 19) {
        return false;
    }
    let sum = 0;
    let alternate = false;
    for (let i = value.length - 1; i >= 0; i--) {
        let n = parseInt(value.charAt(i), 10);
        if (alternate) {
            n *= 2;
            if (n > 9) {
                n -= 9;
            }
        }
        sum += n;
        alternate = !alternate;
    }
    return sum % 10 === 0;
}


function RouteComponent() {
    const [selectedCard, setSelectedCard] = useState<string>('visa');
    const [nameCard, setNameCard] = useState<string>('');
    const [numberCard, setNumberCard] = useState<string>('');
    const [expiryCard, setExpirtyCard] = useState<string>('');
    const [ccvCard, setCCVCard] = useState<string>('');

    const isCardNumberValid = numberCard.length === 0 || isCreditCard(numberCard.replace(/\s/g, ''));

    return (
        <div className="flex justify-center items-center w-[60%] min-w-[480px] shadow-lg/25 justify-self-center self-center rounded-lg">
            <div className="flex flex-col gap-6 p-8">
                <div className="flex gap-2 justify-evenly">
                    <PaymentCard
                        id="visa"
                        selectedCard={selectedCard}
                        setSelectedCard={setSelectedCard}
                    >
                        <Visa />
                    </PaymentCard>
                    <PaymentCard
                        id="mastercard"
                        selectedCard={selectedCard}
                        setSelectedCard={setSelectedCard}
                    >
                        <Mastercard />
                    </PaymentCard>
                    <PaymentCard
                        id="aexpress"
                        selectedCard={selectedCard}
                        setSelectedCard={setSelectedCard}
                    >
                        <img src={Aexpress} className="w-[74px] h-[46px]" />
                    </PaymentCard>
                </div>
                <div>
                    <div className="ml-4">Name on card</div>
                    <input
                        type="text"
                        className="w-full p-3 rounded-lg border border-[#808080] focus:border-(--accent) focus:bg-(--pale-accent)"
                        value={nameCard}
                        onChange={(e) => setNameCard(e.target.value)}
                    />
                </div>
                <div>
                    <div className="ml-4">Card number</div>
                    <input
                        type="text"
                        placeholder="Enter card number"
                        value={numberCard}
                        onChange={(e) => setNumberCard(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${!isCardNumberValid ? 'border-red-500' : 'border-[#808080]'
                            } focus:border-(--accent) focus:bg-(--pale-accent)`}
                    />
                </div>
                <div>
                    <div className="flex">
                        <div className="flex flex-col">
                            <div className="ml-4">Expiry</div>
                            <input
                                type="text"
                                className="w-full p-3 rounded-l-lg border border-[#808080] focus:border-(--accent) focus:bg-(--pale-accent)"
                                value={expiryCard}
                                onChange={(e) => setExpirtyCard(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="mr-4 self-end">Security Code</div>
                            <input
                                type="text"
                                className="w-full p-3 rounded-r-lg border-r border-y border-[#808080] focus:border-(--accent) focus:bg-(--pale-accent)"
                                value={ccvCard}
                                onChange={(e) => setCCVCard(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <ActionButton
                    hoverOverlayTheme="light"
                    className="self-end px-10 py-4"
                    onClick={async (e) => {
                        e.preventDefault();
                        const response = await apiClient.post('/api/booking/payment', {
                            selected_card: selectedCard,
                            name_card: nameCard,
                            number_card: numberCard,
                            expiry_card: expiryCard,
                            ccv_card: ccvCard
                        })

                        console.log("Payment Response Status: ", response.status);
                    }}
                >
                    Confirm
                </ActionButton>
            </div>
        </div>
    );
}

function PaymentCard({
    children,
    id,
    selectedCard,
    setSelectedCard,
}: {
    children: React.ReactNode;
    id: string;
    selectedCard: string;
    setSelectedCard: React.Dispatch<React.SetStateAction<string>>;
}) {
    return (
        <div
            onClick={() => {
                setSelectedCard(id);
            }}
            className={`${selectedCard == id ? 'bg-(--pale-accent) border-(--accent)' : 'border-[#808080] bg-white'} hover:bg-(--pale-accent) hover:border-(--accent) w-[100px] p-3 border rounded-md cursor-pointer`}
        >
            {children}
        </div>
    );
}
