// src/components/ui/card.jsx
import React from 'react';

export function Card({ children, ...props }) {
  return <div className="p-4 bg-white rounded shadow" {...props}>{children}</div>;
}

export function CardContent({ children, ...props }) {
  return <div className="p-2" {...props}>{children}</div>;
}
