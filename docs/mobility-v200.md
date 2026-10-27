# v200: back and hip mobility

Adds `back_hips_mobility` (A/B/C) and `back_hips_daily` (one repeating session). Existing programs, user layouts, history and account state remain unchanged. The user chooses activation in the program picker. Uses the existing cyclic session engine and existing save/delete/history paths; no new persistence schema or cloud service.

Beginner prescriptions intentionally start at one set, 20–30 seconds per side or slow repetitions. The bilingual guide explains warm-up, a six-week progression, easy days, and when to reduce or stop. Adding sets is explicit, never automatic. The hold timer fills a visible input only on request and never marks or saves a set. Changing exercise, set revision or target invalidates a running timer. Remaining time uses wall time to tolerate background throttling.

## Art

Built-in imagegen, using `source/exercise-image-reference.webp` as the style reference. Final application assets:

- `exercise-guides/v200/hip_flexor_stretch.webp`
- `exercise-guides/v200/supine_hamstring_stretch.webp`
- `exercise-guides/v200/supine_figure_four.webp`
- `exercise-guides/v200/adductor_rockback.webp`

Shared prompt: square realistic instructional fitness illustration, navy backdrop, blue floor light, consistent man in gray top and dark shorts; two full-body phases, natural skin, red stretched muscles and orange secondary regions, turquoise arrows, modest beginner range, no text/logo/watermark. Each asset depicts only its own exercise, never the reference machine.

Individual briefs: padded half-kneel with posterior pelvic tilt and small forward shift; supine hamstring stretch with strap and slightly bent raised knee; supine crossed-ankle figure-four with head supported and hands supporting the other thigh; quadruped adductor rock-back with one leg sideways and hips moving toward the supporting heel. Figure-four and adductor images received targeted pose corrections after visual review. Existing artwork was preserved.

## References

- https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20047931
- https://www.cuh.nhs.uk/patient-information/stretches-for-the-hip/
- https://www.nhsinform.scot/illnesses-and-conditions/muscle-bone-and-joints/neck-and-back-problems-and-conditions/exercises-for-back-pain/

## Validation

`tests/mobility.cjs`: 3/1-session rotations, known exercise IDs, doses, bilingual instructions, built-in preservation, asset existence and caching, timer validation, explicit field fill without saves and stale-context cancellation. Existing audit, manual save, program, exercise-detail, chin-up, set-deletion and custom-program suites pass. Inline scripts and changed JS pass syntax checks. Physical iPhone testing is not available in this environment.
