# MMS Frontend

Web dashboard for visualizing environmental data collected from IoT devices in the MMS monitoring system.

---

## Overview

This frontend provides the visualization layer of the MMS system, allowing users to monitor environmental readings through a web interface.

It is designed to present sensor data in a clear and accessible way using cards, historical records and charts.

---

## Technologies

- React
- Vite
- JavaScript
- CSS

---

## Features

- real-time data visualization
- historical readings display
- operational summary
- charts for monitoring data behavior
- integration with the MMS backend API
- responsive interface for desktop and mobile access

---

## Project Structure

- `src/` → application source code
- `public/` → static assets
- `package.json` → project dependencies and scripts
- `vite.config.js` → Vite configuration

---

## Getting Started

```bash
git clone https://github.com/rusilveira/mms-frontend.git
cd mms-frontend
npm install
npm run dev
```
Access the application at:
http://localhost:5173

---

## Backend Integration

This application consumes data from the MMS backend API.
Make sure the backend is running before starting the frontend in local development.

Example backend address:
http://localhost:3000

---

## Deployment

Production version:
https://mms-frontend-ten.vercel.app

---

## Role in the System

This repository represents the visualization layer of the MMS system, responsible for:

- displaying readings collected by IoT devices
- organizing environmental data into an accessible interface
- supporting monitoring and analysis through charts and summaries

--- 

## Future Improvements

- support for multiple monitored units
- more advanced filtering options
- improved mobile experience
- connection status indicators
- alert and notification features

---

## License

This project is protected under a custom license.

It is provided for viewing and educational purposes only.
Unauthorized use, copying, modification, or distribution is strictly prohibited.

See the LICENSE file for more details.
