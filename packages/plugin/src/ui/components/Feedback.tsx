import React from 'react';

interface FeedbackProps {
  title: string;
  description?: string | React.ReactNode;
}

export function Feedback({ title, description }: FeedbackProps) {
  return (
    <div className="flex flex-col items-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          fill="#CFF7D3"
        />
        <path
          d="M9 12L11 14L15 10"
          stroke="#14AE5C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="text-sm font-semibold mt-3">{title}</div>
      <div className="mt-1 text-center">{description}</div>
    </div>
  );
}
