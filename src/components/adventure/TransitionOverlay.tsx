import { useState, useEffect } from 'react';

interface Props {
  visible: boolean;
}

const SYMBOLS = ['✦', '◆', '◈', '◇', '✧', '❖', '⟡', '✶'];

export default function TransitionOverlay({ visible }: Props) {
  const [symbol, setSymbol] = useState('✦');
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!visible) return;
    const si = setInterval(() => {
      setSymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }, 300);
    const di = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => { clearInterval(si); clearInterval(di); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="transition-overlay">
      <div className="transition-content">
        <div className="transition-spinner">
          <div className="spinner-ring"></div>
          <span className="transition-symbol">{symbol}</span>
        </div>
        <p className="transition-text">Processing{dots}</p>
      </div>
    </div>
  );
}
