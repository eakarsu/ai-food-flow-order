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
  Calendar,
  Plus,
  ArrowLeft,
  Loader2,
  Sparkles,
  Edit,
  Trash2,
  Clock,
  Database,
  Download,
  FileText,
} from 'lucide-react';
import {
  getSchedules,
  getStaffMembers,
  createSchedule,
  deleteSchedule,
  bulkDeleteSchedules,
  bulkUpdateSchedules,
  optimizeSchedule,
  StaffSchedule,
  StaffMember,
  ScheduleOptimization,
} from '@/services/api/staff';
import { AIOutputDisplay, ConfidenceMeter } from '@/components/ai/AIOutputDisplay';
import { seedStaff } from '@/services/api/seed';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { BulkActionsToolbar } from '@/components/shared/BulkActionsToolbar';
import { useSortableData } from '@/hooks/useSortableData';
import { useSelection } from '@/hooks/useSelection';
import { useRBAC } from '@/hooks/useRBAC';
import { exportToCSV, exportToPDF, ExportColumn } from '@/utils/exportUtils';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Staff Member', accessor: (r) => r.staffName || '' },
  { header: 'Date', accessor: (r) => new Date(r.shiftDate).toLocaleDateString() },
  { header: 'Start', accessor: 'startTime' },
  { header: 'End', accessor: 'endTime' },
  { header: 'Status', accessor: 'status' },
  { header: 'AI Suggested', accessor: (r) => r.aiSuggested ? 'Yes' : 'No' },
];

export default function ScheduleList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { canCreate, canDelete, canEdit, canSeed } = useRBAC();
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<ScheduleOptimization | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    staffMemberId: '',
    shiftDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 30,
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; bulk?: boolean }>({ open: false });

  // Bulk update dialog state
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ status: '' });

  const { sortedItems, sortConfig, requestSort } = useSortableData(schedules, { key: 'shiftDate', direction: 'asc' });
  const { selectedIds, isSelected, isAllSelected, toggleOne, toggleAll, clearSelection, selectedCount } = useSelection(sortedItems);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, membersRes] = await Promise.all([
        getSchedules(),
        getStaffMembers(),
      ]);
      setSchedules(schedulesRes.schedules);
      setMembers(membersRes.members);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.staffMemberId || !newSchedule.shiftDate) {
      toast.error('Staff member and date are required');
      return;
    }

    try {
      const restaurantId = schedules[0]?.restaurantId || members[0]?.restaurantId || 'default';
      await createSchedule({
        ...newSchedule,
        restaurantId,
      });
      toast.success('Schedule created');
      setShowNewDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create schedule');
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
        await bulkDeleteSchedules(ids);
        toast.success(`${ids.length} schedules deleted`);
        clearSelection();
        fetchData();
      } catch (error) {
        toast.error('Failed to bulk delete schedules');
      }
    } else if (deleteConfirm.id) {
      try {
        await deleteSchedule(deleteConfirm.id);
        toast.success('Schedule deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
    setDeleteConfirm({ open: false });
  };

  const handleBulkUpdate = async () => {
    const updates: Record<string, any> = {};
    if (bulkUpdateFields.status) updates.status = bulkUpdateFields.status;

    if (Object.keys(updates).length === 0) {
      toast.error('Please select a status');
      return;
    }

    try {
      const ids = Array.from(selectedIds);
      await bulkUpdateSchedules(ids, updates);
      toast.success(`${ids.length} schedules updated`);
      clearSelection();
      setShowBulkUpdateDialog(false);
      setBulkUpdateFields({ status: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to bulk update schedules');
    }
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      const restaurantId = schedules[0]?.restaurantId || members[0]?.restaurantId || 'default';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await optimizeSchedule({
        restaurantId,
        targetDate: tomorrow.toISOString().split('T')[0],
        expectedDemand: 'medium',
      });
      setOptimization(response.optimization);
      toast.success('Optimization complete');
    } catch (error) {
      toast.error('Failed to optimize');
    } finally {
      setOptimizing(false);
    }
  };

  const handleExportCSV = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToCSV(data, EXPORT_COLUMNS, 'schedules');
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToPDF(data, EXPORT_COLUMNS, 'Schedules Report', 'schedules');
    toast.success('PDF exported');
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <h1 className="text-xl font-bold text-gray-900">Staff Schedules</h1>
              <p className="text-sm text-gray-500">Manage shifts and optimize scheduling</p>
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
                New Shift
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Optimization */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Schedule Optimizer
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {members.length === 0 && canSeed && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const result = await seedStaff();
                      toast.success(result.message);
                      fetchData();
                    } catch { toast.error('Failed to load sample data'); }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
              )}
              <Button onClick={handleOptimize} disabled={optimizing || members.length === 0}>
                {optimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize Tomorrow
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {optimization && (
            <CardContent>
              <AIOutputDisplay
                title="Schedule Optimization"
                content={optimization.summary}
                type="recommendation"
              />

              {optimization.suggestions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium text-gray-900">Suggested Shifts</h4>
                  {optimization.suggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{suggestion.staffName}</p>
                        <p className="text-sm text-gray-600">
                          {suggestion.startTime} - {suggestion.endTime} ({suggestion.role})
                        </p>
                        <p className="text-sm text-gray-500">{suggestion.reason}</p>
                      </div>
                      <ConfidenceMeter value={suggestion.confidence} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Bulk Actions Toolbar */}
        <BulkActionsToolbar
          selectedCount={selectedCount}
          totalCount={sortedItems.length}
          onBulkDelete={canDelete ? () => setDeleteConfirm({ open: true, bulk: true }) : undefined}
          onBulkUpdate={canEdit ? () => { setBulkUpdateFields({ status: '' }); setShowBulkUpdateDialog(true); } : undefined}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onClearSelection={clearSelection}
          canDelete={canDelete}
          canUpdate={canEdit}
        />

        {/* Schedules Table */}
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
                <SortableTableHead label="Staff Member" sortKey="staffName" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Date" sortKey="shiftDate" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Time" sortKey="startTime" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Status" sortKey="status" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>AI Suggested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((schedule) => (
                <TableRow
                  key={schedule.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/admin/schedules/${schedule.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected(schedule.id)}
                      onChange={() => toggleOne(schedule.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {schedule.staffName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.shiftDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {schedule.startTime} - {schedule.endTime}
                  </TableCell>
                  <TableCell>{statusBadge(schedule.status)}</TableCell>
                  <TableCell>
                    {schedule.aiSuggested && (
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/schedules/${schedule.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, schedule.id)}
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
                    <p className="text-gray-500 mb-3">No schedules found</p>
                    {members.length === 0 ? (
                      canSeed && (
                        <Button
                          variant="outline"
                          onClick={async () => {
                            try {
                              const result = await seedStaff();
                              toast.success(result.message);
                              fetchData();
                            } catch { toast.error('Failed to load sample data'); }
                          }}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          Load Sample Staff & Schedule Data
                        </Button>
                      )
                    ) : (
                      <p className="text-sm text-gray-400">Use "Optimize Tomorrow" above to generate AI-suggested shifts</p>
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
        title={deleteConfirm.bulk ? 'Delete Selected Schedules' : 'Delete Schedule'}
        description={
          deleteConfirm.bulk
            ? `Are you sure you want to delete ${selectedCount} selected schedules? This action cannot be undone.`
            : 'Are you sure you want to delete this schedule? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update {selectedCount} Schedules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Select the new status for the selected schedules.</p>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={bulkUpdateFields.status}
                onValueChange={(value) => setBulkUpdateFields({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>Update Schedules</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shift</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Staff Member *</Label>
              <Select
                value={newSchedule.staffMemberId}
                onValueChange={(value) =>
                  setNewSchedule({ ...newSchedule, staffMemberId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newSchedule.shiftDate}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, shiftDate: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Break (minutes)</Label>
              <Input
                type="number"
                value={newSchedule.breakMinutes}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, breakMinutes: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>Create Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
