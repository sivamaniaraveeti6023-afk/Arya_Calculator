# Colorful Calculator

A standalone calculator website built with HTML, CSS, and vanilla JavaScript.

## Run locally

From the `calculator` folder, start a quick local web server:

```bash
cd "C:\Users\Sivamani Araveeti\OneDrive\calculator"
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

You can also open `index.html` directly in a browser, but the local server is recommended for a smoother experience.

## Features

- Responsive calculator layout
- Decimal support and chained operations
- Clear and backspace controls
- Keyboard shortcuts for number entry, operators, Enter, Backspace, and Escape
- Graceful handling for division by zero and invalid input
- No `eval` usage; all calculations are parsed safely in JavaScript
