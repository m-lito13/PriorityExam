# Sound Search Application 🎵

A responsive, feature-rich React & TypeScript web application for discovering and playing audio tracks via the Mixcloud API. Built with Vite, modern React hooks, and tailored layout primitives.

🌐 **Live Demo**: [https://sound-search-wine.vercel.app/](https://sound-search-wine.vercel.app/)

---

## 🌟 Key Features

- 🌐 **Live Vercel Deployment**: Accessible directly in production at [https://sound-search-wine.vercel.app/](https://sound-search-wine.vercel.app/).
- 🔍 **Track Search & Discovery**: Search through thousands of audio tracks, sets, and podcasts powered by the Mixcloud API.
- ⚡ **Next/Previous Result Caching**: 
  - Advanced client-side caching mechanism for paginated search results (`next` and `prev` pages).
  - Pre-fetches and stores page responses in memory to eliminate redundant network requests during pagination, providing instant seamless navigation between result pages.
- 🕒 **Recent Searches History**: Automatically tracks user search queries and saves them in `localStorage` for quick re-access and search history management.
- 🎧 **Interactive Track Panel**: Full player controls with custom waveform visualization, audio metadata display, and controls.
- 📱 **Responsive & Mobile-First Design**: Auto-adjusts UI layouts for mobile devices vs. desktop displays using custom responsiveness hooks.
- 🧪 **Comprehensive Test Suite**:
  - Unit and integration testing setup using Vitest and React Testing Library.
  - **Hook Tests** (`sound-search/src/tests/hooks/`): Covers `useTrackSearch.test.ts` and `useRecentSearches.test.ts` to verify search state, result caching, pagination, and local storage synchronization.
  - **API Tests** (`sound-search/src/tests/api/`): Covers `mixcloudSoundApiClient.test.ts` for validating API requests, response parsing, and error handling.

---

## 🏗 Tech Stack & Architecture

- **Frontend Framework**: React 19 / TypeScript
- **Build Tool**: Vite
- **Deployment Platform**: Vercel
- **Styling & Primitive Components**: Custom theme, modular primitive layouts, CSS-in-JS styling
- **Testing**: Vitest, React Testing Library
- **Linting & Code Quality**: Oxlint

---

## 📁 Project Structure

```
sound-search/
├── .env                          # Environment variables (Port configuration)
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── errors.ts             # Custom API error handling
│   │   ├── index.ts              # API exports
│   │   ├── mixcloudSoundApiClient.ts # Mixcloud API client service
│   │   └── types.ts              # API request/response types
│   ├── components/               # React UI components
│   │   ├── RecentSearchesPanel.tsx
│   │   ├── ResultsFooterControls.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchPanel.tsx
│   │   ├── SearchResults.tsx
│   │   ├── TrackPanel.tsx
│   │   └── WaveformBars.tsx
│   ├── const/                    # Constants & configurations
│   ├── hooks/                    # Custom hooks
│   │   ├── useIsMobileDevice.ts
│   │   ├── useRecentSearches.ts
│   │   └── useTrackSearch.ts     # Search state & caching logic
│   ├── mock/                     # Mock data used only for testing
│   ├── tests/                    # Vitest unit test suites
│   │   ├── api/                  # API client tests (mixcloudSoundApiClient.test.ts)
│   │   └── hooks/                # Hook unit tests (useTrackSearch, useRecentSearches)
│   ├── theme/                    # Theme definitions & layout primitives
│   ├── types/                    # Common TypeScript type definitions
│   └── utils/                    # Utility functions (e.g., localStorage helpers)
├── package.json
└── vite.config.ts
```

---

## ⚡ Next/Previous Page Caching Mechanics

To enhance user experience and optimize API network consumption, pagination handles caching dynamically:

1. **In-Memory Cache**: The `useTrackSearch` hook maintains an internal cache mapping page parameters (`query`, `limit`, `offset`/cursor) to API response payloads.
2. **Instant Page Transitions**: When navigating back and forth (`prev` / `next`), cached results render immediately without triggering additional API loading states.
3. **Optimized Network Usage**: Prevents duplicate fetches when a user toggles between previously viewed result pages during the same search session.

---

## 🚀 Getting Started & Deployment

### Live Demo

Access the live application hosted on Vercel: **[https://sound-search-wine.vercel.app/](https://sound-search-wine.vercel.app/)**

### Prerequisites

Ensure you have Node.js (v18+) and npm installed on your machine.

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/m-lito13/PriorityExam.git
   cd sound-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Open your browser and navigate to **`http://localhost:3000`**.
   - *Note*: The application port is explicitly configured in the `.env` file (`PORT=3000`).

5. Run full test suite (including both API client and hook unit tests):
   ```bash
   npm test
   ```

---

