# SEO Meta Tag Analyzer - Design Guidelines

## Design Approach
**Selected Approach:** Design System (Utility-Focused)
**Justification:** This is a developer/marketer tool prioritizing efficiency, data clarity, and professional credibility over visual appeal.
**System:** Material Design principles with custom adaptations for technical analysis workflows.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light Mode: 220 85% 25% (deep blue for trust/professionalism)
- Dark Mode: 220 80% 65% (lighter blue maintaining contrast)

**Status Colors:**
- Success: 120 60% 45% (SEO compliant)
- Warning: 45 85% 55% (needs attention) 
- Error: 0 75% 55% (critical issues)
- Info: 200 85% 60% (informational)

**Neutral Palette:**
- Light backgrounds: 0 0% 98%
- Dark backgrounds: 220 15% 12%
- Cards/surfaces: Semi-transparent overlays with subtle borders

### Typography
**Font Family:** Inter (Google Fonts) for excellent readability in technical contexts
**Hierarchy:**
- H1: 32px/bold for main analyzer title
- H2: 24px/semibold for section headers (Google Preview, Facebook Preview, etc.)
- Body: 16px/regular for meta tag content and descriptions
- Code: 14px/mono for URLs and HTML snippets
- Small: 12px/medium for labels and secondary info

### Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)
**Grid Structure:**
- Single column mobile layout
- Two-column desktop: URL input + controls (left), results dashboard (right)
- Card-based organization for each preview type

### Component Library

**Core Components:**
- **URL Input Card:** Large, prominent search field with validation states
- **Status Badges:** Color-coded indicators with icons for SEO compliance
- **Preview Cards:** Google/Facebook/Twitter mockups with actual fetched data
- **Analysis Panels:** Expandable sections showing detailed SEO recommendations
- **Score Indicators:** Circular progress rings showing overall SEO health

**Navigation:** Minimal top bar with app title and optional settings
**Forms:** Clean input fields with real-time validation and loading states
**Data Display:** Structured cards with clear labels, values, and status indicators

### Visual Treatment
**Card Design:** Clean white/dark cards with subtle shadows and rounded corners
**Information Hierarchy:** Clear visual separation between different meta tag categories
**Interactive States:** Subtle hover effects on clickable elements, loading skeletons during fetch
**Iconography:** Heroicons for consistent, professional interface elements

**Preview Authenticity:** Google, Facebook, and Twitter previews should closely mimic actual platform appearance using official design specs and dimensions.

## Key Design Principles
1. **Clarity First:** Technical data must be immediately scannable and understandable
2. **Professional Credibility:** Clean, trustworthy interface suitable for client presentations  
3. **Efficient Workflow:** Minimal clicks from URL input to comprehensive analysis
4. **Visual Feedback:** Clear status indicators for quick SEO health assessment

## Images
No hero images needed. Focus on clean interface with preview mockups showing fetched website content within simulated Google/social platform contexts.