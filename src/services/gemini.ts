// Gemini AI Service for document analysis and autofill
const GEMINI_API_KEY = 'AIzaSyDsVeghED6nxmvIA2-NiRotHg9Tr7AMpm8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export interface AIAnalysisResult {
  description: string;
  category: string;
  keywords: string[];
  confidence: number;
}

export interface AutofillResult {
  [key: string]: string;
}

async function callGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function analyzeDocument(
  fileName: string,
  fileType: string
): Promise<AIAnalysisResult> {
  const prompt = `Analyze this document based on its filename and type. Provide a JSON response with the following structure:
{
  "description": "A clear, concise 1-2 sentence description of what this document likely contains",
  "category": "One of: Academic, ID Proofs, Receipts, Medical, Financial, Legal, Others",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.85
}

Document filename: "${fileName}"
File type: "${fileType}"

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await callGemini(prompt);
    
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    const result = JSON.parse(jsonStr.trim());
    
    return {
      description: result.description || 'Document uploaded',
      category: result.category || 'Others',
      keywords: result.keywords || [],
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error('Document analysis failed:', error);
    // Fallback to basic analysis
    return {
      description: `${fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`,
      category: 'Others',
      keywords: [],
      confidence: 0.3,
    };
  }
}

export async function generateAutofillData(
  formType: string,
  documents: Array<{ fileName: string; category: string; description?: string }>
): Promise<AutofillResult> {
  const documentContext = documents
    .map((doc) => `- ${doc.fileName} (${doc.category}): ${doc.description || 'No description'}`)
    .join('\n');

  const formFields: Record<string, string[]> = {
    Exam: [
      'Full Name',
      'Date of Birth',
      'Gender',
      'Email',
      'Phone Number',
      'Address',
      'City',
      'State',
      'PIN Code',
      'ID Proof Type',
      'ID Proof Number',
      'Qualification',
      'Institution Name',
      'Year of Passing',
      'Percentage/CGPA',
    ],
    Scholarship: [
      'Full Name',
      'Date of Birth',
      'Gender',
      'Father Name',
      'Mother Name',
      'Annual Family Income',
      'Email',
      'Phone Number',
      'Address',
      'State',
      'PIN Code',
      'Bank Account Number',
      'IFSC Code',
      'Institution Name',
      'Course Name',
      'Year of Study',
      'Previous Year Percentage',
    ],
    Internship: [
      'Full Name',
      'Email',
      'Phone Number',
      'LinkedIn Profile',
      'GitHub Profile',
      'College/University',
      'Degree',
      'Expected Graduation Year',
      'Skills',
      'Previous Experience',
      'Preferred Role',
      'Availability',
    ],
    Admission: [
      'Full Name',
      'Date of Birth',
      'Gender',
      'Parent/Guardian Name',
      'Email',
      'Phone Number',
      'Address',
      'City',
      'State',
      'PIN Code',
      'Previous Institution',
      'Board',
      'Year of Passing',
      'Percentage',
      'Preferred Course',
    ],
    Custom: [
      'Full Name',
      'Date of Birth',
      'Email',
      'Phone Number',
      'Address',
      'City',
      'State',
      'PIN Code',
      'ID Proof Number',
      'Qualification',
    ],
  };

  const fields = formFields[formType] || formFields.Custom;

  const prompt = `You are an AI assistant helping to fill out a ${formType} form. Based on the user's documents listed below, extract and provide likely values for the following form fields.

User's Documents:
${documentContext || 'No documents available'}

Form Fields to fill:
${fields.map((f) => `- ${f}`).join('\n')}

IMPORTANT INSTRUCTIONS:
1. If you can infer a value from the document names/descriptions, provide it
2. For fields you cannot determine, provide a placeholder like "[Enter your Field Name]"
3. Be realistic - don't make up specific numbers or IDs
4. Use common formats (e.g., DD/MM/YYYY for dates, +91 for Indian phone numbers)

Respond ONLY with valid JSON in this format:
{
  "Full Name": "value or placeholder",
  "Date of Birth": "value or placeholder",
  ...
}`;

  try {
    const response = await callGemini(prompt);
    
    // Extract JSON from response
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    const result = JSON.parse(jsonStr.trim());
    return result;
  } catch (error) {
    console.error('Autofill generation failed:', error);
    // Return placeholder data
    const placeholders: AutofillResult = {};
    fields.forEach((field) => {
      placeholders[field] = `[Enter your ${field}]`;
    });
    return placeholders;
  }
}

export async function enhanceDescription(
  fileName: string,
  currentDescription: string
): Promise<string> {
  const prompt = `Improve and enhance this document description to be more professional and informative.

Filename: "${fileName}"
Current description: "${currentDescription}"

Provide a clear, concise 1-2 sentence description that:
1. Clearly states what the document is
2. Mentions any dates or important identifiers if visible in the filename
3. Is professional and suitable for document management

Respond with ONLY the enhanced description, no additional text or formatting.`;

  try {
    const response = await callGemini(prompt);
    return response.trim();
  } catch (error) {
    console.error('Description enhancement failed:', error);
    return currentDescription;
  }
}

export const geminiService = {
  analyzeDocument,
  generateAutofillData,
  enhanceDescription,
};
