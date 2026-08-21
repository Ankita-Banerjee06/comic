export const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';


// ============================================================
// AMIVI
// ============================================================

export async function generateAmivi(
  text,
  language = 'en',
  generateVideo = true,
  videoUrl = ''
) {
  const response = await fetch(
    `${API_URL}/api/amivi/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text || '',
        language,
        generate_video: generateVideo,
        video_url: videoUrl || null,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        'Failed to generate AMIVI content.'
    );
  }

  return response.json();
}


// ============================================================
// AMIVI QUIZ
// ============================================================

export async function generateAmiviQuiz(
  text,
  language = 'en'
) {
  const response = await fetch(
    `${API_URL}/api/amivi/generate_quiz`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text || '',
        language,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(
      () => ({})
    );

    throw new Error(
      err.detail ||
        'Failed to generate AMIVI quiz.'
    );
  }

  return response.json();
}


// ============================================================
// AMICO
// ============================================================

export async function generateAmico(
  homeworkPrompt,
  language = 'en'
) {
  const response = await fetch(
    `${API_URL}/api/amico/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        homework_prompt: homeworkPrompt,
        language,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(
      () => ({})
    );

    throw new Error(
      err.detail ||
        'Failed to generate AMICO comic.'
    );
  }

  return response.json();
} 