import React from 'react';

const QuickAnswer = ({ text, label = 'Quick answer', className = '', dir }) => {
  if (!text) return null;
  return (
    <aside
      dir={dir}
      aria-label={label}
      className={`rounded-lg border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-950/40 p-4 sm:p-5 text-left ${className}`}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-200 mb-1">
        {label}
      </p>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{text}</p>
    </aside>
  );
};

export default QuickAnswer;
