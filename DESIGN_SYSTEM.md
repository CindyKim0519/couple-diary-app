# Couple Diary App Design System

Reference image: a soft spring phone wallpaper with warm cream paper, sage green handwritten type, tiny garden illustrations, rounded mobile panels, and a quiet calendar mood.

## 1. Design Direction

### Shared Paper Diary
The app should feel like a private diary that two people keep together. Use cream paper, white sheets, sage green ink, small flower accents, and gentle spacing.

### Soft But Useful
This is not a decorative wallpaper app. The interface must support repeated daily actions: writing diary entries, checking a calendar, adding photos, reading past memories, and seeing a partner's notes.

### Handwritten Emotion, Clean UI
Use handwritten styling for emotional moments such as month names, date stamps, section titles, and empty states. Use a readable UI font for body text, forms, buttons, navigation, and long diary content.

## 2. Color Tokens

| Token | Hex | Use |
| --- | --- | --- |
| `--color-cream-50` | `#FFFDF6` | Paper cards and form fields |
| `--color-cream-100` | `#FBF4DF` | App background |
| `--color-sand-200` | `#E9DCB7` | Warm dividers and soft borders |
| `--color-sage-50` | `#EFF5E5` | Soft panels and hover fills |
| `--color-sage-100` | `#D9E7C7` | Illustration panels |
| `--color-sage-300` | `#A9C98A` | Selected calendar days |
| `--color-sage-500` | `#75A45F` | Primary action and active states |
| `--color-sage-700` | `#315F35` | Headings and strong ink |
| `--color-flower-100` | `#F8D4C9` | Light pink flower accents |
| `--color-flower-300` | `#ED9A8B` | Important warm accents |
| `--color-butter-100` | `#F4EA91` | Calendar highlight dots |
| `--color-sky-100` | `#CFE2D7` | Secondary illustration accent |
| `--color-ink-900` | `#263A2C` | Primary text |
| `--color-ink-600` | `#586052` | Body text |
| `--color-ink-400` | `#8D9285` | Secondary text |
| `--color-error` | `#D46B62` | Error text and borders |

## 3. Semantic Tokens

```css
--surface-app: var(--color-cream-100);
--surface-paper: var(--color-cream-50);
--surface-soft: var(--color-sage-50);
--surface-illustration: var(--color-sage-100);
--text-primary: var(--color-ink-900);
--text-body: var(--color-ink-600);
--text-muted: var(--color-ink-400);
--border-soft: var(--color-sand-200);
--accent-primary: var(--color-sage-500);
--accent-primary-pressed: var(--color-sage-700);
--accent-warm: var(--color-flower-300);
--accent-highlight: var(--color-butter-100);
```

## 4. Usage Ratio

- 45% cream background and whitespace
- 28% white paper cards and sheets
- 17% sage green UI accents
- 7% tiny flower, butter, and sky accents
- 3% dark ink text

Avoid a pink-first romantic palette. The app should feel springlike, natural, and intimate instead of candy-colored.

## 5. Background And Texture

Use a soft cream-to-sage wash at the top of key screens.

```css
--gradient-header: linear-gradient(180deg, #F8F1D8 0%, #EEF6DE 62%, #FFFDF6 100%);
```

Use sparse paper speckles only on backgrounds and illustration panels.

```css
--paper-speckles:
  radial-gradient(circle at 14% 22%, rgba(117, 164, 95, 0.2) 0 1.5px, transparent 2px),
  radial-gradient(circle at 78% 32%, rgba(237, 154, 139, 0.2) 0 1.5px, transparent 2px),
  radial-gradient(circle at 42% 78%, rgba(244, 234, 145, 0.28) 0 1.5px, transparent 2px);
```

Texture should be quiet. Do not place speckles under long diary text or small metadata.

## 6. Typography

| Role | Font | Use |
| --- | --- | --- |
| UI | `Pretendard` | Korean body, forms, navigation, buttons |
| Display | `Gaegu`, `Comic Sans MS`, cursive fallback | Month names, date stamps, short titles |
| Numeric Accent | Display font or UI font `700` | Calendar numbers and counters |

Rules:

- Long diary content always uses UI font.
- Handwritten display text should be short, warm, and readable.
- Letter spacing is `0`.
- Use green-black ink instead of pure black.

## 7. Type Scale

| Token | Size / Line Height | Use |
| --- | --- | --- |
| `--font-size-xs` | `11px / 16px` | Metadata, helper text |
| `--font-size-sm` | `13px / 20px` | Labels, captions |
| `--font-size-md` | `15px / 24px` | Body, inputs |
| `--font-size-lg` | `20px / 28px` | Card titles |
| `--font-size-xl` | `26px / 34px` | Screen titles |
| `--font-size-2xl` | `40px / 46px` | Calendar month or hero date |

## 8. Spacing

Use a `4px` base grid.

| Token | Value | Use |
| --- | --- | --- |
| `--space-1` | `4px` | Tiny icon gaps |
| `--space-2` | `8px` | Label to field gap |
| `--space-3` | `12px` | Compact groups |
| `--space-4` | `16px` | Card inner spacing |
| `--space-5` | `20px` | Section spacing |
| `--space-6` | `24px` | Screen side padding |
| `--space-8` | `32px` | Major vertical rhythm |

## 9. Radius, Border, Shadow

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | `4px` | Small tags |
| `--radius-sm` | `8px` | Buttons and inputs |
| `--radius-md` | `16px` | Cards |
| `--radius-lg` | `24px` | Bottom sheets and large panels |
| `--radius-pill` | `999px` | Avatars, dots, icon buttons |
| `--shadow-paper` | `0 14px 30px rgba(79, 103, 61, 0.12)` | Paper cards |
| `--shadow-soft` | `0 8px 18px rgba(79, 103, 61, 0.1)` | Floating controls |

Borders should use warm sand or transparent sage. Shadows should feel like lifted paper.

## 10. Components

### Primary Button

- Height: `44px`
- Radius: `8px`
- Fill: sage green
- Text: white, `700`
- Pressed: darker sage with slight `translateY(1px)`

### Secondary Button

- Height: `40-44px`
- Fill: cream white
- Border: sage
- Text: sage
- Use for cancel, back, login alternatives, and lower-emphasis actions.

### Diary Card

- White paper background
- Warm low-contrast border
- Optional tiny date stamp in display font
- Content preview max 2-3 lines
- Emotion chips at bottom

### Calendar

- Month name in display font and sage dark.
- Day grid stays precise and aligned.
- Today: sage outline circle.
- Selected day: sage fill with white text.
- Memory day: tiny butter or flower dot.
- Partner entry: small sky dot.

### Text Field

- Background: cream white
- Border: warm sand
- Radius: `8px`
- Focus: sage border and `0 0 0 3px rgba(117, 164, 95, 0.14)`
- Placeholder: muted ink, never the only label.

### Photo Area

- Background: sage wash
- Border: warm sand or translucent sage
- Radius: `16px`
- Empty state can use tiny drawn flowers, leaves, or a paper clip motif.

### Bottom Navigation

- White paper surface
- Active item: sage icon and label
- Inactive item: muted ink
- Use familiar icons for home, calendar, write, album, and my page.

## 11. Screen Patterns

### Home

1. Warm header with date or relationship day count
2. Today's prompt or partner note
3. Recent diary cards
4. Tiny calendar preview
5. Bottom navigation

### Diary Write

1. Date stamp
2. Mood selector
3. Title field
4. Large diary body field
5. Photo attachment
6. Visibility control
7. Save button

### Calendar

1. Large handwritten month title
2. Aligned calendar grid
3. Legend for my entry, partner entry, shared memory
4. Selected day diary list

### Memory Detail

1. Photo or illustration header
2. Date and place
3. Diary content
4. Partner reaction or reply
5. Edit/share controls

## 12. Voice

Tone is quiet, affectionate, and simple.

Good examples:

- `오늘의 우리`
- `이 날의 마음`
- `함께 남긴 순간`
- `나만 보기`
- `둘이 보기`
- `작게 적어둘게요`

Avoid overly dramatic romance copy, excessive exclamation marks, and long onboarding explanations.

## 13. Accessibility

- Body text contrast should meet 4.5:1.
- Touch targets should be at least `40px`.
- Calendar states cannot rely on color alone; pair dots, outlines, or labels.
- Form fields need visible labels.
- Decorative texture must not reduce readability.
