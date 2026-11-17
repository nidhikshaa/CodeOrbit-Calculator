# 🧮 Simple Calculator

> **CodeOrbit Tech Web Development Internship – Task 3**

A modern, elegant, fully responsive **Simple Calculator** built with pure HTML5, CSS3, and Vanilla JavaScript — no frameworks, no libraries, no shortcuts.

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Basic Arithmetic** | Addition, Subtraction, Multiplication, Division |
| **Decimal Support** | Full floating-point input with duplicate-dot prevention |
| **Percentage** | Relative (`50 + 10%` → `55`) and absolute (`50%` → `0.5`) modes |
| **Chained Operations** | Consecutive calculations without pressing `=` each time |
| **Clear (AC)** | Resets the entire calculator |
| **Delete (DEL)** | Removes the last typed character |
| **Division by Zero** | Friendly `"Cannot divide by zero"` message |
| **Error Recovery** | Invalid inputs handled gracefully; calculator stays usable |
| **Keyboard Support** | Full keyboard mapping (see table below) |
| **Responsive Design** | Adapts to desktop, tablet, and mobile screens |
| **Smooth Animations** | Hover lifts, press-sink effects, and adaptive font scaling |
| **No `eval()`** | Custom arithmetic engine — safe and predictable |
| **Accessible** | ARIA labels, `role` attributes, and keyboard focus rings |

---

## 🎹 Keyboard Shortcuts

| Key | Action |
|---|---|
| `0` – `9` | Enter digit |
| `+` `-` `*` `/` | Operator |
| `.` or `,` | Decimal point |
| `%` | Percentage |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last character |
| `Escape` | Clear all (AC) |

---

## 🛠 Technologies Used

- **HTML5** – Semantic markup with ARIA attributes
- **CSS3** – Custom properties, Grid layout, transitions, responsive breakpoints
- **Vanilla JavaScript (ES6+)** – Classes, destructuring, `switch` routing, event delegation

> No React · No Vue · No Bootstrap · No Tailwind · No jQuery · No external CDN

---

## 📁 Project Folder Structure

```
Simple-Calculator/
│
├── index.html          ← Main HTML document
├── css/
│   └── style.css       ← All styling and responsive rules
├── js/
│   └── script.js       ← All JavaScript logic
└── README.md           ← This file
```

---

## 🚀 How to Run Locally

**Option 1 – Open directly in a browser**
```
1. Download or clone this repository.
2. Navigate to the Simple-Calculator/ folder.
3. Double-click index.html to open it in your default browser.
```

**Option 2 – Use VS Code Live Server**
```
1. Open the Simple-Calculator/ folder in VS Code.
2. Install the "Live Server" extension (if not already installed).
3. Right-click index.html → "Open with Live Server".
4. The app opens at http://127.0.0.1:5500
```

**Option 3 – Python simple HTTP server**
```bash
cd Simple-Calculator
python -m http.server 8080
# Open http://localhost:8080 in your browser
```

---

## ⚙️ Calculator Functionality Explained

### State Management
All mutable state lives in a single `calc` object, making it easy to reason about the calculator's current condition at any point.

### Arithmetic Engine
The `compute(a, b, op)` function handles all four arithmetic operations using a `switch` statement — **no `eval()` is used anywhere**. This prevents code-injection risks and makes the logic transparent.

### Expression Parser Flow

```
User presses digit(s)
       ↓
User presses operator  ──→  stores previousValue + operator,
                             shows operator in expression line
       ↓
User presses digit(s)  ──→  builds second operand
       ↓
User presses "="       ──→  compute(prev, current, op)
                             display result, mark justCalculated = true
       ↓
User can continue      ──→  chained calculation starts with result
```

### Error Handling
- **Division by zero** → friendly message, calculator remains usable.
- **Multiple decimals** → second `.` is silently ignored.
- **Consecutive operators** → new operator replaces the previous one.
- **Empty / NaN inputs** → `isNaN` guard before every calculation.
- **Floating-point noise** → results rounded to 10 significant figures (`toPrecision(10)`).

### Keyboard Mapping
A single `keydown` listener maps physical keys to the same handler functions used by mouse clicks, ensuring identical behaviour regardless of input method.

---

## 🎨 Design Palette

| Element | Colour | Hex |
|---|---|---|
| Page background | Warm ivory | `#FFFBF8` |
| Calculator card | White | `#FFFFFF` |
| Primary accent | Soft rose pink | `#E8B8C4` |
| Secondary accent | Lavender | `#E8E0F5` |
| Display background | Very light grey | `#F5F3F6` |
| Text | Deep charcoal | `#34313A` |

---

## 👩‍💻 Author

**Nidhi**
Web Development Intern · CodeOrbit Tech
Task 3 – Simple Calculator

---

## 📄 License

This project was created as part of a structured internship programme and is shared for educational purposes.
