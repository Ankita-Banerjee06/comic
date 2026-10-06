# VLQ — MVP Spec Notes

Running capture of MVP requirements as they're provided, before implementation. Nothing in this file has been built yet — it's a holding area so requirements aren't lost between sessions. Numbering follows the order items were given.

---

## 2. AMIVI — System Generated Only for MVP

**Status: implemented** (backend + frontend, shipped to `main.py` and `Amivi.jsx`).

The existing **Custom Generated** facility may remain available in the architecture, but it is **not** the priority MVP journey. The MVP should demonstrate **System Generated** results clearly and reliably.

### System Prompt 1 — INTRODUCE

Generate separate individual Chunks/Microbits for [SUBJECT]. Choose the natural number of essential Key Points required by the subject; do not force a fixed number.

Each Microbit should contain:
1. One essential Key Point Name
2. One relevant image
3. One memorable slogan — maximum 4 words

Generate each Microbit separately so it can be individually selected and presented for teaching.

Do not combine the Microbits into one poster or image.

### System Prompt 2 — EXPLAIN

Using the same Chunks/Microbits and Key Points generated in INTRODUCE, generate a short, clear explanation for each individual Microbit.

Keep the same Key Point Name and, wherever possible, the same image or visual identity used in INTRODUCE, so the learner recognises and reinforces the same visual memory.

Each explanation should describe only the essential information needed to understand that Key Point, using simple, concise language appropriate to the subject and learner.

Keep every Microbit separate and individually selectable, so a teacher can click and present each one individually.

Do not combine the Microbits into one poster, image, or long explanation.

### How this was implemented (v1)

- **Backend** (`backend/main.py`): `generate_amivi_content()` now runs the INTRODUCE prompt — natural number of Microbits, each with just a Key Point Name, image, and ≤4-word slogan; the old forced 5–10 count and the combined "Complete Visual" final chunk were removed. A new `generate_amivi_explanation()` function + `/api/amivi/explain_chunk` endpoint implement EXPLAIN — called per Microbit, on demand.
- **Frontend** (`frontend/src/pages/Amivi.jsx`, `frontend/src/services/api.js`): each generated Microbit card now has an "AMIVI Explain" button. Clicking it calls the new endpoint for just that Microbit and shows the explanation inline — nothing is explained in bulk up front, so a teacher can click and present each Microbit individually. The "Prompt Type" info box was simplified to two clean, friendly cards (① INTRODUCE, ② AMIVI EXPLAIN) instead of the old technical field-list; the full prompt wording lives only in the backend.

### v2 — Two connected stages, detailed image spec, separate result boxes

**Status: implemented.**

Updated requirement: INTRODUCE and EXPLAIN must behave as two connected stages of the same lesson, each with its own clearly separate, always-visible result area (never overwriting each other), plus a precise spec for what the generated *images* themselves must look like, plus an optional third "Complete Visual" stage.

- **Image spec (INTRODUCE)**: each Microbit's image must be a concrete, literal illustration of only that Key Point (e.g. "a healthy green plant with sunlight clearly shining on its leaves" style, not abstract/decorative), simple/clear/colourful, visually communicating the concept before the learner reads any text, text-free (no labels/captions inside the image), and in one consistent illustration style across the whole set.
- **EXPLAIN**: unchanged in behavior, but prompt wording tightened to explicitly forbid re-analysing the material or inventing new Key Points — it strictly reuses the stored Key Point, slogan, and image from INTRODUCE.
- **Two separate UI boxes**: Box 1 (INTRODUCE: Image + Key Point + Slogan) and Box 2 (EXPLAIN: same Image + same Key Point + same Slogan + explanation) are now rendered as two distinct sections on the page — generating/viewing EXPLAIN for a Microbit never touches or hides its Box 1 card.
- **Box 3 — Complete Visual (optional)**: new third stage. A "Generate Complete Visual" button calls a new backend function (`generate_amivi_complete_visual_prompt`) + endpoint (`/api/amivi/generate_complete_visual`) that writes one image prompt connecting all the Key Points (arrows/sequence/cause-and-effect) and generates a single new illustration — never a collage of the existing Microbit images, and never replacing Boxes 1 or 2.

### v3 — Box 2 card layout matches the "same visual, deeper understanding" spec

**Status: implemented.**

Both Box 1 and Box 2 cards now show the Key Point Name and the Slogan as two separate visible lines (previously only one of the two showed, via a fallback chain) — matching the spec's worked example exactly: image → Key Point Name → Slogan → (Box 2 only) a 1–3 sentence explanation. The EXPLAIN backend prompt was tightened to specify "around 1 to 3 short sentences" instead of the vaguer "a few sentences."

### v4 — Bigger card text, no re-clicking EXPLAIN, Microbit paging

**Status: implemented.**

- **Bigger text**: Key Point, Slogan and the Box 2 explanation text are all a size up in both Box 1 and Box 2 cards, for easier reading/presenting.
- **Never re-ask for an explanation that already exists**: a Microbit's EXPLAIN result now shows automatically wherever it's already known — reopening a project from the Library, or anywhere else `result.chunks` carries a `description` — instead of showing the "AMIVI Explain" button again. (This relies on the EXPLAIN result now being saved onto the Microbit itself, from the AMIVI → AMICO integration work above — previously it only lived in the page's temporary state.)
- **Microbit paging**: Box 1 and Box 2 now show 6 Microbits per page (3 per row × 2 rows) with Previous / page-number / Next controls, instead of one long scroll — a 7th Microbit starts page 2, and so on. Both boxes page together, and "Select All" still selects every Microbit across all pages, not just the visible ones.

### v5 — EXPLAIN is automatic, not a click

**Status: implemented.**

The "AMIVI Explain" button is gone. Each Microbit's explanation is now generated right away, as part of the same generation request that produces its image and slogan — using that Microbit's own Key Point and Slogan as the basis, same as before, just no longer gated behind an individual click. Box 2 simply shows the explanation for every Microbit as soon as generation finishes; if one somehow has none (a one-off failure), it shows a plain "not available" note instead of a retry button. The on-demand `/api/amivi/explain_chunk` endpoint and its backing function are left in place (still used as a safety-net fallback when AMICO builds its package and finds an un-explained Microbit), but the AMIVI page itself no longer calls it.

### v6 — Image composition: subject fully in frame, slogan drives the scene

**Status: implemented.**

Two added rules in the INTRODUCE image prompt instructions (`generate_amivi_content()` in `main.py`), covering both of a Microbit's images (the second, alternate-angle image explicitly reuses the same requirements):

- **The slogan is the main topic of the picture.** The scene is now built directly around what the slogan is saying, so the single clearest visual idea in the image matches the slogan's idea, instead of a generic or loosely-related illustration of the Key Point.
- **No more half-cropped characters.** Any character, person, animal, or main subject must be fully contained inside the frame and roughly centered, with visible background margin on every side — the prompt explicitly tells the image model to show the entire subject, never cropped, cut off, or extending past the image's edges.

Regenerating a single Microbit's image (the "regenerate" action) reuses that Microbit's already-generated `image_prompt`, so it automatically carries these same rules — no separate change needed there.

### v7 — Fixed: half the picture being cropped off in Box 1 / Box 2 / fullscreen

**Status: implemented.**

Root cause: every AMIVI image is generated as a perfect square (`generate_image()` always requests `1024x1024` from the image model — this is shared by AMICO, avatars and quiz images too, so it wasn't changed). The card, however, displays it in a tall 11.7 × 14.7 box using CSS `object-cover`, which fills that whole box by scaling to the box's *height* and then crops whatever overflows the width — cutting off the left/right edges of the square image (e.g. a character standing at the edge of the scene, like the robot in the "Bias" Microbit). Box 1, Box 2 and the fullscreen viewer now use `object-contain` instead, so the full image is always shown, letterboxed against the card's existing light-gray background rather than cropped. No backend change was needed (and the shared image-size default was deliberately left alone, since AMICO/avatars/Quiz also depend on it).

### v8 — Faster generation: each Microbit's work now happens at the same time instead of one step after another

**Status: implemented.**

Feedback: generating a project was taking a long time.

Root cause: for every Microbit, the backend was doing four separate network calls — generate its explanation, generate its main image, generate its optional second image, generate its narration audio — one after another, waiting for each to fully finish before starting the next. None of these four actually depend on each other (the explanation doesn't need the image, the audio doesn't need the explanation, etc.), so doing them one-by-one was pure wasted waiting. This got a bit worse earlier this session when explanation generation was moved to happen automatically for every Microbit (v5) — that added a fourth sequential step where there used to be three.

Fix: inside `process_amivi_chunk()` in `main.py`, these four calls now fire at the same time (a small worker pool per Microbit, alongside the existing pool that already processes multiple Microbits at once) and the chunk just waits for whichever one finishes last, instead of adding up all four wait times. Every existing fallback behavior is unchanged — a failed image, a failed audio clip, or a failed explanation still doesn't crash the rest of that Microbit or the project; it just quietly skips that one piece, same as before.

Net effect: a project with several Microbits should now take roughly as long as its *slowest single step*, not the sum of all steps across all Microbits.

### v9 — Each Microbit's picture should still show it belongs to the subject, not just its own isolated idea

**Status: implemented.**

Feedback: when a subject is given, the Key Point pictures should carry the main gist of the subject — so that anyone can tell what the subject is just from looking at the pictures.

Previously, the image-generation instructions in `generate_amivi_content()` (`main.py`) explicitly told the image model to depict *only* that one Key Point's concept and nothing from "the overall subject" — meant to keep each card focused and uncluttered, but it also meant a card's picture could end up generic enough (e.g. a plain plant, a lone person) that, on its own, it gave no hint of what the broader subject actually was.

Fix: that rule now asks for both at once — stay focused on this Key Point's own idea (never pull in other Key Points' content), but ground the scene in a setting, objects, characters, era, or symbols that come from the subject itself. So flipping through just the pictures — no Key Point text, no slogan — should still be enough to tell what general subject the whole set belongs to, not only recognize each isolated idea on its own. This applies automatically to every new AMIVI generation; nothing else needed to change, since the image model already receives the full subject text in the same call.

---

## 4. AMIVI → AMICO Integration

**Status: implemented** (backend + frontend, shipped to `main.py` and `Amivi.jsx`).

- SEND TO AMICO should transfer the completed EXPLAIN / Box 2 package automatically.
- Transferred package: Subject + Essential Key Points + Sequence + Images/visual anchors + Slogans + Brief Descriptions.
- AMICO should transform this existing learning package into creative engagement; it should not re-analyse the original source.
- The same saved package should also remain available later through Import from AMIVI / Select AMIVI Material.
- No retyping should be required between AMIVI and AMICO.

### How this was implemented

- **EXPLAIN results now persist to the database.** Previously, clicking "AMIVI Explain" generated an explanation but only kept it in the AMIVI page's temporary browser state — it was never saved, so it didn't actually exist anywhere AMICO (or a page reload) could see it. `/api/amivi/explain_chunk` now saves each explanation onto its Microbit row (`update_amivi_chunk_description`) as soon as it's generated.
- **"Send to AMICO" (the AMICO quick-action button on the AMIVI results page, relabelled from "AMICO" to "Send to AMICO") still just passes the AMIVI project's id** — but the backend's handling of that id changed completely:
  - `/api/amico/generate` no longer re-fetches and re-analyses the AMIVI project's original raw material when it comes from an AMIVI project. Instead, it builds a structured package straight from the saved Microbits: Subject, then every essential Key Point **in sequence**, each with its Slogan, a note that it already has its own AMIVI illustration ("visual anchor"), and its Brief Explanation.
  - Any Microbit that wasn't individually explained yet (a teacher can still click through Box 2 one at a time, or skip straight to AMICO) is explained automatically at this point and saved back to the database — so the package AMICO receives is always the **complete** EXPLAIN package, never a partial one, and no explaining has to happen again later.
  - This package — not the original subject text — is what's sent to AMICO's story-writing step, together with an explicit instruction that this is already-finished material: don't re-analyse the subject, don't invent/merge/reorder/rename Key Points, just transform the given sequence into a connected comic story.
- **"Import from AMIVI" / "Select AMIVI Material"** (on the AMICO page) already existed and already reads from the saved AMIVI project by id, so the same completed package is available there too, any time later — not just right after generating in AMIVI. Nothing needed to change there.
- **No retyping**: both paths (the AMIVI "Send to AMICO" button, and manually picking a project under "Import from AMIVI" on the AMICO page) only ever pass a project id — the teacher never re-types the subject, key points, slogans or explanations.

---

## 6. Language — Keep the MVP Simple

**Status: implemented.**

- English = default.
- Spanish = the only additional MVP language.
- Design the structure so more languages can be added later; do not add them now.
- Do not make multilingual video/audio a requirement for this MVP completion.
- Language work must not delay the core AMIVI → AMICO journey.

### How this was implemented

The content-generation side (AMIVI, AMICO, Quiz prompts) already took a `language` parameter and already special-cased `"es"` vs. everything else defaulting to English (`get_language_instruction()` in `main.py`) — that part of the spec was already satisfied going in.

What wasn't satisfied: there was no working way for a person to actually switch the app to Spanish.
- The Navbar's language control (`LanguageSwitcher` in `Navbar.jsx`) was a plain, hardcoded "English" label with a comment saying "nothing to switch to yet" — not a dropdown, not wired to anything.
- The Settings page had a language `<select>`, but it wasn't connected to the app's real language state either, and it listed **French** as an option — a language the app has no translations for and that the spec says not to add yet.

Fixed with the smallest change that makes both controls real and keeps them in sync automatically (they already share the same `LanguageContext`/`localStorage` state, so changing the language in one place updates the other):
- Added one `SUPPORTED_LANGUAGES` list (`[{code: 'en', label: 'English'}, {code: 'es', label: 'Español'}]`), exported from `LanguageContext.jsx` next to the existing `translations` object. This is the "structure for more languages later" the spec asks for — adding a third language later means adding its block to `translations` and one entry to this list, nothing else.
- `Navbar.jsx`'s `LanguageSwitcher` is now a real dropdown bound to `useLanguage()`'s `language`/`setLanguage`, rendering from `SUPPORTED_LANGUAGES`.
- `Settings.jsx`'s language `<select>` is now wired to the same `language`/`setLanguage`, also rendering from `SUPPORTED_LANGUAGES` — so French is gone, and picking a language here actually changes it.

Multilingual audio/video was deliberately left untouched (narration already passes `language` through to voice generation, best-effort, same as before) — per the spec, that's explicitly not required for MVP completion, and widening language support further wasn't pursued, per "must not delay the core AMIVI → AMICO journey."

---

*(Add further numbered items / system prompts below as they're provided.)*
