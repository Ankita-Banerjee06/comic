import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Palette,
  Radio,
  Loader2,
  Save,
  Plus,
  Trash2,
  Upload,
  Images,
  X,
  Type,
  LayoutTemplate,
  Check,
} from 'lucide-react';

import {
  listDesigns,
  saveDesign,
  deleteDesign,
  uploadClassroomMedia,
  getClassroomLibraryProjects,
  getLibraryProject,
  startLive,
  mediaUrl,
} from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import DesignCanvas, { DEFAULT_DESIGN, LAYOUTS } from './DesignCanvas';

const BACKGROUNDS = ['#0f172a', '#1e3a8a', '#4c1d95', '#831843', '#065f46', '#7c2d12', '#ffffff', '#fef3c7', '#e0f2fe', '#fce7f3'];
const TEXT_COLORS = ['#ffffff', '#000000', '#facc15', '#22d3ee', '#f472b6', '#4ade80', '#fb923c', '#1e3a8a'];
const SIZE_PRESETS = [
  { label: 'S', value: 18 },
  { label: 'M', value: 24 },
  { label: 'L', value: 34 },
  { label: 'XL', value: 46 },
];

function freshDesign() {
  return JSON.parse(JSON.stringify(DEFAULT_DESIGN));
}

function imageSrc(path) {
  if (!path) return '';
  return path.startsWith('/api/') || path.startsWith('http') ? mediaUrl(path) : path;
}

// Little picture of each layout for the picker buttons.
function LayoutIcon({ layout }) {
  const box = 'bg-current rounded-[2px]';
  if (layout === 'spotlight') {
    return (
      <div className="grid grid-cols-4 grid-rows-2 gap-0.5 w-12 h-7">
        <div className={`${box} col-span-2 row-span-2`} />
        <div className={box} /><div className={box} /><div className={box} /><div className={box} />
      </div>
    );
  }
  const rows = layout === '3-2' ? [3, 2] : layout === '2-3' ? [2, 3] : [5];
  return (
    <div className="flex flex-col justify-center gap-0.5 w-12 h-7">
      {rows.map((n, r) => (
        <div key={r} className="flex justify-center gap-0.5 flex-1">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className={box} style={{ width: `${100 / Math.max(...rows) - 4}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ColorRow({ label, colors, value, onChange }) {
  return (
    <div>
      <p className="text-base font-bold text-black mb-2">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={c}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
              value.toLowerCase() === c ? 'border-rose-500 ring-2 ring-rose-300' : 'border-slate-300'
            }`}
            style={{ background: c }}
          >
            {value.toLowerCase() === c && <Check className="w-4 h-4" style={{ color: c === '#ffffff' || c.startsWith('#f') ? '#000' : '#fff' }} />}
          </button>
        ))}
        <label className="inline-flex items-center gap-2 text-base font-bold text-black cursor-pointer">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-slate-300" />
          {value.toUpperCase()}
        </label>
      </div>
    </div>
  );
}

// Pick a picture from the teacher's own AMIVI lessons / AMICO comics.
function LessonImagePicker({ classCode, memberToken, onPick, onClose }) {
  const { t } = useLanguage();
  const [kind, setKind] = useState('amivi');
  const [projects, setProjects] = useState(null);
  const [images, setImages] = useState(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProjects(null);
    setImages(null);
    getClassroomLibraryProjects(classCode, memberToken, kind)
      .then((d) => setProjects(d.projects || []))
      .catch((err) => { setProjects([]); setError(err?.message); });
  }, [classCode, memberToken, kind]);

  const openProject = async (id) => {
    setLoadingImages(true);
    setError(null);
    try {
      const project = await getLibraryProject(id);
      const data = project.data || {};
      let list = [];
      if (kind === 'amivi') {
        list = (data.chunks || []).map((c) => ({ url: c.image_url, caption: c.key_point || c.slogan || '' }));
        if (data.complete_visual_image_url) list.push({ url: data.complete_visual_image_url, caption: '' });
      } else {
        list = [
          ...(data.pages || []).map((p) => ({ url: p.comic_image_url || p.image_url, caption: '' })),
          ...(data.panels || []).map((p) => ({ url: p.image_url, caption: p.title || '' })),
        ];
      }
      setImages(list.filter((x) => x.url));
    } catch (err) {
      setError(err?.message || t('Unable to load this lesson.'));
    } finally {
      setLoadingImages(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-xl font-extrabold text-black">{t('Choose an image from your lessons')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex gap-2">
            {[{ k: 'amivi', l: 'AMIVI lesson' }, { k: 'amico', l: 'AMICO comic' }].map(({ k, l }) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`px-4 py-2 rounded-xl text-base font-bold border-2 ${kind === k ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-200 text-black'}`}
              >
                {t(l)}
              </button>
            ))}
          </div>

          {images ? (
            <>
              <button onClick={() => setImages(null)} className="text-base font-bold text-rose-600">← {t('Back to list')}</button>
              {images.length === 0 ? (
                <p className="text-base font-semibold text-black">{t('This one has no images yet.')}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => onPick(img)}
                      className="rounded-xl border-2 border-slate-200 hover:border-rose-500 overflow-hidden bg-slate-50 aspect-video"
                    >
                      <img src={imageSrc(img.url)} alt="" loading="lazy" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : loadingImages || projects === null ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>
          ) : projects.length === 0 ? (
            <p className="text-base font-semibold text-black">{t('Nothing saved in your Library yet')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProject(p.id)}
                  className="text-left px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-base font-bold text-black"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-base font-semibold text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ClassroomDesigner({ classCode, memberToken }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [designs, setDesigns] = useState(null);
  const [designId, setDesignId] = useState(null);
  const [title, setTitle] = useState('');
  const [design, setDesign] = useState(freshDesign);
  const [selected, setSelected] = useState(0);
  const [dirty, setDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [uploading, setUploading] = useState(null); // card index
  const [pickerFor, setPickerFor] = useState(null); // card index
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const loadDesigns = useCallback(() => {
    listDesigns(classCode, memberToken)
      .then((d) => setDesigns(d.designs || []))
      .catch((err) => { setDesigns([]); setError(err?.message); });
  }, [classCode, memberToken]);

  useEffect(() => { loadDesigns(); }, [loadDesigns]);

  const update = (patch) => {
    setDesign((d) => ({ ...d, ...patch }));
    setDirty(true);
    setMessage(null);
  };

  const updateCard = (index, patch) => {
    setDesign((d) => ({ ...d, cards: d.cards.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
    setDirty(true);
    setMessage(null);
  };

  const openDesign = (d) => {
    setDesignId(d.id);
    setTitle(d.title);
    setDesign({ ...freshDesign(), ...d.data });
    setSelected(0);
    setDirty(false);
    setError(null);
    setMessage(null);
  };

  const newDesign = () => {
    setDesignId(null);
    setTitle('');
    setDesign(freshDesign());
    setSelected(0);
    setDirty(false);
    setError(null);
    setMessage(null);
  };

  const persist = async () => {
    const saved = await saveDesign(classCode, {
      memberToken,
      designId,
      title: title.trim() || t('Untitled design'),
      data: design,
    });
    setDesignId(saved.id);
    setTitle(saved.title);
    setDirty(false);
    setDesigns((list) => [saved, ...(list || []).filter((x) => x.id !== saved.id)]);
    return saved;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await persist();
      setMessage(t('Design saved.'));
    } catch (err) {
      setError(err?.message || t('Unable to save this design.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePresent = async () => {
    if (!design.cards.some((c) => c.image_url || c.caption)) {
      setError(t('Add at least one image or caption before presenting.'));
      return;
    }
    setPresenting(true);
    setError(null);
    try {
      const saved = await persist();
      await startLive(classCode, { memberToken, kind: 'design', projectId: saved.id });
      navigate(`/classroom/live/${classCode}`, {
        state: { memberToken, role: 'teacher', from: location.pathname },
      });
    } catch (err) {
      setError(err?.message || t('Unable to start presenting.'));
      setPresenting(false);
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(t('Delete this design?'))) return;
    try {
      await deleteDesign(classCode, d.id, memberToken);
      setDesigns((list) => (list || []).filter((x) => x.id !== d.id));
      if (designId === d.id) newDesign();
    } catch (err) {
      setError(err?.message || t('Unable to delete this design.'));
    }
  };

  const startUpload = (index) => {
    setSelected(index);
    fileRef.current?.click();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('Please choose an image file.'));
      return;
    }
    const index = selected;
    setUploading(index);
    setError(null);
    try {
      const res = await uploadClassroomMedia(classCode, { memberToken, file });
      updateCard(index, { image_url: res.url });
    } catch (err) {
      setError(err?.message || t('Failed to upload that file.'));
    } finally {
      setUploading(null);
    }
  };

  const card = design.cards[selected] || { image_url: '', caption: '' };

  return (
    <div className="space-y-6">
      {/* Header + saved designs */}
      <div className="bg-gradient-to-br from-fuchsia-50 via-white to-sky-50 rounded-2xl border-2 border-fuchsia-200 border-l-8 border-l-fuchsia-500 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-black flex-1">{t('Classroom Designer')}</h3>
          <button
            onClick={newDesign}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-fuchsia-300 bg-white text-black font-bold text-base hover:bg-fuchsia-50"
          >
            <Plus className="w-5 h-5" /> {t('New design')}
          </button>
        </div>
        <p className="text-lg font-semibold text-black mb-4">
          {t('Choose images and a layout, set the colours and text size, then click PRESENT to show it on every student’s screen.')}
        </p>

        {designs === null ? (
          <Loader2 className="w-5 h-5 animate-spin text-black" />
        ) : designs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {designs.map((d) => (
              <div
                key={d.id}
                className={`inline-flex items-center rounded-xl border-2 overflow-hidden ${
                  designId === d.id ? 'border-fuchsia-500 bg-fuchsia-500 text-white' : 'border-slate-200 bg-white text-black'
                }`}
              >
                <button onClick={() => openDesign(d)} className="px-3 py-2 text-base font-bold">
                  {d.title}
                </button>
                <button
                  onClick={() => handleDelete(d)}
                  title={t('Delete')}
                  className={`px-2 py-2 ${designId === d.id ? 'hover:bg-fuchsia-600' : 'hover:bg-red-50 text-red-600'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base font-semibold text-black">{t('No saved designs yet — start with the board below.')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Controls */}
        <div className="xl:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-5 space-y-4">
            <label className="block">
              <span className="block text-base font-bold text-black mb-1.5">{t('Design name')}</span>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
                placeholder={t('e.g. Parts of a Plant')}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-lg font-semibold text-black focus:outline-none focus:border-fuchsia-400"
              />
            </label>
            <label className="block">
              <span className="block text-base font-bold text-black mb-1.5">{t('Heading on the board (optional)')}</span>
              <input
                value={design.heading}
                onChange={(e) => update({ heading: e.target.value })}
                placeholder={t('e.g. The Water Cycle')}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-lg font-semibold text-black focus:outline-none focus:border-fuchsia-400"
              />
            </label>
          </div>

          <div className="bg-white rounded-2xl border-2 border-indigo-200 border-t-8 border-t-indigo-500 shadow-sm p-5">
            <p className="text-lg font-extrabold text-black mb-3 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-indigo-600" /> {t('Layout')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => update({ layout: l.key })}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left text-base font-bold ${
                    design.layout === l.key ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200 text-black hover:border-indigo-300'
                  }`}
                >
                  <span className={design.layout === l.key ? 'text-white' : 'text-indigo-500'}>
                    <LayoutIcon layout={l.key} />
                  </span>
                  {t(l.label)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-amber-200 border-t-8 border-t-amber-500 shadow-sm p-5 space-y-5">
            <ColorRow label={t('Background colour')} colors={BACKGROUNDS} value={design.background} onChange={(c) => update({ background: c })} />
            <ColorRow label={t('Text colour')} colors={TEXT_COLORS} value={design.textColor} onChange={(c) => update({ textColor: c })} />
            <div>
              <p className="text-base font-bold text-black mb-2 flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-600" /> {t('Text size')}: <span className="text-amber-700">{design.textSize}</span>
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={12}
                  max={72}
                  value={design.textSize}
                  onChange={(e) => update({ textSize: Number(e.target.value) })}
                  className="flex-1 accent-amber-500"
                />
                {SIZE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => update({ textSize: p.value })}
                    className={`w-11 h-10 rounded-lg text-base font-extrabold border-2 ${
                      design.textSize === p.value ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-black'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-teal-200 border-t-8 border-t-teal-500 shadow-sm p-5">
            <p className="text-lg font-extrabold text-black mb-3 flex items-center gap-2">
              <Images className="w-5 h-5 text-teal-600" /> {t('Images')}
            </p>
            <div className="flex gap-2 mb-4">
              {design.cards.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`relative flex-1 aspect-square rounded-xl border-2 overflow-hidden bg-slate-50 flex items-center justify-center text-lg font-extrabold ${
                    selected === i ? 'border-teal-500 ring-2 ring-teal-300' : 'border-slate-200'
                  }`}
                >
                  {c.image_url ? <img src={imageSrc(c.image_url)} alt="" className="w-full h-full object-cover" /> : <span className="text-black">{i + 1}</span>}
                  {uploading === i && (
                    <span className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-black" /></span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-base font-bold text-black mb-2">{t('Card')} {selected + 1}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => startUpload(selected)}
                disabled={uploading !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-base font-bold"
              >
                <Upload className="w-4 h-4" /> {t('Upload image')}
              </button>
              <button
                onClick={() => setPickerFor(selected)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-teal-300 bg-white hover:bg-teal-50 text-black text-base font-bold"
              >
                <Images className="w-4 h-4 text-teal-600" /> {t('From my lessons')}
              </button>
              {card.image_url && (
                <button
                  onClick={() => updateCard(selected, { image_url: '' })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-base font-bold"
                >
                  <X className="w-4 h-4" /> {t('Remove image')}
                </button>
              )}
            </div>
            <input
              value={card.caption}
              onChange={(e) => updateCard(selected, { caption: e.target.value })}
              maxLength={200}
              placeholder={t('Caption for this card (optional)')}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-lg font-semibold text-black focus:outline-none focus:border-teal-400"
            />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </div>

        {/* Live preview */}
        <div className="xl:col-span-7 xl:sticky xl:top-6 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-4">
            <p className="text-base font-bold text-black mb-3">{t('Preview — click a card to edit it')}</p>
            <DesignCanvas design={design} selectedIndex={selected} onSelectCard={setSelected} showEmpty />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePresent}
              disabled={presenting || saving}
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-60 text-white text-2xl font-extrabold tracking-wider rounded-2xl px-6 py-4 shadow-lg"
            >
              {presenting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Radio className="w-7 h-7" />}
              {t('PRESENT')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || presenting}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 text-black text-lg font-bold"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {t('Save')}
            </button>
          </div>
          {dirty && !error && <p className="text-base font-semibold text-amber-700">{t('Unsaved changes — PRESENT saves automatically.')}</p>}
          {message && <p className="text-base font-bold text-green-700">{message}</p>}
          {error && <p className="text-base font-bold text-red-600">{error}</p>}
        </div>
      </div>

      {pickerFor !== null && (
        <LessonImagePicker
          classCode={classCode}
          memberToken={memberToken}
          onClose={() => setPickerFor(null)}
          onPick={(img) => {
            updateCard(pickerFor, { image_url: img.url, ...(design.cards[pickerFor]?.caption ? {} : { caption: img.caption || '' }) });
            setPickerFor(null);
          }}
        />
      )}
    </div>
  );
}
