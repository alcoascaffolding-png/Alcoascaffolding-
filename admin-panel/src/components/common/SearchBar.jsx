/**
 * Clean Search Bar Component
 */

const SearchBar = ({ value, onChange, placeholder = 'Search...', onExport }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={placeholder}
            className="input pl-10"
            value={value}
            onChange={onChange}
          />
        </div>
        
        {onExport && <div>{onExport}</div>}
      </div>
    </div>
  );
};

export default SearchBar;
