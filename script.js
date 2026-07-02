// Config and State
const HOUSE_COORDS = { lat: 14.239259779665424, lng: 75.63912844909106 };
const resumeFileId = "1YSaDrZv8_H2XIdL5ohuMI_Lmj4EoC_2J";

let allCertificates = [];
let featuredCertificates = [];
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ==========================================
// 1. HOMEPAGE CERTIFICATE RENDERER
// ==========================================

function renderFeaturedCertificates() {
  const featuredGrid = document.getElementById("featuredCertificateContainer");
  if (!featuredGrid) return;
  featuredGrid.innerHTML = "";

  featuredCertificates = allCertificates.filter(cert => cert.highlight === true);

  featuredCertificates.forEach((cert, idx) => {
    const card = document.createElement("div");
    card.className = "certificate-card highlighted-certificate";

    // Create custom badge
    const badge = document.createElement("div");
    badge.className = "highlight-badge";
    const category = cert.category?.toLowerCase() || "";
    if (category.includes("hackathon")) {
      badge.innerHTML = "🏆 Hackathon";
    } else if (category.includes("quiz")) {
      badge.innerHTML = "🧠 Quiz";
    } else if (category.includes("course")) {
      badge.innerHTML = "🎓 Course";
    } else if (category.includes("workshop")) {
      badge.innerHTML = "📜 Workshop";
    } else {
      badge.innerHTML = "🌟 Featured";
    }
    card.appendChild(badge);

    // Google Drive image with skeleton loader
    const imgWrapper = createDriveImage(cert.driveLink, cert.title, "certificate-thumb");

    // Zoom viewer trigger
    imgWrapper.addEventListener("click", () => {
      openModal(getGoogleDriveImageUrl(cert.driveLink), idx, featuredCertificates);
    });

    const title = document.createElement("div");
    title.className = "certificate-title";
    title.textContent = cert.title;

    const infoRow = document.createElement("div");
    infoRow.className = "certificate-info-row";
    infoRow.innerHTML = `
      <span class="cert-card-issuer">${cert.issuer}</span>
      <span class="cert-card-year">${cert.year}</span>
    `;

    card.appendChild(imgWrapper);
    card.appendChild(title);
    card.appendChild(infoRow);

    featuredGrid.appendChild(card);
  });
}

// ==========================================
// 4. EXISTING PROJECT LOGIC 
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  fetch("certificates.json")
    .then(res => res.json())
    .then(data => {
      allCertificates = data;
      renderFeaturedCertificates();
    });
});

// Back to Top button
window.addEventListener('scroll', () => {
  const backToTop = document.getElementById('backToTop');
  if (window.pageYOffset > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Sticky Header
const stickyHeader = document.getElementById("stickyHeader");
const mainNavbar = document.querySelector(".main-content .navbar");
const headerHeight = 90;

function handleScroll() {
  if (window.innerWidth > 768) {
    if (window.scrollY > 200) {
      stickyHeader.style.display = "block";
      mainNavbar.classList.add("hidden");
    } else {
      stickyHeader.style.display = "none";
      mainNavbar.classList.remove("hidden");
    }
  } else {
    stickyHeader.style.display = "none";
    mainNavbar.classList.remove("hidden");
  }
}

window.addEventListener("scroll", handleScroll);
window.addEventListener("resize", handleScroll);
document.addEventListener("DOMContentLoaded", handleScroll);

document.querySelectorAll('#stickyHeader a, .navbar a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop =
        target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });

      if (window.innerWidth > 768) {
        stickyHeader.style.display = "none";
        mainNavbar.classList.remove("hidden");
      }
    }
  });
});

// Resume modal handlers
window.openResumeModal = function (e) {
  e.preventDefault();
  const previewUrl = `https://drive.google.com/file/d/${resumeFileId}/preview`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${resumeFileId}`;

  document.getElementById("resumeFrame").src = previewUrl;
  document.getElementById("previewResumeBtn").href = `https://drive.google.com/file/d/${resumeFileId}/view`;
  document.getElementById("downloadResumeBtn").href = downloadUrl;

  document.getElementById("resumeModal").style.display = "flex";
};

window.closeResumeModal = function () {
  document.getElementById("resumeModal").style.display = "none";
  document.getElementById("resumeFrame").src = "";
};

window.addEventListener("click", (e) => {
  const resumeModal = document.getElementById("resumeModal");
  if (e.target === resumeModal) {
    closeResumeModal();
  }
});

// Contact message sending via EmailJS
(function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init("XxOgLCe6y7RiVEjQF");
  }
})();

const messageForm = document.getElementById("contactForm");
if (messageForm) {
  messageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm(
      "service_j6prcik",
      "template_5030d17",
      this
    ).then(() => {
      alert("✅ Message sent successfully!");
      this.reset();
    }).catch(() => {
      alert("❌ Failed to send message. Try again later.");
    });
  });
}

AOS.init({
  duration: 1000,
  once: true,
  easing: "ease-out-cubic"
});
/*PROJECT VIDEO PLAYER*/
const projectModal = document.getElementById("projectVideoModal");
const projectVideo = document.getElementById("projectVideo");
const projectTitle = document.getElementById("videoProjectTitle");
const closeProjectVideo = document.querySelector(".close-project-video");

const projectPlayer = new Plyr(projectVideo, {

  controls: [
    "play",
    "progress",
    "current-time",
    "duration",
    "settings",
    "fullscreen"
  ],

  settings: ["speed"],

  speed: {
    selected: 1,
    options: [0.5, 1, 1.25, 1.5, 2]
  }

});

document.querySelectorAll(".preview-btn").forEach(btn => {

  btn.addEventListener("click", function () {

    projectTitle.textContent = this.dataset.title;

    projectPlayer.source = {
      type: "video",
      sources: [
        {
          src: this.dataset.video,
          type: "video/mp4"
        }
      ]
    };

    projectModal.classList.add("active");

    projectPlayer.play();

  });

});

function closePlayer() {

  projectPlayer.pause();

  projectPlayer.stop();

  projectModal.classList.remove("active");

}

closeProjectVideo.addEventListener("click", closePlayer);

projectModal.addEventListener("click", function (e) {

  if (e.target === projectModal) {
    closePlayer();
  }

});

document.addEventListener("keydown", function (e) {

  if (e.key === "Escape") {
    closePlayer();
  }

});