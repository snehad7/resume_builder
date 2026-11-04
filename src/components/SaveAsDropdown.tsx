import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, FileText, Download, Loader2 } from 'lucide-react';

interface SaveAsDropdownProps {
  onSavePdf: () => void;
  onSaveDocx: () => void;
  isGeneratingDocx?: boolean;
  className?: string;
}

export const SaveAsDropdown: React.FC<SaveAsDropdownProps> = ({
  onSavePdf,
  onSaveDocx,
  isGeneratingDocx = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectPdf = () => {
    setIsOpen(false);
    onSavePdf();
  };

  const handleSelectDocx = () => {
    setIsOpen(false);
    onSaveDocx();
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Save As Trigger Button */}
      <button
        type="button"
        id="save-as-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isGeneratingDocx}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        title="Save or Download Resume"
      >
        {isGeneratingDocx ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>Save As</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu with exactly two options */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="save-as-button"
          className="absolute right-0 mt-1.5 w-56 origin-top-right bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Option 1: PDF (.pdf) */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSelectPdf}
            className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-red-100">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
                PDF (.pdf)
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Print or export high-resolution PDF
              </p>
            </div>
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* Option 2: Word Document (.docx) */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSelectDocx}
            className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
                Word Document (.docx)
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Microsoft Word compatible document
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
