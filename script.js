// Config and State
const HOUSE_COORDS = { lat: 14.2472, lng: 75.6203 }; // Honnali, Karnataka coordinates
const resumeFileId = "1YSaDrZv8_H2XIdL5ohuMI_Lmj4EoC_2J";

let allCertificates = [];
let featuredCertificates = [];
let globeInstance = null;
let cloudsAnimationId = null;

// ==========================================
// 1. DYNAMIC SCRIPTS & DRIVE IMAGE LOADER
// ==========================================

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
// 4. FULLSCREEN 3D EARTH EXPERIENCE
// ==========================================

async function openEarthExperience() {
  const overlay = document.getElementById('earthOverlay');
  const loader = document.getElementById('earthLoading');
  const popupCard = document.getElementById('pinPopupCard');
  
  overlay.classList.remove('hidden');
  loader.classList.remove('hidden');
  popupCard.classList.add('hidden');
  document.body.classList.add('modal-open');
  
  try {
    // Dynamically load Three.js first, then Globe.gl UMD
    await loadScript('https://unpkg.com/three@0.146.0/build/three.min.js');
    await loadScript('https://unpkg.com/globe.gl');
    
    if (typeof Globe === 'undefined') {
      throw new Error('Globe.gl failed to load.');
    }
    
    const container = document.getElementById('earthContainer');
    container.innerHTML = '';
    
    // Initialize 3D Globe
    globeInstance = Globe()(container)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#80d0ff')
      .atmosphereAltitude(0.18)
      .enableZoom(true);
      
    const controls = globeInstance.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 350;
    controls.minDistance = 12;
    
    // Set rotating Clouds layer using Three.js mesh
    const THREE = window.THREE;
    if (THREE) {
      const CLOUDS_IMG_URL = 'https://unpkg.com/three-globe/example/img/earth-clouds.png';
      const CLOUDS_ALT = 0.005;
      const CLOUDS_ROT_SPEED = -0.005; 

      new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTxt => {
        const cloudsMesh = new THREE.Mesh(
          new THREE.SphereGeometry(globeInstance.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
          new THREE.MeshPhongMaterial({ map: cloudsTxt, transparent: true })
        );
        globeInstance.scene().add(cloudsMesh);

        function rotateClouds() {
          if (!globeInstance) return;
          cloudsMesh.rotation.y += CLOUDS_ROT_SPEED * Math.PI / 180;
          cloudsAnimationId = requestAnimationFrame(rotateClouds);
        }
        rotateClouds();
      });
    }
    
    // Pin Marker Data
    const markerData = [{
      lat: HOUSE_COORDS.lat,
      lng: HOUSE_COORDS.lng,
      name: 'Mayur H R',
      location: 'Honnali, Karnataka',
      role: 'Software Developer',
      img: 'assest/logo/myimg.jpeg'
    }];
    
    globeInstance
      .htmlElementsData(markerData)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.className = 'custom-globe-marker';
        el.innerHTML = `
          <div class="marker-pulse"></div>
          <div class="marker-ripple"></div>
          <div class="marker-pin">
            <img src="${d.img}" alt="${d.name}" />
          </div>
          <div class="marker-tooltip">
            <span class="tooltip-icon">📍</span>
            <div class="tooltip-content">
              <div class="tooltip-name">${d.name}</div>
              <div class="tooltip-loc">${d.location}</div>
              <div class="tooltip-role">${d.role}</div>
            </div>
          </div>
        `;
        
        el.querySelector('.marker-pin').addEventListener('click', (e) => {
          e.stopPropagation();
          showPopupCard();
        });
        
        return el;
      });
      
    // Set initial viewpoint in space
    globeInstance.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0);
    
    // Hide loader and start fly-in transition
    setTimeout(() => {
      loader.classList.add('hidden');
      runCinematicFlight();
    }, 1200);
    
  } catch (error) {
    console.error(error);
    loader.innerHTML = `
      <div class="earth-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>Could not load 3D orbit visualization.</p>
        <button onclick="closeEarthExperience()" class="close-orbit-err-btn">Go Back</button>
      </div>
    `;
  }
}

function runCinematicFlight() {
  if (!globeInstance) return;
  
  // Sequence of flight: India -> Karnataka -> Honnali -> House Location
  globeInstance.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 1.5 }, 2500);
  
  setTimeout(() => {
    if (!globeInstance) return;
    globeInstance.pointOfView({ lat: 15.3173, lng: 75.7139, altitude: 0.7 }, 2000);
    
    setTimeout(() => {
      if (!globeInstance) return;
      globeInstance.pointOfView({ lat: HOUSE_COORDS.lat, lng: HOUSE_COORDS.lng, altitude: 0.18 }, 1800);
      
      setTimeout(() => {
        if (!globeInstance) return;
        globeInstance.pointOfView({ lat: HOUSE_COORDS.lat, lng: HOUSE_COORDS.lng, altitude: 0.025 }, 1500);
        
        setTimeout(() => {
          showPopupCard();
        }, 1500);
      }, 1800);
    }, 2000);
  }, 2500);
}

function showPopupCard() {
  const card = document.getElementById('pinPopupCard');
  card.classList.remove('hidden');
  card.classList.add('show');
}

function closeEarthExperience() {
  const overlay = document.getElementById('earthOverlay');
  overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  
  if (cloudsAnimationId) {
    cancelAnimationFrame(cloudsAnimationId);
    cloudsAnimationId = null;
  }
  
  // WebGL memory cleanup
  if (globeInstance) {
    try {
      const renderer = globeInstance.renderer();
      if (renderer) {
        renderer.dispose();
        if (renderer.forceContextLoss) {
          renderer.forceContextLoss();
        }
        const gl = renderer.getContext();
        if (gl) {
          const loseContext = gl.getExtension('WEBGL_lose_context');
          if (loseContext) loseContext.loseContext();
        }
      }
    } catch (e) {
      console.warn('Error releasing WebGL resources:', e);
    }
    globeInstance = null;
  }
  
  document.getElementById('earthContainer').innerHTML = '';
}

// Global escape key to close Earth experience
document.addEventListener("keydown", (e) => {
  const earthOverlay = document.getElementById('earthOverlay');
  if (earthOverlay && !earthOverlay.classList.contains("hidden")) {
    if (e.key === "Escape") {
      closeEarthExperience();
    }
  }
});

// ==========================================
// 5. EXISTING PROJECT LOGIC (PRESERVED)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Fetch certificates from JSON
  fetch("certificates.json")
    .then(res => res.json())
    .then(data => {
      allCertificates = data;
      renderFeaturedCertificates();
    });

  // Location link trigger
  const locationIcon = document.getElementById("locationIcon");
  if (locationIcon) {
    locationIcon.addEventListener("click", (e) => {
      e.preventDefault();
      openEarthExperience();
    });
  }
  
  // Close buttons
  const closeEarthBtn = document.getElementById("closeEarth");
  if (closeEarthBtn) {
    closeEarthBtn.addEventListener("click", closeEarthExperience);
  }
  
  const closePopupCardBtn = document.getElementById("closePopupCard");
  if (closePopupCardBtn) {
    closePopupCardBtn.addEventListener("click", () => {
      document.getElementById("pinPopupCard").classList.add("hidden");
    });
  }
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