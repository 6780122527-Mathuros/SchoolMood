import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only if the key exists to avoid immediate crash on load if missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeDiaryEntry = async (text: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return "ระบบ AI ยังไม่พร้อมใช้งานในขณะนี้ (Missing API Key)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a supportive, empathetic school counselor assistant. 
      Analyze the following student diary entry (in Thai) and provide a short, warm, and encouraging response in Thai.
      Keep it under 3 sentences.
      
      Diary Entry: "${text}"`,
    });

    return response.text || "ขอบคุณที่แบ่งปันเรื่องราว";
  } catch (error) {
    console.error("Error analyzing diary:", error);
    return "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  }
};

export const generatePsychAnalysis = async (answers: string[]): Promise<string> => {
    if (!ai) return "ระบบ AI ยังไม่พร้อมใช้งาน (กรุณาตรวจสอบ API Key)";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Role: School Counselor / Child Psychologist.
            Task: Analyze the following student answers from a mental health screening (focusing on Stress and Depression indicators).
            Output:
            1. A supportive, empathetic summary of their mental state in Thai.
            2. If high risk, gently suggest seeing the counselor.
            3. One simple, actionable self-care tip suitable for a student.
            
            Student Answers: ${JSON.stringify(answers)}`,
        });
        return response.text || "สิ้นสุดการประเมิน";
    } catch (error) {
        console.error("Error generating analysis", error);
        return "เกิดข้อผิดพลาดในการประมวลผล";
    }
}