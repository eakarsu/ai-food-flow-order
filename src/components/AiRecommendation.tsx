
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const AiRecommendation = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<null | string>(null);
  const { toast } = useToast();

  // Simulated AI recommendation function
  const generateRecommendation = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter what you're in the mood for",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const recommendations = [
        "Based on your mood for something spicy, I recommend the Thai Red Curry from Bangkok Bistro. It has the perfect balance of heat and flavor!",
        "If you're looking for something healthy and fresh, try the Mediterranean Bowl from Green Plate. It's packed with nutrients and flavor!",
        "Craving comfort food? The Classic Cheeseburger from Burger Joint will hit the spot. Their house-made sauce is amazing!",
        "For a light option, I'd suggest the Grilled Salmon Salad from Ocean Grill. It's refreshing and satisfying.",
        "You might enjoy the Stone-Fired Pizza from Napoli's. Their authentic Italian recipes are crowd favorites!"
      ];
      
      const randomRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
      
      setRecommendation(randomRecommendation);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="bg-gradient-to-r from-food-primary/10 to-food-secondary/10 border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center text-food-dark">
          <span className="mr-2">🤖</span> AI Food Assistant
        </CardTitle>
        <CardDescription>Tell me what you're in the mood for, and I'll suggest the perfect dish</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., I'm craving something spicy..."
            className="border-food-secondary/30 focus-visible:ring-food-secondary"
            onKeyDown={(e) => e.key === 'Enter' && generateRecommendation()}
          />
          <Button 
            onClick={generateRecommendation}
            disabled={isLoading}
            className="bg-food-secondary hover:bg-food-secondary/90 text-white"
          >
            {isLoading ? "Thinking..." : <Search size={18} />}
          </Button>
        </div>
      </CardContent>
      {recommendation && (
        <CardFooter className="bg-white rounded-b-lg p-4 border-t animate-fade-in">
          <div className="text-food-dark">
            <p className="font-medium text-sm mb-1">My recommendation:</p>
            <p className="text-sm">{recommendation}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default AiRecommendation;
