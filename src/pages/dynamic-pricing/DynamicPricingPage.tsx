import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, Loader2, Zap } from 'lucide-react';
import {
  getDynamicPricingSuggestions,
  applyDynamicPricing,
  DynamicPricingResponse,
} from '@/services/api/dynamicPricing';

export default function DynamicPricingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DynamicPricingResponse | null>(null);
  const [queueSize, setQueueSize] = useState(15);
  const [inventoryPressure, setInventoryPressure] = useState(0.3);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const restaurantId = 'default';

  const load = async () => {
    setLoading(true);
    try {
      const r = await getDynamicPricingSuggestions({
        restaurantId,
        queueSize,
        inventoryPressure,
      });
      setData(r);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load pricing suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (itemId: string, newPrice: number) => {
    setApplyingId(itemId);
    try {
      await applyDynamicPricing({ restaurantId, itemId, newPrice });
      toast.success(`New price applied: $${newPrice.toFixed(2)}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-xl">
          <TrendingUp className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dynamic Pricing by Demand</h1>
          <p className="text-gray-600 text-sm">
            AI adjusts item prices based on queue length, time-of-day, and inventory.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pricing Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Current Queue Size</Label>
            <Input
              type="number"
              value={queueSize}
              onChange={(e) => setQueueSize(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Inventory Pressure (0-1)</Label>
            <Input
              type="number"
              step="0.05"
              value={inventoryPressure}
              onChange={(e) => setInventoryPressure(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={load} disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
              Recalculate Prices
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Time of Day</div>
                <div className="text-xl font-bold capitalize">{data.context.timeOfDay}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Day</div>
                <div className="text-xl font-bold">{data.context.dayOfWeek}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Queue</div>
                <div className="text-xl font-bold">{data.context.queueSize} orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Items Repriced</div>
                <div className="text-xl font-bold">{data.suggestions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Suggested</TableHead>
                    <TableHead>Multiplier</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.suggestions.map((s) => (
                    <TableRow key={s.itemId}>
                      <TableCell className="font-medium">{s.itemName}</TableCell>
                      <TableCell>${s.basePrice.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">${s.suggestedPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={s.multiplier >= 1 ? 'default' : 'secondary'}>
                          {s.multiplier}x
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.round(s.confidence * 100)}%</TableCell>
                      <TableCell className="text-sm text-gray-600">{s.reason}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          disabled={applyingId === s.itemId}
                          onClick={() => apply(s.itemId, s.suggestedPrice)}
                        >
                          {applyingId === s.itemId ? '...' : 'Apply'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
