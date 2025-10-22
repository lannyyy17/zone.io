# Zone.io

**Zone.io** is a web-based network analysis tool designed to map and visualize signal strength in specific locations. The application allows users to conduct data collection "sessions" using two modes: a manual "Pinpoint" mode for dropping individual data points, or an automated "Area Scan" mode that periodically records signal data while the user moves.

## Key Features

*   **Dual Collection Modes**: Choose between manual "Pinpoint" drops or an automated "Area Scan" for continuous data logging.
*   **Live Signal Mapping**: See your data points appear in real-time on an interactive map, creating a heatmap of network quality.
*   **Performance Metrics**: The dashboard provides live monitoring of your current download speed, converted into a signal strength reading (dBm).
*   **Session Management**: All data is saved into sessions, which can be reviewed, renamed, or deleted from the Session History.
*   **AI-Powered Summaries**: Leverage Genkit to generate concise, insightful summaries of your collected session data.
*   **Data Export**: Export raw signal data from any session to a CSV file for further analysis.
*   **Utilities**: Includes a handy Download Time Calculator to estimate how long a download will take at a given speed.

## Tech Stack

*   **Framework**: Next.js (with App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS with shadcn/ui components
*   **Database**: Google Cloud Firestore
*   **Authentication**: Firebase Authentication (Anonymous Sign-In)
*   **Mapping**: Leaflet & React Leaflet
*   **Generative AI**: Genkit with Google's Gemini models

## Getting Started

The main application logic is centered around these key files:

*   `src/app/page.tsx`: The main entry point and layout component.
*   `src/components/dashboard.tsx`: The main dashboard view with feature cards.
*   `src/components/session-explorer-client.tsx`: The detailed view for a single session, including the map, charts, and data table.
*   `src/firebase/`: Contains all Firebase configuration, hooks, and providers.
*   `src/ai/`: Contains the Genkit flows for AI-powered features.