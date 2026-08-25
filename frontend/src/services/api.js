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

export async function regenerateAmiviImage(
  chunk,
  language = 'en',
  projectId = null
) {
  const response = await fetch(`${API_URL}/api/amivi/regenerate_image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      chunk_id: chunk.chunk_id,
      text: chunk.text || '',
      slogan: chunk.slogan || '',
      description: chunk.description || '',
      image_prompt: chunk.image_prompt || '',
      language,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to regenerate image.');
  }

  return response.json();
}

export async function editAmiviChunk(
  chunk,
  language = 'en',
  projectId = null
) {
  const response = await fetch(`${API_URL}/api/amivi/edit_chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      chunk_id: chunk.chunk_id,
      text: chunk.text || '',
      slogan: chunk.slogan || '',
      description: chunk.description || '',
      voice_script: chunk.voice_script || chunk.text || '',
      language,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to edit chunk.');
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

export async function generateAmico({
  homeworkPrompt = '',
  language = 'en',
  sourceProjectId = null,
  panelsPerPage = 4,
  pages = 1,
  layout = 'horizontal',
  avatarId = null,
} = {}) {
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
        source_project_id: sourceProjectId,
        panels_per_page: panelsPerPage,
        pages,
        layout,
        avatar_id: avatarId,
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

export async function regenerateAmicoPanel(panel, projectId = null) {
  const response = await fetch(`${API_URL}/api/amico/regenerate_panel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      panel_number: panel.panel_number,
      title: panel.title || '',
      scene: panel.scene || '',
      image_prompt: panel.image_prompt || '',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to regenerate panel.');
  }

  return response.json();
}

export async function editAmicoPanel(projectId, panel) {
  const response = await fetch(`${API_URL}/api/amico/edit_panel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      panel_number: panel.panel_number,
      title: panel.title,
      dialogue: panel.dialogue,
      learning_point: panel.learning_point,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to edit panel.');
  }

  return response.json();
}

export async function addAmicoPanel(projectId, insertAfter, topicHint = '', language = 'en') {
  const response = await fetch(`${API_URL}/api/amico/add_panel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      language,
      insert_after: insertAfter,
      topic_hint: topicHint,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to add panel.');
  }

  return response.json();
}

export async function recomposeAmico(projectId, panels, panelsPerPage, layout) {
  const response = await fetch(`${API_URL}/api/amico/recompose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: projectId,
      panels,
      panels_per_page: panelsPerPage,
      layout,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update the comic pages.');
  }

  return response.json();
}


// ============================================================
// AVATARS
// ============================================================

export async function generateAvatar(file, name = '', style = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('style', style);

  const response = await fetch(`${API_URL}/api/avatar/generate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate avatar.');
  }

  return response.json();
}

export async function listAvatars() {
  const response = await fetch(`${API_URL}/api/avatars`);
  if (!response.ok) throw new Error('Failed to load avatars.');
  return response.json();
}

export async function deleteAvatar(avatarId) {
  const response = await fetch(`${API_URL}/api/avatar/${avatarId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete avatar.');
  return response.json();
}


// ============================================================
// AMICO PHOTO STORY
// ============================================================

export async function generateAmicoPhotoStory(file, language = 'en', panelCount = 6) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  formData.append('panel_count', panelCount);

  const response = await fetch(`${API_URL}/api/amico/photostory/generate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate photo story.');
  }

  return response.json();
}


// ============================================================
// PROJECTS + COMICS (library / "import from AMIVI")
// ============================================================

export async function listProjects(projectType = '') {
  const query = projectType ? `?project_type=${encodeURIComponent(projectType)}` : '';
  const response = await fetch(`${API_URL}/api/projects${query}`);
  if (!response.ok) throw new Error('Failed to load projects.');
  return response.json();
}

export async function listComics() {
  const response = await fetch(`${API_URL}/api/comics`);
  if (!response.ok) throw new Error('Failed to load comics.');
  return response.json();
}


// ============================================================
// MEDIA DOWNLOAD
// ============================================================

export function mediaUrl(path, { download = false } = {}) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${API_URL}${path}${download ? `${separator}download=true` : ''}`;
}

export async function downloadMedia(path, filename) {
  const response = await fetch(mediaUrl(path, { download: true }));
  if (!response.ok) throw new Error('Download failed.');
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(blobUrl);
  document.body.removeChild(a);
}
