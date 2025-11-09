/**
 * Stats Cards Component
 * Display statistics for contact messages
 */

const StatsCards = ({ stats = {} }) => {
  const cards = [
    {
      title: 'Total Messages',
      value: stats.total || 0,
      color: 'blue',
      bgClass: 'bg-blue-600',
    },
    {
      title: 'New',
      value: stats.byStatus?.new || 0,
      color: 'green',
      bgClass: 'bg-green-600',
    },
    {
      title: 'In Progress',
      value: stats.byStatus?.in_progress || 0,
      color: 'yellow',
      bgClass: 'bg-yellow-600',
    },
    {
      title: 'Quotes',
      value: stats.byType?.quote || 0,
      color: 'purple',
      bgClass: 'bg-purple-600',
    },
    {
      title: 'Contact Forms',
      value: stats.byType?.contact || 0,
      color: 'orange',
      bgClass: 'bg-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgClass} text-white rounded-lg p-5 shadow-sm`}>
          <p className="text-sm font-medium opacity-90">{card.title}</p>
          <p className="text-3xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

