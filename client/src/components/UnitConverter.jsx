import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Save, Ruler, Weight, Thermometer, HardDrive, Gauge } from 'lucide-react';

const CONVERSION_CATEGORIES = {
  length: {
    label: 'Length',
    icon: Ruler,
    base: 'm',
    units: {
      m: { name: 'Meters (m)', factor: 1 },
      km: { name: 'Kilometers (km)', factor: 1000 },
      cm: { name: 'Centimeters (cm)', factor: 0.01 },
      mm: { name: 'Millimeters (mm)', factor: 0.001 },
      mi: { name: 'Miles (mi)', factor: 1609.344 },
      yd: { name: 'Yards (yd)', factor: 0.9144 },
      ft: { name: 'Feet (ft)', factor: 0.3048 },
      in: { name: 'Inches (in)', factor: 0.0254 },
    },
  },
  mass: {
    label: 'Mass',
    icon: Weight,
    base: 'kg',
    units: {
      kg: { name: 'Kilograms (kg)', factor: 1 },
      g: { name: 'Grams (g)', factor: 0.001 },
      mg: { name: 'Milligrams (mg)', factor: 0.000001 },
      lb: { name: 'Pounds (lb)', factor: 0.45359237 },
      oz: { name: 'Ounces (oz)', factor: 0.02834952 },
      t: { name: 'Metric Tons (t)', factor: 1000 },
    },
  },
  temperature: {
    label: 'Temperature',
    icon: Thermometer,
    units: {
      C: { name: 'Celsius (°C)' },
      F: { name: 'Fahrenheit (°F)' },
      K: { name: 'Kelvin (K)' },
    },
  },
  storage: {
    label: 'Data Storage',
    icon: HardDrive,
    base: 'B',
    units: {
      B: { name: 'Bytes (B)', factor: 1 },
      KB: { name: 'Kilobytes (KB)', factor: 1024 },
      MB: { name: 'Megabytes (MB)', factor: 1024 ** 2 },
      GB: { name: 'Gigabytes (GB)', factor: 1024 ** 3 },
      TB: { name: 'Terabytes (TB)', factor: 1024 ** 4 },
    },
  },
  speed: {
    label: 'Speed',
    icon: Gauge,
    base: 'mps',
    units: {
      mps: { name: 'Meters / sec (m/s)', factor: 1 },
      kmh: { name: 'Kilometers / hour (km/h)', factor: 1 / 3.6 },
      mph: { name: 'Miles / hour (mph)', factor: 0.44704 },
      knot: { name: 'Knots (kn)', factor: 0.514444 },
    },
  },
};

export default function UnitConverter({ onSaveConversion, onCopySuccess }) {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [inputValue, setInputValue] = useState('1');
  const [outputValue, setOutputValue] = useState('');

  // Reset unit defaults when category changes
  useEffect(() => {
    const keys = Object.keys(CONVERSION_CATEGORIES[category].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  }, [category]);

  // Recalculate whenever inputs change
  useEffect(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setOutputValue('');
      return;
    }

    if (category === 'temperature') {
      let result = val;
      // Convert from source to Celsius
      let celsius = val;
      if (fromUnit === 'F') celsius = ((val - 32) * 5) / 9;
      if (fromUnit === 'K') celsius = val - 273.15;

      // Convert Celsius to destination
      if (toUnit === 'C') result = celsius;
      if (toUnit === 'F') result = (celsius * 9) / 5 + 32;
      if (toUnit === 'K') result = celsius + 273.15;

      setOutputValue(String(Math.round(result * 1e6) / 1e6));
    } else {
      const catData = CONVERSION_CATEGORIES[category];
      const fromFactor = catData.units[fromUnit].factor;
      const toFactor = catData.units[toUnit].factor;

      // Value in base units
      const baseValue = val * fromFactor;
      // Value in destination units
      const converted = baseValue / toFactor;
      setOutputValue(String(Math.round(converted * 1e8) / 1e8));
    }
  }, [category, fromUnit, toUnit, inputValue]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleSave = () => {
    if (!inputValue || !outputValue) return;
    const cat = CONVERSION_CATEGORIES[category];
    const fromName = cat.units[fromUnit].name;
    const toName = cat.units[toUnit].name;
    const expr = `${inputValue} ${fromName} → ${toName}`;

    onSaveConversion({
      expression: expr,
      result: outputValue,
      type: 'converter',
      category: cat.label,
    });
  };

  const currentCatData = CONVERSION_CATEGORIES[category];

  return (
    <div className="converter-container" role="region" aria-label="Unit Converter">
      {/* Category Selection Tabs */}
      <div className="converter-categories">
        {Object.entries(CONVERSION_CATEGORIES).map(([key, data]) => {
          const Icon = data.icon;
          return (
            <button
              key={key}
              id={`cat-btn-${key}`}
              className={`category-pill ${category === key ? 'active' : ''}`}
              onClick={() => setCategory(key)}
            >
              <Icon size={14} />
              <span>{data.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conversion Interface */}
      <div className="converter-box">
        {/* From Unit */}
        <div className="unit-row">
          <label className="unit-label" htmlFor="unit-input-from">From</label>
          <div className="unit-input-group">
            <input
              id="unit-input-from"
              type="number"
              className="unit-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0"
            />
            <select
              id="unit-select-from"
              className="unit-select"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {Object.entries(currentCatData.units).map(([key, u]) => (
                <option key={key} value={key}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <button
          id="btn-swap-units"
          className="swap-units-btn"
          onClick={handleSwap}
          title="Swap Units"
          aria-label="Swap from and to units"
        >
          <ArrowDownUp size={18} />
        </button>

        {/* To Unit */}
        <div className="unit-row">
          <label className="unit-label" htmlFor="unit-input-to">To</label>
          <div className="unit-input-group">
            <input
              id="unit-input-to"
              type="text"
              readOnly
              className="unit-input"
              value={outputValue}
              placeholder="0"
            />
            <select
              id="unit-select-to"
              className="unit-select"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
            >
              {Object.entries(currentCatData.units).map(([key, u]) => (
                <option key={key} value={key}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save to History Button */}
        <button
          id="btn-save-conversion"
          className="save-conversion-btn"
          onClick={handleSave}
          title="Save this conversion result to MongoDB history"
        >
          <Save size={16} />
          <span>Save to MongoDB History</span>
        </button>
      </div>
    </div>
  );
}
