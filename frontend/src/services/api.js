export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Environment-based backend URL

export async function generateAmivi(text, language = 'en') {
  const response = await fetch(`${API_URL}/api/amivi/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, language }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate AMIVI content');
  }
  
  return response.json();
}

export async function generateAmico(homeworkPrompt, language = 'en') {
  const response = await fetch(`${API_URL}/api/amico/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ homework_prompt: homeworkPrompt, language }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate AMICO comic');
  }
  
  return response.json();
}

export async function generateAmiviQuiz(text, language = 'en') {
  const response = await fetch(`${API_URL}/api/amivi/generate_quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, language }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate quiz');
  }
  
  return response.json();
}
