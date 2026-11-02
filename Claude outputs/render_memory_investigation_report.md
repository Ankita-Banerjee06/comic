# Render Memory Investigation & Fix — Final Report

## 1. Confirmed root cause

Three concrete, code-verified contributors (not assumptions — each was traced to an exact line of code):

**a) Oversized lossless composite page images.** `render_amico_page` and `render_photostory_page` in `backend/main.py` composited each finished comic/photo-story page at **3200px wide (AMICO)** or **3400px wide (Photo Story)**, and saved it as lossless `PNG` with `optimize=True`. The frontend (`Amico.jsx`, `Library.jsx`) only ever displays these at up to `max-w-5xl` (1024px CSS, ~2048px at 2x retina) — so every page was rendered 1.5-1.7x larger than the largest screen could ever show, in a format with no lossy compression.

**b) No HTTP caching on `/api/media/{media_id}`.** The endpoint returned the full binary blob on every single request with no `Cache-Control`, `ETag`, or conditional-GET support. This is the direct explanation for "repeated requests to the same `media_id`" you found in the Render logs — every time a user re-opened a page they'd already viewed, the browser re-fetched and the server re-read and re-sent the entire multi-MB row again, with no way to short-circuit it.

**c) Full-blob synchronous loading with no size bound.** Each request to that endpoint loads the entire `BYTEA` column into memory as a Python `bytes` object before responding. There's no streaming, no bound, and nothing to stop concurrent requests for different large rows from each allocating their full payload in memory at the same time.

I explicitly checked for, and ruled out, three other plausible causes before settling on the above:
- **An in-memory cache growing unbounded** — grepped the codebase; no such cache exists.
- **`ThreadPoolExecutor(max_workers=8)` holding large buffers** — confirmed this pool is only used for small per-item OpenAI image/audio calls (AMIVI chunks, AMICO panels, quiz questions), not for the large page-composition functions, which run in a simple sequential loop.
- **Comic/Photo-Story viewers rendering every page at once** — confirmed AMICO's and Library's main viewers already show only `pages[currentPageIndex]`, a single page at a time. This was *not* a problem there.

I also found one genuine "load everything at once" bug that wasn't in your original notes: **`Amivi.jsx`'s embedded photo-story preview** (`result.photo_story_pages.map(...)`) renders every page's full image simultaneously, unlike AMICO's one-page-at-a-time viewer. Fixed below.

## 2. Files and functions modified

| File | What changed |
|---|---|
| `backend/main.py` | `render_amico_page`, `render_photostory_page` (downscale + WebP), `compose_amico_comic`, `compose_amico_photostory` (filename/mime updates), `/api/media/{media_id}` (`def media`) rewritten for caching + logging, plus new `COMIC_PAGE_MAX_WIDTH` constant and `Request`/`time` imports |
| `frontend/src/pages/Amivi.jsx` | `loading="lazy"` on 3 image spots, including the photo-story "all pages at once" list |
| `frontend/src/pages/Amico.jsx` | `loading="lazy"` on avatar picker grid + "Manage Panels" grid |
| `frontend/src/pages/Library.jsx` | `loading="lazy"` on project thumbnails, AMIVI chunk grid, and quiz question images |

Nothing in `requirements.txt`, `database.py`'s migration system, `models.py`, or any unrelated feature (AMIVI generation, Classroom, avatar ownership checks, quiz logic, the panel-border/title-overflow fixes from earlier) was touched.

## 3. Changes made

**Image generation (backend):** After all existing layout/composition code runs unchanged (fonts, padding, borders, square-panel sizing — none of that was touched), the finished canvas is downscaled with `Image.LANCZOS` to a max width of **2200px** (still sharper than the ~2048px the UI ever displays at retina resolution) and saved as **WebP at quality 88** instead of lossless PNG. This is a pure post-processing step appended after the existing render logic, not a rewrite of it.

**Backend retrieval (`/api/media/{media_id}`):** Rewritten to:
- Compute a stable `ETag` from the `media_id` itself. This is valid because media rows in this app are write-once — regenerating a project always inserts a new row via `save_media`, it never updates `asset.data` on an existing one — so the id alone is a correct, zero-cost cache key (no content hashing needed).
- Return `Cache-Control: public, max-age=31536000, immutable` on every response.
- Return `304 Not Modified` with an empty body when the browser's `If-None-Match` matches, avoiding re-reading or re-sending the blob at all.
- Log `media_id`, `asset_type`, `bytes`, and query duration on every served request (no binary content, no requester identity) — useful for watching real memory/traffic patterns on Render going forward.
- Still serves `asset.mime_type` dynamically, so **existing PNG rows are unaffected** — they keep serving as `image/png` exactly as before. Only future generations use WebP.

**Frontend loading:** Added the native `loading="lazy"` attribute to every off-screen/grid/list image identified above, so the browser only fetches an image once it's scrolled near, instead of all of them the moment a page mounts. No custom JS or IntersectionObserver was needed.

## 4. Before-and-after image sizes

I built a direct, apples-to-apples test: the same synthetic test panels rendered once through the *exact* pre-fix code path (full-resolution canvas, lossless PNG) and once through the new code path (downscale + WebP), by capturing the canvas at the precise point the two paths diverge.

| Page type | Before (PNG, native size) | After (WebP, 2200px wide) | Reduction |
|---|---|---|---|
| AMICO comic page | 3200×3828, 187 KB | 2200×2632, 104 KB | **44.7%** |
| Photo Story page | 3400×4957, 257 KB | 2200×3207, 143 KB | **44.4%** |

**Important caveat:** these synthetic test images (flat colors + striped gradients) are not representative of real AI-generated illustrations, which tend to have much smoother color regions, less high-frequency noise, and generally compress *better* under lossy WebP than lossless PNG. I'd expect the real reduction on actual AMICO/Photo Story pages to be as good as or better than 45%, but I'm not overstating it — please check exact before/after sizes on 2-3 real projects after you deploy and regenerate them, and let me know if the numbers look meaningfully different.

## 5. Tests performed and results

- **Full-app smoke test** — imported `main.py` fresh after every edit this task; confirmed all 64 routes still register with no import errors, including every key endpoint (`/api/media/{media_id}`, `/api/quiz/generate`, `/api/amico/generate`, `/api/avatar/generate`, `/api/avatars`, `/api/library`, `/api/amivi/generate_photo_story`).
- **Media endpoint behavior** (via `TestClient`): plain GET returns `200` with correct `Cache-Control` + `ETag`; a conditional GET with a matching `If-None-Match` returns `304` with an empty body; a mismatched ETag still returns `200`; a nonexistent id returns `404`. All passed.
- **Backward compatibility** — inserted a simulated *old-format* PNG media row and confirmed it still serves correctly through the rewritten endpoint with `content-type: image/png` and byte-identical content. Existing generated content is unaffected by this change.
- **Repeated-request memory behavior** — 50 sequential full-body GETs of the same 3MB media row raised peak RSS by ~13.5MB (expected: each request still loads the full blob once). The same 50 requests sent as *conditional* GETs (simulating a browser that already cached the response, which is exactly what the new `Cache-Control`/`ETag` headers cause in real use) raised peak RSS by only **~0.1MB** — this is the concrete mechanism that stops repeat views of the same page from costing anything close to what they did before.
- **Concurrent-request behavior** — 50 concurrent requests spread across 5 different 2MB media rows (via an 8-worker thread pool, mirroring the kind of traffic several users browsing different pages at once would generate) raised peak RSS by ~71MB. This is an honest result, not a win to claim: the current endpoint still loads each *distinct* payload fully into memory per request, so concurrent *first views* of different large pages still cost memory proportional to their size. What this task's changes do is shrink that per-request cost (via the ~45% smaller WebP pages) and eliminate the cost entirely for *repeat* views (via caching) — it does not eliminate the cost of many simultaneous *first* views of different large pages. If concurrent first-view traffic is still a concern after deploying this, the next lever would be a size/dimension cap enforced at generation time (already effectively in place via the 2200px cap) or moving to a streaming response — I did not implement streaming here because, as your task document correctly noted, it wouldn't help on its own since the full BYTEA is already loaded into memory before any response streaming could begin; a real fix for that would require reading the blob in chunks directly from Postgres, which is a larger change I'd want to discuss with you before making.

## 6. Expected impact on Render memory

- Every newly generated comic/photo-story page will be roughly **40-45% smaller** on disk and in memory per request, directly shrinking the per-request memory footprint for the most common large-media flows (AMICO and Photo Story).
- Repeat views of already-seen pages (the "repeated requests to the same media_id" pattern you found in the logs) should now cost **almost nothing** — the browser serves them from its own cache, and even a conditional re-check gets a tiny 304 instead of the full multi-MB body.
- This should visibly slow the climb from the 25-30% baseline toward the 80-90% restart threshold, but it will not eliminate memory use from first-time loads of large pages, and it does nothing for the ~40-85MB already stored on *existing* projects generated before this change — those stay exactly as they are (same size, same PNG format) until a project owner regenerates them.
- Please treat this as a meaningful reduction, not a complete fix, and keep watching Render's memory graph after deploying — the new `print(...)` logging on every media request (id/type/bytes/timing) will help correlate any future memory spikes with specific requests if you need to investigate further.

## 7. Deployment steps / environment variables required

- **No new environment variables are needed.**
- **No requirements.txt change is needed** — `pillow` is already unpinned in `backend/requirements.txt` and already includes WebP support; your existing `render-build.sh` (`pip install -r backend/requirements.txt` + `python backend/install_piper.py`) is sufficient as-is.
- **No database migration is needed** — nothing about the schema changed; this only changes what gets written into the existing `mime_type`/`filename`/`data` columns going forward.
- As always in this project: commit and push these four files, then trigger a redeploy on Render yourself — nothing here deploys automatically.
- Existing projects keep displaying exactly as before (their PNG rows are untouched and still served correctly). They will only pick up the smaller WebP pages once you **regenerate** them — this is the same "already-generated content needs to be regenerated to see backend rendering changes" rule that's applied to every rendering fix this session.
