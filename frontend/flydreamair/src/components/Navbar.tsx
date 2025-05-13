import { JSX } from 'react';
import Burger from '../resource/Burger.svg?react';
import { ActionButton } from './ActionButton';

interface Props {
    children?: React.ReactNode;
}

export function Navbar({ children }: Props): JSX.Element {
    return (
        <div className="w-full h-full bg-(--primary) text-white flex items-center p-4 gap-4 rounded-b-xl shadow-md/25 ">
            <div className="cursor-pointer" onClick={() => alert('Menu will be implemented soon!')}>
                <Burger className="w-6 h-6" />
            </div>
            <button
                onClick={() => {
                    window.location.replace('/');
                }}
                className="cursor-pointer"
            >
                Fly Dream Air
            </button>
            <div className="grow"></div>
            {children}
            <ActionButton onClick={signIn} hoverOverlayTheme="light">
                Sign in
            </ActionButton>
        </div>
    );
}
function signIn() {
    alert('Sign in function will be implemented soon!');
}
