
import React from 'react';

interface ActionButtonProps {
  title: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-slate-700 px-4 py-1.5 text-sm text-sky-300 transition-colors hover:bg-sky-500 hover:text-white"
    >
      {title}
    </button>
  );
};

export default ActionButton;
