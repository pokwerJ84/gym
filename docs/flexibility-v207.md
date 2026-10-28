# Flexibility goals — v207

Adds twelve illustrated exercises: six Advanced and six Expert. These are app-specific labels, not an association certification. The existing 31 mobility entries remain, giving 43 mobility entries and 142 total exercises.

## User behavior

- Exercise Database → Mobility & Stretching: combine Goal (front split, middle split, bridge), Difficulty and existing Body Area/search filters.
- Each addition includes Czech/English setup, movement, easier variant, prerequisites, target muscles, mistakes, dose and image.
- Separate optional program `splits_bridge_foundation`: A front split preparation, B middle split preparation, C shoulder/thoracic preparation. Three sessions in rotation, 25–40 minutes, no Expert exercise in defaults. No program activation or user-data migration.
- Existing session editor and timer handle the new entries; nothing increases automatically.
- Elevated-hand bridge is a supervised library option only. No standing dropbacks or head loading. With neck/back symptoms, consult a physiotherapist before backbends. No personal medical information is embedded in the source.
- General source guidance does not validate every app exercise or promise full splits: https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20546848 and https://gymnasticsmedicine.org/back-pain-in-gymnastics/ .

## Artwork

Built-in Imagegen, style reference `source/exercise-image-reference.webp`. One distinct image per exercise, navy/blue background, two controlled positions, appropriate red target tissue highlights. Final app paths `exercise-guides/v207/<id>.webp`. Encoded through an in-memory buffer, checked nonempty and fully decoded before atomic write; all assets in the service-worker precache.

Shared prompt: scientific-educational square instructional image; reference is style only; realistic adult male, dark grey sleeveless top and black shorts; whole body, accurate supports and two phases; no text/logos/watermarks. Subject prompts:

### ninety_ninety_hinge

Final asset: `exercise-guides/v207/ninety_ninety_hinge.webp`.

90/90 seated hip hinge: man seated with both knees bent at roughly right angles, front leg externally rotated and rear leg internally rotated. First panel torso upright with hands supporting on floor. Second panel a small forward hinge over the FRONT shin with a long spine, no knee pressing. Highlight front glute red.

### cossack_supported

Final asset: `exercise-guides/v207/cossack_supported.webp`.

Supported Cossack squat: man holding a sturdy fixed rail in front, wide stance. First panel upright; second panel shifting into a moderate side squat with one knee bent over its foot, other leg extended sideways with heel grounded and toes pointing up. Whole body and stable support visible. Highlight adductors red.

### couch_stretch

Final asset: `exercise-guides/v207/couch_stretch.webp`.

Couch quadriceps stretch with stable bench: man in half-kneeling position on thick knee pad in front of a bench; rear knee on mat and rear foot/shin supported up behind on bench edge, front foot planted far enough forward. Torso upright, pelvis gently tucked, no lumbar arch. Two panels shallow setup then gentle hip extension. Highlight rear quadriceps and hip flexor red.

### lizard_blocks

Final asset: `exercise-guides/v207/lizard_blocks.webp`.

Lizard stretch supported on two yoga blocks: padded rear knee grounded, front foot outside same-side hand, both hands on firm blocks inside the front foot. First panel higher gentle position; second slightly forward with long spine, rear knee still grounded. Highlight hip adductors and rear hip flexors red. Do not depict forearms on floor or excessive depth.

### pancake_blocks

Final asset: `exercise-guides/v207/pancake_blocks.webp`.

Seated straddle pancake supported on TWO stable yoga blocks in front: legs comfortably wide, knees facing ceiling, torso long. First panel upright palms on blocks, second panel small controlled forward hinge at hips resting hands on blocks; not flat on floor. Highlight inner thighs and hamstrings red.

### puppy_supported

Final asset: `exercise-guides/v207/puppy_supported.webp`.

Supported kneeling puppy stretch: knees on padded mat under hips, hands on low stable bench ahead, arms straight. Two side-view panels neutral setup then chest lowering slightly between upper arms, ribs controlled and lumbar neutral, head floating in line with spine. Hips stay over knees. Highlight lats and chest red. No extreme lower back arch, no head weight.

### bridge_elevated

Final asset: `exercise-guides/v207/bridge_elevated.webp`.

Coach-supervised elevated-hand bridge preparation. Stable wide low gymnastics platform rigidly against wall supporting BOTH palms, fingers pointing toward shoulders/feet. Feet on floor, knees bent. First side-view panel supine setup hands supported on platform behind shoulders; second side-view panel modest bridge lifted with both hands and feet weight-bearing, broad smooth arch, head hanging freely entirely OFF floor and neck unloaded. No standing dropback, no headstand, no sharp lumbar hinge. Highlight shoulders/chest and hip flexors red; glutes orange. Correct hands wrists and all limbs, platform firmly against wall.

### cossack_controlled

Final asset: `exercise-guides/v207/cossack_controlled.webp`.

Unassisted controlled Cossack squat: first panel wide standing stance arms in front; second panel moderate controlled side squat, one knee tracks over planted foot, opposite leg straight with heel grounded toes up. No weight or support. Only go moderately deep, no forced groin stretch. Highlight adductors red and glutes orange.

### pancake_active

Final asset: `exercise-guides/v207/pancake_active.webp`.

Active seated straddle pancake: man sitting in wide straddle legs long with knees/toes pointing up. First panel upright with arms reaching forward, second panel controlled forward hip hinge with hands hovering above floor rather than pulling toes. Spine long, chest stays well above floor, no extreme fold. Highlight adductors and hamstrings red, hip flexors orange.

### front_split_blocks

Final asset: `exercise-guides/v207/front_split_blocks.webp`.

Front split progression with two tall stable yoga blocks supporting palms either side of hips. Side view man with front leg forward heel on floor and rear leg extending behind knee/shin padded, pelvis remains clearly well above floor with support and square facing forward. First panel half split kneeling start, second slightly longer partial front split retaining a gentle bend in front knee and no forced floor contact. Highlight front hamstrings and rear hip flexors red. No oversplit.

### middle_split_supported

Final asset: `exercise-guides/v207/middle_split_supported.webp`.

Middle split preparation: front view man in very wide straddle with hands supported on a solid heavy bench directly in front, hips kept high well above floor. Two phases moderate width then slightly wider under hand support, knees and feet aligned without twisting, feet planted and no slippery socks. Controlled partial middle split, not a full floor split, no pulling by partner. Highlight inner thigh adductors red.

### seated_leg_lift

Final asset: `exercise-guides/v207/seated_leg_lift.webp`.

Seated straight-leg lift for active flexibility: man seated tall on firm low cushion with one leg straight in front, opposite knee bent foot grounded. Hands on floor beside hips. First side-view panel extended heel on floor, second heel raised only a few centimetres with knee long and torso unchanged, no rounding or leaning back. Highlight hip flexors and quadriceps red. A short turquoise upward arrow by heel.

## Validation

`tests/flexibility-goals.cjs` covers unique additions, real image headers, goal/level/body/search combinations, invalid filter inputs, bilingual prerequisites, A/B/C cycling, no default Expert exercise, unchanged prior presets, history and active session. Existing save, deletion, custom-program, mobility, stretching, chin-up and program-guide regressions also run. All inline JavaScript and touched modules checked for syntax.


Final front-split image refinement (built-in Imagegen, original style reference): two stacked side views; top half split with rear knee padded under hip and front knee almost straight, heel grounded and toes up, both palms on tall blocks; bottom controlled partial front split with front leg still nearly straight, rear knee padded, square pelvis above floor, both hands controlling depth on blocks. No lunge with bent front knee, no full split or oversplit. Same navy/blue realistic style, no text. Selected generated source: `generated_images/exec-12164106-b073-47e1-a78b-39448887585e.png`; final app file unchanged.

Release v208 also makes the existing live hold timer derive its starting duration from the exercise prescription (bridge 5 s, partial front split 15 s), with the existing 5–180 s limits and Cat–Cow movement interval preserved. Regression covered in flexibility-goals.cjs.

Release v209 fits all new instructions, including warm-up and stop criteria, into six tips so the existing detail renderer displays every instruction. No existing detail layout changed.
