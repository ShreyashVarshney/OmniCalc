# OmniCalc — Full-Stack MERN Calculator ⚡

A modern, high-precision, glassmorphism calculator web application built on the **MERN** stack (MongoDB, Express, React, Node.js).

---

## 🌟 Key Features

1. **4 Comprehensive Modes**:
   - **Basic / Standard**: Standard 4-function operations, parentheses, percentages, negation, and clear.
   - **Scientific**: Trigonometric functions (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`), hyperbolic (`sinh`), logarithms (`ln`, `log10`), powers (`x²`, `x³`, `xʸ`), roots (`√`, `∛`), constants ($\pi$, $e$, $\phi$), factorials ($n!$), and degree/radian toggling.
   - **Unit Converter**: Real-time conversions across Length, Mass/Weight, Temperature, Digital Data Storage, and Speed, with one-click saving directly to MongoDB history.
   - **Programmer Mode**: Real-time simultaneous representation in **HEX**, **DEC**, **OCT**, and **BIN** (with 4-bit nibble formatting), plus bitwise operators (`AND`, `OR`, `XOR`, `NOT`, `<<`, `>>`).

2. **MongoDB Cloud & Local Persistence**:
   - Calculations and unit conversions are automatically persisted to MongoDB via Mongoose.
   - If MongoDB is temporarily offline or unreachable, the server seamlessly falls back to a high-performance local store (`server/data/calculations.json`), ensuring uninterrupted functionality.
   - Real-time MongoDB connection indicator with database status modal and latency ping.

3. **History Drawer & Starred Favorites**:
   - Slide-over glassmorphic drawer.
   - Real-time search across expressions and results.
   - Star / Favorite your frequent calculations.
   - Click any past calculation to immediately reload it into the calculator.
   - Export history to JSON.
   - Delete individual items or clear all history.

4. **Interactive Tactile Experience & Audio**:
   - Synthesized Web Audio API tactile feedback (clicks, pops, operator chords, error buzz) with an audio toggle.
   - Full keyboard shortcuts: type digits, operators, `Enter` for equals, `Esc` for clear, `Backspace`, and parentheses.
   - Copy to clipboard with instant animated feedback.
   - Multiple sleek themes: **Obsidian Cyber** (dark neon cyan/indigo), **Cosmic Aurora** (violet/emerald), and **Nordic Frost** (clean light mode).

---

## 🛠️ Architecture

```
d:/Calculator/
├── client/                     # Frontend (React 19 + Vite)
│   ├── index.html              # HTML with Google Fonts & metadata
│   ├── src/
│   │   ├── components/         # Header, Display, Keypads, History, Converter, Status
│   │   ├── utils/              # Math engine, Web Audio synth, API client
│   │   ├── index.css           # Glassmorphism design system & themes
│   │   ├── App.jsx             # Main React application
│   │   └── main.jsx
│   └── vite.config.js          # Vite config with backend API proxy
├── server/                     # Backend (Express + Mongoose + Node.js)
│   ├── config/db.js            # MongoDB connection & fallback manager
│   ├── models/Calculation.js   # Mongoose schema
│   ├── controllers/            # Calculation & statistics controllers
│   ├── routes/                 # Express REST endpoints
│   ├── .env                    # MongoDB URI & server port configuration
│   └── index.js                # Express entry point
└── package.json                # Root concurrently dev scripts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Start Both Backend & Frontend
```bash
npm run dev
```
- **Development Mode (Vite + Express)**: `npm run dev`
  - Vite dev server: [http://localhost:5180](http://localhost:5180)
  - Backend API: [http://localhost:5000](http://localhost:5000)
- **Unified Single-Port Mode (Production React + Express + MongoDB)**: `npm start`
  - Unified Full-Stack App: [http://localhost:5000](http://localhost:5000)
  - Serves the compiled React frontend, static assets, PWA manifest, and MongoDB API endpoints together on port 5000!

### 3. 📱 Mobile & PWA Experience
- **Open on any smartphone**: Connect your phone to the same Wi-Fi network and open `http://192.168.1.4:5180`.
- **Install as Native Mobile App (PWA)**:
  - **iPhone (Safari)**: Tap the **Share** button -> Tap **"Add to Home Screen"**. It opens fullscreen with its own custom app icon and no browser navigation bars!
  - **Android (Chrome)**: Tap the **three dots menu** -> Tap **"Install app"** or **"Add to Home screen"**.
- **Mobile Swipe to Backspace**: Swipe left or right across the numbers on the display to delete the last digit (native iOS calculator feel).
- **Physical Device Haptics**: Automatically triggers responsive vibration pulses on key taps via `navigator.vibrate`.
- **Landscape Auto-Expansion**: Rotate your phone sideways to automatically expand into full scientific side-by-side mode!

### 4. 🌐 Share with Anyone Worldwide (Cloudflare Tunnel)
You can share OmniCalc with friends in any city or open it anywhere over mobile data without opening router ports or configuring firewall rules:

1. **Start the Unified Server** in one terminal:
   ```bash
   npm start
   ```
2. **Start the Cloudflare Tunnel** in a second terminal:
   ```bash
   npm run tunnel
   ```
3. Copy the generated `https://xxxx.trycloudflare.com` URL and send it to your friend!
   - Full HTTPS encryption
   - Zero login / zero password prompts
   - Both frontend and MongoDB backend run over the single secure link

### 5. MongoDB Configuration (Optional)
By default, the server connects to your local MongoDB service at `mongodb://127.0.0.1:27017/calculator`.

To use **MongoDB Atlas** (Cloud), update `server/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/calculator?retryWrites=true&w=majority
```

