export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AnalysisResponse {
  predicted_label_index: number;
  predicted_label_name: string;
  confidence: number;
  is_recognized: boolean;
  class_probabilities: Record<string, number>;
  explanation: string;
  disclaimer: string;
}

export const analyzeImage = async (imageFile: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    throw new Error(`Cannot reach backend at ${API_BASE_URL}. Is the server running?`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Failed to analyze image');
  }

  return response.json();
};
