import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

/**
 * Ekran oczekiwania na odpowiedź AI podczas analizy posiłku.
 * Wyświetla animowane Skeleton odwzorowujące układ formularza.
 */
export function AnalysisLoadingView() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header z animacją */}
      <div className="flex items-center justify-center gap-3 py-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-lg font-medium">AI analizuje Twój posiłek...</p>
      </div>

      {/* Skeleton nazwa posiłku */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Skeleton dymek AI */}
      <div className="rounded-lg bg-muted p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Skeleton makroskładniki - siatka 2x3 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Kalorie */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Białko */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Tłuszcze */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Węglowodany */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Błonnik */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Skeleton przyciski */}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}
