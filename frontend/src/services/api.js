export const API_URL = ''; // Uses Vite proxy

export async function generateAmivi(text) {
  const response = await fetch(`${API_URL}/api/amivi/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate AMIVI content');
  }
  
  return response.json();
}

export async function generateAmico(homeworkPrompt) {
  const response = await fetch(`${API_URL}/api/amico/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ homework_prompt: homeworkPrompt }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate AMICO comic');
  }
  
  return response.json();
}

export async function generateAmiviQuiz(text) {
  const response = await fetch(`${API_URL}/api/amivi/generate_quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate quiz');
  }
  
  return response.json();
}
