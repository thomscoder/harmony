import { useEffect, useState } from 'react';

const Clock = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const timeFormat = `${date.toLocaleTimeString()}`;
      setTime(timeFormat);
    }, 1000);
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
