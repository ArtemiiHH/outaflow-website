---
name: outaflow
description: Neutral, image-led streetwear storefront
colors:
  ink: "#191a19"
  muted: "#62645f"
  line: "#d8dad5"
  paper: "#f5f5f3"
  white: "#fff"
  image-surface: "#e8e8e5"
  action-hover: "#383f37"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(36px, 6.6vw, 86px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  control: "0px"
spacing:
  desktop-gutter: "3.5%"
  mobile-gutter: "20px"
  size-gap: "6px"
  gallery-gap: "22px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "17px 20px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-text:
    textColor: "{colors.ink}"
    padding: "10px 0"
  size-option:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "42px"
  size-option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  email-input:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 0 15px"
---

# Design System: outaflow

## Overview

**Creative North Star: "Independent by nature"**

Sparse, neutral streetwear commerce shaped by the supplied references: generous imagery, compact uppercase information, and restrained controls. The supplied outaflow emblem remains the identity anchor; atmospheric landscape photography carries the opening screen.

This records the implemented reference-led direction. CODEX-INSTRUCTIONS.md and PRODUCT.md establish the brand asset and neutral streetwear constraints. Surface compositions are recorded in `.impeccable/surfaces/storefront.md`.

**Key Characteristics:**
- Warm neutral paper and dark ink
- Self-hosted Manrope with compact commerce labels
- Flat, square controls and image-led layouts
- Restrained motion with reduced-motion support

## Colors

The palette is almost monochrome, with subdued natural photography providing variation. Frontmatter holds the normative values, extracted from `src/styles.css`.

### Primary
- **Ink** (`ink`): text, selected sizes, and the dominant purchase action. The action darkens to the softer green-grey `action-hover` on hover.

### Neutral
- **Paper** (`paper`): the storefront canvas.
- **Muted** (`muted`): supporting product information and footer text.
- **Rule** (`line`): dividers and unselected size borders.
- **White** (`white`): reversed action text and banner text.
- **Image surface** (`image-surface`): quiet backing behind product photography.

The opening surface additionally uses a pale grey-green background, desaturated landscape, and translucent light gradient. These atmospheric layers are surface treatments, not an additional brand accent.

## Typography

Manrope is self-hosted as a variable font, with Arial and sans-serif fallbacks. Bold, tightly tracked headings sit above compact, often uppercase labels. Body descriptions remain quieter and more open.

- **Display:** opening heading uses the frontmatter display role; mobile uses `clamp(30px, 8.7vw, 62px)`. The short desktop viewport override is (64px).
- **Title:** product heading uses the title role, uppercase; mobile reduces it to (20px).
- **Body:** descriptions use the body role and a maximum measure of (60ch). Opening supporting copy is (14px), reducing to (12px) on mobile.
- **Label:** purchase action uses the label role, uppercase. Product metadata is (10px), weight (600), line height (1.6), reducing to (9px) on mobile.
- **Wordmark:** typographic outaflow wordmark is (32px), weight (800), tracking (-0.04em), reducing to (27px) on mobile; it accompanies the actual supplied emblem.

## Layout

Desktop content uses the frontmatter desktop gutter, with catalog and product content capped at (1800px). Mobile uses the mobile gutter. Header height is (80px), reducing to (68px).

Catalog imagery uses a (4:5) ratio. The grid has four columns and gaps of (40px 20px); at a maximum width of (1023px), it uses two columns and gaps of (35px 18px). At (767px) and below, two columns remain with gaps of (30px 12px).

Product desktop layout allocates (1.65fr) to the gallery and at least (320px) to controls, separated by (6%). Thumbnails occupy a (64px) vertical rail with the gallery gap. At (1023px), thumbnails move below the image. At (767px), gallery and controls stack with a (32px) gap and the main image changes to (4:4.5).

## Elevation & Depth

There are no box shadows or raised card containers. Depth comes from photography, the opening screen's translucent veil, and a near-opaque paper strip revealed over catalog imagery. Borders organize controls and expandable details.

## Shapes

Controls are square and image frames remain rectangular. Selected sizes invert to ink and white; selected thumbnails receive a thin dark border. Focus outlines are (2px) in the current text color, offset by (5px). The purchase action has a minimum height of (52px); email submission has a minimum target of (44px) square. Size buttons currently have a height of (42px).

## Components

- **Primary action:** full-width, uppercase, with an arrow at the far edge. Hover changes its fill; disabled states use pale grey-green with muted text. Pressing enabled buttons moves them down (1px).
- **Text action:** underlined, small, transparent, used for retries.
- **Email field:** transparent field and arrow submission share a single bottom rule; explicit consent sits below. Loading, error, unavailable configuration, and success states remain textual and truthful.
- **Size selector:** six equal columns with the size gap; selected, disabled and unselected states are distinct. Unavailable sizes are struck through.
- **Navigation:** three-part desktop header, central compact navigation, wordmark left and emblem right. Mobile preserves the shop link when available and hides the inactive tagline.
- **Product card:** frameless imagery above compact metadata; the supplied front image is the default; hover or keyboard focus reveals the back view with a 0.25s opacity transition. White, contain-fit surfaces preserve the complete garment. A paper action strip appears on hover and keyboard focus; it is hidden on mobile.
- **Expandable details:** thin horizontal rules, uppercase summary, plus/minus indicators, and quiet body text.
- **Opening emblem:** the supplied image makes one complete vertical-axis rotation every (13s), linear and continuous. Reduced-motion disables animations and transitions globally.

## Do's and Don'ts

### Do:
- Do preserve the supplied outaflow emblem.
- Do give imagery priority and keep commerce labels compact.
- Do retain visible keyboard focus and reduced-motion support.

### Don't:
- The user explicitly supplied reference-branded jacket front/back photos for every sample item. Keep them labeled as sample imagery; do not represent them as original outaflow products.
- Don't present illustrative development photography as real outaflow products.
- Don't introduce raised cards or rounded purchase controls into the current flat system.

## Compact storefront header

The header now follows the user's supplied narrow navigation reference: 48px navigation row, wordmark left, centered HOME/SHOP links without dropdowns, and a 44px basket control right. A 28px announcement strip repeats “NEW DROP ONLINE NOW” during active drops and “NEXT DROP COMING SOON” between releases. Two identical groups translate by half their combined width over 65 seconds for a seamless loop. Hover pauses the strip and reduced-motion disables it. The basket opens a native, dismissible empty-cart popover; purchases still use the existing direct Shopify checkout flow.
