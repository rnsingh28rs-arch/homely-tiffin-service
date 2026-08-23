import React, { useState } from 'react';

interface QuickCalculatorProps {
  onClose?: () => void;
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNumber = (digit: string) => {
    if (display === '0' || resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const res = calculate(prevValue, current, operation);
      setPrevValue(res);
      setDisplay(String(res));
    }
    setOperation(op);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      const res = calculate(prevValue, current, operation);
      setDisplay(String(res));
      setPrevValue(null);
      setOperation(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setResetNext(false);
  };

  return (
    <div className="bg-[#111A14] border border-[#D97706]/40 rounded-3xl p-4 shadow-2xl w-72 text-white font-sans select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#243B2D]">
        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
          <span>🧮</span> Quick Kitchen Calculator
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-[#18271E]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Screen */}
      <div className="bg-[#0A110D] border border-[#243B2D] rounded-2xl p-3 text-right font-mono mb-3">
        <div className="text-[10px] text-slate-500 h-4">
          {prevValue !== null ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-2xl font-black text-amber-300 truncate">{display}</div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
        <button type="button" onClick={handleClear} className="p-2.5 bg-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-500/30 col-span-2">
          AC / Clear
        </button>
        <button type="button" onClick={() => handleOp('÷')} className="p-2.5 bg-[#203326] text-amber-400 rounded-xl hover:bg-[#2c4734]">
          ÷
        </button>
        <button type="button" onClick={() => handleOp('×')} className="p-2.5 bg-[#203326] text-amber-400 rounded-xl hover:bg-[#2c4734]">
          ×
        </button>

        <button type="button" onClick={() => handleNumber('7')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">7</button>
        <button type="button" onClick={() => handleNumber('8')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">8</button>
        <button type="button" onClick={() => handleNumber('9')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">9</button>
        <button type="button" onClick={() => handleOp('-')} className="p-2.5 bg-[#203326] text-amber-400 rounded-xl hover:bg-[#2c4734]">-</button>

        <button type="button" onClick={() => handleNumber('4')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">4</button>
        <button type="button" onClick={() => handleNumber('5')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">5</button>
        <button type="button" onClick={() => handleNumber('6')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">6</button>
        <button type="button" onClick={() => handleOp('+')} className="p-2.5 bg-[#203326] text-amber-400 rounded-xl hover:bg-[#2c4734]">+</button>

        <button type="button" onClick={() => handleNumber('1')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">1</button>
        <button type="button" onClick={() => handleNumber('2')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">2</button>
        <button type="button" onClick={() => handleNumber('3')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">3</button>
        <button type="button" onClick={handleEquals} className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl row-span-2 flex items-center justify-center text-sm shadow-md">
          =
        </button>

        <button type="button" onClick={() => handleNumber('0')} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B] col-span-2">0</button>
        <button type="button" onClick={handleDecimal} className="p-2.5 bg-[#18271E] rounded-xl hover:bg-[#23382B]">.</button>
      </div>
    </div>
  );
};
