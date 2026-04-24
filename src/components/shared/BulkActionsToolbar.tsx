import { Button } from '@/components/ui/button';
import { Trash2, Edit, Download, FileText, X } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onBulkDelete?: () => void;
  onBulkUpdate?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onClearSelection: () => void;
  canDelete?: boolean;
  canUpdate?: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onBulkDelete,
  onBulkUpdate,
  onExportCSV,
  onExportPDF,
  onClearSelection,
  canDelete = true,
  canUpdate = true,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <span className="text-sm font-medium text-blue-800 mr-2">
        {selectedCount} of {totalCount} selected
      </span>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
      <div className="flex-1" />
      {onExportCSV && (
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="h-4 w-4 mr-1" />
          CSV
        </Button>
      )}
      {onExportPDF && (
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <FileText className="h-4 w-4 mr-1" />
          PDF
        </Button>
      )}
      {canUpdate && onBulkUpdate && (
        <Button variant="outline" size="sm" onClick={onBulkUpdate}>
          <Edit className="h-4 w-4 mr-1" />
          Bulk Update
        </Button>
      )}
      {canDelete && onBulkDelete && (
        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Bulk Delete
        </Button>
      )}
    </div>
  );
}
