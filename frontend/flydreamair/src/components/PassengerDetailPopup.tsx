import { ActionButton } from './ActionButton';
interface Props {
    className?: string;
    setVisability: (isVisible: boolean) => void;
}

export function PassengerDetailPopup({ className, setVisability }: Props) {
    return (
        <div className={`flex flex-col ${className} bg-white`}>
            <div className="flex flex-col">
                <label htmlFor="name*">Name</label>
                <input type="text" id="name" />
            </div>
            <div className="flex flex-col">
                <label htmlFor="email*">Email</label>
                <input type="email" id="email" />
            </div>
            <div className="flex flex-col">
                <label htmlFor="phone">Phone</label>
                <input type="text" id="phone" />
            </div>
            <ActionButton
                onClick={() => {
                    setVisability(false);
                }}
            >
                Save
            </ActionButton>
        </div>
    );
}
