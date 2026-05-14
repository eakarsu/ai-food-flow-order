import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Package, Loader2, Truck } from 'lucide-react';
import {
  getInventoryForecasts,
  placeReorder,
  PredictiveInventoryResponse,
} from '@/services/api/predictiveInventory';

export default function PredictiveInventoryPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PredictiveInventoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderingId, setOrderingId] = useState<string | null>(null);

  const restaurantId = 'default';

  const load = async () => {
    setLoading(true);
    try {
      const r = await getInventoryForecasts({ restaurantId, horizonDays: 7 });
      setData(r);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reorder = async (id: string, qty: number, supplier: string, name: string) => {
    setOrderingId(id);
    try {
      const r = await placeReorder({ restaurantId, ingredientId: id, quantity: qty, supplier });
      toast.success(`Reorder placed for ${qty} of ${name}. ETA: ${new Date(r.estimatedDelivery).toLocaleDateString()}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setOrderingId(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Package className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Predictive Inventory</h1>
          <p className="text-gray-600 text-sm">
            ML forecasts ingredient demand and auto-recommends reorders.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {data ? `Generated ${new Date(data.generatedAt).toLocaleString()}` : ''}
        </div>
        <Button onClick={load} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Refresh Forecast
        </Button>
      </div>

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Demand Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Forecast (7d)</TableHead>
                  <TableHead>Days to Stockout</TableHead>
                  <TableHead>Recommended</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.forecasts.map((f) => (
                  <TableRow key={f.ingredientId}>
                    <TableCell className="font-medium">{f.ingredientName}</TableCell>
                    <TableCell>
                      {f.currentStock} {f.unit}
                    </TableCell>
                    <TableCell>
                      {f.forecastedUsage7Days} {f.unit}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          f.daysUntilStockout < 2
                            ? 'destructive'
                            : f.daysUntilStockout < 5
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {f.daysUntilStockout}d
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {f.reorderRecommended ? (
                        <span className="font-bold text-orange-700">
                          {f.recommendedOrderQty} {f.unit}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{Math.round(f.confidence * 100)}%</TableCell>
                    <TableCell>
                      {f.reorderRecommended && (
                        <Button
                          size="sm"
                          disabled={orderingId === f.ingredientId}
                          onClick={() =>
                            reorder(
                              f.ingredientId,
                              f.recommendedOrderQty,
                              f.preferredSupplier ?? 'Default',
                              f.ingredientName
                            )
                          }
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          {orderingId === f.ingredientId ? '...' : 'Reorder'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
