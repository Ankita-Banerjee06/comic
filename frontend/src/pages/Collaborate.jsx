import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  MessageCircle,
  Send,
  Copy,
  Check,
  Crown,
  LogOut,
  Sparkles,
  Palette,
  BookOpen,
  Puzzle,
  Trophy,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createRoom,
  joinRoom,
  getRoom,
  getRoomMessages,
  sendRoomMessage,
  updateRoomMaterial,
  linkRoomProject,
  submitRoomScore,
  leaveRoom,
  generateAmivi,
  generateAmico,
  generateQuiz,
  getLibraryProject,
  mediaUrl,
} from '../services/api';

const SESSION_KEY = 'vlq_room_session';
const CHAT_POLL_MS = 6000;

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore — worst case the user re-joins next visit
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export default function CollaborativeLearning() {
  const navigate = useNavigate();

  const [session, setSession] = useState(() => loadSession());
  const [screen, setScreen] = useState(() => (loadSession() ? 'room' : 'hub'));

  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // --------------------------------------------------------
  // ROOM LOADING
  // --------------------------------------------------------

  const loadRoom = useCallback((roomCode) => {
    setRoomLoading(true);
    setRoomError(null);

    getRoom(roomCode)
      .then((data) => setRoom(data))
      .catch((err) => setRoomError(err?.message || 'Unable to load this room.'))
      .finally(() => setRoomLoading(false));
  }, []);

  useEffect(() => {
    if (screen === 'room' && session?.roomCode) {
      loadRoom(session.roomCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session?.roomCode]);

  const myMember = room?.members?.find((m) => m.id === session?.memberId) || null;

  // --------------------------------------------------------
  // CREATE / JOIN
  // --------------------------------------------------------

  const handleCreated = (data) => {
    const newSession = {
      roomCode: data.room.room_code,
      memberToken: data.member.token,
      memberId: data.member.id,
      displayName: data.member.display_name,
    };
    saveSession(newSession);
    setSession(newSession);
    setRoom(data.room);
    setScreen('room');
  };

  const handleJoined = (data) => {
    const newSession = {
      roomCode: data.room.room_code,
      memberToken: data.member.token,
      memberId: data.member.id,
      displayName: data.member.display_name,
    };
    saveSession(newSession);
    setSession(newSession);
    setRoom(data.room);
    setScreen('room');
  };

  const handleLeave = async () => {
    if (!session) return;
    setLeaving(true);
    try {
      await leaveRoom(session.roomCode, { memberToken: session.memberToken });
    } catch {
      // even if the network call fails, still forget the local session
    } finally {
      clearSession();
      setSession(null);
      setRoom(null);
      setRoomError(null);
      setLeaving(false);
      setShowLeaveConfirm(false);
      setScreen('hub');
    }
  };

  const backToHub = () => {
    clearSession();
    setSession(null);
    setRoom(null);
    setRoomError(null);
    setScreen('hub');
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        screen={screen}
        room={room}
        onLeaveClick={() => setShowLeaveConfirm(true)}
      />

      {screen === 'hub' && (
        <RoomHub
          onGoCreate={() => setScreen('create')}
          onGoJoin={() => setScreen('join')}
        />
      )}

      {screen === 'create' && (
        <CreateRoomForm onCancel={() => setScreen('hub')} onCreated={handleCreated} />
      )}

      {screen === 'join' && (
        <JoinRoomForm onCancel={() => setScreen('hub')} onJoined={handleJoined} />
      )}

      {screen === 'room' && session && (
        <RoomView
          session={session}
          room={room}
          myMember={myMember}
          loading={roomLoading}
          error={roomError}
          onRetry={() => loadRoom(session.roomCode)}
          onRoomUpdate={setRoom}
          onBackToHub={backToHub}
          navigate={navigate}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmModal
          title="Leave this room?"
          body="You can rejoin later with the room code. Anything you've shared will stay for the rest of the group."
          confirmLabel={leaving ? 'Leaving…' : 'Leave Room'}
          busy={leaving}
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeave}
        />
      )}
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================

function Header({ screen, room, onLeaveClick }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8 text-white"
      style={{ minHeight: 180, background: '#1e1b4b' }}
    >
      <img
        src="/vlq-collab-hero.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(30,27,75,0.68)' }} />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
            <Users className="w-3.5 h-3.5" /> Collaborative Learning
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
            {screen === 'room' && room ? room.name : 'Study together, live'}
          </h1>
          <p className="text-white/90 font-medium max-w-lg">
            {screen === 'room' && room
              ? room.topic || 'A shared room for discussing, generating and quizzing together.'
              : 'Create a room, invite your group with a code, and learn together — share material, chat, generate AMIVI/AMICO, and take a shared quiz.'}
          </p>
        </div>

        {screen === 'room' && room && (
          <button
            onClick={onLeaveClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" /> Leave Room
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HUB (no active room)
// ============================================================

function RoomHub({ onGoCreate, onGoJoin }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={onGoCreate}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Plus className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1.5">Create a room</h2>
        <p className="text-slate-500 font-medium text-sm mb-4">
          Start a new study room, get a shareable code, and invite your group.
        </p>
        <span className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
          Create <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <button
        onClick={onGoJoin}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Users className="w-6 h-6 text-pink-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1.5">Join a room</h2>
        <p className="text-slate-500 font-medium text-sm mb-4">
          Have a room code from someone else? Jump straight into their room.
        </p>
        <span className="inline-flex items-center gap-1.5 text-pink-600 font-bold text-sm">
          Join <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}

// ============================================================
// CREATE ROOM
// ============================================================

function CreateRoomForm({ onCancel, onCreated }) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !displayName.trim()) {
      setError('Room name and your name are both required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await createRoom({
        name: name.trim(),
        topic: topic.trim(),
        description: description.trim(),
        displayName: displayName.trim(),
      });
      onCreated(data);
    } catch (err) {
      setError(err?.message || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
    >
      <h2 className="text-xl font-bold text-slate-800">Create a learning room</h2>

      <Field label="Room name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Photosynthesis Study Group"
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Topic (optional)">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Biology — Cells & Energy"
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Description (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this room about?"
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
        />
      </Field>

      <Field label="Your name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should others see you?"
          className={INPUT_CLASS}
        />
      </Field>

      {error && (
        <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Creating…' : 'Create Room'}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// JOIN ROOM
// ============================================================

function JoinRoomForm({ onCancel, onJoined }) {
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!roomCode.trim() || !displayName.trim()) {
      setError('Room code and your name are both required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await joinRoom({
        roomCode: roomCode.trim().toUpperCase(),
        displayName: displayName.trim(),
      });
      onJoined(data);
    } catch (err) {
      setError(err?.message || 'Failed to join room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
    >
      <h2 className="text-xl font-bold text-slate-800">Join a learning room</h2>

      <Field label="Room code">
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QX"
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label="Your name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should others see you?"
          className={INPUT_CLASS}
        />
      </Field>

      {error && (
        <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Joining…' : 'Join Room'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// ============================================================
// ROOM VIEW
// ============================================================

function RoomView({ session, room, myMember, loading, error, onRetry, onRoomUpdate, onBackToHub, navigate }) {
  if (loading && !room) {
    return <RoomSkeleton />;
  }

  if (error && !room) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-slate-700 font-bold text-lg mb-1">Couldn't load this room.</p>
        <p className="text-slate-400 font-medium text-sm mb-5">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={onBackToHub}
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            Back to Start
          </button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <RoomCodeCard room={room} />
        <MaterialPanel session={session} room={room} onRoomUpdate={onRoomUpdate} />
        <GeneratePanel session={session} room={room} onRoomUpdate={onRoomUpdate} navigate={navigate} />
        <QuizPanel session={session} room={room} onRoomUpdate={onRoomUpdate} />
      </div>

      <div className="space-y-6">
        <MembersPanel room={room} myMember={myMember} />
        <ChatPanel session={session} room={room} />
      </div>
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200" />
        ))}
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-white rounded-2xl border border-slate-200" />
        <div className="h-72 bg-white rounded-2xl border border-slate-200" />
      </div>
    </div>
  );
}

// ============================================================
// ROOM CODE CARD
// ============================================================

function RoomCodeCard({ room }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Room code</p>
        <p className="text-2xl font-extrabold text-slate-900 tracking-[0.2em]">{room.room_code}</p>
        {room.description && (
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-md">{room.description}</p>
        )}
      </div>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy Code'}
      </button>
    </div>
  );
}

// ============================================================
// MEMBERS PANEL
// ============================================================

function MembersPanel({ room, myMember }) {
  const members = room.members || [];
  const scored = members.filter((m) => m.quiz_total);
  const leaderboard = [...scored].sort((a, b) => (b.quiz_score / b.quiz_total) - (a.quiz_score / a.quiz_total));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-4.5 h-4.5 text-slate-400" /> Members ({members.length})
      </h2>

      {members.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium">No one's here yet.</p>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-indigo-600">
                  {(m.display_name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                  {m.display_name}
                  {m.id === myMember?.id && (
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {m.is_host && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </p>
                {m.quiz_total ? (
                  <p className="text-xs text-slate-400 font-semibold">
                    Quiz: {m.quiz_score}/{m.quiz_total}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Quiz leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 truncate">
                  {i === 0 ? '🏆 ' : `${i + 1}. `}
                  {m.display_name}
                </span>
                <span className="font-bold text-slate-500 shrink-0">
                  {m.quiz_score}/{m.quiz_total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARED MATERIAL PANEL
// ============================================================

function MaterialPanel({ session, room, onRoomUpdate }) {
  const [draft, setDraft] = useState(room.shared_material || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(room.shared_material || '');
  }, [room.shared_material]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateRoomMaterial(room.room_code, {
        memberToken: session.memberToken,
        sharedMaterial: draft,
      });
      onRoomUpdate({ ...room, shared_material: draft });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err?.message || 'Failed to save material.');
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = !room.shared_material;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 mb-1.5">Shared learning material</h2>
      <p className="text-sm text-slate-500 font-medium mb-4">
        {isEmpty
          ? 'No material shared yet — paste something below so the group can generate visuals, a comic and a quiz from it.'
          : 'Anyone in the room can edit this. It powers AMIVI, AMICO and the shared quiz below.'}
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Paste the topic or learning material you want the group to study..."
        rows={6}
        className={`${INPUT_CLASS} resize-none`}
      />

      <div className="flex items-center justify-between mt-3">
        {error && <p className="text-red-500 font-bold text-xs">{error}</p>}
        {saved && !error && <p className="text-green-600 font-bold text-xs">Saved ✓</p>}
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving || draft === (room.shared_material || '')}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Saving…' : 'Save Material'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// GENERATE PANEL — AMIVI / AMICO from the shared material
// ============================================================

function GeneratePanel({ session, room, onRoomUpdate, navigate }) {
  const [busy, setBusy] = useState(null); // 'amivi' | 'amico' | null
  const [errors, setErrors] = useState({});

  const material = (room.shared_material || '').trim();

  const runGeneration = async (kind) => {
    if (!material) {
      setErrors((e) => ({ ...e, [kind]: 'Add some shared material first.' }));
      return;
    }

    setBusy(kind);
    setErrors((e) => ({ ...e, [kind]: null }));

    try {
      let projectId;

      if (kind === 'amivi') {
        const data = await generateAmivi(material, 'en', false, '');
        projectId = data.project_id;
      } else {
        const data = await generateAmico({ homeworkPrompt: material, language: 'en' });
        projectId = data.project_id;
      }

      const linked = await linkRoomProject(room.room_code, {
        memberToken: session.memberToken,
        kind,
        projectId,
      });

      onRoomUpdate({
        ...room,
        [`${kind}_project_id`]: projectId,
        [kind]: linked[kind],
      });
    } catch (err) {
      setErrors((e) => ({ ...e, [kind]: err?.message || `Failed to generate ${kind.toUpperCase()}.` }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 mb-1.5">Generate from the shared material</h2>
      <p className="text-sm text-slate-500 font-medium mb-5">
        Turn what the group shared into AMIVI visuals or an AMICO comic — visible to everyone in the room.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GenerateCard
          icon={Palette}
          tint="bg-orange-50"
          iconColor="text-orange-500"
          btnClass="bg-orange-500 hover:bg-orange-600"
          title="AMIVI Visuals"
          project={room.amivi}
          busy={busy === 'amivi'}
          error={errors.amivi}
          onGenerate={() => runGeneration('amivi')}
          onOpen={() => navigate(`/amivi/${room.amivi_project_id}`)}
        />
        <GenerateCard
          icon={BookOpen}
          tint="bg-pink-50"
          iconColor="text-pink-500"
          btnClass="bg-pink-500 hover:bg-pink-600"
          title="AMICO Comic"
          project={room.amico}
          busy={busy === 'amico'}
          error={errors.amico}
          onGenerate={() => runGeneration('amico')}
          onOpen={() => navigate(`/amico/${room.amico_project_id}`)}
        />
      </div>
    </div>
  );
}

function GenerateCard({ icon: Icon, tint, iconColor, btnClass, title, project, busy, error, onGenerate, onOpen }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 flex flex-col">
      <div className={`w-10 h-10 rounded-xl ${tint} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-400 font-medium mb-4 flex-1">
        {project ? project.title || 'Generated for this room.' : 'Not generated yet.'}
      </p>

      {error && <p className="text-red-500 font-bold text-xs mb-3">{error}</p>}

      {project ? (
        <button
          onClick={onOpen}
          className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          Open <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          onClick={onGenerate}
          disabled={busy}
          className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm text-white ${btnClass} disabled:opacity-60 transition-colors`}
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {busy ? 'Generating…' : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Generate
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================================
// QUIZ PANEL — generate + play a shared quiz
// ============================================================

function QuizPanel({ session, room, onRoomUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [player, setPlayer] = useState(null); // { questions, idx, selected, score }
  const [playerError, setPlayerError] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);

  const material = (room.shared_material || '').trim();

  const handleGenerate = async () => {
    if (!material) {
      setGenError('Add some shared material first.');
      return;
    }

    setGenerating(true);
    setGenError(null);

    try {
      const data = await generateQuiz({
        mode: 'material',
        materialText: material,
        language: 'en',
        numQuestions: 5,
        generateImages: true,
        generateVideos: false,
      });

      const linked = await linkRoomProject(room.room_code, {
        memberToken: session.memberToken,
        kind: 'quiz',
        projectId: data.project_id,
      });

      onRoomUpdate({ ...room, quiz_project_id: data.project_id, quiz: linked.quiz });
    } catch (err) {
      setGenError(err?.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const startPlaying = async () => {
    setPlayerLoading(true);
    setPlayerError(null);

    try {
      const project = await getLibraryProject(room.quiz_project_id);
      const questions = project?.data?.questions || [];

      if (!questions.length) {
        throw new Error('This quiz has no questions to show.');
      }

      setPlayer({ questions, idx: 0, selected: null, score: 0 });
    } catch (err) {
      setPlayerError(err?.message || 'Unable to load the shared quiz.');
    } finally {
      setPlayerLoading(false);
    }
  };

  const handleSelect = (i) => {
    if (player.selected !== null) return;
    setPlayer((p) => ({ ...p, selected: i, score: i === p.questions[p.idx].correct ? p.score + 1 : p.score }));
  };

  const handleNext = async () => {
    const isLast = player.idx === player.questions.length - 1;

    if (!isLast) {
      setPlayer((p) => ({ ...p, idx: p.idx + 1, selected: null }));
      return;
    }

    try {
      const updated = await submitRoomScore(room.room_code, {
        memberToken: session.memberToken,
        score: player.score,
        total: player.questions.length,
      });
      onRoomUpdate({ ...room, members: updated.members });
    } catch {
      // scoreboard update is best-effort — still show the player their result
    }

    setPlayer((p) => ({ ...p, idx: p.idx + 1 })); // idx === questions.length signals "finished"
  };

  if (player) {
    const finished = player.idx >= player.questions.length;

    if (finished) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="text-5xl mb-3">
            {player.score / player.questions.length >= 0.8 ? '🏆' : player.score / player.questions.length >= 0.5 ? '⭐' : '💪'}
          </div>
          <h2 className="font-bold text-slate-900 text-xl mb-1">
            You scored {player.score}/{player.questions.length}
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-5">
            Your score has been added to the room leaderboard.
          </p>
          <button
            onClick={() => setPlayer(null)}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Done
          </button>
        </div>
      );
    }

    const q = player.questions[player.idx];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Question {player.idx + 1}/{player.questions.length}
          </span>
          <button
            onClick={() => setPlayer(null)}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="font-bold text-slate-800 mb-4">{q.q}</p>

        {q.image_url && (
          <img
            src={mediaUrl(q.image_url)}
            alt={q.q}
            className="w-full max-h-52 object-contain rounded-xl border border-slate-100 mb-4"
          />
        )}

        <div className="space-y-2 mb-4">
          {(q.options || []).map((opt, idx) => {
            let cls = 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-purple-300';
            if (player.selected !== null) {
              if (idx === q.correct) cls = 'bg-green-50 border border-green-300 text-green-700';
              else if (idx === player.selected) cls = 'bg-red-50 border border-red-300 text-red-600';
              else cls = 'bg-slate-50 border border-slate-100 text-slate-400';
            }
            return (
              <button
                key={idx}
                disabled={player.selected !== null}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${cls}`}
              >
                {opt}
                {player.selected !== null && idx === q.correct && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {player.selected !== null && idx === player.selected && idx !== q.correct && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {player.selected !== null && (
          <button
            onClick={handleNext}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            {player.idx === player.questions.length - 1 ? 'Finish' : 'Next →'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <Puzzle className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="font-bold text-slate-900">Shared quiz</h2>
      </div>

      {!room.quiz ? (
        <>
          <p className="text-sm text-slate-500 font-medium mb-4">
            Generate a quiz from the shared material — everyone in the room can play it and land on the leaderboard.
          </p>
          {genError && <p className="text-red-500 font-bold text-xs mb-3">{genError}</p>}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
            {generating ? 'Generating…' : (
              <>
                <Sparkles className="w-4 h-4" /> Start Shared Quiz
              </>
            )}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500 font-medium mb-4">
            "{room.quiz.title || 'Room Quiz'}" is ready. Play it and your score joins the leaderboard.
          </p>
          {playerError && <p className="text-red-500 font-bold text-xs mb-3">{playerError}</p>}
          <button
            onClick={startPlaying}
            disabled={playerLoading}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {playerLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {playerLoading ? 'Loading…' : 'Play Quiz'}
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================
// CHAT PANEL — simple, non-real-time group chat
// ============================================================

function ChatPanel({ session, room }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const loadMessages = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    getRoomMessages(room.room_code)
      .then((data) => {
        setMessages(data.messages || []);
        setError(null);
      })
      .catch((err) => {
        if (!silent) setError(err?.message || 'Unable to load messages.');
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [room.room_code]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => loadMessages(true), CHAT_POLL_MS);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setSending(true);
    try {
      const data = await sendRoomMessage(room.room_code, {
        memberToken: session.memberToken,
        message: text,
      });
      setMessages((prev) => [...prev, data.message]);
      setInput('');
    } catch (err) {
      setError(err?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-4.5 h-4.5 text-slate-400" /> Discussion
        </h2>
        <button onClick={() => loadMessages()} title="Refresh" className="text-slate-300 hover:text-slate-500 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto space-y-3 pr-1 mb-4">
        {loading && (
          <div className="h-full flex items-center justify-center text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {!loading && error && messages.length === 0 && (
          <p className="text-red-400 font-semibold text-sm text-center py-8">{error}</p>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="text-slate-400 font-medium text-sm text-center py-8">
            No messages yet — say hello 👋
          </p>
        )}

        {messages.map((m) => {
          const mine = m.sender_name === session.displayName;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {!mine && <p className="text-[11px] font-bold opacity-70 mb-0.5">{m.sender_name}</p>}
                <p className="text-sm font-medium whitespace-pre-wrap break-words">{m.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-300 transition-all"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// CONFIRM MODAL (leave room)
// ============================================================

function ConfirmModal({ title, body, confirmLabel, busy, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={() => (!busy ? onCancel() : null)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{body}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
