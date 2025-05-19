import { ActionButton } from './ActionButton';
import { useState } from 'react';
import { Passenger } from '../type';

interface Props {
    className?: string;
    seatNumber: string | null;
    setVisability: (isVisible: boolean) => void;
    setPassengers?: React.Dispatch<React.SetStateAction<Passenger[]>>;
}


function validatePhoneNumber(phone: string): boolean {
    if (!phone) return true;
    const phoneRegex = /^\+?\d{10,14}$/; // regex for 10-14 digit phone number, allowing for leading +
    return phoneRegex.test(phone);
}

function validateEmail(email: string): boolean {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex, {text or number}@{text or number}.{text or number}
    return emailRegex.test(email);
}

function canSubmit(name: string, email: string, phone: string): boolean {
    return (
        validateEmail(email) &&
        validatePhoneNumber(phone) &&
        name.length > 0 &&
        email.length > 0
    );
}

export function PassengerDetailPopup({ className, setVisability, setPassengers, seatNumber  }: Props) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');    
    
    return (
        <div className={`bg-(--pale-accent) p-4 rounded-md shadow-lg${className}`}>
            <div className="flex gap-2 justify-around">
                <h2 className="text-2x1l p-1">
                Passenger Details for seat
                </h2>
                <div className='text-2xl text-bold border-1 p-1 rounded-sm bg-slate-50 text-zinc-800 '>{seatNumber}</div>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-2 border-(--accent) bg-slate-50 rounded-md p-2 w-full"
                    />
                </label>
                                <label>
                    Email:
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={validateEmail(email) ? 'border-2 border-(--accent) bg-slate-50  rounded-md p-2 w-full' : 'border-2 bg-slate-50 border-red-500 rounded-md p-2 w-full'}
                    />
                </label>
                <label>
                    Phone:
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={validatePhoneNumber(phone) ? "border-2 border-(--accent) bg-slate-50  rounded-md p-2 w-full" : "border-2 bg-slate-50 border-red-500 rounded-md p-2 w-full"}
                    />
                    
                </label>
                <ActionButton
                    className={ canSubmit(name, email, phone) ? "bg-(--accent) text-white hover:bg-(--primary) rounded-md p-2 mt-4" : " bg-zinc-400 text-white hover:bg-zinc-400 rounded-md p-2 mt-4"}
                    onClick={(e) => {
                        e.preventDefault();
                        if (canSubmit(name, email, phone)) {
                            const newPassenger: Passenger = {
                                name,
                                email,
                                phone,
                                seat: seatNumber || '',
                            };

                            if (setPassengers) {
                                setPassengers((passengers) => [...passengers, newPassenger]);
                            }

                            setName('');
                            setEmail('');
                            setPhone('');
                            setVisability(false);
                        } else {
                            alert('Please enter valid email and phone number');
                        }
                    }}
                >
                    Save
                </ActionButton>


            </div>
        </div>
    );
}
