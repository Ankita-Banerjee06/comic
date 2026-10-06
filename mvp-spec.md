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

## 5. AMICO — MVP Scope

**Status: implemented.**

- KEEP the existing Comic controls: AMIVI import, Paste Text, Panels, Pages, Layout and optional Character Avatar.
- Comic generation must work reliably from the transferred AMIVI package.
- Activate/connect Photo Story so it can be tested end-to-end.
- Use one consistent name for the feature; recommended MVP label: PHOTO STORY.
- Clean duplicate or unclear AMIVI package names in the selection list where practical.

### How this was implemented

- **Existing Comic controls** (Import from AMIVI / Paste Text source tabs, Panels per page, Pages, Layout, optional Character Avatar) were checked against `Amico.jsx` and are all still present and untouched — nothing here needed to change.
- **Comic generation from the transferred AMIVI package** was already made reliable earlier this session (see section 4 above): `/api/amico/generate` builds a structured package from the AMIVI project's saved Microbits (Subject + Key Points in sequence + slogans + explanations), auto-fills any Microbit that was never individually explained so the package is always complete, and falls back to the project's raw text only if it somehow has no saved Microbits at all.
- **Photo Story was already fully built and wired end-to-end** on inspection — upload a photo → `/api/amico/photostory/generate` → Terra describes the photo and picks an educational process/cycle to diagram → writes a panel-by-panel diagram story → Sol reviews it → each panel's image generates in parallel → the pages compose and save, same pattern as the AMICO comic pipeline. It just hadn't been given a trial run; nothing in the code needed fixing for it to work. What *was* actually missing was findability: the tab that opens it was labeled **"Visual Story"** everywhere in the UI while every other label, button, and message for the same feature (`"Generate Photo Story"`, `"Photo Story Generated!"`, download filenames, etc.) called it **"Photo Story"** — the one mismatched tab made the feature look like it might not exist. Renamed that tab to "Photo Story" so the whole feature now uses one consistent name throughout, as asked.
- **Duplicate/unclear AMIVI package names**: the "Select AMIVI Material" dropdown showed each project's auto-generated title as-is. Since AMIVI titles are short 2-word summaries, two different lessons can easily land on the exact same title (e.g. two separate "Photosynthesis" projects from different classes or test runs), making them impossible to tell apart in the list. The dropdown now detects when a title repeats and appends that project's own id to disambiguate it (e.g. "Photosynthesis (#12)" / "Photosynthesis (#15)"); a project with no title at all still falls back to "Learning Package #<id>" as before. Titles that aren't duplicated stay exactly as they were — clean and unchanged.

### Photo Story page follow-up fixes (from direct feedback on the rendered output)

Three rounds of feedback on the actual generated Photo Story sheet (`render_photostory_page()` in `main.py`), each fixed in turn:
- Text and photos read as too small → panel title and caption fonts both increased substantially (~70% larger than the original), with more canvas room added so neither got clipped.
- Panel titles ("Plan the Story", "Choose Meaningful Gestures", etc.) were showing in a rotating color palette (pink, blue, orange, green, purple, teal) instead of black, even though the rest of the page had already been fixed to black — the per-panel palette color was still being used for just that one piece of text. Now pure black, matching the caption beneath it; the now-unused color palette was removed.
- The page was shaped like a tall A4 sheet, so on a normal screen it rendered as a narrow strip with large empty margins on either side. Panels now arrange 3-per-row instead of 2 (a Photo Story's panels, unlike a comic's, have no strict left-to-right reading pair-up, so this is safe), and the page's height is now calculated directly from how much room its own content needs rather than forced into A4 proportions — a 6-panel story now comes out close to square, filling a normal screen's width instead of leaving it mostly empty.

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

## 7. AMICO — Visual Storytelling Engine (vision)

**Status: first MVP slice implemented** (the launcher screen). The rest of the vision below is captured but deliberately not built yet — see "What was built" at the end of this section for exactly where the line was drawn, and why.

> AMICO isn't merely a comic generator. It is a visual storytelling engine. Choose what you want to create. Choose how you want it to look. AMICO helps you bring the story to life.

Proposed flow:

- **AMICO >> begin >> "What would you like to create?"** — a choice of content type: **Comic | Photo Story | Biography | Diary | My Own Story**.
- **Creation tools**, in sequence: 1. choose number of panels → 2. choose layout → 3. choose/create avatars → 4. choose background → 5. preview → Use/Discard → 6. create.
- Every one of those choices should be made **visual rather than textual** — e.g. a small photograph representing Biography, a comic panel representing Comic, a diary-style image for Diary, and beautiful thumbnails for background options like Seaside, Garden, Breakfast Table, etc. — not plain dropdown text.
- Explicitly called out: keep the MVP version **deliberately small and beautiful** — demonstrate the possibility, don't try to build every creation tool right now.
- Preserve the **USE / DISCARD** step and "see it before you create it" — i.e. a preview the teacher can accept or throw away before the final comic/story is generated.

What this means against what exists today: Comic and Photo Story already exist as working content types (panels, layout, and avatars already exist as controls for Comic). **Biography, Diary, and "My Own Story" do not exist yet** — no backend generation path, no UI — and neither does a **background chooser** or a **preview-before-create / Use-Discard step**; today's flow goes straight from the generate button to the final result. A unified "what would you like to create?" launcher screen, with visual tiles instead of the current two text tabs, also doesn't exist yet.

This is a meaningfully larger build than the fixes made elsewhere in this document today, and the note itself says to keep the MVP slice small rather than build the whole thing at once, so this was scoped deliberately rather than attempted all at once.

### What was built

Asked where to start, the direction given back was "where it would look good" — read as: prioritize whichever slice makes the vision itself visible and demonstrable, since that's literally what "we demonstrate the possibility" calls for. That pointed at the launcher screen over the other two candidates (a Use/Discard preview step, or swapping today's existing text controls for visual pickers) — the launcher is the one piece that shows the *whole* vision (all 5 content types, presented visually) in a single screen, rather than deepening just the one path that already existed.

Built in `Amico.jsx`:
- AMICO now opens on a **"What would you like to create?"** launcher — five tiles in a visual grid (Comic, Photo Story, Biography, Diary, My Own Story), each with its own color gradient and a representative emoji standing in for the "carefully selected images" the vision asks for (a real curated photo per tile can replace these later without changing the structure).
- **Comic** and **Photo Story** tiles are fully live — clicking one goes straight into that existing flow, same as the two tabs they replaced.
- **Biography**, **Diary**, and **My Own Story** tiles are visually present (not hidden or stubbed out of sight) but marked "Coming soon"; clicking one shows a short inline note rather than pretending to work. This is what "demonstrate the possibility, don't build every tool now" meant in practice — the full 5-way vision is visible and real to look at, but only 2 of the 5 are actually functional underneath.
- AMIVI's "Send to AMICO" button and opening a saved comic from the Library both still skip straight past the launcher into the Comic flow, exactly as before — the launcher only appears when someone arrives at AMICO with no destination already decided for them.
- A small "← Choose a different way to create" link inside each flow returns to the launcher.

Deliberately NOT built in this slice (left for a future, separately-scoped pass): the Biography/Diary/My Own Story generation engines themselves, the background chooser, the avatar/layout/panel pickers becoming visual thumbnails instead of dropdowns, and the preview-before-create Use/Discard step. Each of those was also a candidate starting point and remains open for whenever it's prioritized next.

---

---

## 8. Category logos (Visual Learning, Essential Learning, Collaborative Learning, Digital Library, Retakers Quiz, Homework Quiz)

**Status: implemented.**

A single composite image with 6 circular badge logos (icon + label) was provided — one each for Visual Learning, Essential Learning, Collaborative Learning, Digital Library, Retakers Quiz, and Homework Quiz — with the instruction to add each to its respective area in the app.

### How this was implemented

Cropped the composite into 6 individual PNGs (circle artwork + label, tightly trimmed) and added them to `frontend/public/` as `vlq-badge-<name>.png`. Placed each where that exact name already appears as a section/page identity in the app, replacing the generic lucide-react icon or emoji that stood in for it before:

- **Visual Learning** — corner badge on the AMIVI engine card on the Explore hub (`Explore.jsx`), since AMIVI is the app's visual-learning engine (its own default project title is literally "AMIVI Visual Learning").
- **Essential Learning** — header badge on the Courses page (`Courses.jsx`, the `/courses` destination behind the Navbar's "Essential Learning" link), the Quiz Decks picker header (`QuizDecks.jsx`, "Essential Learning Quizzes"), and the Essential Learning heading inside the Quiz page's deck picker (`Quiz.jsx`).
- **Collaborative Learning** — Explore hub's Learning Resources tile image, plus the Collaborative Learning room header badge (`CollaborativeLearning.jsx`).
- **Digital Library** — Explore hub's Learning Resources tile image, plus the Library page's own header (`Library.jsx`, replacing the 📚 emoji).
- **Retakers Quiz** — Explore hub's quiz-card icon (replacing the generic retry icon), plus the Retakers Quiz section header inside the Quiz page (`Quiz.jsx`, replacing the 📕 emoji).
- **Homework Quiz** — Explore hub's Learning Resources tile image (the Homework card).

Every placement already had a dedicated icon/image slot before this change (a card image, a header pill icon, or an emoji in a heading) — logos replace those placeholders rather than being bolted on as new UI elements, so no layout changed.

---

---

## 9. Aesthetic / UI Finishing

**Status: implemented.**

- Replace unnecessary decorative space with the AMIVI–AMICO visual learning journey where agreed.
- Keep typography, button sizes, spacing, card treatment and terminology consistent.
- AMIVI should feel clear and structured; AMICO may feel slightly more creative while remaining part of the same VLQ family.
- Keep the journey visible and memorable: Complexity → Clarity → Creativity → Mastery.
- Remove wording that encourages an arbitrary fixed number of key points; the subject should determine the natural number.
- Keep loading messages/characters friendly but professional and not limited to a children's audience.

### How this was implemented

**Decorative space → the journey strip.** Both `Amivi.jsx` and `Amico.jsx` opened with a tall (h-44/h-56) generic stock-style photo banner above the page title — `vlq-amivi-card.jpg` on AMIVI, `vlq-understand-tool.png` on AMICO. Neither photo said anything about what the app does. First pass replaced both with a new shared component, `LearningJourney.jsx`, showing the four-stage strip **Complexity → Clarity → Creativity → Mastery** at the top of the page. Turned out both pages already had this exact flowchart — labelled identically — as a "4-Step Flowchart" footer near the bottom of the page (`Amivi.jsx` ~line 1400, `Amico.jsx` ~line 1381, built in an earlier session), so the new header strip was a straight duplicate once both were on the page together. Removed the new header component from both pages — the photo banner is simply gone now, no replacement — and kept the original footer flowchart as the one place the journey appears on each page. `LearningJourney.jsx` itself is left in `components/ui/` unused (not imported anywhere) in case it's wanted later; safe to delete.

**Consistency pass.** While working the header, found and fixed a couple of small drifts between the two pages: AMICO's `<h1>` was a size smaller than AMIVI's (`text-3xl sm:text-4xl` vs `text-4xl sm:text-5xl`) and its intro paragraph was missing the `text-lg` AMIVI's had — both now match.

**AMIVI clear/structured vs. AMICO slightly more creative.** The existing footer flowcharts on both pages are already identical in structure (same four pills, same colors, same order) — that sameness itself is the "same VLQ family" consistency. The AMICO-specific "slightly more creative" feel comes from elsewhere on the page (its pink/rose accent color, its emoji-tiled launcher), not from this flowchart, so it was left untouched on both pages.

**Fixed-number wording.** The AMIVI "Insert Subject" textarea's placeholder text read *"Paste your educational text here... e.g. Give this in 5 key points, and the pics should come with key points."* — directly suggesting a fixed count of 5, which contradicts the INTRODUCE spec (section 2) that already made the backend choose a natural number. Reworded to *"Paste your educational text here... AMIVI will break it into the key points the subject naturally calls for, each with its own picture."* A full search of both the backend prompts and the frontend copy turned up no other fixed-number wording — the generation prompt itself had already been corrected in an earlier session (section 2), this placeholder was the one remaining spot still telling a teacher to ask for a specific number.

**Loading characters.** `ProcessingAnimation.jsx` (the "please wait" screen shown while AMIVI/AMICO generate) rotated through a cast of cute mascots — a bear wearing a graduation cap, plus cupcake/penguin/frog/star stickers — which reads as a children's-app mascot set, not matching an app used by teachers and adult learners. Replaced the mascot cast with a rotating set of plain icon badges (lightbulb, sparkles, book, palette, target) in the app's existing brand colors, keeping the same gentle bounce animation and fade transition so the "something is happening" feeling is unchanged. The rotating quotes underneath (e.g. "Every expert was once a beginner.") were already friendly-but-professional and needed no change — only the character art was the issue.

---

---

## 10. AMICO launcher — visual polish

**Status: implemented.**

Direct feedback on the "What would you like to create?" launcher tiles (section 7's first MVP slice): make it "little good with icons colours enlarge it with enlarging icons and tabs."

### How this was implemented

In `Amico.jsx`'s `CREATION_TYPES` list, swapped the placeholder emoji (🦸 📷 📜 📔 🪄) for real `lucide-react` icons in a white/translucent rounded badge — `Drama` (Comic), `Camera` (Photo Story), `ScrollText` (Biography), `NotebookText` (Diary), `Wand2` (My Own Story) — so they render crisp and consistent instead of depending on the OS's emoji font. Deepened each tile's gradient slightly (e.g. Comic: violet→fuchsia instead of purple→pink) for more contrast against the white icon badge. Enlarged the tiles themselves (more padding, a `min-h` so all five are a consistent taller size, bigger gap between them), the icon badge (16×16 up to 20×20 on larger screens, icon itself 9×9/11×11), and the type/heading text (title bumped a size, the "What would you like to create?" heading bumped a size) so the whole launcher reads as a more substantial set of five choices rather than small buttons.

---

*(Add further numbered items / system prompts below as they're provided.)*
