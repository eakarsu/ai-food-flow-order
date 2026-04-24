import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Send,
  Edit,
  Calendar,
  User,
} from 'lucide-react';
import {
  getReview,
  generateAIResponse,
  publishResponse,
  updateReview,
  Review,
} from '@/services/api/reviews';
import { AIOutputDisplay, RatingStars, SentimentBadge } from '@/components/ai/AIOutputDisplay';

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiMeta, setAiMeta] = useState<{ tone: string; keyPoints: string[] } | null>(null);
  const [editingResponse, setEditingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated && id) {
      fetchReview();
    }
  }, [isAuthenticated, authLoading, id, navigate]);

  const fetchReview = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getReview(id);
      setReview(response.review);
      if (response.review.aiResponse) {
        setEditedResponse(response.review.aiResponse);
      }
    } catch (error) {
      toast.error('Failed to load review');
      navigate('/admin/reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!id) return;
    try {
      setGenerating(true);
      const response = await generateAIResponse(id);
      setReview(response.review);
      setAiMeta(response.aiMeta);
      setEditedResponse(response.review.aiResponse || '');
      toast.success('AI response generated');
    } catch (error) {
      toast.error('Failed to generate response');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!id || !review?.aiResponse) return;

    // If response was edited, save it first
    if (editedResponse !== review.aiResponse) {
      try {
        await updateReview(id, { aiResponse: editedResponse });
      } catch (error) {
        toast.error('Failed to save edited response');
        return;
      }
    }

    try {
      setPublishing(true);
      await publishResponse(id);
      toast.success('Response published');
      fetchReview();
    } catch (error) {
      toast.error('Failed to publish response');
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Review not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/reviews')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {review.title || 'Customer Review'}
                </h1>
                {review.sentiment && <SentimentBadge sentiment={review.sentiment} />}
              </div>
              <p className="text-sm text-gray-500">
                by {review.customerName} on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!review.aiResponse && (
              <Button onClick={handleGenerateResponse} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Response
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Review</CardTitle>
                  <RatingStars rating={review.rating} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </CardContent>
            </Card>

            {/* AI Response Section */}
            {review.aiResponse && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Generated Response
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {!review.isResponded && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingResponse(!editingResponse)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {editingResponse ? 'Preview' : 'Edit'}
                          </Button>
                          <Button size="sm" onClick={handlePublish} disabled={publishing}>
                            {publishing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      {review.isResponded && (
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingResponse ? (
                    <Textarea
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                  ) : (
                    <AIOutputDisplay
                      title=""
                      content={review.aiResponse}
                      tone={aiMeta?.tone}
                      keyPoints={aiMeta?.keyPoints}
                      type="response"
                    />
                  )}

                  {review.aiResponseGeneratedAt && (
                    <p className="text-sm text-gray-500 mt-4">
                      Generated on {new Date(review.aiResponseGeneratedAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!review.aiResponse && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Response Generated Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Click "Generate AI Response" to create a personalized reply to this review.
                  </p>
                  <Button onClick={handleGenerateResponse} disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Response
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{review.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rating</p>
                  <RatingStars rating={review.rating} size="lg" />
                </div>
                {review.sentiment && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sentiment</p>
                    <SentimentBadge sentiment={review.sentiment} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Published</span>
                  <Badge
                    className={
                      review.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {review.isPublished ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Response Status</span>
                  <Badge
                    className={
                      review.isResponded
                        ? 'bg-green-100 text-green-800'
                        : review.aiResponse
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {review.isResponded ? 'Responded' : review.aiResponse ? 'Draft' : 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
