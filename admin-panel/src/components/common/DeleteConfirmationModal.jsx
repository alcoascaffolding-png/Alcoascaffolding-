/**
 * Reusable Delete Confirmation Modal
 * Matches screenshot design with warning icon and yellow warning box
 */

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  warningText = "This action cannot be undone.",
  entityName = "",
  isLoading = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm"
          onClick={isLoading ? undefined : onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg border border-gray-200">
          {/* Content */}
          <div className="px-6 py-6">
            {/* Warning Icon & Title */}
            <div className="flex items-start space-x-4">
              {/* Warning Icon */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <svg 
                    className="w-6 h-6 text-red-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Title & Message */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {message}
                  {entityName && (
                    <span className="font-semibold text-gray-900"> {entityName}</span>
                  )}
                  {message.includes('transactions') && ' All associated transactions will be archived.'}
                </p>

                {/* Warning Box */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg 
                      className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      />
                    </svg>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold text-yellow-800">Warning:</span>{' '}
                        <span className="text-yellow-800">{warningText}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

