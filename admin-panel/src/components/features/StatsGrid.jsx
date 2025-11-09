/**
 * Reusable Stats Grid Component
 */

const StatsGrid = ({ stats = [] }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(stats.length, 4)} gap-4`}>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`p-4 bg-gradient-to-br ${colorClasses[stat.color || 'blue']} rounded-lg text-white shadow-md`}
        >
          <p className="text-sm font-medium opacity-90">{stat.label}</p>
          <p className={`${stat.large ? 'text-2xl' : 'text-3xl'} font-bold mt-2`}>
            {stat.value}
          </p>
          {stat.subtitle && (
            <p className="text-xs opacity-80 mt-1">{stat.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;

