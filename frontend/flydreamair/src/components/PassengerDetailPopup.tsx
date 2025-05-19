import { ActionButton } from './ActionButton';
import { SessionData } from '../type';
import { useState } from 'react';
import { Passenger } from '../type';
import { validateEmail } from '../utils/validation';

interface Props {
    className?: string;
    setVisability: (isVisible: boolean) => void;
    session: SessionData;
    setSession: (session: SessionData | null) => void;
    seatNumber: string | null;
}
export function PassengerDetailPopup({ className, setVisability, seatNumber, session, setSession }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [passenger, setPassenger] = useState<Passenger | null>(null);
    
    return (
        <div className={`bg-white p-4 rounded-md shadow-lg${className}`}>
            <h2 className="text-2xl text-center">
                {`Passenger Details for seat ${seatNumber}`}
            </h2>
            <div className="grid grid-cols-1 gap-2">
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                    />
                </label>
                <label>
                    Phone:
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                    />
                </label>
            </div>
        </div>
    );
}
