import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Leaf, Loader2 } from 'lucide-react';
import {
  calculateOrderSustainability,
  SustainabilityScore,
} from '@/services/api/sustainability';

export default function SustainabilityPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState<SustainabilityScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('SAMPLE-001');
  const [distance, setDistance] = useState(4);
  const [packaging, setPackaging] = useState<'plastic' | 'compostable' | 'reusable'>('compostable');
  const [itemsText, setItemsText] = useState('Cheeseburger:1:meat\nFrench Fries:1:vegetable\nDiet Coke:1:drink');

  const calculate = async () => {
    setLoading(true);
    try {
      const items = itemsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [name, qty, category] = l.split(':');
          return { name, quantity: parseInt(qty || '1') || 1, category };
        });
      const r = await calculateOrderSustainability({
        orderId,
        items,
        deliveryDistanceKm: distance,
        packagingType: packaging,
      });
      setScore(r);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ratingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'bg-green-600';
      case 'B':
        return 'bg-green-500';
      case 'C':
        return 'bg-yellow-500';
      case 'D':
        return 'bg-orange-500';
      default:
        return 'bg-red-600';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-xl">
          <Leaf className="text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sustainability Scoring</h1>
          <p className="text-gray-600 text-sm">
            Estimate carbon footprint and earn loyalty points for eco-friendly choices.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order ID</Label>
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            </div>
            <div>
              <Label>Delivery Distance (km)</Label>
              <Input
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div>
            <Label>Packaging</Label>
            <div className="flex gap-2 mt-2">
              {(['plastic', 'compostable', 'reusable'] as const).map((p) => (
                <Button
                  key={p}
                  variant={packaging === p ? 'default' : 'outline'}
                  onClick={() => setPackaging(p)}
                  size="sm"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Items (name:quantity:category, one per line)</Label>
            <textarea
              className="w-full border rounded p-2 text-sm font-mono"
              rows={5}
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
            />
          </div>
          <Button onClick={calculate} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Calculate Score
          </Button>
        </CardContent>
      </Card>

      {score && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sustainability Score</CardTitle>
              <div className={`${ratingColor(score.rating)} text-white text-3xl font-bold rounded-full w-14 h-14 flex items-center justify-center`}>
                {score.rating}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase">Total CO₂</div>
                <div className="text-2xl font-bold">{score.totalCo2Kg} kg</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Loyalty Points Earned</div>
                <div className="text-2xl font-bold text-green-700">+{score.loyaltyPointsEarned}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500">Ingredients</div>
                <div className="text-xl font-bold">{score.ingredientScore}/100</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Delivery</div>
                <div className="text-xl font-bold">{Math.round(score.deliveryScore)}/100</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Packaging</div>
                <div className="text-xl font-bold">{score.packagingScore}/100</div>
              </div>
            </div>
            {score.suggestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="font-semibold mb-2 text-green-800">Suggestions</div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {score.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
