# Mail Scanner

A little app to help me mark stuff as mailed.

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

## Usage

1. **Enter API Key**: On first load, enter your Hack Club Mail API key

   - You can also load your API key by scanning a QR code
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

## License

MIT
