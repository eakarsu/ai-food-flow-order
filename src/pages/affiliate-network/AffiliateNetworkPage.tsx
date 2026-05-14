import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Network, Loader2, ArrowRightCircle } from 'lucide-react';
import {
  getRoutingRecommendation,
  acceptRouting,
  RoutingDecision,
} from '@/services/api/affiliateNetwork';

export default function AffiliateNetworkPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('ORD-DEMO-001');
  const [restaurantId, setRestaurantId] = useState('rest-001');
  const [cuisine, setCuisine] = useState('Italian');
  const [decision, setDecision] = useState<RoutingDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const find = async () => {
    setLoading(true);
    try {
      const r = await getRoutingRecommendation({ orderId, restaurantId, cuisineType: cuisine });
      setDecision(r);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (partnerId: string) => {
    setAccepting(partnerId);
    try {
      const r = await acceptRouting({ orderId, acceptedRestaurantId: partnerId });
      toast.success(`Routed to partner. New order: ${r.newOrderId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 p-3 rounded-xl">
          <Network className="text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Affiliate Restaurant Network</h1>
          <p className="text-gray-600 text-sm">
            When overloaded, AI routes orders to partner locations with available capacity.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Find Routing Options</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Order ID</Label>
            <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <div>
            <Label>Origin Restaurant</Label>
            <Input value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} />
          </div>
          <div>
            <Label>Cuisine</Label>
            <Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={find} disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Find Partners
            </Button>
          </div>
        </CardContent>
      </Card>

      {decision && (
        <>
          <Card className="mb-6 border-amber-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ArrowRightCircle className="text-amber-600" />
                <div>
                  <div className="font-semibold">AI Recommendation</div>
                  <div className="text-sm text-gray-700">{decision.reason}</div>
                  <div className="text-sm text-green-700 mt-1">
                    Estimated time savings: {decision.expectedTimeSavingsMin} min
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold mb-3">Available Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {decision.partners.map((p) => {
              const isRecommended = p.id === decision.recommendedRestaurantId;
              return (
                <Card key={p.id} className={isRecommended ? 'border-2 border-amber-500' : ''}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      {p.name}
                      {isRecommended && <Badge>Recommended</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>Distance: {p.distanceKm} km</div>
                    <div>
                      Capacity: {Math.round(p.currentCapacity * 100)}%{' '}
                      <span className="text-gray-500">
                        ({p.currentCapacity < 0.5 ? 'low' : p.currentCapacity < 0.8 ? 'medium' : 'high'})
                      </span>
                    </div>
                    <div>Wait: {p.estimatedWaitMin} min</div>
                    <div>Match: {Math.round(p.matchScore * 100)}%</div>
                    <Button
                      className="w-full mt-2"
                      onClick={() => accept(p.id)}
                      disabled={accepting === p.id}
                      variant={isRecommended ? 'default' : 'outline'}
                    >
                      {accepting === p.id ? '...' : 'Route Order Here'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
