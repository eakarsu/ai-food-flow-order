
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-food-dark py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to order from OrderlyBite?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Delicious, freshly-prepared meals are just a few clicks away
        </p>
        <Button 
          className="bg-food-primary hover:bg-food-primary/90 text-white px-8 py-6 text-lg"
          onClick={() => navigate('/menu')}
        >
          Order Now
        </Button>
      </div>
    </div>
  );
};

export default CallToAction;
