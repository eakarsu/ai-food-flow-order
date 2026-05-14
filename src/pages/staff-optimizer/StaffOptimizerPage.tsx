import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Loader2, DollarSign } from 'lucide-react';
import { generateStaffSchedule, StaffOptimizerResponse } from '@/services/api/staffOptimizer';

export default function StaffOptimizerPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<StaffOptimizerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [wage, setWage] = useState(18);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().slice(0, 10);
  });

  const restaurantId = 'default';

  const load = async () => {
    setLoading(true);
    try {
      const r = await generateStaffSchedule({ restaurantId, weekStarting: weekStart, hourlyWage: wage });
      setData(r);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-xl">
          <Calendar className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Staff Scheduling Optimizer</h1>
          <p className="text-gray-600 text-sm">
            AI predicts demand and suggests optimal staffing to balance service and labor cost.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Schedule Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Week Starting</Label>
            <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          </div>
          <div>
            <Label>Hourly Wage ($)</Label>
            <Input
              type="number"
              step="0.5"
              value={wage}
              onChange={(e) => setWage(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={load} disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Generate Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Total Hours</div>
                <div className="text-2xl font-bold">{data.totalLaborHours}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Labor Cost</div>
                <div className="text-2xl font-bold">${data.totalLaborCost}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Predicted Revenue</div>
                <div className="text-2xl font-bold text-green-700">${data.predictedRevenue}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-gray-500 uppercase">Labor %</div>
                <div className="text-2xl font-bold">
                  {((data.totalLaborCost / data.predictedRevenue) * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {data.insights.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {data.insights.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Suggested Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Forecast Demand</TableHead>
                    <TableHead>Staff Needed</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.suggestions.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{s.day}</TableCell>
                      <TableCell>{s.hour.toString().padStart(2, '0')}:00</TableCell>
                      <TableCell>{s.forecastDemand}</TableCell>
                      <TableCell>
                        <Badge>{s.recommendedStaff}</Badge>
                      </TableCell>
                      <TableCell>${s.laborCostEstimate}</TableCell>
                      <TableCell className="text-sm text-gray-600">{s.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
