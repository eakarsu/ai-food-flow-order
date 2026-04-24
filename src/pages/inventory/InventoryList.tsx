import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertTriangle,
  Edit,
  Trash2,
  Database,
  Download,
  FileText,
} from 'lucide-react';
import {
  getInventoryItems,
  createInventoryItem,
  deleteInventoryItem,
  bulkDeleteInventoryItems,
  bulkUpdateInventoryItems,
  analyzeInventory,
  InventoryItem,
  InventoryAnalysis,
} from '@/services/api/inventory';
import { seedInventory } from '@/services/api/seed';
import { AIOutputDisplay } from '@/components/ai/AIOutputDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { BulkActionsToolbar } from '@/components/shared/BulkActionsToolbar';
import { useSortableData } from '@/hooks/useSortableData';
import { useSelection } from '@/hooks/useSelection';
import { useRBAC } from '@/hooks/useRBAC';
import { exportToCSV, exportToPDF, ExportColumn } from '@/utils/exportUtils';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Category', accessor: (r) => r.category || '' },
  { header: 'Quantity', accessor: (r) => `${r.currentQuantity} ${r.unit}` },
  { header: 'Min Qty', accessor: (r) => String(r.minQuantity) },
  { header: 'Reorder Point', accessor: (r) => String(r.reorderPoint) },
  { header: 'Supplier', accessor: (r) => r.supplier || '' },
];

export default function InventoryList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { canCreate, canDelete, canEdit, canBulkAction, canSeed } = useRBAC();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<InventoryAnalysis | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    unit: 'units',
    currentQuantity: 0,
    minQuantity: 10,
    reorderPoint: 20,
    supplier: '',
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false });

  // Bulk update dialog state
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ category: '', supplier: '' });

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { sortedItems, sortConfig, requestSort } = useSortableData(filteredItems, { key: 'name', direction: 'asc' });
  const { selectedIds, isSelected, isAllSelected, toggleOne, toggleAll, clearSelection, selectedCount } = useSelection(sortedItems);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await getInventoryItems();
      setItems(response.items);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name || !newItem.unit) {
      toast.error('Name and unit are required');
      return;
    }

    try {
      const restaurantId = items[0]?.restaurantId || 'default';
      await createInventoryItem({
        ...newItem,
        restaurantId,
      });
      toast.success('Item created successfully');
      setShowNewDialog(false);
      setNewItem({
        name: '',
        category: '',
        unit: 'units',
        currentQuantity: 0,
        minQuantity: 10,
        reorderPoint: 20,
        supplier: '',
      });
      fetchItems();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.bulk) {
      try {
        const ids = Array.from(selectedIds);
        await bulkDeleteInventoryItems(ids);
        toast.success(`${ids.length} items deleted`);
        clearSelection();
        fetchItems();
      } catch (error) {
        toast.error('Failed to bulk delete items');
      }
    } else if (deleteConfirm.id) {
      try {
        await deleteInventoryItem(deleteConfirm.id);
        toast.success('Item deleted');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
    setDeleteConfirm({ open: false });
  };

  const handleBulkUpdate = async () => {
    const updates: Record<string, string> = {};
    if (bulkUpdateFields.category) updates.category = bulkUpdateFields.category;
    if (bulkUpdateFields.supplier) updates.supplier = bulkUpdateFields.supplier;

    if (Object.keys(updates).length === 0) {
      toast.error('Please fill at least one field');
      return;
    }

    try {
      const ids = Array.from(selectedIds);
      await bulkUpdateInventoryItems(ids, updates);
      toast.success(`${ids.length} items updated`);
      clearSelection();
      setShowBulkUpdateDialog(false);
      setBulkUpdateFields({ category: '', supplier: '' });
      fetchItems();
    } catch (error) {
      toast.error('Failed to bulk update items');
    }
  };

  const handleAnalyze = async () => {
    if (items.length === 0) {
      toast.error('No inventory items to analyze');
      return;
    }

    try {
      setAnalyzing(true);
      const restaurantId = items[0].restaurantId;
      const response = await analyzeInventory(restaurantId);
      setAnalysis(response.analysis);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze inventory');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToCSV(data, EXPORT_COLUMNS, 'inventory');
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToPDF(data, EXPORT_COLUMNS, 'Inventory Report', 'inventory');
    toast.success('PDF exported');
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentQuantity <= item.minQuantity / 2) {
      return { label: 'Critical', className: 'bg-red-100 text-red-800' };
    }
    if (item.currentQuantity <= item.reorderPoint) {
      return { label: 'Low', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Good', className: 'bg-green-100 text-green-800' };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Inventory Tracker</h1>
              <p className="text-sm text-gray-500">Track and manage inventory levels</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            {canCreate && (
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Item
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Analysis Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Inventory Analysis
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {items.length === 0 && canSeed && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const result = await seedInventory();
                      toast.success(result.message);
                      fetchItems();
                    } catch { toast.error('Failed to load sample data'); }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
              )}
              <Button onClick={handleAnalyze} disabled={analyzing || items.length === 0}>
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {analysis && (
            <CardContent>
              <AIOutputDisplay
                title="Inventory Analysis"
                content={analysis.summary}
                type="analysis"
              />

              {analysis.lowStockAlerts.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Low Stock Alerts
                  </h4>
                  <div className="space-y-2">
                    {analysis.lowStockAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          alert.severity === 'critical'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-yellow-50 border border-yellow-200'
                        }`}
                      >
                        <span className="font-medium">{alert.itemName}:</span>{' '}
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.reorderSuggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Reorder Suggestions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysis.reorderSuggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                      >
                        <span className="font-medium">{suggestion.itemName}</span>
                        <p className="text-sm text-gray-600">
                          Order {suggestion.suggestedQuantity} units - {suggestion.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedCount}
          totalCount={sortedItems.length}
          onBulkDelete={canDelete ? () => setDeleteConfirm({ open: true, bulk: true }) : undefined}
          onBulkUpdate={canEdit ? () => { setBulkUpdateFields({ category: '', supplier: '' }); setShowBulkUpdateDialog(true); } : undefined}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onClearSelection={clearSelection}
          canDelete={canDelete}
          canUpdate={canEdit}
        />

        {/* Inventory Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <SortableTableHead label="Name" sortKey="name" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Category" sortKey="category" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Quantity" sortKey="currentQuantity" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>Status</TableHead>
                <SortableTableHead label="Supplier" sortKey="supplier" currentSort={sortConfig} onSort={requestSort} />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => {
                const status = getStockStatus(item);
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/admin/inventory/${item.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={() => toggleOne(item.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell>
                      {item.currentQuantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell className="text-right">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/inventory/${item.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500 mb-3">No inventory items found</p>
                    {canSeed && (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const result = await seedInventory();
                            toast.success(result.message);
                            fetchItems();
                          } catch { toast.error('Failed to load sample data'); }
                        }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Load Sample Inventory Data
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title={deleteConfirm.bulk ? 'Delete Selected Items' : 'Delete Item'}
        description={
          deleteConfirm.bulk
            ? `Are you sure you want to delete ${selectedCount} selected items? This action cannot be undone.`
            : 'Are you sure you want to delete this item? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update {selectedCount} Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Only filled fields will be updated.</p>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={bulkUpdateFields.category}
                onChange={(e) => setBulkUpdateFields({ ...bulkUpdateFields, category: e.target.value })}
                placeholder="New category"
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                value={bulkUpdateFields.supplier}
                onChange={(e) => setBulkUpdateFields({ ...bulkUpdateFields, supplier: e.target.value })}
                placeholder="New supplier"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>Update Items</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Item Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Item name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="e.g., Dairy"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="e.g., lbs, gallons"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Qty</Label>
                <Input
                  type="number"
                  value={newItem.currentQuantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, currentQuantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Min Qty</Label>
                <Input
                  type="number"
                  value={newItem.minQuantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minQuantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Point</Label>
                <Input
                  type="number"
                  value={newItem.reorderPoint}
                  onChange={(e) =>
                    setNewItem({ ...newItem, reorderPoint: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                value={newItem.supplier}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>Create Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
