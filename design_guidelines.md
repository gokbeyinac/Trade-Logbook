# Trading Journal Design Guidelines

## Design Approach

**Selected Framework**: Design System Approach with Material Design + Modern Fintech Aesthetics

**Justification**: Trading applications are utility-focused tools where data clarity, quick information scanning, and functional excellence drive user success. Drawing inspiration from TradingView's clean professionalism, Robinhood's modern simplicity, and Bloomberg's data density.

**Core Principles**:
1. Data clarity above all else
2. Instant visual comprehension of trade performance
3. Professional, trustworthy appearance
4. Desktop-optimized experience

---

## Typography

**Font Stack**:
- **Primary**: Inter (via Google Fonts CDN) - exceptional readability for numbers and data
- **Monospace**: JetBrains Mono - for prices, P&L figures, and technical data

**Hierarchy**:
- Page Titles: text-3xl font-bold (Inter)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Data Labels: text-sm font-medium uppercase tracking-wide
- Numbers/Prices: text-base font-mono (JetBrains Mono)
- Large Metrics: text-4xl font-bold font-mono

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4 to p-6
- Section spacing: mb-8, gap-6
- Card spacing: p-6
- Tight elements: gap-2, space-y-2
- Generous sections: py-12, py-16

**Grid System**:
- Dashboard: 3-column metric cards (grid-cols-3)
- Trade list: Full-width table with fixed-width columns
- Trade details: 2-column layout (60/40 split)

**Container Strategy**:
- Main content: max-w-7xl mx-auto px-6
- Data tables: Full container width
- Forms: max-w-2xl

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Full-width sticky header with shadow
- Logo/brand left-aligned
- Primary navigation center (Dashboard, Trades, Analytics, Settings)
- User profile/settings right-aligned
- Height: h-16, bg-white with subtle border-b

### Dashboard Components

**Metric Cards** (Statistics Overview):
- Grid of 4 cards displaying: Total Trades, Win Rate, Total P&L, Profit Factor
- Each card: Rounded corners (rounded-lg), shadow, p-6
- Structure: Label (text-sm text-gray-500 uppercase), Large number (text-4xl font-mono font-bold), Change indicator with arrow icon
- P&L cards use conditional visual treatment (positive/negative states)

**Trade List Table**:
- Clean table with zebra striping
- Columns: Date/Time (monospace), Symbol (bold), Direction (badge), Entry/Exit prices (monospace), P&L (monospace, conditional)
- Row height: py-3
- Hover state for row interaction
- Sticky header
- Action column right-aligned (View Details icon button)

**Trade Detail Card**:
- Large card (rounded-xl, shadow-lg)
- Top section: Symbol + Direction badge + Close button
- 2-column grid below: Trade metrics left, Notes/Analysis right
- Metrics include: Entry/Exit prices, Quantity, Duration, Fees, Net P&L
- Each metric: Label + Value pairs with clear hierarchy

### Forms

**Manual Trade Entry Form**:
- 2-column layout for related fields
- Field groups: Trade Info (Symbol, Direction), Prices (Entry, Exit), Quantity, Timestamps, Notes
- Direction: Radio button group (Long/Short) with visual distinction
- Submit button: Full-width, prominent
- All inputs: Consistent height (h-10), rounded-md, border focus states

### Filters & Controls

**Filter Bar**:
- Horizontal layout with gap-4
- Date range picker, Symbol search/select, Direction filter (All/Long/Short)
- Each filter: Compact button/select style
- Clear filters button right-aligned

### Visual Feedback

**Badges**:
- Direction badges: LONG (subtle green tint), SHORT (subtle red tint), uppercase, px-3 py-1, rounded-full, text-xs font-bold
- Status indicators: Small colored dots for active/closed trades

**Icons**: Use Heroicons (via CDN) for:
- Navigation icons
- Arrow up/down for P&L
- TrendingUp/TrendingDown for performance
- Plus icon for add trade
- Filter/Search icons
- Calendar for date pickers

---

## Key Layouts

### Dashboard Page
1. **Header Section**: Page title "Dashboard" + Quick action "Log Trade" button
2. **Metrics Row**: 4 metric cards (grid-cols-4, gap-6)
3. **Recent Trades Section**: Section header + Trade list table (last 10 trades)
4. **Chart Placeholder**: Performance over time chart area

### Trade List Page
1. **Header**: Title + "Add Trade" button
2. **Filter Bar**: Date range, symbol, direction filters
3. **Trade Table**: Full list with pagination
4. **Empty State**: Centered message with CTA when no trades

### Trade Detail View
1. **Modal or Side Panel**: Large overlay with trade details card
2. **Close mechanism**: X button top-right
3. **Content**: All trade information displayed clearly

---

## Desktop-First Responsive Strategy

Primary target: 1920x1080 and 1440p displays (traders use large monitors)

**Breakpoints**:
- Desktop (default): Full multi-column layouts
- Tablet (md): 2-column grids collapse
- Mobile (sm): Single column, simplified tables (card view)

---

## Images

**No hero image needed** - This is a data application, not a marketing site. Focus on immediate data display and functional clarity from the first viewport.

---

## Data Visualization Principles

- **Conditional Formatting**: Positive P&L in green tones, negative in red tones
- **Numeric Precision**: Always show 2 decimal places for prices, appropriate precision for percentages
- **Visual Hierarchy**: Most important numbers (Total P&L, Win Rate) largest and boldest
- **Scanability**: Consistent alignment (right-align numbers), monospace for tabular data