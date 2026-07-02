// --------------------------------------------------------------------------
// 1. GOOGLE DRIVE IMAGE URL CONVERTER
// --------------------------------------------------------------------------
function getGoogleDriveImageUrl(driveUrl) {
  if (!driveUrl) return "";

  if (driveUrl.includes("drive.google.com/thumbnail")) {
    return driveUrl;
  }

  let fileId = "";

  // Pattern: /file/d/FILE_ID/...  or  /d/FILE_ID
  const matchD = driveUrl.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (matchD) {
    fileId = matchD[1];
  }

  // Pattern: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const matchId = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId) fileId = matchId[1];
  }

  if (!fileId) return driveUrl;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w4000`;
}

// --------------------------------------------------------------------------
// 2. DRIVE IMAGE ELEMENT WITH SKELETON / ERROR / RETRY STATES
// --------------------------------------------------------------------------
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

// --------------------------------------------------------------------------
// 3. FULLSCREEN CERTIFICATE VIEWER MODAL (shared by both pages)
// --------------------------------------------------------------------------
const modal = document.getElementById("modal");
const image = document.getElementById("imageViewer");
const closeModalBtn = document.getElementById("closeModal");

let scale = 1;
let translateX = 0, translateY = 0;
let isDragging = false, startX, startY;
let activeIndex = 0;
let certsList = [];

window.openModal = function (src, index, list) {
  image.src = src;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  resetTransform();

  if (list && list.length > 0) {
    certsList = list;
    activeIndex = index;
    updateModalControls();
  }
};

function closeModalFn() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  resetTransform();
}

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

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModalFn);
}

// Close when tapping/clicking the dark backdrop outside the modal box
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalFn();
  });
}

// Zoom with mouse scroll
if (image) {
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

  // Dragging zoomed image (desktop mouse)
  image.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  });
}

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
  if (image) {
    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
}

// Keyboard arrow controls for modal
document.addEventListener("keydown", (e) => {
  if (modal && !modal.classList.contains("hidden")) {
    if (e.key === "Escape") {
      closeModalFn();
    } else if (e.key === "ArrowLeft") {
      navigateModal(-1);
    } else if (e.key === "ArrowRight") {
      navigateModal(1);
    }
  }
});

// Mobile swipe navigation for modal
let touchStartX = 0;
let touchEndX = 0;

if (modal) {
  modal.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const swipeThreshold = 55;
  if (touchEndX < touchStartX - swipeThreshold) {
    navigateModal(1);
  } else if (touchEndX > touchStartX + swipeThreshold) {
    navigateModal(-1);
  }
}
