import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GlobalNavControls = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    }
  };

  const handleForward = () => {
    navigate(1);
  };

  const openRouteCalculator = () => {
    navigate('/route-calculator');
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
      <Button 
        onClick={handleBack} 
        variant="outline" 
        size="sm" 
        className="rounded-full"
        aria-label="Go Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Button 
        onClick={openRouteCalculator} 
        variant="default" 
        size="sm" 
        className="rounded-full"
        aria-label="Route Calculator"
      >
        <MapPin className="h-4 w-4" />
      </Button>

      <Button 
        onClick={handleForward} 
        variant="outline" 
        size="sm" 
        className="rounded-full"
        aria-label="Go Forward"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default GlobalNavControls;
