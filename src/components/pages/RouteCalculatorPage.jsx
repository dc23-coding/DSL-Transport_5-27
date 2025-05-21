// src/components/pages/RouteCalculatorPage.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const RouteCalculatorPage = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateRoute = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    setResult(null);

    try {
      // 1) Geocode origin & destination
      const [origGeo, destGeo] = await Promise.all([
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${MAPBOX_TOKEN}`)
          .then(res => res.json()),
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}`)
          .then(res => res.json()),
      ]);

      if (!origGeo.features?.length || !destGeo.features?.length) {
        throw new Error('Could not find one or both addresses');
      }

      const [origLng, origLat] = origGeo.features[0].center;
      const [destLng, destLat] = destGeo.features[0].center;

      // 2) Fetch directions
      const directionsRes = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${origLng},${origLat};${destLng},${destLat}` +
        `?access_token=${MAPBOX_TOKEN}&overview=false`
      );
      const directionsJson = await directionsRes.json();
      if (!directionsJson.routes?.length) {
        throw new Error('No route found between those points');
      }
      const route = directionsJson.routes[0];

      // 3) Convert & round
      const distance = (route.distance / 1609.34).toFixed(1); // meters → miles
      const time     = (route.duration / 3600).toFixed(1);    // seconds → hours

      setResult({ distance, time });
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="glass-effect p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Route Mileage Calculator</h1>

        <input
          type="text"
          placeholder="Enter Origin"
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background"
        />

        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background"
        />

        <Button onClick={calculateRoute} className="w-full" disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate'}
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
