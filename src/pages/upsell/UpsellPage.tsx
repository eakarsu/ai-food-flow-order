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
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Database,
  Download,
  FileText,
} from 'lucide-react';
import {
  getUpsellRecommendations,
  getUpsellHistory,
  recordUpsellAcceptance,
  deleteUpsellRecommendation,
  bulkDeleteUpsellRecommendations,
  UpsellRecommendation,
  UpsellHistory,
} from '@/services/api/ai';
import { seedUpsell } from '@/services/api/seed';
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
  { header: 'Cart Items', accessor: (r) => r.cartItems.map((i: any) => i.name).join(', ') },
  { header: 'Recommendations', accessor: (r) => r.recommendedItems.map((i: any) => i.itemName).join(', ') },
  { header: 'Confidence', accessor: (r) => r.confidence != null ? `${Math.round(r.confidence * 100)}%` : '' },
  { header: 'Accepted', accessor: (r) => r.wasAccepted === true ? 'Yes' : r.wasAccepted === false ? 'No' : '' },
];

export default function UpsellPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { canDelete, canSeed } = useRBAC();
  const [history, setHistory] = useState<UpsellHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<UpsellRecommendation[] | null>(null);
  const [totalConfidence, setTotalConfidence] = useState<number | null>(null);

  // Form state
  const [restaurantId, setRestaurantId] = useState('default');
  const [cartItems, setCartItems] = useState<Array<{ name: string; price: number }>>([
    { name: '', price: 0 },
  ]);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false });

  // Detail dialog state
  const [detailEntry, setDetailEntry] = useState<UpsellHistory | null>(null);

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
      const res = await getUpsellHistory({ limit: 50 });
      setHistory(res.recommendations);
    } catch (error) {
      toast.error('Failed to load recommendation history');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    const validItems = cartItems.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      toast.error('Please add at least one cart item');
      return;
    }
    try {
      setRecommending(true);
      const res = await getUpsellRecommendations({
        restaurantId,
        cartItems: validItems,
      });
      setRecommendations(res.recommendations);
      setTotalConfidence(res.totalConfidence);
      toast.success('Recommendations generated!');
      fetchHistory();
    } catch (error) {
      toast.error('Failed to generate recommendations');
    } finally {
      setRecommending(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.bulk) {
      try {
        const ids = Array.from(selectedIds);
        await bulkDeleteUpsellRecommendations(ids);
        toast.success(`${ids.length} recommendations deleted`);
        clearSelection();
        fetchHistory();
      } catch (error) {
        toast.error('Failed to bulk delete recommendations');
      }
    } else if (deleteConfirm.id) {
      try {
        await deleteUpsellRecommendation(deleteConfirm.id);
        toast.success('Recommendation deleted');
        setDetailEntry(null);
        fetchHistory();
      } catch (error) {
        toast.error('Failed to delete recommendation');
      }
    }
    setDeleteConfirm({ open: false });
  };

  const addCartItem = () => {
    setCartItems([...cartItems, { name: '', price: 0 }]);
  };

  const removeCartItem = (index: number) => {
    if (cartItems.length > 1) {
      setCartItems(cartItems.filter((_, i) => i !== index));
    }
  };

  const updateCartItem = (index: number, field: 'name' | 'price', value: string | number) => {
    const updated = [...cartItems];
    updated[index] = { ...updated[index], [field]: value };
    setCartItems(updated);
  };

  const loadSampleCart = () => {
    const sampleCarts = [
      [
        { name: 'Turkey Club Sandwich', price: 12.99 },
        { name: 'Caesar Salad', price: 9.49 },
        { name: 'Iced Latte', price: 5.99 },
      ],
      [
        { name: 'Margherita Pizza', price: 14.99 },
        { name: 'Garlic Bread', price: 4.99 },
      ],
      [
        { name: 'Grilled Salmon', price: 18.99 },
        { name: 'Roasted Vegetables', price: 7.49 },
        { name: 'Sparkling Water', price: 3.49 },
        { name: 'Tiramisu', price: 8.99 },
      ],
    ];
    const randomCart = sampleCarts[Math.floor(Math.random() * sampleCarts.length)];
    setCartItems(randomCart);
    toast.success('Sample cart loaded - click Get Recommendations!');
  };

  const handleExportCSV = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToCSV(data, EXPORT_COLUMNS, 'upsell-recommendations');
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToPDF(data, EXPORT_COLUMNS, 'Upsell Recommendations Report', 'upsell-recommendations');
    toast.success('PDF exported');
  };

  // Compute stats from history
  const stats = {
    totalRecommendations: history.length,
    acceptanceRate:
      history.filter((h) => h.wasAccepted != null).length > 0
        ? (
            (history.filter((h) => h.wasAccepted === true).length /
              history.filter((h) => h.wasAccepted != null).length) *
            100
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
              <h1 className="text-xl font-bold text-gray-900">Upsell Recommender</h1>
              <p className="text-sm text-gray-500">
                AI-powered upsell and cross-sell recommendations
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
                    const result = await seedUpsell();
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Recommendations</p>
                  <p className="text-2xl font-bold">{stats.totalRecommendations}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Acceptance Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.acceptanceRate !== 'N/A' ? `${stats.acceptanceRate}%` : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
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
                <ShoppingCart className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Recommendation Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                New Recommendation
              </h2>
              <Button variant="outline" onClick={loadSampleCart}>
                <Database className="h-4 w-4 mr-2" />
                Load Sample Cart
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
                <label className="text-sm font-medium text-gray-700">Cart Items</label>
                <div className="mt-2 space-y-2">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateCartItem(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={item.price || ''}
                        onChange={(e) =>
                          updateCartItem(index, 'price', parseFloat(e.target.value) || 0)
                        }
                        placeholder="Price"
                        className="w-24"
                        min={0}
                        step={0.01}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCartItem(index)}
                        disabled={cartItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addCartItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              <Button onClick={handleGetRecommendations} disabled={recommending}>
                {recommending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...
                  </>
                ) : (
                  'Get Recommendations'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Result */}
        {recommendations && recommendations.length > 0 && (
          <div className="mb-6 space-y-4">
            <AIOutputDisplay
              title="Upsell Recommendations"
              type="recommendation"
              content={recommendations
                .map(
                  (rec) =>
                    `${rec.itemName}: ${rec.reason}`
                )
                .join('\n\n')}
              confidence={totalConfidence ?? undefined}
              keyPoints={recommendations.map(
                (rec) =>
                  `${rec.itemName} — ${Math.round(rec.confidence * 100)}% confidence`
              )}
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
                <TableHead>Cart Items</TableHead>
                <TableHead>Recommendations</TableHead>
                <SortableTableHead label="Confidence" sortKey="confidence" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>Accepted</TableHead>
                {canDelete && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((entry) => (
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
                    <div className="flex flex-wrap gap-1">
                      {entry.cartItems.map((item, i) => (
                        <Badge key={i} variant="outline">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.recommendedItems.map((rec, i) => (
                        <Badge key={i} className="bg-purple-100 text-purple-800">
                          {rec.itemName}
                        </Badge>
                      ))}
                    </div>
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
                  <TableCell>
                    {entry.wasAccepted === true ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> Yes
                      </Badge>
                    ) : entry.wasAccepted === false ? (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" /> No
                      </Badge>
                    ) : (
                      <span className="text-gray-400">&mdash;</span>
                    )}
                  </TableCell>
                  {canDelete && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm({ open: true, id: entry.id })}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {sortedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canDelete ? 7 : 6} className="text-center py-8 text-gray-500">
                    No recommendations yet
                    {canSeed && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              const result = await seedUpsell();
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
        title={deleteConfirm.bulk ? 'Delete Selected Recommendations' : 'Delete Recommendation'}
        description={
          deleteConfirm.bulk
            ? `Are you sure you want to delete ${selectedCount} selected recommendations? This action cannot be undone.`
            : 'Are you sure you want to delete this recommendation? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Detail Dialog */}
      <Dialog open={!!detailEntry} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recommendation Details</DialogTitle>
          </DialogHeader>
          {detailEntry && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-medium">{new Date(detailEntry.createdAt).toLocaleString()}</p>
              </div>
              {detailEntry.userName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">User</p>
                  <p className="font-medium">{detailEntry.userName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">Cart Items</p>
                <div className="space-y-1">
                  {detailEntry.cartItems.map((item, i) => (
                    <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name}</span>
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Recommended Items</p>
                <div className="space-y-2">
                  {detailEntry.recommendedItems.map((rec, i) => (
                    <div key={i} className="p-2 bg-purple-50 border border-purple-200 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{rec.itemName}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {Math.round(rec.confidence * 100)}%
                        </Badge>
                      </div>
                      {rec.reason && (
                        <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Overall Confidence</p>
                  <p className="font-medium">
                    {detailEntry.confidence != null
                      ? `${Math.round(detailEntry.confidence * 100)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Accepted</p>
                  <p className="font-medium">
                    {detailEntry.wasAccepted === true
                      ? 'Yes'
                      : detailEntry.wasAccepted === false
                        ? 'No'
                        : 'Pending'}
                  </p>
                </div>
              </div>
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
