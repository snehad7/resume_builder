import React, { useEffect, useRef, useState } from 'react';
import { ResumeData, ResumeSettings, ResumeTemplateId } from '../types/resume';
import { ResumePreview } from './ResumePreview';

interface ScaledTemplatePreviewProps {
  data: ResumeData;
  template: ResumeTemplateId;
  settings: ResumeSettings;
  aspectClass?: string;
  scrollable?: boolean;
  className?: string;
}

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export const ScaledTemplatePreview: React.FC<ScaledTemplatePreviewProps> = ({
  data,
  template,
  settings,
  aspectClass = 'aspect-[210/270]',
  scrollable = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.26);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / A4_WIDTH_PX);
      }
    };

    updateScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateScale);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  if (scrollable) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full overflow-x-hidden overflow-y-auto bg-white rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs ${className}`}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ height: `${Math.round(A4_HEIGHT_PX * scale)}px` }}
        >
          <div
            className="origin-top-left"
            style={{
              width: `${A4_WIDTH_PX}px`,
              transform: `scale(${scale})`,
            }}
          >
            <ResumePreview data={data} template={template} settings={settings} isThumbnail />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${aspectClass} overflow-hidden bg-white rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}
    >
      <div
        className="origin-top-left"
        style={{
          width: `${A4_WIDTH_PX}px`,
          transform: `scale(${scale})`,
        }}
      >
        <ResumePreview data={data} template={template} settings={settings} isThumbnail />
      </div>
    </div>
  );
};
