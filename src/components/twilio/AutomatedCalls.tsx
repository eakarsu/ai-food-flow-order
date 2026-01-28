import { useState } from 'react';
import { Phone, MessageSquare, Megaphone, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AutomatedCalls = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Order Ready form state
  const [orderReadyForm, setOrderReadyForm] = useState({
    phoneNumber: '',
    customerName: '',
    orderNumber: '',
    restaurantName: 'OrderlyBite',
    pickupTime: '15 minutes',
  });

  // Delivery Update form state
  const [deliveryForm, setDeliveryForm] = useState({
    phoneNumber: '',
    customerName: '',
    orderNumber: '',
    driverName: '',
    estimatedTime: '10 minutes',
  });

  // Promotional form state
  const [promoForm, setPromoForm] = useState({
    phoneNumber: '',
    customerName: '',
    promoCode: 'SAVE20',
    discount: '20%',
    restaurantName: 'OrderlyBite',
  });

  // Custom message form state
  const [customForm, setCustomForm] = useState({
    phoneNumber: '',
    message: '',
    gatherResponse: true,
  });

  const makeCall = async (endpoint: string, data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/automated-calls/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Call Initiated',
          description: result.simulated
            ? `Simulated: ${result.message}`
            : `Call started successfully. SID: ${result.callSid}`,
        });
      } else {
        throw new Error(result.error || 'Failed to make call');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate call',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="h-6 w-6" />
          Automated Calls
        </h1>
        <p className="text-muted-foreground">
          Make automated calls to customers for orders, deliveries, and promotions
        </p>
      </div>

      <Tabs defaultValue="order-ready" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="order-ready" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Order Ready</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="promotional" className="flex items-center gap-1">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Promo</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Custom</span>
          </TabsTrigger>
        </TabsList>

        {/* Order Ready Tab */}
        <TabsContent value="order-ready">
          <Card>
            <CardHeader>
              <CardTitle>Order Ready Notification</CardTitle>
              <CardDescription>
                Call customers to notify them their order is ready for pickup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="or-phone">Phone Number *</Label>
                  <Input
                    id="or-phone"
                    placeholder="+1234567890"
                    value={orderReadyForm.phoneNumber}
                    onChange={(e) => setOrderReadyForm({ ...orderReadyForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="or-name">Customer Name</Label>
                  <Input
                    id="or-name"
                    placeholder="John"
                    value={orderReadyForm.customerName}
                    onChange={(e) => setOrderReadyForm({ ...orderReadyForm, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="or-order">Order Number</Label>
                  <Input
                    id="or-order"
                    placeholder="#12345"
                    value={orderReadyForm.orderNumber}
                    onChange={(e) => setOrderReadyForm({ ...orderReadyForm, orderNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="or-restaurant">Restaurant Name</Label>
                  <Input
                    id="or-restaurant"
                    placeholder="OrderlyBite"
                    value={orderReadyForm.restaurantName}
                    onChange={(e) => setOrderReadyForm({ ...orderReadyForm, restaurantName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="or-time">Pickup Time</Label>
                  <Input
                    id="or-time"
                    placeholder="15 minutes"
                    value={orderReadyForm.pickupTime}
                    onChange={(e) => setOrderReadyForm({ ...orderReadyForm, pickupTime: e.target.value })}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => makeCall('order-ready', orderReadyForm)}
                disabled={isLoading || !orderReadyForm.phoneNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                {isLoading ? 'Calling...' : 'Call Customer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Update Tab */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Update</CardTitle>
              <CardDescription>
                Call customers with delivery status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="del-phone">Phone Number *</Label>
                  <Input
                    id="del-phone"
                    placeholder="+1234567890"
                    value={deliveryForm.phoneNumber}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="del-name">Customer Name</Label>
                  <Input
                    id="del-name"
                    placeholder="John"
                    value={deliveryForm.customerName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="del-order">Order Number</Label>
                  <Input
                    id="del-order"
                    placeholder="#12345"
                    value={deliveryForm.orderNumber}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, orderNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="del-driver">Driver Name</Label>
                  <Input
                    id="del-driver"
                    placeholder="Mike"
                    value={deliveryForm.driverName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, driverName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="del-time">Estimated Arrival</Label>
                  <Input
                    id="del-time"
                    placeholder="10 minutes"
                    value={deliveryForm.estimatedTime}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, estimatedTime: e.target.value })}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => makeCall('delivery-update', deliveryForm)}
                disabled={isLoading || !deliveryForm.phoneNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                {isLoading ? 'Calling...' : 'Call Customer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotional Tab */}
        <TabsContent value="promotional">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Call</CardTitle>
              <CardDescription>
                Call leads with special offers and promo codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-phone">Phone Number *</Label>
                  <Input
                    id="promo-phone"
                    placeholder="+1234567890"
                    value={promoForm.phoneNumber}
                    onChange={(e) => setPromoForm({ ...promoForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-name">Customer Name</Label>
                  <Input
                    id="promo-name"
                    placeholder="Valued Customer"
                    value={promoForm.customerName}
                    onChange={(e) => setPromoForm({ ...promoForm, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-code">Promo Code</Label>
                  <Input
                    id="promo-code"
                    placeholder="SAVE20"
                    value={promoForm.promoCode}
                    onChange={(e) => setPromoForm({ ...promoForm, promoCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-discount">Discount</Label>
                  <Input
                    id="promo-discount"
                    placeholder="20%"
                    value={promoForm.discount}
                    onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="promo-restaurant">Restaurant Name</Label>
                  <Input
                    id="promo-restaurant"
                    placeholder="OrderlyBite"
                    value={promoForm.restaurantName}
                    onChange={(e) => setPromoForm({ ...promoForm, restaurantName: e.target.value })}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => makeCall('promotional', promoForm)}
                disabled={isLoading || !promoForm.phoneNumber}
              >
                <Megaphone className="mr-2 h-4 w-4" />
                {isLoading ? 'Calling...' : 'Call Lead'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Message Tab */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Message</CardTitle>
              <CardDescription>
                Send a custom automated voice message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-phone">Phone Number *</Label>
                <Input
                  id="custom-phone"
                  placeholder="+1234567890"
                  value={customForm.phoneNumber}
                  onChange={(e) => setCustomForm({ ...customForm, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-message">Message *</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Enter your custom message here..."
                  rows={4}
                  value={customForm.message}
                  onChange={(e) => setCustomForm({ ...customForm, message: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gather-response"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={customForm.gatherResponse}
                  onChange={(e) => setCustomForm({ ...customForm, gatherResponse: e.target.checked })}
                />
                <Label htmlFor="gather-response">Ask for response (Press 1 to confirm, etc.)</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => makeCall('custom', customForm)}
                disabled={isLoading || !customForm.phoneNumber || !customForm.message}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {isLoading ? 'Calling...' : 'Send Message'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedCalls;
