import React, { useState, forwardRef, useRef } from 'react';
import type { MeetingReport } from '../types';
import { DownloadIcon } from './Icons';

// Fix: Add type declarations for window.jspdf and window.html2canvas to resolve TypeScript errors.
declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: any) => any;
    };
    html2canvas: (
      element: HTMLElement,
      options?: any,
    ) => Promise<HTMLCanvasElement>;
  }
}

interface MeetingReportDisplayProps {
  report: MeetingReport;
}

export const MeetingReportDisplay = forwardRef<HTMLDivElement, MeetingReportDisplayProps>(({ report }, ref) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const reportContentRef = useRef<HTMLDivElement>(null);
  const minutesContainerRef = useRef<HTMLDivElement>(null);

  const generateAndDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const { jsPDF } = window.jspdf;
    const reportElement = reportContentRef.current;
    const minutesElement = minutesContainerRef.current;

    if (!reportElement || !minutesElement) {
        setIsGeneratingPdf(false);
        return;
    };
    
    // Store original styles and then remove height restrictions for full capture
    const originalMaxHeight = minutesElement.style.maxHeight;
    const originalOverflowY = minutesElement.style.overflowY;
    minutesElement.style.maxHeight = 'none';
    minutesElement.style.overflowY = 'visible';
    
    try {
        // Use html2canvas to render the div
        const canvas = await window.html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            windowWidth: reportElement.scrollWidth,
            windowHeight: reportElement.scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('meeting-report.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        // Restore original styles
        minutesElement.style.maxHeight = originalMaxHeight;
        minutesElement.style.overflowY = originalOverflowY;
        setIsGeneratingPdf(false);
    }
  };
  

  return (
    <div className="space-y-8" ref={ref}>
        <div ref={reportContentRef} className="p-4 bg-white">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2 mb-4">
                สรุปสำหรับผู้บริหาร (Executive Summary)
              </h2>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                {report.executiveSummary}
              </p>
            </section>
    
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2 mb-4">
                รายงานการประชุม
              </h2>
              <div ref={minutesContainerRef} className="space-y-6 max-h-[50vh] overflow-y-auto pr-3 border rounded-lg p-4">
                {report.minutes.map((entry, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-2 md:gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <p className="flex-shrink-0 bg-blue-100 text-blue-800 font-mono text-sm px-2 py-1 rounded">
                      {entry.timestamp}
                    </p>
                    <div className="flex-grow">
                      <p className="font-semibold text-slate-900">{entry.speaker}:</p>
                      <p className="text-slate-700">{entry.dialogue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
        </div>

        <section className="bg-slate-100 p-6 rounded-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">ส่งออกรายงาน</h3>
            <div className="flex">
                <button 
                    onClick={generateAndDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="h-10 px-6 py-2 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition-colors disabled:bg-slate-400"
                >
                    <DownloadIcon className="w-5 h-5" />
                    {isGeneratingPdf ? 'กำลังสร้าง...' : 'ดาวน์โหลดเป็น PDF'}
                </button>
            </div>
        </section>
    </div>
  );
});