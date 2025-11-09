/**
 * Reusable Badge Component
 */

const Badge = ({ children, variant = 'info', size = 'md' }) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    gray: 'badge-gray',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`badge ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Badge;

