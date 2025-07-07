import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Types for gas and slippage
export type GasOption = 'slow' | 'standard' | 'fast';

interface AdvancedSettingsProps {
  // Optional: Pass handlers to update global config (context, redux, etc.)
  onGasChange?: (gas: GasOption) => void;
  onSlippageChange?: (slippage: number) => void;
}

const GAS_OPTIONS: { label: string; value: GasOption }[] = [
  { label: 'Slow', value: 'slow' },
  { label: 'Standard', value: 'standard' },
  { label: 'Fast', value: 'fast' },
];

const DEFAULT_GAS: GasOption = 'standard';
const DEFAULT_SLIPPAGE = 0.5;

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  onGasChange,
  onSlippageChange,
}) => {
  // State
  const [gas, setGas] = useState<GasOption>(DEFAULT_GAS);
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE);

  // Load from localStorage on mount
  useEffect(() => {
    const savedGas = localStorage.getItem('advanced_gas') as GasOption | null;
    const savedSlippage = localStorage.getItem('advanced_slippage');
    if (savedGas && GAS_OPTIONS.some(opt => opt.value === savedGas)) {
      setGas(savedGas);
      onGasChange?.(savedGas);
    }
    if (savedSlippage && !isNaN(Number(savedSlippage))) {
      setSlippage(Number(savedSlippage));
      onSlippageChange?.(Number(savedSlippage));
    }
    // eslint-disable-next-line
  }, []);

  // Persist gas to localStorage and update global config
  useEffect(() => {
    localStorage.setItem('advanced_gas', gas);
    onGasChange?.(gas);
  }, [gas, onGasChange]);

  // Persist slippage to localStorage and update global config
  useEffect(() => {
    localStorage.setItem('advanced_slippage', slippage.toString());
    onSlippageChange?.(slippage);
  }, [slippage, onSlippageChange]);

  // Handle reset
  const handleReset = () => {
    localStorage.removeItem('advanced_gas');
    localStorage.removeItem('advanced_slippage');
    setGas(DEFAULT_GAS);
    setSlippage(DEFAULT_SLIPPAGE);
    toast.success('Settings reset to default', { position: 'bottom-right' });
    onGasChange?.(DEFAULT_GAS);
    onSlippageChange?.(DEFAULT_SLIPPAGE);
    // TODO: Optionally sync reset with backend API
  };

  return (
    <div className="space-y-6">
      {/* Gas Settings */}
      <div>
        <p className="font-medium text-gray-900 mb-2">Gas Settings</p>
        <div className="flex gap-4">
          {GAS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setGas(opt.value)}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                gas === opt.value
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage Tolerance */}
      <div>
        <p className="font-medium text-gray-900 mb-2">Slippage Tolerance</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={slippage}
            onChange={e => setSlippage(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-gray-700 font-medium">{slippage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="font-semibold text-red-900 mb-3">Danger Zone</p>
        <button
          onClick={handleReset}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );
};

export default AdvancedSettings; 