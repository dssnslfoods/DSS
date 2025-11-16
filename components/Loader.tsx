
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-slate-700">กำลังประมวลผลไฟล์เสียง...</p>
        <p className="text-slate-500">ขั้นตอนนี้อาจใช้เวลาสักครู่ ขึ้นอยู่กับความยาวของไฟล์เสียง</p>
    </div>
  );
};
