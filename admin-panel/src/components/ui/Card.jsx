/**
 * Reusable Card Component
 */

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  padding = true,
  header,
  footer
}) => {
  return (
    <div className={`card ${!padding ? 'p-0' : ''} ${className}`}>
      {(title || subtitle || header) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

