# Mail Scanner

A React + Tailwind app for automatically scanning QR codes and marking mail as mailed through the Hack Club Mail API.

## Features

- 📷 Automatic QR code scanning using webcam
- 🔊 Audio feedback on successful scan
- 🎨 Color-coded status indicators (gray/yellow/green/red)
- 📱 Mobile-friendly responsive design
- 💾 Local storage for API keys and scan history
- 🔍 Duplicate detection
- 📜 Scrollable scan history

## Quick Start

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

This creates a static site in the `dist/` directory that can be deployed anywhere.

### Testing

```bash
npm run test        # Run Playwright tests
npm run test:ui     # Run Playwright in UI mode
```

## Usage

1. **Enter API Key**: On first load, enter your Hack Club Mail API key
   - Optionally check "Store key locally" to persist it in localStorage

2. **Scan QR Codes**: Point your camera at QR codes containing letter URLs
   - Valid format: `https://hack.club/ltr!xxxxxxxx`
   - The scanner will automatically detect and process codes

3. **Status Colors**:
   - **Gray**: Idle, ready to scan
   - **Yellow**: Processing request
   - **Green**: Successfully marked as mailed (800ms)
   - **Red**: Error occurred (1.5s then returns to idle)
   - **Flashing Red**: Duplicate scan detected (flashes for 5 seconds, then solid red for 1.5s)

4. **View History**: Previously scanned letters appear in the history list at the bottom

## API Integration

The app interacts with the Hack Club Mail API:

- `POST /api/v1/letters/{id}/mark_mailed` - Mark a letter as mailed
- `GET /api/v1/letters/{id}` - Get letter status (for duplicate checking)

## Project Structure

```
src/
├── components/
│   ├── Scanner.tsx          # QR scanner wrapper
│   ├── HistoryList.tsx      # Scan history display
│   └── ApiKeyModal.tsx      # API key input modal
├── hooks/
│   └── useErrorSound.ts     # Error sound hook
├── utils/
│   ├── api.ts               # API client functions
│   ├── letterParser.ts      # Letter ID parsing
│   └── storage.ts           # localStorage utilities
├── types.ts                 # TypeScript types
└── App.tsx                  # Main app component
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **@point-of-sale/webcam-barcode-scanner** - QR code scanning
- **Playwright** - E2E testing

## Configuration

All configuration is in the source code:

- API base URL: `https://mail.hackclub.com`
- Scan debounce: 3 seconds
- Request timeout: 8 seconds
- History limit: 200 items

## Browser Compatibility

- Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- Mobile Safari (iOS)
- Chrome for Android

Camera permissions are required for QR scanning.

## License

MIT
