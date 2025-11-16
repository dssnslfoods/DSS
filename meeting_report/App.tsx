
import React, { useState, useRef, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { MeetingReportDisplay } from './components/MeetingReportDisplay';
import { Loader } from './components/Loader';
import { generateMeetingReport } from './services/geminiService';
import type { MeetingReport } from './types';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [report, setReport] = useState<MeetingReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const reportData = await generateMeetingReport(file);
      setReport(reportData);
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการประมวลผลไฟล์เสียง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex justify-center items-center gap-4 mb-4">
            <LogoIcon className="h-12 w-12 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              ถอดความการประชุมอัตโนมัติ
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            อัปโหลดไฟล์เสียงการประชุมของคุณเพื่อสร้างรายงาน, สรุปผู้บริหาร, และส่งอีเมลได้อย่างง่ายดาย
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
            {!report && !isLoading && (
              <FileUpload onFileUpload={handleFileUpload} disabled={isLoading} />
            )}
            
            {isLoading && <Loader />}
            
            {error && !isLoading && (
              <div className="text-center">
                <p className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setReport(null);
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            )}
            
            {report && !isLoading && (
              <div>
                 <MeetingReportDisplay report={report} ref={reportRef} />
              </div>
            )}
          </div>
        </main>
        <footer className="text-center mt-12 text-slate-500">
          <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
