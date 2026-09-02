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
        ...authHeaders(),
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

export async function generateAmiviPhotoStory(projectId) {
  const response = await fetch(`${API_URL}/api/amivi/generate_photo_story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({
      project_id: projectId,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate Photo Story.');
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
} = {}) {
  const formData = new FormData();
  formData.append('mode', mode);
  formData.append('topic', topic || '');
  formData.append('material_text', materialText || '');
  formData.append('language', language);
  formData.append('num_questions', numQuestions);
  formData.append('generate_images', generateImages);
  formData.append('generate_videos', generateVideos);
  if (file) formData.append('file', file);

  const response = await fetch(
    `${API_URL}/api/quiz/generate`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
      },
      body: formData,
    }
  );

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

// Generates one illustration for a single question — used by
// category quizzes, which build their questions directly from a
// curated bank instead of going through generateQuiz(), but still
// want the same AI-illustrated look.
export async function generateQuizQuestionImage(prompt, explanation, language) {
  const formData = new FormData();
  formData.append('prompt', prompt || '');
  formData.append('explanation', explanation || '');
  formData.append('language', language || 'en');

  const response = await fetch(
    `${API_URL}/api/quiz/generate_question_image`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(
      () => ({})
    );

    throw new Error(
      err.detail ||
        'Failed to generate question image.'
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

export async function createClassroom({ name, subject = '', description = '', displayName }) {
  const response = await fetch(`${API_URL}/api/classrooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      name,
      subject,
      description,
      display_name: displayName,
    }),
  });
  if (!response.ok) throw await parseClassroomError(response, 'Failed to create classroom.');
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

export async function createAssignment(classCode, { memberToken, title, instructions = '', quizProjectId, amiviProjectId = null, amicoProjectId = null, dueAt = null }) {
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
