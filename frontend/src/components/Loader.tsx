import React, { useState, useEffect } from "react";

// Define props type
interface LoaderProps {
  texts: string[]; // Array of loading texts
}

const Loader: React.FC<LoaderProps> = ({ texts }) => {
  // Accept texts as prop
  const [loadingText, setLoadingText] = useState(texts[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setVisible(false); // Fade out
      setTimeout(() => {
        index = (index + 1) % texts.length; // Use the texts prop
        setLoadingText(texts[index]);
        setVisible(true); // Fade in
      }, 500); // Duration of fade out
    }, 1000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [texts]);

  return (
    <div className="z-20 flex flex-col items-center gap-6">
      <img src="loader.gif" className="h-30" />
      <p
        className={`text-slate-950 transition-opacity text-lg font-semibold
                duration-500 ease-in-out 
                ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {loadingText}
      </p>
    </div>
  );
};

export default Loader;
