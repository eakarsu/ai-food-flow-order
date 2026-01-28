import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogOut, User, Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { getOrders, Order } from '@/services/api/orders';
import {
  addAddress,
  deleteAddress,
  updateProfile,
  Address,
} from '@/services/api/auth';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const navigate = useNavigate();
  const { user, addresses, isAuthenticated, logout, refreshUser, setAddresses } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile edit state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // New address state
  const [newAddress, setNewAddress] = useState({
    label: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (open && activeTab === 'orders' && isAuthenticated) {
      fetchOrders();
    }
  }, [open, activeTab, isAuthenticated]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await getOrders({ limit: 10 });
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    onOpenChange(false);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(editForm);
      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.streetAddress || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await addAddress({
        label: newAddress.label || 'Home',
        streetAddress: newAddress.streetAddress,
        apartment: newAddress.apartment,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.zipCode,
        isDefault: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, response.address]);
      setNewAddress({ label: '', streetAddress: '', apartment: '', city: '', state: '', zipCode: '' });
      setShowAddressForm(false);
      toast.success('Address added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <User className="mr-2" />
              User Profile
            </SheetTitle>
            <SheetDescription>
              Sign in to manage your account.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <User size={64} className="text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Please sign in to view your profile</p>
            <SheetClose asChild>
              <Button className="bg-food-primary hover:bg-food-primary/90">
                Sign In
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <User className="mr-2" />
            User Profile
          </SheetTitle>
          <SheetDescription>
            Manage your account settings and preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="pt-4">
          <div className="flex border-b mb-4">
            <Button
              variant="ghost"
              className={`pb-2 rounded-none ${activeTab === 'profile' ? 'border-b-2 border-food-primary text-food-primary' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              className={`pb-2 rounded-none ${activeTab === 'orders' ? 'border-b-2 border-food-primary text-food-primary' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </Button>
            <Button
              variant="ghost"
              className={`pb-2 rounded-none ${activeTab === 'addresses' ? 'border-b-2 border-food-primary text-food-primary' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              Addresses
            </Button>
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                </div>
                {!isEditing ? (
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {user?.firstName || user?.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : 'User'}
                    </h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    {user?.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="w-full max-w-sm space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                          placeholder="First Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-food-primary hover:bg-food-primary/90"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Quick Links</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/orders');
                    }}
                  >
                    <span className="mr-2">📦</span> View All Orders
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🔔</span> Notification Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Recent Orders</h3>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/orders');
                  }}
                >
                  View All
                </Button>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/orders/${order.id}`);
                        }}
                      >
                        <TableCell className="font-medium text-xs">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-xs">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/menu')}
                    >
                      Start Shopping
                    </Button>
                  </SheetClose>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Saved Addresses</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </div>

              {addresses.length === 0 && !showAddressForm && (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">No saved addresses yet.</p>
                </div>
              )}

              {addresses.map((address) => (
                <div key={address.id} className="border rounded-md p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {address.label}
                        {address.isDefault && (
                          <span className="text-xs bg-food-primary/10 text-food-primary px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {address.streetAddress}
                        {address.apartment && `, ${address.apartment}`}
                        <br />
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {showAddressForm && (
                <div className="border rounded-md p-4 space-y-3">
                  <h4 className="font-medium">Add New Address</h4>
                  <Input
                    placeholder="Label (e.g. Home, Work)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress((a) => ({ ...a, label: e.target.value }))}
                  />
                  <Input
                    placeholder="Street Address *"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress((a) => ({ ...a, streetAddress: e.target.value }))}
                  />
                  <Input
                    placeholder="Apartment, Suite, etc."
                    value={newAddress.apartment}
                    onChange={(e) => setNewAddress((a) => ({ ...a, apartment: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                    />
                    <Input
                      placeholder="State *"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="ZIP Code *"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress((a) => ({ ...a, zipCode: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="bg-food-primary hover:bg-food-primary/90"
                      onClick={handleAddAddress}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      Save Address
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-6">
          <Button variant="ghost" className="text-red-500 gap-2" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserProfile;
