# Release 2B local integration report

This release is intentionally unconnected. No migration deployment, live RLS result, cross-device production sync, email delivery or authenticated production-browser result is claimed.

Implemented locally: local/Supabase/hybrid adapters; versioned entity writes; hardened outbox states and backoff; resumable import; provider error normalization; remote active-timer detection and hydration; auth state machine; sync/import/conflict UI components; mock remote failure simulator.

Static review found and fixed unsafe group membership insertion, admin ability to affect owners, insufficient ownership protection on group updates, and missing explicit authentication checks inside sensitive security-definer RPCs.

The legacy screens still consume the Release 1 compatibility store. The adapter/service boundary is complete, but a later UI decomposition pass is needed to replace every direct `patch()` call without destabilizing the current compressed `App.jsx`. This is explicitly not represented as complete cloud-backed UI.
