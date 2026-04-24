import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Plus,
  Trash2,
  Sparkles,
  Database,
  Download,
  FileText,
} from 'lucide-react';
import {
  predictWaitTime,
  getWaitTimePredictionHistory,
  updateActualWaitTime,
  deleteWaitTimePrediction,
  bulkDeleteWaitTimePredictions,
  WaitTimePrediction,
  WaitTimePredictionHistory,
} from '@/services/api/ai';
import { seedWaitTime } from '@/services/api/seed';
import { AIOutputDisplay, ConfidenceMeter } from '@/components/ai/AIOutputDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { BulkActionsToolbar } from '@/components/shared/BulkActionsToolbar';
import { useSortableData } from '@/hooks/useSortableData';
import { useSelection } from '@/hooks/useSelection';
import { useRBAC } from '@/hooks/useRBAC';
import { exportToCSV, exportToPDF, ExportColumn } from '@/utils/exportUtils';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Date', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
  { header: 'Items', accessor: (r) => String(r.orderItemsCount) },
  { header: 'Predicted (min)', accessor: (r) => String(r.predictedMinutes) },
  { header: 'Actual (min)', accessor: (r) => r.actualMinutes != null ? String(r.actualMinutes) : '' },
  { header: 'Confidence', accessor: (r) => r.confidence != null ? `${Math.round(r.confidence * 100)}%` : '' },
  { header: 'Time of Day', accessor: 'timeOfDay' },
  { header: 'Queue Size', accessor: (r) => String(r.currentQueueSize) },
];

export default function WaitTimePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { canDelete, canSeed } = useRBAC();
  const [history, setHistory] = useState<WaitTimePredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null);

  // Form state
  const [restaurantId, setRestaurantId] = useState('default');
  const [orderItems, setOrderItems] = useState<Array<{ name: string; quantity: number }>>([
    { name: '', quantity: 1 },
  ]);

  // Inline actual time editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actualMinutes, setActualMinutes] = useState('');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false });

  // Detail dialog state
  const [detailEntry, setDetailEntry] = useState<WaitTimePredictionHistory | null>(null);

  const { sortedItems, sortConfig, requestSort } = useSortableData(history, { key: 'createdAt', direction: 'desc' });
  const { selectedIds, isSelected, isAllSelected, toggleOne, toggleAll, clearSelection, selectedCount } = useSelection(sortedItems);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getWaitTimePredictionHistory({ limit: 50 });
      setHistory(res.predictions);
    } catch (error) {
      toast.error('Failed to load prediction history');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    const validItems = orderItems.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      toast.error('Please add at least one order item');
      return;
    }
    try {
      setPredicting(true);
      const res = await predictWaitTime({
        restaurantId,
        orderItems: validItems,
      });
      setPrediction(res.prediction);
      toast.success('Prediction generated!');
      fetchHistory();
    } catch (error) {
      toast.error('Failed to generate prediction');
    } finally {
      setPredicting(false);
    }
  };

  const handleUpdateActual = async (predictionId: string) => {
    const mins = parseInt(actualMinutes);
    if (isNaN(mins) || mins <= 0) {
      toast.error('Please enter a valid number of minutes');
      return;
    }
    try {
      await updateActualWaitTime({ predictionId, actualMinutes: mins });
      toast.success('Actual wait time recorded');
      setEditingId(null);
      setActualMinutes('');
      fetchHistory();
    } catch (error) {
      toast.error('Failed to update actual time');
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.bulk) {
      try {
        const ids = Array.from(selectedIds);
        await bulkDeleteWaitTimePredictions(ids);
        toast.success(`${ids.length} predictions deleted`);
        clearSelection();
        fetchHistory();
      } catch (error) {
        toast.error('Failed to bulk delete predictions');
      }
    } else if (deleteConfirm.id) {
      try {
        await deleteWaitTimePrediction(deleteConfirm.id);
        toast.success('Prediction deleted');
        setDetailEntry(null);
        fetchHistory();
      } catch (error) {
        toast.error('Failed to delete prediction');
      }
    }
    setDeleteConfirm({ open: false });
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { name: '', quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index: number, field: 'name' | 'quantity', value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const loadSampleOrder = () => {
    const sampleOrders = [
      [
        { name: 'Turkey Club Sandwich', quantity: 2 },
        { name: 'Caesar Salad', quantity: 1 },
        { name: 'Iced Latte', quantity: 2 },
        { name: 'Chocolate Chip Cookie', quantity: 3 },
      ],
      [
        { name: 'Grilled Chicken Wrap', quantity: 1 },
        { name: 'Tomato Soup', quantity: 1 },
        { name: 'Fresh Squeezed OJ', quantity: 1 },
      ],
      [
        { name: 'Breakfast Burrito', quantity: 3 },
        { name: 'Cappuccino', quantity: 3 },
        { name: 'Fruit Bowl', quantity: 2 },
        { name: 'Avocado Toast', quantity: 1 },
      ],
    ];
    const randomOrder = sampleOrders[Math.floor(Math.random() * sampleOrders.length)];
    setOrderItems(randomOrder);
    toast.success('Sample order loaded - click Predict!');
  };

  const handleExportCSV = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToCSV(data, EXPORT_COLUMNS, 'wait-time-predictions');
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToPDF(data, EXPORT_COLUMNS, 'Wait Time Predictions Report', 'wait-time-predictions');
    toast.success('PDF exported');
  };

  // Compute stats from history
  const stats = {
    totalPredictions: history.length,
    avgPredictedTime:
      history.length > 0
        ? (history.reduce((sum, h) => sum + h.predictedMinutes, 0) / history.length).toFixed(1)
        : '0',
    avgAccuracy:
      history.filter((h) => h.actualMinutes != null).length > 0
        ? (
            history
              .filter((h) => h.actualMinutes != null)
              .reduce((sum, h) => {
                const diff = Math.abs(h.predictedMinutes - (h.actualMinutes || 0));
                return sum + Math.max(0, 100 - (diff / h.predictedMinutes) * 100);
              }, 0) / history.filter((h) => h.actualMinutes != null).length
          ).toFixed(0)
        : 'N/A',
    avgConfidence:
      history.filter((h) => h.confidence != null).length > 0
        ? (
            history
              .filter((h) => h.confidence != null)
              .reduce((sum, h) => sum + (h.confidence || 0), 0) /
            history.filter((h) => h.confidence != null).length
          ).toFixed(2)
        : 'N/A',
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
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Wait Time Predictor</h1>
              <p className="text-sm text-gray-500">
                AI-powered order wait time predictions
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            {canSeed && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const result = await seedWaitTime();
                    toast.success(result.message);
                    fetchHistory();
                  } catch { toast.error('Failed to load sample data'); }
                }}
              >
                <Database className="h-4 w-4 mr-2" />
                Seed Data
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Predictions</p>
                  <p className="text-2xl font-bold">{stats.totalPredictions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Predicted Time</p>
                  <p className="text-2xl font-bold">{stats.avgPredictedTime} min</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Accuracy</p>
                  <p className="text-2xl font-bold">
                    {stats.avgAccuracy !== 'N/A' ? `${stats.avgAccuracy}%` : 'N/A'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Confidence</p>
                  <p className="text-2xl font-bold">
                    {stats.avgConfidence !== 'N/A'
                      ? `${Math.round(parseFloat(stats.avgConfidence) * 100)}%`
                      : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Prediction Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                New Prediction
              </h2>
              <Button variant="outline" onClick={loadSampleOrder}>
                <Database className="h-4 w-4 mr-2" />
                Load Sample Order
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Restaurant ID</label>
                <Input
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  placeholder="Enter restaurant ID"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Order Items</label>
                <div className="mt-2 space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        placeholder="Qty"
                        className="w-20"
                        min={1}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOrderItem(index)}
                        disabled={orderItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addOrderItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              <Button onClick={handlePredict} disabled={predicting}>
                {predicting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Predicting...
                  </>
                ) : (
                  'Predict Wait Time'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Result */}
        {prediction && (
          <div className="mb-6 space-y-4">
            <AIOutputDisplay
              title="Wait Time Prediction"
              type="prediction"
              content={`Predicted wait time: ${prediction.predictedMinutes} minutes\n\n${prediction.explanation}`}
              confidence={prediction.confidence}
              keyPoints={[
                `Order Complexity: ${prediction.factors.orderComplexity}`,
                `Queue Impact: ${prediction.factors.queueImpact}`,
                `Time Impact: ${prediction.factors.timeImpact}`,
                `Staffing Impact: ${prediction.factors.staffingImpact}`,
              ]}
            />
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedCount}
          totalCount={sortedItems.length}
          onBulkDelete={canDelete ? () => setDeleteConfirm({ open: true, bulk: true }) : undefined}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onClearSelection={clearSelection}
          canDelete={canDelete}
        />

        {/* History Table */}
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
                <SortableTableHead label="Date" sortKey="createdAt" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Items" sortKey="orderItemsCount" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Predicted" sortKey="predictedMinutes" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Actual" sortKey="actualMinutes" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>Accuracy</TableHead>
                <SortableTableHead label="Confidence" sortKey="confidence" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((entry) => {
                const accuracy =
                  entry.actualMinutes != null
                    ? Math.max(
                        0,
                        100 -
                          (Math.abs(entry.predictedMinutes - entry.actualMinutes) /
                            entry.predictedMinutes) *
                            100
                      ).toFixed(0)
                    : null;

                return (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setDetailEntry(entry)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected(entry.id)}
                        onChange={() => toggleOne(entry.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.orderItemsCount} items</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entry.predictedMinutes} min</TableCell>
                    <TableCell>
                      {entry.actualMinutes != null ? (
                        `${entry.actualMinutes} min`
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {accuracy !== null ? (
                        <Badge
                          className={
                            parseInt(accuracy) >= 80
                              ? 'bg-green-100 text-green-800'
                              : parseInt(accuracy) >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {accuracy}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.confidence != null ? (
                        <div className="w-24">
                          <ConfidenceMeter value={entry.confidence} size="sm" />
                        </div>
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {entry.actualMinutes == null && editingId !== entry.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(entry.id);
                            setActualMinutes('');
                          }}
                        >
                          Update Actual
                        </Button>
                      )}
                      {editingId === entry.id && (
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={actualMinutes}
                            onChange={(e) => setActualMinutes(e.target.value)}
                            className="w-20 h-8"
                            min={1}
                            placeholder="min"
                          />
                          <Button size="sm" onClick={() => handleUpdateActual(entry.id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setActualMinutes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {canDelete && editingId !== entry.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm({ open: true, id: entry.id })}
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
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No predictions yet
                    {canSeed && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              const result = await seedWaitTime();
                              toast.success(result.message);
                              fetchHistory();
                            } catch { toast.error('Failed to load sample data'); }
                          }}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          Load Sample Data
                        </Button>
                      </div>
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
        title={deleteConfirm.bulk ? 'Delete Selected Predictions' : 'Delete Prediction'}
        description={
          deleteConfirm.bulk
            ? `Are you sure you want to delete ${selectedCount} selected predictions? This action cannot be undone.`
            : 'Are you sure you want to delete this prediction? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Detail Dialog */}
      <Dialog open={!!detailEntry} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          {detailEntry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(detailEntry.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Items</p>
                  <p className="font-medium">{detailEntry.orderItemsCount} items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Predicted Time</p>
                  <p className="font-medium">{detailEntry.predictedMinutes} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Actual Time</p>
                  <p className="font-medium">
                    {detailEntry.actualMinutes != null ? `${detailEntry.actualMinutes} min` : 'Not recorded'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Queue Size</p>
                  <p className="font-medium">{detailEntry.currentQueueSize} orders</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time of Day</p>
                  <p className="font-medium">{detailEntry.timeOfDay}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Day of Week</p>
                  <p className="font-medium">{detailEntry.dayOfWeek}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confidence</p>
                  <p className="font-medium">
                    {detailEntry.confidence != null
                      ? `${Math.round(detailEntry.confidence * 100)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
              {detailEntry.factors && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Factors</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(detailEntry.factors).map(([key, value]) => (
                      <div key={key} className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">{key}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailEntry.actualMinutes == null && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={actualMinutes}
                    onChange={(e) => setActualMinutes(e.target.value)}
                    className="w-24"
                    min={1}
                    placeholder="Actual min"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      await handleUpdateActual(detailEntry.id);
                      setDetailEntry(null);
                    }}
                  >
                    Update Actual
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {canDelete && detailEntry && (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm({ open: true, id: detailEntry.id })}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailEntry(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
