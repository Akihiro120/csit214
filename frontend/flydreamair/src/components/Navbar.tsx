import { JSX } from 'react';
import Burger from '../resource/Burger.svg?react';
import { ActionButton } from './ActionButton';

interface Props {
    children?: React.ReactNode;
}

export function Navbar({ children }: Props): JSX.Element {
    return (
        <div className="w-full h-full bg-(--primary) text-white flex items-center p-4 gap-4 rounded-b-xl shadow-md/25 ">
            <div>
                <Burger className="w-6 h-6" />
            </div>
            <div className="grow">Fly Dream Air</div>
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
