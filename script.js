// Config and State
const HOUSE_COORDS = { lat: 14.239259779665424, lng: 75.63912844909106 }; 
const resumeFileId = "1YSaDrZv8_H2XIdL5ohuMI_Lmj4EoC_2J";

let allCertificates = [];
let featuredCertificates = [];
// Google Drive URL Converter
function getGoogleDriveImageUrl(driveUrl) {
  if (!driveUrl) return "";

  if (driveUrl.includes("drive.google.com/thumbnail")) {
    return driveUrl;
  }

  let fileId = "";

  const matchD = driveUrl.match(/\/file\/d\/([^/]+)/);
  if (matchD) {
    fileId = matchD[1];
  }

  if (!fileId) {
    const matchId = driveUrl.match(/[?&]id=([^&]+)/);
    if (matchId) fileId = matchId[1];
  }

  if (!fileId) return driveUrl;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w4000`;
}

// Create Image Element with Skeleton, Error State, and Retry
function createDriveImage(driveUrl, altText, className) {
  const wrapper = document.createElement('div');
  wrapper.className = 'drive-img-wrapper skeleton';
  
  const img = document.createElement('img');
  img.className = className || '';
  img.alt = altText || 'Certificate';
  img.loading = 'lazy';
  
  const embedUrl = getGoogleDriveImageUrl(driveUrl);
  img.src = embedUrl;
  
  let retries = 0;
  const maxRetries = 2;
  
  img.onload = () => {
    wrapper.classList.remove('skeleton');
  };
  
  img.onerror = () => {
    if (retries < maxRetries) {
      retries++;
      setTimeout(() => {
        img.src = `${embedUrl}&retry=${retries}`;
      }, 1000);
    } else {
      wrapper.classList.remove('skeleton');
      wrapper.classList.add('error-state');
      wrapper.innerHTML = `
        <div class="img-error-placeholder">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Failed to load image</span>
          <button class="img-retry-btn">Retry</button>
        </div>
      `;
      const retryBtn = wrapper.querySelector('.img-retry-btn');
      retryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.remove('error-state');
        wrapper.classList.add('skeleton');
        wrapper.innerHTML = '';
        retries = 0;
        img.src = `${embedUrl}&t=${Date.now()}`;
        wrapper.appendChild(img);
      });
    }
  };
  
  wrapper.appendChild(img);
  return wrapper;
}

// Script loader helper
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
// 2. HOMEPAGE CERTIFICATE RENDERER
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
// 3. FULLSCREEN CERTIFICATE VIEWER
// ==========================================

const modal = document.getElementById("modal");
const image = document.getElementById("imageViewer");
const closeModal = document.getElementById("closeModal");
let scale = 1;
let translateX = 0, translateY = 0;
let isDragging = false, startX, startY;
let activeIndex = 0;
let certsList = [];

window.openModal = function (src, index, list) {
  image.src = src;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  resetTransform();
  
  if (list && list.length > 0) {
    certsList = list;
    activeIndex = index;
    updateModalControls();
  }
};

function updateModalControls() {
  let prevBtn = document.getElementById("modalPrev");
  let nextBtn = document.getElementById("modalNext");
  
  if (certsList.length > 1) {
    if (!prevBtn) {
      prevBtn = document.createElement("button");
      prevBtn.id = "modalPrev";
      prevBtn.className = "modal-nav-btn prev";
      prevBtn.innerHTML = "❮";
      prevBtn.setAttribute("aria-label", "Previous Certificate");
      modal.appendChild(prevBtn);
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateModal(-1);
      });
    }
    if (!nextBtn) {
      nextBtn = document.createElement("button");
      nextBtn.id = "modalNext";
      nextBtn.className = "modal-nav-btn next";
      nextBtn.innerHTML = "❯";
      nextBtn.setAttribute("aria-label", "Next Certificate");
      modal.appendChild(nextBtn);
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateModal(1);
      });
    }
    prevBtn.style.display = "block";
    nextBtn.style.display = "block";
  } else {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
  }
}

function navigateModal(direction) {
  if (certsList.length === 0) return;
  activeIndex = (activeIndex + direction + certsList.length) % certsList.length;
  const cert = certsList[activeIndex];
  image.src = getGoogleDriveImageUrl(cert.driveLink);
  resetTransform();
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  resetTransform();
});

// Zoom with mouse scroll
image.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const newScale = Math.min(Math.max(scale * zoomFactor, 1), 4);
  const rect = image.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  const worldX = (offsetX - translateX) / scale;
  const worldY = (offsetY - translateY) / scale;

  scale = newScale;
  translateX = offsetX - worldX * scale;
  translateY = offsetY - worldY * scale;

  updateTransform();
}, { passive: false });

// Dragging zoomed image
image.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX - translateX;
  startY = e.clientY - translateY;
});

document.addEventListener("mouseup", () => (isDragging = false));

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  translateX = e.clientX - startX;
  translateY = e.clientY - startY;
  updateTransform();
});

function resetTransform() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  updateTransform();
}

function updateTransform() {
  image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// Keyboard arrow controls for modal
document.addEventListener("keydown", (e) => {
  if (modal && !modal.classList.contains("hidden")) {
    if (e.key === "Escape") {
      closeModal.click();
    } else if (e.key === "ArrowLeft") {
      navigateModal(-1);
    } else if (e.key === "ArrowRight") {
      navigateModal(1);
    }
  }
});

// Mobile Swiping for modal
let touchStartX = 0;
let touchEndX = 0;

modal.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

modal.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 55;
  if (touchEndX < touchStartX - swipeThreshold) {
    navigateModal(1);
  } else if (touchEndX > touchStartX + swipeThreshold) {
    navigateModal(-1);
  }
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
window.openResumeModal = function(e) {
  e.preventDefault();
  const previewUrl = `https://drive.google.com/file/d/${resumeFileId}/preview`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${resumeFileId}`;

  document.getElementById("resumeFrame").src = previewUrl;
  document.getElementById("previewResumeBtn").href = `https://drive.google.com/file/d/${resumeFileId}/view`;
  document.getElementById("downloadResumeBtn").href = downloadUrl;

  document.getElementById("resumeModal").style.display = "flex";
};

window.closeResumeModal = function() {
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
