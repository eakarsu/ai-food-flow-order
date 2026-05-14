import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getPersonalizedRecommendations,
  recordRecAction,
  PersonalizedRecResponse,
} from '@/services/api/personalizedRecs';

export default function PersonalizedRecsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<PersonalizedRecResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefsText, setPrefsText] = useState('vegetarian-friendly, low sodium');

  const restaurantId = 'default';
  const userId = user?.id ?? 'guest';

  const load = async () => {
    setLoading(true);
    try {
      const dietaryPreferences = prefsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const r = await getPersonalizedRecommendations({ userId, restaurantId, dietaryPreferences });
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

  const act = async (itemId: string, action: 'view' | 'add_to_cart' | 'dismiss', name: string) => {
    await recordRecAction({ userId, itemId, action });
    if (action === 'add_to_cart') toast.success(`Added ${name} to cart`);
    else if (action === 'dismiss') toast.info(`Hid ${name} from recommendations`);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-pink-100 p-3 rounded-xl">
          <Sparkles className="text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Personalized Recommendations</h1>
          <p className="text-gray-600 text-sm">
            AI-curated suggestions based on your order history and dietary preferences.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Dietary Preferences (comma-separated)</Label>
          <div className="flex gap-2 mt-2">
            <Input value={prefsText} onChange={(e) => setPrefsText(e.target.value)} />
            <Button onClick={load} disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Based on {data.basedOn.historicalOrders} past orders · Favorite categories:{' '}
            {data.basedOn.favoriteCategories.join(', ')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recommendations.map((r) => (
              <Card key={r.itemId}>
                <CardHeader>
                  <CardTitle className="text-base">{r.itemName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">${r.price.toFixed(2)}</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 italic mb-3">{r.reason}</div>
                  <div className="text-xs mb-3">
                    Match: <strong>{Math.round(r.matchScore * 100)}%</strong>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => act(r.itemId, 'add_to_cart', r.itemName)}>
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => act(r.itemId, 'dismiss', r.itemName)}
                    >
                      Not interested
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
