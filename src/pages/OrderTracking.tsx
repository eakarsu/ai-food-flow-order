import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { getOrder, Order, cancelOrder } from '@/services/api/orders';
import { getDeliveryStatus, DeliveryStatus } from '@/services/api/delivery';
import {
  connectSocket,
  subscribeToOrder,
  unsubscribeFromOrder,
  onDeliveryUpdate,
  onOrderUpdate,
} from '@/services/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  ChefHat,
  Truck,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
      setIsLoading(false);
    } else if (isAuthenticated && id) {
      fetchOrderDetails();
      setupSocketConnection();
    }

    return () => {
      if (id) {
        unsubscribeFromOrder(id);
      }
    };
  }, [isAuthenticated, authLoading, id]);

  const fetchOrderDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [orderResponse, deliveryResponse] = await Promise.all([
        getOrder(id),
        getDeliveryStatus(id).catch(() => null),
      ]);
      setOrder(orderResponse.order);
      if (deliveryResponse) {
        setDeliveryStatus(deliveryResponse);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketConnection = () => {
    if (!id) return;

    const socket = connectSocket();
    subscribeToOrder(id);

    onOrderUpdate((data) => {
      if (data.orderId === id) {
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    });

    onDeliveryUpdate((data) => {
      if (data.orderId === id) {
        setDeliveryStatus((prev) =>
          prev
            ? {
                ...prev,
                delivery: {
                  ...prev.delivery!,
                  currentLocation: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                  },
                  etaMinutes: data.etaMinutes,
                  status: data.status,
                  lastUpdated: data.timestamp,
                },
              }
            : prev
        );
      }
    });
  };

  const handleCancelOrder = async () => {
    if (!id) return;

    try {
      await cancelOrder(id);
      toast.success('Order cancelled');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.status === 'cancelled') return -1;
    return statusSteps.findIndex((s) => s.key === order.status);
  };

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Sign in to track your order
            </h2>
            <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <Button onClick={() => navigate('/orders')}>View All Orders</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Order {order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status]}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchOrderDetails}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {order.status === 'cancelled' ? (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <p className="text-lg font-medium">Order Cancelled</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between relative">
                      {statusSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center relative z-10"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                            >
                              <StepIcon className="h-5 w-5" />
                            </div>
                            <span
                              className={`text-xs mt-2 text-center ${
                                isActive ? 'font-medium' : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ETA */}
                    {order.estimatedDeliveryTime && order.status !== 'delivered' && (
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Estimated Delivery
                        </p>
                        <p className="text-lg font-semibold">
                          {formatDate(order.estimatedDeliveryTime)}
                        </p>
                        {deliveryStatus?.delivery?.etaMinutes && (
                          <p className="text-sm text-primary">
                            ~{deliveryStatus.delivery.etaMinutes} minutes away
                          </p>
                        )}
                      </div>
                    )}

                    {/* Driver Info */}
                    {deliveryStatus?.delivery && order.status === 'out_for_delivery' && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Your Driver</h3>
                        <div className="flex items-center gap-4">
                          {deliveryStatus.delivery.driverPhotoUrl ? (
                            <img
                              src={deliveryStatus.delivery.driverPhotoUrl}
                              alt="Driver"
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Truck className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {deliveryStatus.delivery.driverName || 'Driver'}
                            </p>
                            {deliveryStatus.delivery.driverPhone && (
                              <a
                                href={`tel:${deliveryStatus.delivery.driverPhone}`}
                                className="text-sm text-primary flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" />
                                Contact Driver
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {item.quantity}x {item.name}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-sm text-muted-foreground">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                {order.tipAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>${order.tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.deliveryAddress.streetAddress}</p>
                  {order.deliveryAddress.apartment && (
                    <p>{order.deliveryAddress.apartment}</p>
                  )}
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                    {order.deliveryAddress.zipCode}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Restaurant Info */}
            {order.restaurant && (
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{order.restaurant.name}</p>
                  {order.restaurant.phone && (
                    <a
                      href={`tel:${order.restaurant.phone}`}
                      className="text-sm text-primary flex items-center gap-1 mt-1"
                    >
                      <Phone className="h-3 w-3" />
                      {order.restaurant.phone}
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this order? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelOrder}>
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
