import { JSX } from 'react';

interface Props {
    className?: string;
    text: string;
    src?: string;
    selectedCard: string;
    setSelectedCard: React.Dispatch<React.SetStateAction<string>>;
}

export function ExtraCard({
    className,
    text,
    src,
    selectedCard,
    setSelectedCard,
}: Props): JSX.Element {
    return (
        <div
            onClick={() => {
                setSelectedCard(text);
            }}
            className={`${className} flex p-4 gap-4 min-w-[180px] min-h-[90px] ${src ? 'justify-start' : 'justify-center'} items-center shadow-md/25 rounded-lg ${selectedCard == text ? 'bg-(--accent) text-white' : ''} hover:bg-(--accent) hover:text-white cursor-pointer`}
        >
            {src && <img src={src} className="object-fill w-[60px] h-[60px] select-none" />}
            <div className="font-bold">{text}</div>
        </div>
    );
}
