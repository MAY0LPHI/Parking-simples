# Design Guidelines: Sistema de Controle de Estacionamento

## Design Approach

**Selected Approach:** Design System - Material Design 3

**Justification:** This parking management system is utility-focused with information-dense displays requiring efficient data entry, real-time status monitoring, and clear financial calculations. Material Design provides robust patterns for forms, tables, and action-oriented interfaces commonly found in operational dashboards.

**Key Design Principles:**
- Clarity over decoration: Prioritize readability and data comprehension
- Efficient workflows: Minimize clicks for entry/exit registration
- Real-time feedback: Visual confirmation of actions and calculations
- Scannable information: Quick status assessment of parked vehicles

---

## Typography

**Font Family:** Inter (via Google Fonts CDN)

**Hierarchy:**
- Page titles: 28px/semibold
- Section headers: 20px/semibold
- Card titles: 16px/medium
- Body text: 14px/regular
- Data labels: 12px/medium (uppercase, letter-spacing: 0.5px)
- Numbers/prices: 16px/medium (tabular figures)
- License plates: 18px/mono (monospace for alignment)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4, p-6
- Section gaps: gap-4, gap-6
- Margins: m-2, m-4, m-8
- Card spacing: p-6

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-4
- Dashboard layout: 2-column on desktop (sidebar + main content)
- Responsive breakpoints: Stack to single column on mobile

---

## Component Library

### Navigation
**Sidebar Navigation (Fixed Left, Desktop Only)**
- Width: 240px
- Menu items with icon + label
- Active state indicator (border-left accent)
- Navigation items: Dashboard, Configurações
- Mobile: Hamburger menu with slide-out drawer

### Dashboard Components

**Vehicle Entry Card**
- Prominent placement at top of main content
- Input fields arranged vertically
- License plate input with format validation display
- Vehicle type selector (radio buttons: Carro/Moto with icons)
- Large primary action button "Registrar Entrada"
- Real-time validation feedback below plate input

**Active Vehicles Table**
- Full-width data table with fixed header
- Columns: Placa | Tipo | Entrada | Tempo Decorrido | Ação
- Row actions: "Registrar Saída" button per vehicle
- Alternating row treatment for scannability
- Empty state message when no vehicles parked
- Timer updates every minute showing elapsed time

**Exit Confirmation Modal**
- Center overlay with backdrop
- Display: Vehicle details, entry time, duration, itemized charges
- Breakdown: Base charge + Overnight charge (if applicable) + Free time deduction
- Total prominently displayed
- Actions: "Confirmar Saída" (primary) + "Cancelar" (secondary)

**History Section**
- Collapsible accordion or separate tab
- Chronological list of completed sessions
- Each entry shows: Placa, Tipo, Entrada, Saída, Permanência, Valor Cobrado
- Filter options: Date range, vehicle type

### Configuration Panel

**Settings Cards**
- Organized into logical groups using card components
- Card structure: Title + Description + Form fields
- Groups:
  1. "Tarifas por Hora" (Hourly Rates)
  2. "Adicional Pernoite" (Overnight Charges)
  3. "Tempo Gratuito" (Free Time Period)

**Input Fields:**
- Currency inputs with R$ prefix
- Number inputs with + / - steppers
- Labels positioned above inputs
- Help text below describing what each value affects
- "Salvar Configurações" button at bottom (full-width on mobile)

### Forms & Inputs

**Text Inputs:**
- Height: h-12
- Border radius: rounded-lg
- Focus state with visible ring
- Label + input + helper/error text pattern
- Monospace font for license plate input

**Buttons:**
- Primary: Large (h-12), rounded-lg, font-medium
- Secondary: Outlined style, same dimensions
- Icon buttons: Square (h-10 w-10) for compact actions
- Loading states with spinner

**Radio Buttons (Vehicle Type):**
- Large touch targets (min 44px)
- Icon + label horizontal layout
- Visual card treatment when selected
- Icons: Car and motorcycle symbols (from Heroicons)

### Data Display

**Stat Cards (Dashboard Header):**
- 3-column grid on desktop, stack on mobile
- Display: Veículos Ativos | Entradas Hoje | Receita Hoje
- Large number (24px) + small label below
- Icon accent in corner

**Price Display:**
- Tabular figures for alignment
- Format: R$ XX,XX
- Breakdown in itemized list for exit calculation

### Feedback Elements

**Validation Messages:**
- Inline below inputs
- Icon + text pattern
- Error state shows format example: "AAA-0000 ou AAA-0A00"

**Toast Notifications:**
- Top-right positioning
- Auto-dismiss after 4 seconds
- Types: Success (entry/exit confirmed), Error (validation failed)

---

## Interaction Patterns

**Entry Workflow:**
1. Focus automatically on license plate input on page load
2. Real-time validation as user types
3. Vehicle type defaults to "Carro"
4. Submit button disabled until valid plate entered
5. Success toast + table update + input clear on registration

**Exit Workflow:**
1. Click "Registrar Saída" in table row
2. Modal opens with calculation breakdown
3. Confirm action triggers payment summary
4. Vehicle removed from active table, added to history

**Configuration Changes:**
- Changes saved immediately on button click
- Success confirmation message
- New rates apply to subsequent entries (not retroactive)

---

## Responsive Behavior

**Desktop (>1024px):**
- Sidebar navigation visible
- Multi-column layouts active
- Table shows all columns

**Tablet (768px-1024px):**
- Collapsible sidebar
- Reduced columns in table
- Stack stat cards to 2 columns

**Mobile (<768px):**
- Hamburger menu
- Single column layout
- Horizontal scroll for table or simplified card view
- Bottom-sheet style modals

---

## Accessibility

- All interactive elements keyboard accessible
- Clear focus indicators on all inputs
- Form labels properly associated
- Error messages announced to screen readers
- Sufficient touch target sizes (minimum 44px)
- Consistent tab order through workflows