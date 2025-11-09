/**
 * Reusable Select Component
 */

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  placeholder = 'Select...',
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;

