import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({
  title = 'Celebrate the Magic of Diwali 🪔',
  description = 'Spread Happiness, Share Love & Light Up Every Moment with DiwaliWala — Personalized Diwali Wishes, Name in Lights, Photo Frames & Interactive Fireworks.',
  path = '/',
}) {
  const fullTitle = `${title} | DiwaliWala 🪔`;
  const canonicalUrl = `https://diwaliwala.vercel.app${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://diwaliwala.vercel.app/diya.svg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

