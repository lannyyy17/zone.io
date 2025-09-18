# **App Name**: Zone Explorer

## Core Features:

- Data Ingestion: Fetch network signal data from the Cloud Firestore database, including latitude, longitude, and signal strength. Uses Firestore to access a `network_signals` collection and retrieve documents, with each document representing a data point for signal strength at a specific location.
- Map Visualization: Display an interactive map using Leaflet.js, visualizing network signal data as a heatmap. Uses the latitude, longitude, and signal_strength to visually represent network performance. Stronger signals are represented by warmer colors.
- Dynamic Background: Implement a dynamic background with animated translucent circles, adding a visually engaging element to the dashboard. It features three overlapping, translucent circles in different sizes and shades of purple and pink. These circles have a subtle, continuous animation.
- Tagline Display: Show the tagline: 'Your network's blind spots, revealed. Crowdsourced signal mapping for better networks.' to clearly communicate the app's purpose.

## Style Guidelines:

- Primary color: Medium purple (#9370DB) for a modern and sophisticated feel, reflecting network analysis.
- Background color: Light purple (#E6E0FF) to provide a soft, unobtrusive backdrop.
- Accent color: Pink (#FF69B4) to highlight interactive elements and call-to-actions, drawing attention to key functionalities.
- Body and headline font: 'Inter', a sans-serif font that is versatile enough for both headlines and body text.
- Fullscreen map layout to emphasize the geographical data visualization. A side panel accommodates branding and additional UI elements, maintaining a focus on the map.
- Subtle, continuous animation for the background circles, adding visual interest without distracting from the map.