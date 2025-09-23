# TrackD Analytics Dashboard Design Guidelines

## Design Approach
**Selected Approach**: Design System Approach (Utility-Focused)
**Justification**: TrackD is a data-heavy analytics dashboard for trades businesses where efficiency, learnability, and clear information hierarchy are paramount. Users need to quickly digest insights, enter job data, and take actionable steps to improve profitability.

## Core Design Elements

### A. Color Palette
**Primary Brand Colors**:
- Primary: #508682 (sage green) - CTAs, headers, active states, primary buttons
- Accent: #E8B894 (warm peach) - highlights, success indicators, progress elements
- Background: #F8F9FA (warm off-white) - main application background
- Card backgrounds: Pure white (#FFFFFF) for data containers

**Text Colors**:
- Primary: #2C3E50 (headings, key data)
- Secondary: #708090 (body text, labels)  
- Light: #95A5A6 (metadata, timestamps)

**Data Visualization Colors**:
- Success/Positive: #508682 (primary green)
- Warning: #E8B894 (warm peach)
- Alert/Negative: #E74C3C (professional red)
- Neutral: #95A5A6 (light gray)

### B. Typography
**Font Families**:
- Headings: Nunito (friendly, approachable for dashboard titles)
- Body Text: Inter (excellent readability for data-heavy interfaces)
- Data/Numbers: Inter Medium (emphasize key metrics)

**Typography Scale**:
- Dashboard titles: Nunito Bold, 24px
- Section headers: Nunito SemiBold, 18px
- Body text: Inter Regular, 14px
- Labels: Inter Medium, 12px
- Large numbers/KPIs: Inter Bold, 32px

### C. Layout System
**Tailwind Spacing Units**: Focus on 2, 4, 6, and 8 for consistent spacing
- Tight spacing: p-2, gap-2 (form elements)
- Standard spacing: p-4, m-4, gap-4 (card padding, element margins)
- Section spacing: p-6, gap-6 (between dashboard sections)
- Large spacing: p-8, gap-8 (page sections, major separations)

**Grid System**:
- Dashboard: 12-column grid with responsive breakpoints
- Cards: Consistent rounded corners (rounded-lg)
- Chart containers: Minimum height of 300px for readability

### D. Component Library

**Navigation**:
- Sidebar navigation with sage green active states
- Clean, icon-based navigation with labels
- Breadcrumb navigation for deep sections

**Data Display**:
- Chart containers: White backgrounds with subtle shadows
- KPI cards: Large numbers in Inter Bold with descriptive labels
- Data tables: Alternating row backgrounds, hover states in light sage
- Insight cards: Warm peach accent borders for actionable items

**Forms**:
- Input fields: Clean, rounded borders with sage green focus states
- Primary buttons: Sage green background with white text
- Secondary buttons: Outlined with sage green border
- Success states: Warm peach highlights

**Interactive Elements**:
- Hover states: Subtle sage green tints
- Loading states: Sage green progress indicators
- Empty states: Friendly illustrations with warm peach accents

### E. Animations
**Minimal Animation Strategy**:
- Chart transitions: Subtle ease-in-out when data updates
- Page transitions: Simple fade effects
- Loading indicators: Gentle pulsing for skeleton states
- No distracting micro-animations that could interfere with data analysis

## Dashboard-Specific Guidelines

**Chart Design**:
- Consistent color scheme across all 7 chart types
- Clear axis labels and legends
- Tooltip styling matches overall design system
- Responsive scaling for mobile viewing

**Insight Display**:
- Actionable insights in highlighted cards with warm peach accents
- Clear hierarchy: Problem → Solution → Impact
- Quantified recommendations with prominent number styling

**Data Entry**:
- Single-page job entry forms with progress indicators
- Auto-complete dropdowns with sage green selections
- Bulk entry interface with clear validation feedback

## Responsive Behavior
- Mobile-first approach with collapsible sidebar
- Chart responsiveness with horizontal scroll on small screens
- Simplified mobile layouts prioritizing key metrics
- Touch-friendly form elements and navigation

This design system prioritizes clarity, efficiency, and professional credibility while maintaining the warm, approachable feeling appropriate for small business owners in the trades industry.