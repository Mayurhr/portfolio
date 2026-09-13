// Config and State
const HOUSE_COORDS = { lat: 14.239259779665424, lng: 75.63912844909106 };
const resumeFileId = "1Z6FwOn8scdrFS2vJ2wHba8zNFmVU3fdn";

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

  // Featured certificates, with the richer viewAchievement experience
  // surfaced first (featured itself stays independent — this only reorders
  // within the certificates that are already featured)
  featuredCertificates = allCertificates
    .filter(cert => cert.featured === true)
    .sort((a, b) => (b.viewAchievement === true) - (a.viewAchievement === true));

  featuredCertificates.forEach((cert) => {
    const card = document.createElement("div");
    card.className = "certificate-card highlighted-certificate";

    // Create custom badge
    const badge = document.createElement("div");
    badge.className = "highlight-badge";
    badge.innerHTML = getCertificateBadgeLabel(cert.category);
    card.appendChild(badge);

    // Google Drive image with skeleton loader
    const imgWrapper = createDriveImage(cert.driveLink, cert.title, "certificate-thumb");

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

    // Only show the "View Achievement" hint when this certificate actually
    // has the richer Achievement experience enabled
    if (cert.viewAchievement === true) {
      const viewAchievementHint = document.createElement("div");
      viewAchievementHint.className = "view-achievement-hint";
      viewAchievementHint.innerHTML = `View Achievement <i class="fas fa-arrow-right"></i>`;
      card.appendChild(viewAchievementHint);
    }

    // Opens the Achievement panel (if viewAchievement: true) or the normal
    // certificate image viewer (if viewAchievement: false)
    if (typeof wireCertificateCard === "function") {
      wireCertificateCard(card, cert);
    }

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

// ============================================================================
// SKILLS SECTION — "Tech Constellation"
// Scroll-reveal stagger + pointer-driven 3D tilt on each cluster.
// Tilt is desktop-only (fine pointer + hover capable) and skipped entirely
// under prefers-reduced-motion; touch/mobile just gets the reveal fade.
// ============================================================================
(function () {
  const skillsSystem = document.querySelector("[data-skills-system]");
  if (!skillsSystem) return;

  const panels = Array.from(skillsSystem.querySelectorAll(".skills-reveal"));
  if (!panels.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Stagger delay: read the panel's position (data-reveal-i) into a CSS
  // custom property so the transition-delay in CSS can use it.
  panels.forEach((panel) => {
    const i = panel.getAttribute("data-reveal-i");
    if (i !== null) panel.style.setProperty("--reveal-i", i);
  });

  // Scroll reveal
  if (prefersReducedMotion || typeof IntersectionObserver !== "function") {
    panels.forEach((panel) => panel.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    panels.forEach((panel) => revealObserver.observe(panel));
  }

  // Pointer tilt + cursor-follow glow — desktop mouse/trackpad only
  if (!prefersReducedMotion && canHover) {
    const maxTilt = 7;

    skillsSystem.querySelectorAll("[data-tilt]").forEach((tiltEl) => {
      let raf = null;

      const handleMove = (e) => {
        const rect = tiltEl.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const clampedPx = Math.min(Math.max(px, 0), 1);
        const clampedPy = Math.min(Math.max(py, 0), 1);
        const rotY = (clampedPx - 0.5) * maxTilt * 2;
        const rotX = (0.5 - clampedPy) * maxTilt * 2;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          tiltEl.style.setProperty("--tilt-x", rotX.toFixed(2) + "deg");
          tiltEl.style.setProperty("--tilt-y", rotY.toFixed(2) + "deg");
          tiltEl.style.setProperty("--mx", (clampedPx * 100).toFixed(1) + "%");
          tiltEl.style.setProperty("--my", (clampedPy * 100).toFixed(1) + "%");
        });
      };

      tiltEl.addEventListener("pointerenter", (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        tiltEl.classList.add("is-tracking");
      });

      tiltEl.addEventListener("pointermove", (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        handleMove(e);
      });

      tiltEl.addEventListener("pointerleave", (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        tiltEl.classList.remove("is-tracking");
        tiltEl.style.setProperty("--tilt-x", "0deg");
        tiltEl.style.setProperty("--tilt-y", "0deg");
        tiltEl.style.setProperty("--mx", "50%");
        tiltEl.style.setProperty("--my", "35%");
      });
    });
  }
})();
