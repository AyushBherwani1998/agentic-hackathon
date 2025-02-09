import React, { useState, useEffect } from "react";

const Loader: React.FC = () => {
  const [loadingText, setLoadingText] = useState("Creating Smart Session...");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const texts = [
      "Creating Smart Session...",
      "Analyzing Prompt...",
      "Broadcasting Transaction...",
      "Almost there...",
    ];
    let index = 0;

    const interval = setInterval(() => {
      setVisible(false); // Fade out
      setTimeout(() => {
        index = (index + 1) % texts.length;
        setLoadingText(texts[index]);
        setVisible(true); // Fade in
      }, 500); // Duration of fade out
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
