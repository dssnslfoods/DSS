
import { GoogleGenAI, Type } from '@google/genai';
import type { MeetingReport } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the data url prefix: 'data:*/*;base64,'
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};


export const generateMeetingReport = async (audioFile: File): Promise<MeetingReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const audioBase64 = await fileToBase64(audioFile);

  const audioPart = {
    inlineData: {
      mimeType: audioFile.type,
      data: audioBase64,
    },
  };

  const textPart = {
    text: `
      ถอดเสียงการประชุมนี้เป็นรายงานการประชุมฉบับสมบูรณ์ในภาษาไทย 
      สร้างผลลัพธ์เป็นออบเจ็กต์ JSON ที่มีสองคีย์: 'executiveSummary' และ 'minutes'
      - สำหรับ 'executiveSummary' ให้สรุปประเด็นสำคัญ การตัดสินใจ และรายการดำเนินการในย่อหน้าที่กระชับ
      - สำหรับ 'minutes' ให้สร้างอาร์เรย์ของออบเจ็กต์ โดยแต่ละออบเจ็กต์ประกอบด้วย 'timestamp' (รูปแบบ MM:SS), 'speaker' (ระบุเป็น 'ผู้พูด 1', 'ผู้พูด 2' หากไม่ทราบชื่อ), และ 'dialogue' (บทสนทนา)
      ตรวจสอบให้แน่ใจว่าผลลัพธ์เป็น JSON ที่ถูกต้องสมบูรณ์
    `,
  };
  
  const reportSchema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: {
        type: Type.STRING,
        description: 'A concise summary of the meeting in Thai.'
      },
      minutes: {
        type: Type.ARRAY,
        description: 'A detailed, timestamped log of the meeting conversation.',
        items: {
          type: Type.OBJECT,
          properties: {
            timestamp: {
              type: Type.STRING,
              description: 'The timestamp of the dialogue in MM:SS format.'
            },
            speaker: {
              type: Type.STRING,
              description: 'The identified speaker (e.g., "ผู้พูด 1").'
            },
            dialogue: {
              type: Type.STRING,
              description: 'The transcribed dialogue of the speaker.'
            }
          },
          required: ['timestamp', 'speaker', 'dialogue']
        }
      }
    },
    required: ['executiveSummary', 'minutes']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [audioPart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    const reportJsonString = response.text.trim();
    const reportData = JSON.parse(reportJsonString);

    return reportData as MeetingReport;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate meeting report from Gemini API.");
  }
};
