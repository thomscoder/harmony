import { useEffect, useState } from 'react';

const Clock = () => {
  const [time, setTime] = useState<string>('');

  const getTime = () => {
    const date = new Date();
    const timeFormat = `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setTime(timeFormat);
  };
  useEffect(() => {
    getTime();
    const interval = setInterval(getTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="time">{time}</div>
    </>
  );
};

export default Clock;
