import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  Sparkles,
  Edit,
  Trash2,
  Mail,
  Phone,
  Database,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react';
import {
  getStaffMembers,
  createStaffMember,
  deleteStaffMember,
  bulkDeleteStaffMembers,
  bulkUpdateStaffMembers,
  analyzeStaff,
  StaffMember,
  StaffAnalysis,
} from '@/services/api/staff';
import { seedStaff } from '@/services/api/seed';
import { AIOutputDisplay } from '@/components/ai/AIOutputDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { BulkActionsToolbar } from '@/components/shared/BulkActionsToolbar';
import { useSortableData } from '@/hooks/useSortableData';
import { useSelection } from '@/hooks/useSelection';
import { useRBAC } from '@/hooks/useRBAC';
import { exportToCSV, exportToPDF, ExportColumn } from '@/utils/exportUtils';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'First Name', accessor: 'firstName' },
  { header: 'Last Name', accessor: 'lastName' },
  { header: 'Role', accessor: 'role' },
  { header: 'Email', accessor: (r) => r.email || '' },
  { header: 'Phone', accessor: (r) => r.phone || '' },
  { header: 'Employment', accessor: 'employmentType' },
  { header: 'Hourly Rate', accessor: (r) => `$${r.hourlyRate.toFixed(2)}` },
];

export default function StaffList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { canCreate, canDelete, canEdit, canSeed } = useRBAC();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StaffAnalysis | null>(null);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    hourlyRate: 15,
    employmentType: 'full_time' as const,
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false });

  // Bulk update dialog state
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ role: '', employmentType: '', hourlyRate: '' });

  const filteredMembers = members.filter(
    (member) =>
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { sortedItems, sortConfig, requestSort } = useSortableData(filteredMembers, { key: 'lastName', direction: 'asc' });
  const { selectedIds, isSelected, isAllSelected, toggleOne, toggleAll, clearSelection, selectedCount } = useSelection(sortedItems);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getStaffMembers();
      setMembers(response.members);
    } catch (error) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.role) {
      toast.error('First name, last name, and role are required');
      return;
    }

    try {
      const restaurantId = members[0]?.restaurantId || 'default';
      await createStaffMember({
        ...newMember,
        restaurantId,
      });
      toast.success('Staff member added');
      setShowNewDialog(false);
      setNewMember({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        hourlyRate: 15,
        employmentType: 'full_time',
      });
      fetchMembers();
    } catch (error) {
      toast.error('Failed to create staff member');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.bulk) {
      try {
        const ids = Array.from(selectedIds);
        await bulkDeleteStaffMembers(ids);
        toast.success(`${ids.length} staff members deleted`);
        clearSelection();
        fetchMembers();
      } catch (error) {
        toast.error('Failed to bulk delete staff members');
      }
    } else if (deleteConfirm.id) {
      try {
        await deleteStaffMember(deleteConfirm.id);
        toast.success('Staff member removed');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to remove staff member');
      }
    }
    setDeleteConfirm({ open: false });
  };

  const handleBulkUpdate = async () => {
    const updates: Record<string, any> = {};
    if (bulkUpdateFields.role) updates.role = bulkUpdateFields.role;
    if (bulkUpdateFields.employmentType) updates.employmentType = bulkUpdateFields.employmentType;
    if (bulkUpdateFields.hourlyRate) updates.hourlyRate = Number(bulkUpdateFields.hourlyRate);

    if (Object.keys(updates).length === 0) {
      toast.error('Please fill at least one field');
      return;
    }

    try {
      const ids = Array.from(selectedIds);
      await bulkUpdateStaffMembers(ids, updates);
      toast.success(`${ids.length} staff members updated`);
      clearSelection();
      setShowBulkUpdateDialog(false);
      setBulkUpdateFields({ role: '', employmentType: '', hourlyRate: '' });
      fetchMembers();
    } catch (error) {
      toast.error('Failed to bulk update staff members');
    }
  };

  const handleAnalyze = async () => {
    if (members.length === 0) {
      toast.error('No staff members to analyze');
      return;
    }
    try {
      setAnalyzing(true);
      const response = await analyzeStaff();
      setAnalysis(response.analysis);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze staff');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToCSV(data, EXPORT_COLUMNS, 'staff');
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToPDF(data, EXPORT_COLUMNS, 'Staff Report', 'staff');
    toast.success('PDF exported');
  };

  const employmentBadge = (type: string) => {
    switch (type) {
      case 'full_time':
        return <Badge className="bg-green-100 text-green-800">Full Time</Badge>;
      case 'part_time':
        return <Badge className="bg-blue-100 text-blue-800">Part Time</Badge>;
      case 'contractor':
        return <Badge className="bg-purple-100 text-purple-800">Contractor</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Staff Members</h1>
              <p className="text-sm text-gray-500">Manage your team</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            {canCreate && (
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Staff Analysis */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Staff Analysis
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Team composition, skill gaps, cost analysis, and workforce insights
              </p>
            </div>
            <div className="flex gap-2">
              {members.length === 0 && canSeed && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const result = await seedStaff();
                      toast.success(result.message);
                      fetchMembers();
                    } catch { toast.error('Failed to load sample data'); }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
              )}
              <Button onClick={handleAnalyze} disabled={analyzing || members.length === 0}>
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {analysis && (
            <CardContent className="space-y-6">
              <AIOutputDisplay
                title="Executive Summary"
                content={analysis.summary}
                type="analysis"
              />

              {/* Team Composition & Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Team Composition
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysis.teamComposition}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Cost Analysis
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysis.costAnalysis}</p>
                </div>
              </div>

              {/* Skill Gaps */}
              {analysis.skillGaps && analysis.skillGaps.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Skill Gaps
                  </h4>
                  <div className="space-y-2">
                    {analysis.skillGaps.map((gap, i) => (
                      <div key={i} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <span className="font-medium text-sm">{gap.gap}</span>
                        <p className="text-sm text-gray-600">Impact: {gap.impact}</p>
                        <p className="text-sm text-green-700">Fix: {gap.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {analysis.actionItems && analysis.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Action Items</h4>
                  <div className="space-y-2">
                    {analysis.actionItems.map((item, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          item.priority === 'high'
                            ? 'bg-red-50 border-red-200'
                            : item.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-xs ${
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : item.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.priority.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-sm">{item.action}</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="mt-1 text-green-500">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Risks
                  </h4>
                  <ul className="space-y-1">
                    {analysis.risks.map((r, i) => (
                      <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="mt-1 text-red-500">-</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedCount}
          totalCount={sortedItems.length}
          onBulkDelete={canDelete ? () => setDeleteConfirm({ open: true, bulk: true }) : undefined}
          onBulkUpdate={canEdit ? () => { setBulkUpdateFields({ role: '', employmentType: '', hourlyRate: '' }); setShowBulkUpdateDialog(true); } : undefined}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onClearSelection={clearSelection}
          canDelete={canDelete}
          canUpdate={canEdit}
        />

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
                <SortableTableHead label="Name" sortKey="lastName" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Role" sortKey="role" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>Contact</TableHead>
                <SortableTableHead label="Employment" sortKey="employmentType" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Rate" sortKey="hourlyRate" currentSort={sortConfig} onSort={requestSort} />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/admin/staff/${member.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected(member.id)}
                      onChange={() => toggleOne(member.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                      {member.firstName} {member.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {member.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{employmentBadge(member.employmentType)}</TableCell>
                  <TableCell>${member.hourlyRate.toFixed(2)}/hr</TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/staff/${member.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sortedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500 mb-3">No staff members found</p>
                    {canSeed && (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const result = await seedStaff();
                            toast.success(result.message);
                            fetchMembers();
                          } catch { toast.error('Failed to load sample data'); }
                        }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Load Sample Staff Data
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title={deleteConfirm.bulk ? 'Delete Selected Staff' : 'Remove Staff Member'}
        description={
          deleteConfirm.bulk
            ? `Are you sure you want to remove ${selectedCount} selected staff members? This action cannot be undone.`
            : 'Are you sure you want to remove this staff member? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update {selectedCount} Staff Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Only filled fields will be updated.</p>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={bulkUpdateFields.role}
                onChange={(e) => setBulkUpdateFields({ ...bulkUpdateFields, role: e.target.value })}
                placeholder="e.g., Line Cook, Server"
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={bulkUpdateFields.employmentType}
                onValueChange={(value) => setBulkUpdateFields({ ...bulkUpdateFields, employmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hourly Rate ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={bulkUpdateFields.hourlyRate}
                onChange={(e) => setBulkUpdateFields({ ...bulkUpdateFields, hourlyRate: e.target.value })}
                placeholder="e.g., 18.50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>Update Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Member Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={newMember.firstName}
                  onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={newMember.lastName}
                  onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="e.g., Line Cook, Server"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select
                  value={newMember.employmentType}
                  onValueChange={(value: any) =>
                    setNewMember({ ...newMember, employmentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newMember.hourlyRate}
                  onChange={(e) =>
                    setNewMember({ ...newMember, hourlyRate: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
