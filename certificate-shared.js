function getCertificateBadgeLabel(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("hackathon")) return "🏆 Hackathon";
  if (cat.includes("quiz")) return "🧠 Quiz";
  if (cat.includes("course")) return "🎓 Course";
  if (cat.includes("workshop")) return "📜 Workshop";
  return "🌟 Featured";
}
window.getCertificateBadgeLabel = getCertificateBadgeLabel;

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

// ============================================================================
// 4. QUICK IMAGE OVERLAY — temporary "press & hold to enlarge" viewer
// Used inside the Achievement detail panel so the certificate image never
// opens a second, persistent modal. Two modes:
//   - "hold"    : appears while pressed/touched, disappears on release/Escape.
//                 No close button, no backdrop-click-to-close (there's
//                 nothing to click away from — it vanishes on release).
//   - "click"   : appears on click (used for gallery photos), stays open
//                 until the user closes it via the × button, backdrop
//                 click, or Escape.
// Always renders above every other modal on the page.
// ============================================================================
(function () {
  let overlay, overlayImg, overlayCanvas, overlayCloseBtn, overlayPrevBtn, overlayNextBtn, overlayCounter;
  let overlayMode = null; // "hold" | "click" | null
  let overlayItems = [];
  let overlayIndex = 0;

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "quickImageOverlay";
    overlay.className = "quick-image-overlay hidden";
    overlay.setAttribute("aria-hidden", "true");

    overlayCloseBtn = document.createElement("button");
    overlayCloseBtn.type = "button";
    overlayCloseBtn.className = "quick-image-close hidden";
    overlayCloseBtn.setAttribute("aria-label", "Close enlarged image");
    overlayCloseBtn.innerHTML = "✕";
    overlayCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.closeQuickImageOverlay();
    });

    overlayPrevBtn = document.createElement("button");
    overlayPrevBtn.type = "button";
    overlayPrevBtn.className = "quick-image-nav quick-image-prev hidden";
    overlayPrevBtn.setAttribute("aria-label", "Previous image");
    overlayPrevBtn.innerHTML = "&#8249;";
    overlayPrevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.navigateQuickImageOverlay(-1);
    });

    overlayNextBtn = document.createElement("button");
    overlayNextBtn.type = "button";
    overlayNextBtn.className = "quick-image-nav quick-image-next hidden";
    overlayNextBtn.setAttribute("aria-label", "Next image");
    overlayNextBtn.innerHTML = "&#8250;";
    overlayNextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.navigateQuickImageOverlay(1);
    });

    overlayCounter = document.createElement("div");
    overlayCounter.className = "quick-image-counter hidden";
    overlayCounter.setAttribute("aria-live", "polite");

    overlayImg = document.createElement("img");
    overlayImg.id = "quickImageOverlayImg";
    overlayImg.alt = "Enlarged certificate";
    overlayImg.draggable = false;

    overlayCanvas = document.createElement("canvas");
    overlayCanvas.id = "quickImageOverlayCanvas";
    overlayCanvas.className = "quick-image-canvas hidden";
    overlayCanvas.setAttribute("aria-label", "Presentation slide preview");

    overlay.appendChild(overlayCloseBtn);
    overlay.appendChild(overlayPrevBtn);
    overlay.appendChild(overlayNextBtn);
    overlay.appendChild(overlayCounter);
    overlay.appendChild(overlayImg);
    overlay.appendChild(overlayCanvas);
    document.body.appendChild(overlay);

    // Backdrop click only closes in "click" mode
    overlay.addEventListener("click", (e) => {
      if (overlayMode === "click" && e.target === overlay) {
        window.closeQuickImageOverlay();
      }
    });

    // Prevent the browser's native image save/drag callout during hold
    overlayImg.addEventListener("contextmenu", (e) => e.preventDefault());
    overlayImg.addEventListener("dragstart", (e) => e.preventDefault());
  }

  function formatOverlayCounter() {
    if (!overlayItems.length || overlayItems.length <= 1) {
      overlayCounter.textContent = "";
      return;
    }
    overlayCounter.textContent = `${overlayIndex + 1} / ${overlayItems.length}`;
  }

  function setGalleryState(items, index) {
    overlayItems = Array.isArray(items) ? items.filter(Boolean) : [];
    overlayIndex = Math.max(0, Math.min(index || 0, Math.max(0, overlayItems.length - 1)));

    if (overlayItems.length > 1) {
      overlayPrevBtn.classList.remove("hidden");
      overlayNextBtn.classList.remove("hidden");
      overlayCounter.classList.remove("hidden");
      formatOverlayCounter();
    } else {
      overlayPrevBtn.classList.add("hidden");
      overlayNextBtn.classList.add("hidden");
      overlayCounter.classList.add("hidden");
      overlayCounter.textContent = "";
    }
  }

  function updateOverlayImage() {
    const item = overlayItems[overlayIndex];
    if (!item) {
      overlayImg.src = "";
      overlayImg.alt = "Enlarged certificate";
      overlayCanvas.classList.add("hidden");
      overlayImg.classList.remove("hidden");
      overlayCounter.textContent = "";
      return;
    }

    overlayCanvas.classList.add("hidden");
    overlayImg.classList.remove("hidden");
    overlayImg.src = typeof item === "string" ? item : item.src;
    overlayImg.alt = item.alt || "Enlarged certificate";
    formatOverlayCounter();
  }

  window.openQuickImageOverlay = function (srcOrItems, mode, index) {
    ensureOverlay();
    overlayMode = mode === "click" ? "click" : "hold";

    if (Array.isArray(srcOrItems)) {
      setGalleryState(srcOrItems, index || 0);
      overlay.classList.remove("hidden");
      overlay.setAttribute("aria-hidden", "false");
      overlayCloseBtn.classList.toggle("hidden", overlayMode !== "click");
      updateOverlayImage();
      return;
    }

    overlayItems = [];
    overlayIndex = 0;
    overlayPrevBtn.classList.add("hidden");
    overlayNextBtn.classList.add("hidden");
    overlayCounter.classList.add("hidden");
    overlayCounter.textContent = "";
    overlayCanvas.classList.add("hidden");
    overlayImg.classList.remove("hidden");
    overlayImg.src = srcOrItems || "";
    overlayImg.alt = "Enlarged certificate";
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    overlayCloseBtn.classList.toggle("hidden", overlayMode !== "click");
  };

  window.navigateQuickImageOverlay = function (direction) {
    if (!overlayItems.length) return;
    overlayIndex = (overlayIndex + direction + overlayItems.length) % overlayItems.length;
    updateOverlayImage();
  };

  window.setQuickImageGallery = function (items, index) {
    if (!Array.isArray(items) || !items.length) return;
    ensureOverlay();
    setGalleryState(items, index || 0);
    updateOverlayImage();
  };

  window.closeQuickImageOverlay = function () {
    if (!overlay || overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    overlayImg.src = "";
    overlayImg.classList.remove("hidden");
    overlayCanvas.classList.add("hidden");
    overlayMode = null;
    overlayItems = [];
    overlayIndex = 0;
    overlayCounter.textContent = "";
  };

  window.isQuickImageOverlayOpen = function () {
    return !!(overlay && !overlay.classList.contains("hidden"));
  };

  // Escape cancels the overlay first, and only the overlay — it must not
  // also close whatever modal is open behind it.
  document.addEventListener("keydown", (e) => {
    if (window.isQuickImageOverlayOpen()) {
      if (e.key === "Escape") {
        window.closeQuickImageOverlay();
        e.stopImmediatePropagation();
        return;
      }

      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && overlayItems.length > 1) {
        window.navigateQuickImageOverlay(e.key === "ArrowRight" ? 1 : -1);
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  }, true);

  // Click-to-enlarge for gallery photos (persistent overlay, explicit close)
  window.wireClickToEnlarge = function (el, src, galleryItems, startIndex) {
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (Array.isArray(galleryItems) && galleryItems.length > 0) {
        window.openQuickImageOverlay(galleryItems, "click", startIndex || 0);
      } else {
        window.openQuickImageOverlay(src, "click");
      }
    });
  };

  window.getGoogleDriveFileId = function (url) {
    if (!url) return "";
    const match = url.match(/(?:\/d\/|[?&]id=)([a-zA-Z0-9_-]{10,})/);
    return match ? match[1] : "";
  };

  window.getGoogleDrivePdfUrl = function (url) {
    if (!url) return "";
    const fileId = window.getGoogleDriveFileId(url);
    if (!fileId) return url;
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  window.getPresentationFallbackOpenUrl = function (url) {
    if (!url) return "";
    const direct = window.getGoogleDrivePdfUrl(url);
    return direct || url;
  };

})();

// ============================================================================
// 5. DEMO VIDEO MODAL — inline popup, never navigates away from the page
// ============================================================================
(function () {
  let modalEl, bodyEl, lastFocused;

  function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement("div");
    modalEl.id = "demoVideoModal";
    modalEl.className = "demo-video-modal hidden";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-hidden", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "demo-video-backdrop";
    backdrop.addEventListener("click", () => window.closeDemoVideoModal());

    const box = document.createElement("div");
    box.className = "demo-video-box";

    const header = document.createElement("div");
    header.className = "demo-video-header";
    header.innerHTML = `<span>Demo Video</span>`;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "demo-video-close";
    closeBtn.setAttribute("aria-label", "Close demo video");
    closeBtn.innerHTML = "✕";
    closeBtn.addEventListener("click", () => window.closeDemoVideoModal());
    header.appendChild(closeBtn);

    bodyEl = document.createElement("div");
    bodyEl.className = "demo-video-body";
    bodyEl.id = "demoVideoBody";

    box.appendChild(header);
    box.appendChild(bodyEl);
    modalEl.appendChild(backdrop);
    modalEl.appendChild(box);
    document.body.appendChild(modalEl);
  }

  // Figures out how to embed a demo video link without leaving the page.
  function getEmbedInfo(url) {
    if (!url) return null;

    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
    if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0` };

    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };

    const driveMatch = url.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && url.includes("drive.google.com")) {
      return { type: "iframe", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
    }

    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
      return { type: "video", src: url };
    }

    // Fallback: try to embed the raw URL directly
    return { type: "iframe", src: url };
  }

  window.openDemoVideoModal = function (url, triggerEl) {
    if (!url) return;
    ensureModal();
    lastFocused = triggerEl || document.activeElement;

    const info = getEmbedInfo(url);
    bodyEl.innerHTML = "";

    if (info.type === "video") {
      const video = document.createElement("video");
      video.src = info.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      bodyEl.appendChild(video);
    } else {
      const iframe = document.createElement("iframe");
      iframe.src = info.src;
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      bodyEl.appendChild(iframe);
    }

    modalEl.classList.remove("hidden");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalEl.querySelector(".demo-video-close").focus();
  };

  window.closeDemoVideoModal = function () {
    if (!modalEl || modalEl.classList.contains("hidden")) return;
    modalEl.classList.add("hidden");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    bodyEl.innerHTML = ""; // stop playback
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl && !modalEl.classList.contains("hidden")) {
      window.closeDemoVideoModal();
    }
  });
})();

