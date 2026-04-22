# MMS Frontend

Web dashboard for visualizing environmental data collected from IoT devices in the MMS monitoring system.

---

## Overview

This frontend provides the visualization layer of the MMS system, allowing users to monitor environmental readings through a web interface.

It presents sensor data in a clear and structured way using cards, historical records and charts, enabling real-time monitoring and analysis of beehive conditions.

---

## Technologies

* React
* Vite
* JavaScript
* CSS

---

## Features

* real-time data visualization
* historical readings display
* operational status classification (normal, attention, critical)
* charts for monitoring data behavior
* automatic insight generation based on sensor data
* backend API integration
* responsive interface for desktop and mobile access

---

## Project Structure

* `src/` → application source code
* `public/` → static assets
* `package.json` → project dependencies and scripts
* `vite.config.js` → Vite configuration

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

## Operational Thresholds

The system classifies sensor readings into **normal**, **attention**, and **critical** states based on biological and engineering references.

### Internal Temperature (°C)

* Normal: **30 – 36**
* Attention: **28 – 30** and **36 – 38**
* Critical: **< 28** or **> 38**

### Internal Humidity (%)

* Normal: **60 – 80**
* Attention: **50 – 60** and **80 – 90**
* Critical: **< 50** or **> 90**

### External Temperature (°C)

* Normal: **18 – 38**
* Attention: **< 18** or **> 38**

### External Humidity (%)

* Normal: **35 – 90**
* Attention: **< 35** or **> 90**

### Battery Voltage (V)

* Normal: **≥ 3.7**
* Attention: **3.4 – 3.7**
* Critical: **< 3.4**

---

## Offline Detection

The system considers a hive **offline** when no new data is received for more than:

```text
20 minutes
```

This value was defined considering the node operation cycle (deep sleep + transmission interval).

---

## Insights System

The frontend includes an automatic insight system that generates contextual messages based on:

* temperature deviations
* humidity conditions
* battery level
* weight variation trends
* internal vs external temperature difference

This allows quick interpretation of the hive condition without requiring raw data analysis.

---

## Role in the System

This repository represents the **visualization layer** of the MMS system, responsible for:

* displaying readings collected by IoT devices
* organizing environmental data into an accessible interface
* providing operational status and alerts
* supporting monitoring and analysis through charts and summaries

---

## Future Improvements

* support for multiple monitored hives
* configurable alert thresholds
* push notifications and alert system
* advanced filtering and analytics
* improved mobile experience

---

## License

This project is protected under a custom license.

It is provided for viewing and educational purposes only.
Unauthorized use, copying, modification, or distribution is strictly prohibited.

See the LICENSE file for more details.
