'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface WelcomeMessageProps {
  userName: string;
  avatarUrl?: string;
}

export function WelcomeMessage({ userName, avatarUrl }: WelcomeMessageProps) {
  const t = useTranslations('dashboard');
  const [isVisible, setIsVisible] = useState(true);
  const [weather] = useState({
    condition: 'cloudy',
    temperature: 15,
  });

  if (!isVisible) return null;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('welcomeMorning');
    if (hour < 18) return t('welcomeAfternoon');
    return t('welcomeEvening');
  };

  const greeting = getGreeting();
  const weatherCondition = t('weatherDescriptionCondition');

  return (
    <Card className="bg-gradient-to-r from-teal-50 via-white to-white border-teal-100 shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar - Stitch style with image */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center overflow-hidden border-2 border-teal-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={userName}
                  width={56}
                  height={56}
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-teal-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('welcomeMessage', { greeting, name: userName })}
            </h2>
            <p className="text-sm text-gray-500">
              {t('weatherDescription', {
                description: weatherCondition,
                temperature: weather.temperature,
              })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label={t('closeMessage')}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
