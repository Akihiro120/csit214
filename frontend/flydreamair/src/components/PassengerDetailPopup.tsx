import { Passanger } from "../type";
import { useState } from "react";
import { ActionButton } from "./ActionButton";
interface Props {
    className?: string;
    passenger: Passanger;
    setPassenger: (passenger: Passanger) => void;
    setVisability?: (isVisible: boolean) => void;
}



export function PassengerDetailPopup({ className, passenger, setPassenger, setVisability }: Props) {
    
    const [name, setName] = useState(passenger.name);
    const [email, setEmail] = useState(passenger.email);
    const [phone, setPhone] = useState(passenger.phone);


    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex flex-col">
                <label htmlFor="name*">Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setPassenger({ ...passenger, name: e.target.value });
                    }}
                    />
            </div>
            <div className="flex flex-col">
                <label htmlFor="email*">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setPassenger({ ...passenger, email: e.target.value });
                    }}
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="phone">Phone</label>
                <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value);
                        setPassenger({ ...passenger, phone: e.target.value });
                    }}
                />
            </div>
            <ActionButton
                className={name && email ? "bg-blue-500" : "bg-gray-300 pointer-events-none"}
                onClick={() => {
                    setPassenger({ ...passenger, name, email, phone });
                    if (setVisability) {
                        setVisability(false);
                    }
                }}
            >
                Save
            </ActionButton>
        </div>
    );

}