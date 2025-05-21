
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, User } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    onOpenChange(false);
  };

  const sampleOrders = [
    { id: 'ORD-001', date: '2023-05-15', total: 45.80, status: 'Delivered' },
    { id: 'ORD-002', date: '2023-06-02', total: 28.50, status: 'Processing' },
    { id: 'ORD-003', date: '2023-06-10', total: 32.75, status: 'Delivered' },
  ];

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
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
                {!isEditing ? (
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Guest User</h3>
                    <p className="text-gray-500 text-sm">guest@example.com</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="w-full max-w-sm space-y-3">
                    <Input defaultValue="Guest User" placeholder="Full Name" />
                    <Input defaultValue="guest@example.com" placeholder="Email" type="email" />
                    <Input placeholder="Password" type="password" />
                    <div className="flex gap-2">
                      <Button 
                        className="bg-food-primary hover:bg-food-primary/90"
                        onClick={() => {
                          setIsEditing(false);
                          toast({
                            title: "Profile Updated",
                            description: "Your profile has been updated successfully."
                          });
                        }}
                      >
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
                <h4 className="font-medium mb-2">Preferences</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🍔</span> Dietary Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🔔</span> Notification Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🛡️</span> Privacy Settings
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-medium">Your Orders</h3>
              {sampleOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
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
                    <Button variant="outline" className="mt-4">
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
                <Button variant="outline" size="sm">+ Add New</Button>
              </div>
              
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between">
                  <h4 className="font-medium">Home</h4>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  123 Main St, Apt 4B<br/>
                  New York, NY 10001<br/>
                  United States
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-3">Add New Address</h4>
                <div className="space-y-3">
                  <Input placeholder="Address Name (e.g. Home, Work)" />
                  <Input placeholder="Street Address" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="City" />
                    <Input placeholder="State/Province" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="ZIP/Postal Code" />
                    <Input placeholder="Country" />
                  </div>
                  <Textarea placeholder="Delivery Instructions (Optional)" />
                  <Button className="bg-food-primary hover:bg-food-primary/90">
                    Save Address
                  </Button>
                </div>
              </div>
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

