import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Edit,
  Trash2,
  Package,
  TrendingDown,
  Calendar,
  MapPin,
  Save,
} from 'lucide-react';
import {
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  recordInventoryUsage,
  InventoryItem,
  UsageHistory,
} from '@/services/api/inventory';

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [usageAmount, setUsageAmount] = useState(1);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated && id) {
      fetchItem();
    }
  }, [isAuthenticated, authLoading, id, navigate]);

  const fetchItem = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getInventoryItem(id);
      setItem(response.item);
      setUsageHistory(response.usageHistory);
      setEditForm(response.item);
    } catch (error) {
      toast.error('Failed to load item');
      navigate('/admin/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await updateInventoryItem(id, editForm);
      toast.success('Item updated successfully');
      setEditing(false);
      fetchItem();
    } catch (error) {
      toast.error('Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteInventoryItem(id);
      toast.success('Item deleted');
      navigate('/admin/inventory');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleRecordUsage = async () => {
    if (!id || usageAmount <= 0) return;
    try {
      await recordInventoryUsage({
        inventoryItemId: id,
        quantityUsed: usageAmount,
        usageType: 'consumption',
      });
      toast.success('Usage recorded');
      setShowUsageDialog(false);
      setUsageAmount(1);
      fetchItem();
    } catch (error) {
      toast.error('Failed to record usage');
    }
  };

  const getStockStatus = () => {
    if (!item) return { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    if (item.currentQuantity <= item.minQuantity / 2) {
      return { label: 'Critical', className: 'bg-red-100 text-red-800' };
    }
    if (item.currentQuantity <= item.reorderPoint) {
      return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Item not found</p>
      </div>
    );
  }

  const status = getStockStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/inventory')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
                <Badge className={status.className}>{status.label}</Badge>
              </div>
              <p className="text-sm text-gray-500">{item.category || 'Uncategorized'}</p>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowUsageDialog(true)}>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Record Usage
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        value={editForm.unit || ''}
                        onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Quantity</Label>
                      <Input
                        type="number"
                        value={editForm.currentQuantity || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, currentQuantity: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Quantity</Label>
                      <Input
                        type="number"
                        value={editForm.minQuantity || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, minQuantity: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reorder Point</Label>
                      <Input
                        type="number"
                        value={editForm.reorderPoint || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, reorderPoint: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Cost ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.unitCost || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, unitCost: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Input
                        value={editForm.supplier || ''}
                        onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Storage Location</Label>
                      <Input
                        value={editForm.storageLocation || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, storageLocation: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Quantity</p>
                      <p className="text-2xl font-bold">
                        {item.currentQuantity} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unit Cost</p>
                      <p className="text-2xl font-bold">${item.unitCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Min Quantity</p>
                      <p className="font-medium">{item.minQuantity} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reorder Point</p>
                      <p className="font-medium">{item.reorderPoint} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max Quantity</p>
                      <p className="font-medium">{item.maxQuantity} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Daily Usage</p>
                      <p className="font-medium">
                        {item.avgDailyUsage?.toFixed(1) || 'N/A'} {item.unit}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage History */}
            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                {usageHistory.length > 0 ? (
                  <div className="space-y-3">
                    {usageHistory.map((usage) => (
                      <div
                        key={usage.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              -{usage.quantityUsed} {item.unit}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">{usage.usageType}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(usage.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No usage history recorded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="font-medium">{item.supplier || 'Not specified'}</p>
                  </div>
                </div>
                {item.storageLocation && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Storage Location</p>
                      <p className="font-medium">{item.storageLocation}</p>
                    </div>
                  </div>
                )}
                {item.lastRestockedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Last Restocked</p>
                      <p className="font-medium">
                        {new Date(item.lastRestockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current</span>
                    <span className="font-medium">{item.currentQuantity}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        item.currentQuantity <= item.minQuantity / 2
                          ? 'bg-red-500'
                          : item.currentQuantity <= item.reorderPoint
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          (item.currentQuantity / item.maxQuantity) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {item.minQuantity}</span>
                    <span>Max: {item.maxQuantity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Record Usage Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Usage</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Quantity Used ({item.unit})</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={usageAmount}
              onChange={(e) => setUsageAmount(Number(e.target.value))}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Current stock: {item.currentQuantity} {item.unit}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordUsage}>Record Usage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
