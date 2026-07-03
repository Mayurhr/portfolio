# 🌐 Mayur H R – Personal Portfolio

<p align="center">
  <img src="assest/logo/logo.jpg" width="150" alt="Mayur H R Portfolio Logo">
</p>

<h3 align="center">
A modern, responsive, and interactive portfolio showcasing my technical skills, projects, education, achievements, and certifications.
</h3>

<p align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-success?style=for-the-badge)
![JSON](https://img.shields.io/badge/Data-JSON-blue?style=for-the-badge)
![Google Drive](https://img.shields.io/badge/Certificates-Google%20Drive-green?style=for-the-badge)

</p>

---

# 📖 About the Project

This portfolio is designed to present my professional profile in a clean, interactive, and recruiter-friendly manner.

It highlights my:

- 👨‍💻 Technical Skills
- 🚀 Projects
- 🎓 Education
- 🏆 Certifications
- 📜 Achievements
- 📞 Contact Information

Rather than hardcoding certificate cards, the website uses a **dynamic JSON-driven architecture**, making it easy to maintain and scale as new certifications are added.

---

# ✨ Key Features

## 🎨 Modern Portfolio

- Responsive Design
- Mobile, Tablet & Desktop Optimized
- Smooth User Experience
- Clean UI
- Professional Layout
- Interactive Sections

---

## 🏆 Dynamic Certificate Gallery

A dedicated certificates page provides an advanced browsing experience.

### Features

- 📂 Certificates loaded dynamically from **certificates.json**
- ☁️ Images hosted on **Google Drive**
- 🔄 Automatic Google Drive thumbnail conversion
- 🔍 Live Search
- 🏢 Institution Filter
- 🏷️ Category Filter
- 📅 Year Filter
- ⭐ Featured Certificate Highlighting
- 🖼️ Full-size Certificate Preview
- 📄 Pagination
- ❌ Clear Filters
- Responsive Grid Layout

No certificate cards are hardcoded into the HTML.

Simply updating **certificates.json** automatically updates the gallery.

---

# 📂 Project Structure

```
portfolio-main/
│
├── index.html
├── certificates.html
├── styles.css
├── script.js
├── certificates.js
├── certificate-shared.js
├── certificates.json
│
├── assest/
│   ├── logo/
│   │      logo.jpg
│   │
│   └── videos/
│          demo.mp4
│
└── README.md
```

---

# ⚙️ Technologies Used

| Technology | Purpose |
|------------|----------|
| HTML5 | Website Structure |
| CSS3 | Styling & Responsive Design |
| JavaScript (ES6) | Dynamic Functionality |
| JSON | Certificate Data Management |
| Google Drive | Certificate Image Hosting |
| Boxicons | Modern Icons |

---

# 🧠 Dynamic Certificate System

The certificate gallery follows a modular architecture.

```
certificates.json
        │
        ▼
certificates.js
        │
        ▼
certificate-shared.js
        │
        ▼
Google Drive Image Processing
        │
        ▼
Dynamic Certificate Gallery
```

This approach provides:

- Easy maintenance
- Better scalability
- No repetitive HTML
- Faster certificate updates
- Cleaner project structure

---

# 🎥 Project Demo

A demonstration video of the portfolio is included in:

```
assest/videos/demo.mp4
```

The demo provides a walkthrough of the portfolio interface and certificate gallery.

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/portfolio.git
```

## Navigate to the Project

```bash
cd portfolio
```

## Launch Using a Local Server

Because the portfolio loads JSON data using the Fetch API, opening the HTML file directly using the `file://` protocol will not work.

Use any local server such as:

- VS Code Live Server
- Python HTTP Server
- XAMPP
- Node HTTP Server

Example:

```bash
python -m http.server
```

Then visit:

```
http://localhost:8000
```

or

```
http://localhost:5500
```

---

# 🌟 Highlights

✅ Modern Responsive UI

✅ Dynamic JSON Architecture

✅ Google Drive Certificate Integration

✅ Featured Certificates

✅ Live Search

✅ Institution Filtering

✅ Category Filtering

✅ Year Filtering

✅ Pagination

✅ Modal Certificate Preview

✅ Modular JavaScript

✅ Easy Future Scalability

---

# 💡 Why This Portfolio?

The portfolio is designed with simplicity, scalability, and usability in mind.

Key objectives include:

- Professional presentation
- Recruiter-friendly design
- Dynamic content management
- Easy certificate updates
- Clean project organization
- Responsive experience across devices
- Maintainable codebase

---

# 🔮 Future Enhancements

Planned improvements include:

- 🌍 Interactive 3D Globe Location
- 🌙 Dark / Light Theme
- 📊 GitHub Contribution Integration
- 📝 Blog Section
- 📄 Downloadable Resume
- 📬 Backend Contact Form
- 📈 Project Filtering
- 🌐 Multi-language Support
- ⚡ Performance Optimizations

---

# 🤝 Contributions

Suggestions, improvements, and feedback are always welcome.

Feel free to fork this repository, raise issues, or submit pull requests.

---

# 📬 Contact

If you'd like to connect, collaborate, or discuss opportunities, feel free to reach out through the contact section of the portfolio.

---

# ⭐ Support

If you found this project helpful or inspiring, consider giving the repository a ⭐.

Your support is greatly appreciated and motivates future improvements.

---

<p align="center">

## 🚀 Designed & Developed by Mayur H R

*"Transforming ideas into elegant and impactful web experiences."*

</p>