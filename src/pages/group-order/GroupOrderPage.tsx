import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Users, Loader2, Plus, Copy, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  createGroupOrder,
  joinGroupOrder,
  getGroupRecommendations,
  splitGroupBill,
  GroupOrder,
  GroupMember,
} from '@/services/api/socialDining';

export default function GroupOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupOrder | null>(null);
  const [recommendations, setRecommendations] = useState<Array<{ name: string; price: number; reason: string }>>([]);
  const [splits, setSplits] = useState<GroupMember[]>([]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'by_item'>('equal');
  const [loading, setLoading] = useState(false);

  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');

  // Add item form
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [addedBy, setAddedBy] = useState('');

  const userId = user?.id ?? `guest-${Date.now()}`;
  const userName = user?.firstName ?? 'You';

  const create = async () => {
    setLoading(true);
    try {
      const g = await createGroupOrder({ restaurantId: 'default', hostId: userId, hostName: userName });
      setGroup(g);
      setAddedBy(userId);
      toast.success(`Group created. Invite code: ${g.inviteCode}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const join = async () => {
    setLoading(true);
    try {
      const g = await joinGroupOrder({ inviteCode: joinCode, userId, userName: joinName });
      if (g) {
        setGroup(g);
        toast.success('Joined group order');
      } else {
        toast.error('Could not join group');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMember = (name: string) => {
    if (!group || !name) return;
    const newMember: GroupMember = { userId: `m-${Date.now()}`, name };
    setGroup({ ...group, members: [...group.members, newMember] });
  };

  const addItem = () => {
    if (!group || !itemName) return;
    const item = { name: itemName, price: itemPrice, addedBy };
    const total = group.total + itemPrice;
    setGroup({ ...group, items: [...group.items, item], total });
    setItemName('');
    setItemPrice(0);
  };

  const fetchRecs = async () => {
    if (!group) return;
    setLoading(true);
    try {
      const r = await getGroupRecommendations({ groupOrderId: group.id });
      setRecommendations(r.items);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSplit = async () => {
    if (!group) return;
    const result = await splitGroupBill(group, splitMethod);
    setSplits(result);
  };

  const copyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    toast.success('Invite code copied');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-rose-100 p-3 rounded-xl">
          <Users className="text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Group Order</h1>
          <p className="text-gray-600 text-sm">
            Order together, split payments, and get AI suggestions for the group.
          </p>
        </div>
      </div>

      {!group && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Start a Group Order</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={create} disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                Create New Group
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Join Existing Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <Input placeholder="Your name" value={joinName} onChange={(e) => setJoinName(e.target.value)} />
              <Button onClick={join} disabled={loading || !joinCode} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Join Group
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {group && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Group {group.id}</span>
                <Badge variant="outline">{group.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">Invite code:</span>
                <code className="bg-gray-100 px-3 py-1 rounded font-mono">{group.inviteCode}</code>
                <Button size="sm" variant="ghost" onClick={copyCode}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Members ({group.members.length})</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {group.members.map((m) => (
                    <Badge key={m.userId} variant="secondary">
                      {m.name}
                    </Badge>
                  ))}
                </div>
                <AddMemberForm onAdd={addMember} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {group.items.length === 0 ? (
                  <li className="text-gray-500 text-sm">No items yet</li>
                ) : (
                  group.items.map((it, i) => (
                    <li key={i} className="flex justify-between border-b py-2">
                      <span>{it.name}</span>
                      <span>
                        ${it.price.toFixed(2)} ·{' '}
                        <span className="text-xs text-gray-500">
                          by {group.members.find((m) => m.userId === it.addedBy)?.name ?? it.addedBy}
                        </span>
                      </span>
                    </li>
                  ))
                )}
              </ul>
              <div className="text-right font-bold mb-4">Total: ${group.total.toFixed(2)}</div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                />
                <select
                  className="border rounded px-3"
                  value={addedBy}
                  onChange={(e) => setAddedBy(e.target.value)}
                >
                  {group.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <Button onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Group Recommendations</span>
                <Button size="sm" onClick={fetchRecs} disabled={loading}>
                  <Sparkles className="mr-1 h-4 w-4" />
                  Get Suggestions
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-sm">No suggestions yet</p>
              ) : (
                <ul className="space-y-2">
                  {recommendations.map((r, i) => (
                    <li key={i} className="flex justify-between border-b py-2">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-gray-600">{r.reason}</div>
                      </div>
                      <div className="font-bold">${r.price.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Split Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={splitMethod === 'equal' ? 'default' : 'outline'}
                  onClick={() => setSplitMethod('equal')}
                >
                  Split Equally
                </Button>
                <Button
                  size="sm"
                  variant={splitMethod === 'by_item' ? 'default' : 'outline'}
                  onClick={() => setSplitMethod('by_item')}
                >
                  Split by Item
                </Button>
                <Button size="sm" onClick={calculateSplit}>
                  Calculate
                </Button>
              </div>
              {splits.length > 0 && (
                <ul>
                  {splits.map((m) => (
                    <li key={m.userId} className="flex justify-between py-2 border-b">
                      <span>{m.name}</span>
                      <span className="font-bold">${(m.amountOwed ?? 0).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function AddMemberForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="flex gap-2">
      <Input placeholder="Add member name" value={name} onChange={(e) => setName(e.target.value)} />
      <Button
        size="sm"
        onClick={() => {
          onAdd(name);
          setName('');
        }}
        disabled={!name}
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}
