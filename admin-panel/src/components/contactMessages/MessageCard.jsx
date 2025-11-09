/**
 * Message Card Component
 * Reusable card component for displaying individual message
 */

import { format } from 'date-fns';

const MessageCard = ({ message, onView, onDelete, onStatusChange }) => {
  const getStatusBadgeClass = (status) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-600'
    };
    return badges[status] || badges.read;
  };

  const getTypeBadgeClass = (type) => {
    return type === 'quote' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <tr className={`hover:bg-gray-50 ${message.status === 'new' ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(message.type)}`}>
          {message.type === 'quote' ? 'Quote' : 'Contact'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{message.name}</div>
        {message.company && (
          <div className="text-xs text-gray-500">{message.company}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{message.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{message.phone}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {message.message || 'No message'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={message.status}
          onChange={(e) => onStatusChange(message._id, e.target.value)}
          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusBadgeClass(message.status)}`}
        >
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="in_progress">In Progress</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onView(message)}
          className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
        >
          View
        </button>
        <button
          onClick={() => onDelete(message._id)}
          className="text-red-600 hover:text-red-900 font-medium"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default MessageCard;

