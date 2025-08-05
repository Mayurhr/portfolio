# 💼 Mayur H R – Personal Portfolio Website

A modern, responsive portfolio built using **HTML**, **CSS**, and **JavaScript**, featuring an enhanced **Certificates Gallery** powered by JSON data.

---

## 📚 Project Overview

This portfolio showcases:

- Hero banner, About section, Projects, Education, Contact form  
- **Certificates Gallery** with advanced filtering, modal previews, and pagination  

Built with a clean aesthetic and focused on readability and recruiter‑friendly design.

---

## 🔧 Key Features

- **Fully Responsive Layout**: Optimized for mobile, tablet, and desktop  
- **Certificates Gallery** (powered by `data/certificates.json`):  
  - Filter certificates by **Institution**,**catogory** and **Year**  
  - Live text search (by title or keyword)  
  - “Clear Filters” button to reset all filters  
  - Paginated display (9 certificates per page)  
- **Highlighted Certificates**: Flagged specific items (e.g. awarded, hackathons) with visual emphasis  
- **Popup Modal Viewer**: Preview certificate images in a modal overlay  
- **Image Thumbnails**: Stored in `assets/certificates/`, referenced in JSON  
- **Script file (`script.js`)** handles data loading, filtering, pagination, and modal logic  

---

## 🛠️ Technologies Used

- HTML5  
- CSS3 (Custom Properties & Variables)  
- JavaScript (Vanilla) — `script.js` contains all interactivity logic  
- **Boxicons** for UI icons  
- JSON data file (`certificates.json`)  
- Assets folder for certificate images  

---

## ⚠️ Important Setup Note

> **Please run via a Local Live Server** (for example, VSCode Live Server).  
> The certificate gallery uses `fetch()` to load JSON data, which will fail via `file://` protocol (static file access is blocked in modern browsers).

---

## 📁 Folder Structure
/
|— porfolio.html
|— style.css
|— script.js
|— /certificates(certificate image files)
|- /assest
| └─ /logo <-logo and myimage
|— certificates.json
\


---

## 🚀 Quick Start

1. Clone the repo  
2. Open project folder in VSCode  
3. Launch **Live Server** (or any simple local HTTP server)  
4. Visit `http://localhost:5500` (or relevant port) in your browser  

---

## 🌟 Future Enhancements

- Add **Pagination controls** UI  
- Option to download a PDF or certificate bundle  
- Add **Projects section filters** by technology tags  
- Integrate contact form with backend (e.g. email API)

---

⭐ Thanks for visiting my portfolio—hope you enjoy the smooth UX, filters, and gallery experience!



