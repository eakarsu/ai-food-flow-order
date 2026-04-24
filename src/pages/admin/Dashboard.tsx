import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Package,
  Users,
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp,
  Sparkles,
  LogOut,
  Loader2,
  Database,
} from 'lucide-react';
import { getInventoryItems } from '@/services/api/inventory';
import { getStaffMembers } from '@/services/api/staff';
import { getReviews } from '@/services/api/reviews';
import { seedInventory, seedStaff, seedReviews, seedAll } from '@/services/api/seed';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  count?: number;
  countLabel?: string;
  color: string;
  badge?: string;
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    inventory: 0,
    staff: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState<string | null>(null);

  // Get restaurant ID (in a real app, this would come from context or API)
  const restaurantId = 'default'; // You'd replace this with actual restaurant ID

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      fetchCounts();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const [inventoryRes, staffRes, reviewsRes] = await Promise.all([
        getInventoryItems().catch((err) => { console.error('Inventory fetch error:', err); return { items: [] }; }),
        getStaffMembers().catch((err) => { console.error('Staff fetch error:', err); return { members: [] }; }),
        getReviews({ limit: 1 }).catch((err) => { console.error('Reviews fetch error:', err); return { reviews: [], total: 0 }; }),
      ]);

      console.log('Dashboard data loaded:', {
        inventory: inventoryRes.items.length,
        staff: staffRes.members.length,
        reviews: reviewsRes.total || reviewsRes.reviews.length,
      });

      setCounts({
        inventory: inventoryRes.items.length,
        staff: staffRes.members.length,
        reviews: reviewsRes.total || reviewsRes.reviews.length,
      });
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSeed = async (type: 'inventory' | 'staff' | 'reviews' | 'all') => {
    try {
      setSeeding(type);
      const seedFns = { inventory: seedInventory, staff: seedStaff, reviews: seedReviews, all: seedAll };
      const result = await seedFns[type]();
      toast.success(result.message);
      await fetchCounts();
      // Navigate to the relevant page after seeding
      const routes: Record<string, string> = {
        inventory: '/admin/inventory',
        staff: '/admin/staff',
        reviews: '/admin/reviews',
      };
      if (routes[type]) {
        navigate(routes[type]);
      }
    } catch (error) {
      console.error(`Seed ${type} error:`, error);
      toast.error(`Failed to load ${type} sample data`);
    } finally {
      setSeeding(null);
    }
  };

  const features: FeatureCard[] = [
    {
      title: 'Inventory Tracker',
      description: 'AI analyzes stock levels, predicts depletion dates, flags spoilage risks, and recommends reorder quantities',
      icon: Package,
      route: '/admin/inventory',
      count: counts.inventory,
      countLabel: 'items tracked',
      color: 'text-blue-600',
    },
    {
      title: 'Staff Manager',
      description: 'AI-powered team management with skill matching, hours tracking, and performance insights',
      icon: Users,
      route: '/admin/staff',
      count: counts.staff,
      countLabel: 'team members',
      color: 'text-green-600',
    },
    {
      title: 'Schedule Optimizer',
      description: 'AI builds optimal schedules based on demand forecasting, skill matching, and labor cost optimization',
      icon: Calendar,
      route: '/admin/schedules',
      countLabel: 'this week',
      color: 'text-purple-600',
    },
    {
      title: 'Review Responder',
      description: 'AI crafts personalized, on-brand responses to customer reviews with sentiment analysis',
      icon: MessageSquare,
      route: '/admin/reviews',
      count: counts.reviews,
      countLabel: 'reviews',
      color: 'text-amber-600',
    },
    {
      title: 'Wait Time Predictor',
      description: 'AI predicts order wait times based on queue, kitchen load, staff count, and time of day',
      icon: Clock,
      route: '/admin/wait-time',
      countLabel: 'predictions',
      color: 'text-indigo-600',
    },
    {
      title: 'Upsell Recommender',
      description: 'AI suggests complementary items based on cart contents, flavor pairings, and time of day',
      icon: TrendingUp,
      route: '/admin/upsell',
      countLabel: 'recommendations',
      color: 'text-pink-600',
    },
  ];


  if (authLoading) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Dashboard</h1>
                <p className="text-sm text-gray-500">OrderlyBite Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || 'Admin'}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Features</h2>
          <p className="text-gray-600 mt-1">
            Manage your restaurant operations with intelligent automation
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.route}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                  onClick={() => navigate(feature.route)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg bg-gray-100 ${feature.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Powered
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feature.count !== undefined && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {feature.count}
                        </span>
                        <span className="text-sm text-gray-500">{feature.countLabel}</span>
                      </div>
                    )}
                    {feature.count === undefined && (
                      <span className="text-sm text-gray-500">
                        Click to view {feature.countLabel}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Access Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Access</h2>
            <p className="text-gray-600 mb-6">
              Load sample data and go directly to each feature
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={(e) => { e.stopPropagation(); handleSeed('inventory'); }}
                disabled={seeding !== null}
              >
                {seeding === 'inventory' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : (
                  <Package className="h-6 w-6 text-blue-600" />
                )}
                <span className="font-medium">Inventory</span>
                <span className="text-xs text-gray-500">Load & view 16 items</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={(e) => { e.stopPropagation(); handleSeed('staff'); }}
                disabled={seeding !== null}
              >
                {seeding === 'staff' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                ) : (
                  <Users className="h-6 w-6 text-green-600" />
                )}
                <span className="font-medium">Staff</span>
                <span className="text-xs text-gray-500">Load & view 15 members</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={(e) => { e.stopPropagation(); handleSeed('reviews'); }}
                disabled={seeding !== null}
              >
                {seeding === 'reviews' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                ) : (
                  <MessageSquare className="h-6 w-6 text-amber-600" />
                )}
                <span className="font-medium">Reviews</span>
                <span className="text-xs text-gray-500">Load & view 15 reviews</span>
              </Button>

              <Button
                className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={(e) => { e.stopPropagation(); handleSeed('all'); }}
                disabled={seeding !== null}
              >
                {seeding === 'all' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Database className="h-6 w-6 text-white" />
                )}
                <span className="font-medium text-white">Load All Data</span>
                <span className="text-xs text-white/80">Seed everything at once</span>
              </Button>
            </div>
          </div>
          </>
        )}
      </main>
    </div>
  );
}
