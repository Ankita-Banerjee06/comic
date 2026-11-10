export const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';


// ============================================================
// AUTH (real, email + password accounts — separate from the
// code-based Room/Classroom membership system below)
// ============================================================

const AUTH_SESSION_KEY = 'vlq_auth_session';

async function parseAuthError(response, fallback) {
  const err = await response.json().catch(() => ({}));
  return new Error(err.detail || fallback);
}

export function loadAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function authHeaders() {
  const session = loadAuthSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

export async function registerUser({ name, email, password, role }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!response.ok) throw await parseAuthError(response, 'Failed to create your account.');
  return response.json();
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw await parseAuthError(response, 'Incorrect email or password.');
  return response.json();
}

export async function logoutUser() {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw await parseAuthError(response, 'Failed to log out.');
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw await parseAuthError(response, 'Not signed in.');
  return response.json();
}

// Flips the signed-in account between 'student' and 'teacher' in
// place — same account, same saved Library content, no re-registering.
export async function switchRole(role) {
  const response = await fetch(`${API_URL}/api/auth/switch_role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw await parseAuthError(response, 'Unable to switch role.');
  return response.json();
}


// ============================================================
// AMIVI
// ============================================================

export async function generateAmivi(
  text,
  language = 'en',
  generateVideo = true,
  videoUrl = '',
  sourceProjectId = null
) {
  const response = await fetch(
    `${API_URL}/api/amivi/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        text: text || '',
        language,
        generate_video: generateVideo,
        video_url: videoUrl || null,
        source_project_id: sourceProjectId || null,
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

// AMIVI EXPLAIN — second stage. Generates a short explanation for ONE
// already-generated Microbit, on demand, when that Microbit is
// individually selected (click-to-reveal), without touching its image.
export async function explainAmiviChunk(
  chunk,
  subject = '',
  language = 'en',
  projectId = null
) {
  const response = await fetch(`${API_URL}/api/amivi/explain_chunk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      chunk_id: chunk.chunk_id,
      key_point: chunk.key_point || chunk.slogan || chunk.text || '',
      slogan: chunk.slogan || '',
      subject,
      language,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate explanation.');
  }

  return response.json();
}

// AMIVI COMPLETE VISUAL — optional Stage 3. Generates ONE new
// connected illustration from the project's already-saved Microbits
// (requires the project to already be saved, i.e. generation has run).
export async function generateAmiviCompleteVisual(
  projectId,
  language = 'en'
) {
  const response = await fetch(
    `${API_URL}/api/amivi/generate_complete_visual`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        language,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to generate Complete Visual.');
  }

  return response.json();
}

// Builds one narrated video for an already-generated AMIVI lesson,
// on demand — the "Video" card on the AMIVI result page (Photo
// Story's old slot there; Photo Story itself now lives in AMICO).
// Uses the images and narration audio already saved on the
// lesson's chunks, so this never re-runs any AI generation.
export async function generateAmiviVideo(projectId) {
  const response = await fetch(
    `${API_URL}/api/amivi/generate_video`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        project_id: projectId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || 'Failed to generate the video.'
    );
  }

  return response.json();
}

// AMICO Photo Story, sourced from an already-generated AMIVI
// lesson instead of an uploaded photo — reuses that lesson's own
// chunk images (no new image generation), composed into the same
// diagram-story sheet layout as the photo-upload path.
export async function generateAmicoPhotoStoryFromAmivi(amiviProjectId) {
  const response = await fetch(
    `${API_URL}/api/amico/photostory/from_amivi`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        project_id: amiviProjectId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || 'Failed to generate Photo Story.'
    );
  }

  return response.json();
}


// ============================================================
// QUIZ (standalone — generates from a Topic, or from
// uploaded/pasted material, independent of AMIVI)
// ============================================================

export async function generateQuiz({
  mode = 'topic',
  topic = '',
  materialText = '',
  file = null,
  language = 'en',
  numQuestions = 5,
  generateImages = true,
  generateVideos = true,
  sourceProjectId = null,
} = {}) {
  const formData = new FormData();
  formData.append('mode', mode);
  formData.append('topic', topic || '');
  formData.append('material_text', materialText || '');
  formData.append('language', language);
  formData.append('num_questions', numQuestions);
  formData.append('generate_images', generateImages);
  formData.append('generate_videos', generateVideos);
  if (sourceProjectId) formData.append('source_project_id', sourceProjectId);
  if (file) formData.append('file', file);

  // Quiz generation does an LLM call plus one image (and, by
  // default, one narrated video) per question, so it can run for
  // several minutes. Left unbounded, a slow/dropped connection
  // just hangs until the browser or a proxy in front of the API
  // kills it — which surfaces as a bare, unhelpful "Failed to
  // fetch" with no indication of what actually went wrong. Give
  // it a generous but finite budget and turn a network-level
  // failure into a message that says so.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/quiz/generate`,
      {
        method: 'POST',
        headers: {
          ...authHeaders(),
        },
        body: formData,
        signal: controller.signal,
      }
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        'Quiz generation is taking much longer than expected ' +
          '(over 5 minutes) and was stopped. This usually means ' +
          'the server is overloaded or the connection dropped — ' +
          'please try again, or generate fewer questions / turn ' +
          'off images and videos for a faster quiz.'
      );
    }

    // A raw network failure (connection reset, DNS, CORS, the
    // server process restarting mid-request) throws here as
    // "Failed to fetch" with no body to read — there is no
    // response to parse a detail out of.
    throw new Error(
      'Could not reach the server to generate this quiz. Check ' +
        'your connection and try again — if it keeps happening, ' +
        'the quiz may be too large (try fewer questions, or turn ' +
        'off images/videos) or the server may be down.'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const err = await response.json().catch(
      () => ({})
    );

    throw new Error(
      err.detail ||
        'Failed to generate quiz.'
    );
  }

  return response.json();
}


// ============================================================
// QUIZ WRONG ANSWERS BANK
// (durable — persists on the server so teachers can retake
// missed questions after a month, a year, whenever)
// ============================================================

export async function saveWrongAnswer({
  quizId = null,
  quizTitle = '',
  q = '',
  options = [],
  correct = 0,
  explanation = '',
  imageId = null,
  videoId = null,
} = {}) {
  const response = await fetch(
    `${API_URL}/api/quiz/wrong_answers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quiz_id: quizId,
        quiz_title: quizTitle,
        q,
        options,
        correct,
        explanation,
        image_id: imageId,
        video_id: videoId,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to save wrong answer.');
  }

  return response.json();
}

export async function listWrongAnswers() {
  const response = await fetch(`${API_URL}/api/quiz/wrong_answers`);
  if (!response.ok) throw new Error('Failed to load wrong answers.');
  return response.json();
}

export async function deleteWrongAnswer(id) {
  const response = await fetch(
    `${API_URL}/api/quiz/wrong_answers/${id}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to remove wrong answer.');
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
  presetAvatar = null,
  backgroundSetting = null,
} = {}) {
  const response = await fetch(
    `${API_URL}/api/amico/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        homework_prompt: homeworkPrompt,
        language,
        source_project_id: sourceProjectId,
        panels_per_page: panelsPerPage,
        pages,
        layout,
        avatar_id: avatarId,
        preset_avatar: presetAvatar,
        background_setting: backgroundSetting,
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
    headers: {
      ...authHeaders(),
    },
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
// LIBRARY
// (the central place a user can see, open and delete every
// AMIVI / AMICO / Quiz project they've created)
// ============================================================

export async function getLibrary() {
  const response = await fetch(`${API_URL}/api/library`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw new Error('Unable to load your Library.');
  return response.json();
}

export async function getLibraryProject(id) {
  const response = await fetch(`${API_URL}/api/library/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Unable to load this project.');
  }
  return response.json();
}

export async function deleteLibraryProject(id) {
  const response = await fetch(`${API_URL}/api/library/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete project.');
  }
  return response.json();
}

// Regenerates ONLY the images of a saved quiz, under the same
// answer-safety rules used for brand-new quizzes — for an older
// quiz whose question image accidentally gives the answer away
// (e.g. a labeled poster/diagram). Leaves questions/options as-is.
export async function fixQuizImages(id) {
  const response = await fetch(`${API_URL}/api/library/${id}/fix_quiz_images`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Unable to fix this quiz's images.");
  }
  return response.json();
}


// ============================================================
// ESSENTIAL LEARNING
// (Subject -> Chapter -> Chapter hub, derived from the Library's
// own saved AMIVI / AMICO / Quiz projects)
// ============================================================

export async function getChapterSubjects() {
  const response = await fetch(`${API_URL}/api/chapters`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw new Error('Unable to load subjects.');
  return response.json();
}

export async function getSubjectChapters(subject) {
  const response = await fetch(
    `${API_URL}/api/chapters/${encodeURIComponent(subject)}`,
    { headers: { ...authHeaders() } }
  );
  if (!response.ok) throw new Error('Unable to load chapters.');
  return response.json();
}

export async function getChapterHub(subject, chapterKey) {
  const response = await fetch(
    `${API_URL}/api/chapters/${encodeURIComponent(subject)}/${encodeURIComponent(chapterKey)}`,
    { headers: { ...authHeaders() } }
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Unable to load this chapter.');
  }
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


// ============================================================
// COLLABORATIVE LEARNING ROOMS
// ============================================================

async function parseRoomError(response, fallback) {
  const err = await response.json().catch(() => ({}));
  return new Error(err.detail || fallback);
}

export async function createRoom({ name, topic = '', description = '', displayName }) {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      topic,
      description,
      display_name: displayName,
    }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to create room.');
  return response.json();
}

export async function joinRoom({ roomCode, displayName }) {
  const response = await fetch(`${API_URL}/api/rooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_code: roomCode,
      display_name: displayName,
    }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to join room.');
  return response.json();
}

export async function getRoom(roomCode) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}`);
  if (!response.ok) throw await parseRoomError(response, 'Unable to load this room.');
  return response.json();
}

export async function getRoomMessages(roomCode) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}/messages`);
  if (!response.ok) throw await parseRoomError(response, 'Unable to load messages.');
  return response.json();
}

export async function sendRoomMessage(roomCode, { memberToken, message }) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, message }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to send message.');
  return response.json();
}

export async function updateRoomMaterial(roomCode, { memberToken, sharedMaterial }) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}/material`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, shared_material: sharedMaterial }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to update shared material.');
  return response.json();
}

export async function linkRoomProject(roomCode, { memberToken, kind, projectId }) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, kind, project_id: projectId }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to link project to room.');
  return response.json();
}

export async function submitRoomScore(roomCode, { memberToken, score, total }) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, score, total }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to submit score.');
  return response.json();
}

export async function leaveRoom(roomCode, { memberToken }) {
  const response = await fetch(`${API_URL}/api/rooms/${encodeURIComponent(roomCode)}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken }),
  });
  if (!response.ok) throw await parseRoomError(response, 'Failed to leave room.');
  return response.json();
}


// ============================================================
// TEACHER/STUDENT CLASSROOMS
// ============================================================

async function parseClassroomError(response, fallback) {
  const err = await response.json().catch(() => ({}));
  return new Error(err.detail || fallback);
}

export async function createClassroom({ name, subject = '', description = '', displayName, gradeLevel = '', topic = '' }) {
  const response = await fetch(`${API_URL}/api/classrooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      name,
      subject,
      description,
      display_name: displayName,
      grade_level: gradeLevel,
      topic,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to create classroom.');
  return response.json();
}

export async function getTeacherWorkspaceSummary() {
  const response = await fetch(`${API_URL}/api/me/teacher-workspace/summary`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load your Teacher Workspace summary.');
  return response.json();
}

export async function joinClassroom({ classCode, displayName }) {
  const response = await fetch(`${API_URL}/api/classrooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      class_code: classCode,
      display_name: displayName,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to join classroom.');
  return response.json();
}

export async function getClassroom(classCode) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}`);
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load this classroom.');
  return response.json();
}

export async function getMyClassrooms() {
  const response = await fetch(`${API_URL}/api/me/classrooms`, {
    headers: { ...authHeaders() },
  });
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load your classrooms.');
  return response.json();
}

export async function createAssignment(classCode, { memberToken, title, instructions = '', quizProjectId, amiviProjectId = null, amicoProjectId = null, lessonId = null, attachments = [], dueAt = null }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member_token: memberToken,
      title,
      instructions,
      quiz_project_id: quizProjectId,
      amivi_project_id: amiviProjectId,
      amico_project_id: amicoProjectId,
      lesson_id: lessonId,
      attachments,
      due_at: dueAt,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to create assignment.');
  return response.json();
}

export async function getAssignment(classCode, assignmentId) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/assignments/${assignmentId}`);
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load this assignment.');
  return response.json();
}

// Opens the exact AMIVI/AMICO/quiz project a teacher attached to a
// classroom assignment, authorized by the caller's own classroom
// member_token rather than the main account system — this is how a
// student who only joined with a class code (no full account, so no
// ownership over the teacher's project) can still view material their
// teacher shared with them through homework.
export async function getAssignmentProject(classCode, assignmentId, kind, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/assignments/${assignmentId}/project/${kind}?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load this material.');
  return response.json();
}

// Lists the teacher's own saved Library projects of one type (quiz /
// amivi / amico), so "Assign homework" can offer an already-made
// lesson instead of forcing a fresh regeneration from pasted text.
export async function getClassroomLibraryProjects(classCode, memberToken, type) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/library-projects?member_token=${encodeURIComponent(memberToken)}&type=${encodeURIComponent(type)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load your Library.');
  return response.json();
}

export async function submitAssignment(classCode, assignmentId, { memberToken, score, total, answers = [] }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, score, total, answers }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to submit homework.');
  return response.json();
}

export async function getAssignmentResults(classCode, assignmentId, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/assignments/${assignmentId}/results?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load results.');
  return response.json();
}

export async function getSubmissionDetail(classCode, assignmentId, memberId, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/assignments/${assignmentId}/submissions/${memberId}?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, "Unable to load this student's answers.");
  return response.json();
}

export async function getClassroomHistory(classCode, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/history?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load your learning history.');
  return response.json();
}

export async function leaveClassroom(classCode, { memberToken }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to leave classroom.');
  return response.json();
}

export async function getParentCode(classCode, { memberToken, regenerate = false }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/parent-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, regenerate }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to generate a parent code.');
  return response.json();
}

export async function getParentView(parentCode) {
  const response = await fetch(`${API_URL}/api/parents/${encodeURIComponent(parentCode)}`);
  if (!response.ok) throw await parseClassroomError(response, "That parent code isn't recognized.");
  return response.json();
}

export async function getTeacherCode(classCode, { memberToken, regenerate = false }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/teacher-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, regenerate }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to generate a teacher code.');
  return response.json();
}

export async function teacherLogin(classCode, { teacherCode }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/teacher-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ teacher_code: teacherCode }),
  });
  if (!response.ok) throw await parseClassroomError(response, "That class code or teacher code isn't recognized.");
  return response.json();
}

export async function getStudentCode(classCode, { memberToken, regenerate = false }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/student-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, regenerate }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to generate a login code.');
  return response.json();
}

export async function studentLogin(classCode, { studentCode }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ student_code: studentCode }),
  });
  if (!response.ok) throw await parseClassroomError(response, "That class code or login code isn't recognized.");
  return response.json();
}

// ============================================================
// TEACHER WORKSPACE — Teaching Materials, Manual Quiz Builder,
// Students/roster. See backend main.py's matching section for the
// full auth/reuse rationale.
// ============================================================

// A generic file upload shared by lesson/material/assignment
// attachments and manual-quiz question images — returns a
// media_asset_id + url the caller attaches wherever it needs one.
export async function uploadClassroomMedia(classCode, { memberToken, file }) {
  const formData = new FormData();
  formData.append('member_token', memberToken);
  formData.append('file', file);
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/media/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to upload that file.');
  return response.json();
}

export async function createMaterial(classCode, { memberToken, title, description = '', attachments = [] }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, title, description, attachments }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to save that material.');
  return response.json();
}

export async function listMaterials(classCode, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/materials?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load teaching materials.');
  return response.json();
}

export async function deleteMaterial(classCode, materialId, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/materials/${materialId}?member_token=${encodeURIComponent(memberToken)}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw await parseClassroomError(response, 'Failed to delete that material.');
  return response.json();
}

export async function createManualQuiz(classCode, { memberToken, title, description = '', durationMinutes = null, status = 'draft', questions = [], createdVia = 'manual', language = 'en' }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/quizzes/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member_token: memberToken,
      title,
      description,
      duration_minutes: durationMinutes,
      status,
      questions,
      created_via: createdVia,
      // The quiz's own content language — for a "Generate from
      // Lesson" draft this must be the source lesson's language
      // (threaded through from generateQuizDraftFromLesson's
      // response), never left to default, so a Spanish lesson's
      // quiz is never silently saved as English.
      language,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to save that quiz.');
  return response.json();
}

// Teacher Quiz Workflow, Phase 1 — generates a draft quiz strictly
// from an AMIVI lesson's own Microbits (never the lesson's raw
// source text), five questions, each tagged with which Microbit it
// came from. Nothing is saved by this call — the teacher reviews it
// in the same QuizForm as "Start Blank" and createManualQuiz (with
// createdVia: 'generated') is what actually persists it.
export async function generateQuizDraftFromLesson(classCode, { memberToken, sourceProjectId, language = 'en' }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/quizzes/generate_draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      member_token: memberToken,
      source_project_id: sourceProjectId,
      language,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to generate a quiz from that lesson.');
  return response.json();
}

export async function updateManualQuiz(classCode, projectId, { memberToken, title, description, durationMinutes, status, questions }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/quizzes/manual/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      member_token: memberToken,
      title,
      description,
      duration_minutes: durationMinutes,
      status,
      questions,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to save that quiz.');
  return response.json();
}

export async function listManualQuizzes(classCode, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/quizzes/manual?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load your quizzes.');
  return response.json();
}

export async function deleteManualQuiz(classCode, projectId, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/quizzes/manual/${projectId}?member_token=${encodeURIComponent(memberToken)}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw await parseClassroomError(response, 'Failed to delete that quiz.');
  return response.json();
}

export async function getClassroomStudents(classCode, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/students?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load students.');
  return response.json();
}

// ============================================================
// LIVE PRESENT — teacher presents, the whole class follows along
// ============================================================

async function postLive(classCode, action, body, fallback) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/live/${action}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) throw await parseClassroomError(response, fallback);
  return response.json();
}

export function startLive(classCode, { memberToken, kind, projectId }) {
  return postLive(
    classCode,
    'start',
    { member_token: memberToken, kind, project_id: projectId },
    'Unable to start presenting.'
  );
}

export function updateLive(classCode, { memberToken, position, reveal = false }) {
  return postLive(
    classCode,
    'update',
    { member_token: memberToken, position, reveal },
    'Unable to update the live slide.'
  );
}

export function stopLive(classCode, { memberToken }) {
  return postLive(classCode, 'stop', { member_token: memberToken }, 'Unable to end the presentation.');
}

// Long-poll: with `since`, the server holds the request until the
// teacher changes something (or ~25s pass), so callers can simply
// loop on it.
export async function getLiveState(classCode, memberToken, since = null, signal) {
  const params = new URLSearchParams({ member_token: memberToken });
  if (since !== null && since !== undefined) params.set('since', String(since));
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/live?${params}`,
    { signal }
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to check the live presentation.');
  return response.json();
}

export async function getLiveProject(classCode, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/live/project?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load the presentation.');
  return response.json();
}

// ============================================================
// CLASSROOM DESIGNER — teacher-built boards (image cards + layout +
// colours + text size) stored per class, presentable live.
// ============================================================

export async function listDesigns(classCode, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/designs?member_token=${encodeURIComponent(memberToken)}`
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to load your designs.');
  return response.json();
}

export async function saveDesign(classCode, { memberToken, designId = null, title, data }) {
  const response = await fetch(`${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_token: memberToken, design_id: designId, title, data }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Unable to save this design.');
  return response.json();
}

export async function deleteDesign(classCode, designId, memberToken) {
  const response = await fetch(
    `${API_URL}/api/classrooms/${encodeURIComponent(classCode)}/designs/${designId}?member_token=${encodeURIComponent(memberToken)}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw await parseClassroomError(response, 'Unable to delete this design.');
  return response.json();
}
