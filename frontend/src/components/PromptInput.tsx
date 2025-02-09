import React, { useState, ChangeEvent, useRef, useEffect } from 'react';

interface Command {
  id: number;
  label: string;
  description: string;
}

export interface CommandInputProps {
  placeholder?: string;
  className?: string;
  onInputChange?: (value: string) => void;
}

const PromptInput: React.FC<CommandInputProps> = ({
  placeholder = "Type '/' for commands...",
  className = "",
  onInputChange,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands: Command[] = [
    { id: 1, label: '/transfer', description: 'Transfer Oddessey native token' },
    // { id: 2, label: '/create-your-token', description: 'Become a token smith' },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    
    // Show dropdown only if input starts with '/'
    setShowDropdown(value.startsWith('/'));

    // Call the onInputChange prop if provided
    if (onInputChange) {
      onInputChange(value);
    }
  };

  const handleCommandClick = (command: Command): void => {
    const value = command.label;
    setInputValue(value);
    setShowDropdown(false);
    
    // Call onInputChange when a command is clicked
    if (onInputChange) {
      onInputChange(value);
    }
  };

  const noOutline = {
    border: "none",
    backgroundColor: "transparent", 
    outline: 0,
    caretColor: "#fff"
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-2 text-4xl text-gray-50 placeholder-white/[20%]"
        style={noOutline}
      />
      
      {showDropdown && (
        <div className="absolute top-full left-0 w-full mt-1 overflow-hidden z-2 rounded-lg bg-slate-900/[8%] backdrop-blur-sm">
          {commands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => handleCommandClick(command)}
              onMouseEnter={() => setHoveredIndex(index)}
              className={`w-full px-8 py-4 text-left 
              text-slate-100/[50%] 
              ${index === hoveredIndex ? 'bg-yellow-300/[10%] border-1 border-yellow-300 text-yellow-300' : ''} 
              flex items-center gap-2
              rounded-lg`}
            >
                <div className='flex flex-col'>
              <span className="text-xl font-semibold">{command.label}</span>
              <span className="text-sm text-gray-300">{command.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptInput;
