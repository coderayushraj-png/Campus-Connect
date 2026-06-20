import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Briefcase, FileText, Banknote, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlines();
  }, []);

  async function fetchDeadlines() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching deadlines:", error);
      } else {
        setDeadlines(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'placement':
        return { icon: Briefcase, color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", label: "Placement" };
      case 'exam':
        return { icon: FileText, color: "text-error", bg: "bg-error/10", label: "Exam" };
      case 'fee':
        return { icon: Banknote, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Fee" };
      default:
        return { icon: AlertCircle, color: "text-primary", bg: "bg-primary/10", label: "General" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeDeadlines = deadlines.filter(d => !isPast(new Date(d.date)));
  const pastDeadlines = deadlines.filter(d => isPast(new Date(d.date)));

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle/0 pt-2">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface flex items-center gap-2 font-bold text-[30px]">
            Academic Deadlines <span className="text-[28px]">⏰</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Keep track of important dates, application deadlines, and fee submissions.
          </p>
        </div>
      </div>

      <div className="bg-surface-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-subtle bg-surface-container-lowest">
          <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
            Upcoming Deadlines
          </h2>
        </div>
        
        {activeDeadlines.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            No upcoming deadlines found.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {activeDeadlines.map(deadline => {
              const { icon: TypeIcon, color, bg, label } = getTypeStyle(deadline.type);
              const dateObj = new Date(deadline.date);
              
              return (
                <div key={deadline.id} className="p-5 hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bg, color)}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded", bg, color)}>
                        {label}
                      </span>
                      <span className="text-sm font-medium text-error flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(dateObj, { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-on-surface font-bold text-base line-clamp-1">{deadline.title}</h3>
                    {deadline.target_branches && deadline.target_branches.length > 0 && (
                      <p className="text-sm text-on-surface-variant mt-1">
                        Eligible branches: {deadline.target_branches.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0 mt-3 sm:mt-0">
                    <div className="font-bold text-on-surface">{format(dateObj, "dd MMM yyyy")}</div>
                    <div className="text-sm text-on-surface-variant">{format(dateObj, "hh:mm a")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pastDeadlines.length > 0 && (
        <div className="mt-8">
          <h3 className="font-headline-sm text-on-surface font-bold text-base mb-4 pl-1">Past Deadlines</h3>
          <div className="bg-surface-white rounded-xl border border-border-subtle shadow-sm overflow-hidden opacity-75">
            <div className="divide-y divide-border-subtle">
              {pastDeadlines.map(deadline => {
                const { icon: TypeIcon, color, bg, label } = getTypeStyle(deadline.type);
                const dateObj = new Date(deadline.date);
                
                return (
                  <div key={deadline.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 grayscale", bg, color)}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline-sm text-on-surface line-clamp-1">{deadline.title}</h3>
                      <div className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <span>{label}</span> • <span>Expired {formatDistanceToNow(dateObj, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
