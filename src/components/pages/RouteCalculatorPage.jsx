import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const RouteCalculatorPage = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState(null);

  const calculateRoute = () => {
    if (!origin || !destination) return;

    // Mocked distance and ETA
    const distance = Math.floor(Math.random() * 1000) + 50;
    const time = (distance / 50).toFixed(1); // 50 mph standard

    setResult({ distance, time });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="glass-effect p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Route Mileage Calculator</h1>
        <input
          type="text"
          placeholder="Enter Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background"
        />
        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background"
        />
        <Button onClick={calculateRoute} className="w-full">
          Calculate
        </Button>
        {result && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Distance: <strong>{result.distance} miles</strong></p>
            <p>Estimated Time: <strong>{result.time} hours</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteCalculatorPage;
