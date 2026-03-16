'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  className?: string;
}

export function RestTimer({ initialSeconds = 90, onComplete, className }: RestTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleComplete = () => {
    setIsRunning(false);
    if (!isMuted) {
      // Вибрация для мобильных
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    onComplete?.();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((initialSeconds - seconds) / initialSeconds) * 100;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setSeconds(0);
    handleComplete();
  };

  // Цвет прогресс бара в зависимости от времени
  const getProgressColor = () => {
    if (seconds <= 15) return 'bg-red-500';
    if (seconds <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-6', className)}>
      {/* Прогресс бар */}
      <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-1000', getProgressColor())}
          style={{ width: `${getProgress()}%` }}
        />
      </div>

      {/* Время */}
      <div className="text-6xl font-bold tabular-nums mb-6">{formatTime(seconds)}</div>

      {/* Кнопки управления */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <Button size="lg" onClick={handleStart} className="w-14 h-14 rounded-full">
            <Play className="h-6 w-6" />
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={handlePause} className="w-14 h-14 rounded-full">
            <Pause className="h-6 w-6" />
          </Button>
        )}

        <Button size="lg" variant="outline" onClick={handleReset} className="w-14 h-14 rounded-full">
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button size="lg" variant="destructive" onClick={handleSkip} className="w-14 h-14 rounded-full">
          Пропустить
        </Button>

        <Button
          size="lg"
          variant="ghost"
          onClick={() => setIsMuted(!isMuted)}
          className="w-14 h-14 rounded-full"
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      </div>

      {/* Быстрый выбор времени */}
      <div className="flex gap-2 mt-6">
        {[30, 60, 90, 120, 180].map((time) => (
          <Button
            key={time}
            size="sm"
            variant="outline"
            onClick={() => {
              setIsRunning(false);
              setSeconds(time);
            }}
          >
            {time >= 60 ? `${time / 60}м` : `${time}с`}
          </Button>
        ))}
      </div>
    </div>
  );
}
