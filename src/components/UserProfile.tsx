
import React from 'react';
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

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <User className="mr-2" />
            User Profile
          </SheetTitle>
          <SheetDescription>
            Manage your account settings and preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={48} className="text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Guest User</h3>
              <p className="text-gray-500 text-sm">guest@example.com</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Account Settings</h4>
              <div className="rounded-md border p-4 bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">
                  Sign in to access your full profile, order history, and saved addresses.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-food-primary hover:bg-food-primary/90">Sign In</Button>
                  <Button size="sm" variant="outline">Register</Button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Preferences</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🍔</span> Dietary Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📍</span> Saved Addresses
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🛒</span> Order History
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
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
