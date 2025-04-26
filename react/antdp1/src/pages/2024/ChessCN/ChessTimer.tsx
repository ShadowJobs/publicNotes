import React from 'react';

interface TimerProps {
  label: string;
  time: number;
}

export const Timer: React.FC<TimerProps> = ({ label, time }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer">
      <span>{label}: </span>
      <span>{formatTime(time)}</span>
    </div>
  );
};