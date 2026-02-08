<div align="center">

# 🌿 CarbonLint

**Real-time carbon footprint monitoring for your development workflow**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)

<img src="https://img.shields.io/badge/carbon-aware-22C55E?style=for-the-badge&logo=leaf&logoColor=white" alt="Carbon Aware"/>

</div>

---

## What is CarbonLint?

CarbonLint is a real-time system profiler that tracks your computer's energy consumption and calculates its carbon footprint. It helps developers understand the environmental impact of their work and make greener choices.

### Features

| Feature | Description |
|---------|-------------|
| **Real-time Monitoring** | Live CPU, Memory tracking with instant feedback |
| **Carbon Calculation** | Convert energy usage to CO2 emissions by region |
| **Session Recording** | Start/stop profiling to capture specific workflows |
| **Historical Analytics** | Track trends over time with charts and reports |
| **Run Comparison** | Compare carbon footprint between sessions |
| **Smart Suggestions** | AI-powered optimization recommendations |
| **CI/CD Integration** | Monitor carbon in your build pipelines |
| **Customizable Thresholds** | Set carbon budgets and get alerts |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/carbonlint.git
cd carbonlint/dashboard

# Install dependencies
npm install

# Start the backend server
node server/index.js

# In a new terminal, start the frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Usage

### Start Profiling

1. Click **Start Profiling** on the Dashboard
2. Perform your development tasks
3. Click **Stop** to save the session
4. View results in the report

### Understanding Your Carbon Footprint

CarbonLint calculates emissions using:

```
Carbon (gCO2) = Energy (kWh) × Grid Intensity (gCO2/kWh) × PUE
```

| Region | Grid Intensity |
|--------|---------------|
| EU-NORTH (Sweden) | 25 gCO2/kWh |
| US-WEST (California) | 210 gCO2/kWh |
| US-EAST (Virginia) | 380 gCO2/kWh |
| ASIA-SOUTH (India) | 700 gCO2/kWh |

---

## Configuration

Edit settings in the dashboard or modify `data/settings.json`:

```json
{
  "region": "US-WEST",
  "pue": 1.0,
  "hardwareProfile": "laptop",
  "maxCarbon": 100,
  "maxEnergy": 0.5,
  "failOnThreshold": false
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Current system stats |
| `/api/stats/summary` | GET | Dashboard summary |
| `/api/runs` | GET | List all runs |
| `/api/runs/:id` | GET | Get specific run |
| `/api/profile/start` | POST | Start profiling |
| `/api/profile/stop` | POST | Stop and save |
| `/api/settings` | GET/POST | Get/update settings |

---

## Tech Stack

- **Frontend**: React 18, Vite, Chart.js, Lucide Icons
- **Backend**: Node.js, Express
- **Profiling**: systeminformation
- **Storage**: JSON files

---

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## Roadmap

- [ ] Desktop app (Electron) with system tray
- [ ] Auto-start on boot
- [ ] Per-application carbon tracking
- [ ] Cloud sync
- [ ] VS Code extension
- [ ] GitHub Action

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with 💚 for a greener planet**

[Report Bug](https://github.com/yourusername/carbonlint/issues) · [Request Feature](https://github.com/yourusername/carbonlint/issues)

</div>
