import React from 'react';

interface SecondaryButtonProps {
    icon?: string; // Update icon prop to accept string (image source)
    text?: string; // Text for the button
    className?: string; // Additional Tailwind classes
    onClick?: () => void; // Click handler
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ icon, text, className, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 py-2 px-4 
                        bg-gray-950/[18%]
                        text-gray-250
                        rounded-xl
                        hover:bg-gray-950/[15%] 
                        active:bg-gray-950/[8%]
                        ${className}`}
        >
            {icon && ( // Check if icon is provided
                <img src={icon} alt="icon" className="h-3 w-3" /> // Render image using the icon string
            )}
            <span>{text}</span>
        </button>
    );
};

export default SecondaryButton;
