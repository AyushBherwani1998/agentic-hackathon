import React, { useState, ChangeEvent, useRef, useEffect } from 'react';

interface Command {
  id: number;
  label: string;
  description: string;
}

interface CommandInputProps {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sample commands - you can customize these
  const commands: Command[] = [
    { id: 1, label: '/transfer', description: 'Show help menu' },
    { id: 2, label: '/create-your-token', description: 'Search for content' },
    { id: 3, label: '/mint', description: 'Open settings' },
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
        className="w-full p-2 text-4xl text-gray-50 placeholder-gray-600"
        style={noOutline}
      />
      
      {showDropdown && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg rounded-md overflow-hidden">
          {commands.map((command) => (
            <button
              key={command.id}
              onClick={() => handleCommandClick(command)}
              className="w-full p-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="font-medium">{command.label}</span>
              <span className="text-sm text-gray-500">{command.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptInput;
