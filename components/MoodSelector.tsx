import React from 'react';
import { MoodType } from '../types';
import { MOOD_EMOJIS, MOOD_LABELS } from '../constants';

interface MoodSelectorProps {
  currentMood: MoodType | null;
  onSelect: (mood: MoodType) => void;
  disabled?: boolean;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, onSelect, disabled = false }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">วันนี้คุณรู้สึกอย่างไร?</h3>
      <div className="flex justify-between items-center gap-2 max-w-md mx-auto">
        {(Object.keys(MoodType) as MoodType[]).map((mood) => (
          <button
            key={mood}
            disabled={disabled}
            onClick={() => onSelect(mood)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              currentMood === mood
                ? 'bg-indigo-100 scale-110 ring-2 ring-indigo-500 shadow-md'
                : 'hover:bg-gray-50 hover:scale-105'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-4xl mb-1">{MOOD_EMOJIS[mood]}</span>
            <span className="text-xs font-medium text-gray-500">{MOOD_LABELS[mood]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;