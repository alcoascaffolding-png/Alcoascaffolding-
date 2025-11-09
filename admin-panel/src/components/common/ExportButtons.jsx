/**
 * Export Buttons Component
 * Reusable export buttons for PDF and Excel
 */

import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const ExportButtons = ({ data, columns, title }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => exportToPDF(data, columns, title)}
        className="btn btn-secondary text-sm"
        disabled={!data || data.length === 0}
      >
        📄 Export PDF
      </button>
      <button
        onClick={() => exportToExcel(data, columns, title)}
        className="btn btn-secondary text-sm"
        disabled={!data || data.length === 0}
      >
        📊 Export Excel
      </button>
    </div>
  );
};

export default ExportButtons;

