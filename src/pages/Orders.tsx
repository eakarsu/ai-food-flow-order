import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { getOrders, Order, reorder } from '@/services/api/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: Package,
  preparing: Package,
  ready: Package,
  out_for_delivery: MapPin,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function Orders() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState<any>(null);
  useEffect(()=>{ if(!isAuthenticated) return; const t=localStorage.getItem('token'); fetch('/api/feature-pack/orders/insights',{headers:t?{Authorization:`Bearer ${t}`}:{}}).then(r=>r.ok?r.json():null).then(setInsights).catch(()=>{}); },[isAuthenticated]);
  const visibleOrders = orders.filter(o=>{ const hay=[o.orderNumber,o.status,o.restaurantName||''].join(' ').toLowerCase(); return !query||hay.includes(query.toLowerCase()); });
  async function exportOrders(format:string){ const t=localStorage.getItem('token'); const r=await fetch(`/api/feature-pack/orders/export?format=${format}`,{headers:t?{Authorization:`Bearer ${t}`}:{}}); if(!r.ok){toast.error('Export failed');return;} const b=await r.blob(); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`orders.${format}`; a.click(); URL.revokeObjectURL(u); }
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
      setIsLoading(false);
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      await reorder(orderId);
      toast.success('Items added to cart!');
      navigate('/menu');
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const activeOrders = visibleOrders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  );
  const pastOrders = visibleOrders.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const StatusIcon = statusIcons[order.status] || Package;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              {order.orderNumber}
            </CardTitle>
            <Badge className={statusColors[order.status] || 'bg-gray-100'}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.restaurantName && (
              <p className="font-medium">{order.restaurantName}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="font-semibold">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              {order.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReorder(order.id);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reorder
                </Button>
              )}
              <Button variant="ghost" size="sm">
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="flex flex-wrap gap-2 mb-4"><label>Search orders <input aria-label="Search orders" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order, restaurant, status" className="border rounded px-2 py-1" /></label><Button variant="outline" size="sm" onClick={()=>exportOrders('csv')}>Export CSV</Button><Button variant="outline" size="sm" onClick={()=>exportOrders('json')}>Export JSON</Button></div>
        {insights && <section aria-label="Deterministic insights (not AI-generated)" className="mb-6"><h2 className="font-semibold">Deterministic insights — not AI-generated (aiGenerated: false)</h2><p className="text-sm text-muted-foreground">{insights.disclaimer}</p>{insights.insights.map((ins:any)=><article key={ins.id}><h3 className="font-medium">{ins.title}</h3><p>{ins.summary}</p>{ins.sections.map((sec:any,i:number)=><div key={i}><strong>{sec.title}:</strong> <span>{String(sec.detail)}</span></div>)}{ins.metrics.map((m:any,i:number)=><div key={i}><span>{m.label}: </span><strong>{String(m.value)}</strong></div>)}</article>)}</section>}

        {!isAuthenticated && !authLoading ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view your orders</h2>
            <p className="text-muted-foreground mb-4">
              Track your deliveries and view order history
            </p>
            <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">
              Your order history will appear here
            </p>
            <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past Orders ({pastOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active orders</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No past orders</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
