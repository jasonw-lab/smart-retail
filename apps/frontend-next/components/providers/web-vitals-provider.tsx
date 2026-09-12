'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsProvider() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[WebVitals]', metric);
    }
  });

  return null;
}
