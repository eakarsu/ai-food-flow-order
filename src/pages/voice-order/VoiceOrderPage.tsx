import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mic, MicOff, Loader2, PhoneCall, CheckCircle } from 'lucide-react';
import {
  processVoiceOrder,
  confirmVoiceOrder,
  VoiceOrderResponse,
} from '@/services/api/voiceOrder';

export default function VoiceOrderPage() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState('');
  const [response, setResponse] = useState<VoiceOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const restaurantId = 'default';

  const startRecording = () => {
    const w: any = window;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Browser speech recognition not supported. Use the text input instead.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      setRecording(false);
    };
    recog.onerror = (e: any) => {
      toast.error(`Speech recognition error: ${e.error}`);
      setRecording(false);
    };
    recog.onend = () => setRecording(false);
    recog.start();
    recognitionRef.current = recog;
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    if (!text.trim()) {
      toast.error('Please enter or record your order');
      return;
    }
    setLoading(true);
    try {
      const r = await processVoiceOrder({ text, restaurantId });
      setResponse(r);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (yes: boolean) => {
    if (!response) return;
    try {
      const r = await confirmVoiceOrder({ callId: response.callId, confirmed: yes });
      if (r.status === 'placed') {
        toast.success(`Order placed! ID: ${r.orderId}`);
      } else {
        toast.info('Order cancelled');
      }
      setResponse(null);
      setText('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-xl">
          <PhoneCall className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Voice Ordering Assistant</h1>
          <p className="text-gray-600 text-sm">
            Speak or type your order; AI parses, confirms, and places it.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Place an Order by Voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {recording ? (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="rounded-full h-20 w-20">
                <MicOff className="h-8 w-8" />
              </Button>
            ) : (
              <Button onClick={startRecording} size="lg" className="rounded-full h-20 w-20">
                <Mic className="h-8 w-8" />
              </Button>
            )}
          </div>
          <div className="text-center text-sm text-gray-500">
            {recording ? 'Listening... speak now' : 'Tap the microphone to start'}
          </div>
          <div>
            <Label>Or type your order</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I'd like a large pepperoni pizza and two diet cokes"
            />
          </div>
          <Button onClick={submit} disabled={loading || !text.trim()} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Process Order
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>AI Agent Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
              <div className="text-xs text-indigo-700 font-semibold mb-1">YOU SAID</div>
              <p className="italic">"{response.transcript.text}"</p>
              <div className="text-xs text-gray-600 mt-1">
                Confidence: {Math.round(response.transcript.confidence * 100)}%
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Parsed Items</h3>
              {response.parsedItems.length === 0 ? (
                <p className="text-gray-500 text-sm">No items detected</p>
              ) : (
                <ul className="space-y-2">
                  {response.parsedItems.map((item, i) => (
                    <li key={i} className="flex justify-between items-center border-b py-2">
                      <div>
                        <span className="font-medium">
                          {item.quantity}× {item.name}
                        </span>
                        {item.modifiers && (
                          <div className="text-xs text-gray-600">{item.modifiers.join(', ')}</div>
                        )}
                      </div>
                      <Badge variant="secondary">{Math.round(item.matchConfidence * 100)}%</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-right text-xl font-bold mt-3">
                Total: ${response.total.toFixed(2)}
              </div>
            </div>

            <div className="bg-gray-50 border rounded p-4">
              <div className="text-xs text-gray-500 font-semibold mb-1">AGENT REPLY</div>
              <p>{response.agentReply}</p>
            </div>

            {response.needsConfirmation && (
              <div className="flex gap-2">
                <Button onClick={() => confirm(true)} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirm Order
                </Button>
                <Button onClick={() => confirm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
