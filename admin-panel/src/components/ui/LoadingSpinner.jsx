/**
 * Reusable Loading Spinner Component
 */

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto`}></div>
        {text && <p className="mt-4 text-gray-600 font-medium">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;

