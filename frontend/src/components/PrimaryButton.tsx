import React from 'react';

interface PrimaryButtonProps {
    keyShortcut?: string;
    text: string; 
    className?: string; 
    onClick?: () => void; 
    keyEvent?: string; 
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ keyShortcut, text, className, onClick, keyEvent = 'Enter' }) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const isCommandPressed = event.metaKey; // Check if Command key is pressed (for Mac)
        const isControlPressed = event.ctrlKey; // Check if Control key is pressed (for Windows/Linux)
        
        // Check if the key pressed matches the keyEvent and if the appropriate modifier key is pressed
        if ((isCommandPressed || isControlPressed) && event.key === keyEvent.split('+')[1]) {
            onClick?.(); 
        } else if (event.key === keyEvent || event.key === ' ') {
            onClick?.(); 
        }
    };

    return (
        <button
            onClick={onClick}
            onKeyDown={handleKeyDown} // Add keyboard event listener
            className={`flex items-center space-x-2 py-2 px-4 
                        bg-yellow-300
                        ring-1
                        shadow
                        rounded-lg
                        drop-shadow-[1px_2px_0_rgba(0,0,0,1)]
                        hover:bg-yellow-200 
                        active:drop-shadow-[0_0_0_rgba(0,0,0,0)]
                        active:ring-1 active: ring-gray-950/[50%]
                        ${className}`}
            tabIndex={0} // Make button focusable
        >
            {keyShortcut && (
                 <p className='text-gray-950/[30%] font-semibold'>{keyShortcut}</p>
            )}
            <span className="font-semibold text-gray-950">{text}</span>
        </button>
    );
};

export default PrimaryButton;
