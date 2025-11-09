/**
 * Reusable Form Section Component
 */

const FormSection = ({ title, description, children }) => {
  return (
    <div className="mb-6">
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;

