import React from 'react';

export default function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="buildora-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6545F5" />
          <stop offset="55%" stopColor="#4385F5" />
          <stop offset="100%" stopColor="#19B7D5" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#buildora-g)" />
      <path
        d="M20 46V18h13a9 9 0 0 1 5.6 16.1L46 46h-8.2l-6-10.5H27V46h-7zm7-17h5.6a3.5 3.5 0 0 0 0-7H27v7z"
        fill="#fff"
      />
    </svg>
  );
}
