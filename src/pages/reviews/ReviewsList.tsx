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
  MessageSquare,
  Search,
  ArrowLeft,
  Loader2,
  Sparkles,
  Star,
  CheckCircle,
  Database,
  Download,
  FileText,
  Trash2,
} from 'lucide-react';
import {
  getReviews,
  getReviewStats,
  analyzeAllReviews,
  bulkDeleteReviews,
  bulkUpdateReviews,
  Review,
  ReviewStats,
  ReviewAnalysis,
} from '@/services/api/reviews';
import { AIOutputDisplay, RatingStars, SentimentBadge } from '@/components/ai/AIOutputDisplay';
import { seedReviews } from '@/services/api/seed';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { BulkActionsToolbar } from '@/components/shared/BulkActionsToolbar';
import { useSortableData } from '@/hooks/useSortableData';
import { useSelection } from '@/hooks/useSelection';
import { useRBAC } from '@/hooks/useRBAC';
import { exportToCSV, exportToPDF, ExportColumn } from '@/utils/exportUtils';

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Customer', accessor: 'customerName' },
  { header: 'Rating', accessor: (r) => String(r.rating) },
  { header: 'Title', accessor: (r) => r.title || '' },
  { header: 'Content', accessor: (r) => (r.content || '').substring(0, 100) },
  { header: 'Sentiment', accessor: (r) => r.sentiment || '' },
  { header: 'AI Response', accessor: (r) => (r.aiResponse ? 'Yes' : 'No') },
  { header: 'Date', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function ReviewsList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { canDelete, canEdit, canSeed } = useRBAC();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; bulk?: boolean }>({ open: false });

  // Bulk update dialog state
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateFields, setBulkUpdateFields] = useState({ sentiment: '', isPublished: '' });

  const filteredReviews = reviews.filter(
    (review) =>
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { sortedItems, sortConfig, requestSort } = useSortableData(filteredReviews, { key: 'createdAt', direction: 'desc' });
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
      const [reviewsRes, statsRes] = await Promise.all([
        getReviews(),
        getReviewStats('default').catch(() => null),
      ]);
      setReviews(reviewsRes.reviews);
      if (statsRes) setStats(statsRes.stats);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (reviews.length === 0) {
      toast.error('No reviews to analyze');
      return;
    }

    try {
      setAnalyzing(true);
      const response = await analyzeAllReviews();
      setAnalysis(response.analysis);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze reviews');
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      await bulkDeleteReviews(ids);
      toast.success(`${ids.length} reviews deleted`);
      clearSelection();
      fetchData();
    } catch (error) {
      toast.error('Failed to bulk delete reviews');
    }
    setDeleteConfirm({ open: false });
  };

  const handleBulkUpdate = async () => {
    const updates: Record<string, any> = {};
    if (bulkUpdateFields.sentiment) updates.sentiment = bulkUpdateFields.sentiment;
    if (bulkUpdateFields.isPublished) updates.isPublished = bulkUpdateFields.isPublished === 'true';

    if (Object.keys(updates).length === 0) {
      toast.error('Please fill at least one field');
      return;
    }

    try {
      const ids = Array.from(selectedIds);
      await bulkUpdateReviews(ids, updates);
      toast.success(`${ids.length} reviews updated`);
      clearSelection();
      setShowBulkUpdateDialog(false);
      setBulkUpdateFields({ sentiment: '', isPublished: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to bulk update reviews');
    }
  };

  const handleExportCSV = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToCSV(data, EXPORT_COLUMNS, 'reviews');
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const data = selectedCount > 0 ? sortedItems.filter((i) => selectedIds.has(i.id)) : sortedItems;
    exportToPDF(data, EXPORT_COLUMNS, 'Reviews Report', 'reviews');
    toast.success('PDF exported');
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
              <h1 className="text-xl font-bold text-gray-900">Customer Reviews</h1>
              <p className="text-sm text-gray-500">
                Manage and respond to customer feedback
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Analysis Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Review Analysis
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Deep AI analysis of customer sentiment, themes, and actionable insights
              </p>
            </div>
            <div className="flex gap-2">
              {reviews.length === 0 && canSeed && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const result = await seedReviews();
                      toast.success(result.message);
                      fetchData();
                    } catch { toast.error('Failed to load sample data'); }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
              )}
              <Button onClick={handleAnalyze} disabled={analyzing || reviews.length === 0}>
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
                type="response"
              />

              {/* Sentiment Insights */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  Sentiment Insights
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.sentimentInsights}</p>
              </div>

              {/* Top Themes */}
              {analysis.topThemes && analysis.topThemes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Themes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.topThemes.map((theme, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          theme.sentiment.includes('positive')
                            ? 'bg-green-50 border-green-200'
                            : theme.sentiment.includes('negative')
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{theme.theme}</span>
                          <Badge variant="outline" className="text-xs">
                            {theme.count} mentions
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{theme.details}</p>
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

              {/* Strengths & Weaknesses */}
              {analysis.strengthsAndWeaknesses && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengthsAndWeaknesses.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                          <span className="mt-1 text-green-500">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-red-600" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengthsAndWeaknesses.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="mt-1 text-red-500">-</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Trend Analysis */}
              {analysis.trendAnalysis && (
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-indigo-600" />
                    Trend Analysis
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysis.trendAnalysis}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                    <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">AI Responses</p>
                    <p className="text-2xl font-bold">{stats.responsesGenerated}</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="text-2xl font-bold">{stats.responsesPublished}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reviews..."
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
          onBulkUpdate={canEdit ? () => { setBulkUpdateFields({ sentiment: '', isPublished: '' }); setShowBulkUpdateDialog(true); } : undefined}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onClearSelection={clearSelection}
          canDelete={canDelete}
          canUpdate={canEdit}
        />

        {/* Reviews Table */}
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
                <SortableTableHead label="Customer" sortKey="customerName" currentSort={sortConfig} onSort={requestSort} />
                <SortableTableHead label="Rating" sortKey="rating" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>Review</TableHead>
                <SortableTableHead label="Sentiment" sortKey="sentiment" currentSort={sortConfig} onSort={requestSort} />
                <TableHead>AI Response</TableHead>
                <SortableTableHead label="Date" sortKey="createdAt" currentSort={sortConfig} onSort={requestSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((review) => (
                <TableRow
                  key={review.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/admin/reviews/${review.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected(review.id)}
                      onChange={() => toggleOne(review.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{review.customerName}</TableCell>
                  <TableCell>
                    <RatingStars rating={review.rating} size="sm" />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">{review.title || review.content}</p>
                  </TableCell>
                  <TableCell>
                    {review.sentiment && (
                      <SentimentBadge sentiment={review.sentiment} size="sm" />
                    )}
                  </TableCell>
                  <TableCell>
                    {review.aiResponse ? (
                      <Badge
                        className={
                          review.isResponded
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }
                      >
                        {review.isResponded ? 'Published' : 'Generated'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {sortedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500 mb-3">No reviews found</p>
                    {canSeed && (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            const result = await seedReviews();
                            toast.success(result.message);
                            fetchData();
                          } catch { toast.error('Failed to load sample data'); }
                        }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Load Sample Reviews Data
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
        title="Delete Selected Reviews"
        description={`Are you sure you want to delete ${selectedCount} selected reviews? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update {selectedCount} Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Only filled fields will be updated.</p>
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Select
                value={bulkUpdateFields.sentiment}
                onValueChange={(value) => setBulkUpdateFields({ ...bulkUpdateFields, sentiment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Published Status</Label>
              <Select
                value={bulkUpdateFields.isPublished}
                onValueChange={(value) => setBulkUpdateFields({ ...bulkUpdateFields, isPublished: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Unpublished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>Update Reviews</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
