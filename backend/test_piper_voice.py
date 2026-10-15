"""
Superseded — Piper has been replaced by OpenAI TTS for narration.

These tests exercised the local Piper subprocess (binary path, model
file, subprocess concurrency) that generate_voice() used to call.
That code path no longer exists, so this file intentionally defines
no tests (pytest collects zero from it) rather than leaving the old,
now-permanently-failing assertions in place.

See test_narration.py for the current generate_voice() (OpenAI TTS)
and webpage/video URL extraction tests.
"""
