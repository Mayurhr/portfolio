let allCertificates = [];
let filteredCertificates = [];
let currentPage = 1;
const itemsPerPage = 9;

// ==========================================
// 1. GOOGLE DRIVE IMAGE LOADER
// ==========================================

function getGoogleDriveImageUrl(driveUrl) {
  if (!driveUrl) return "";

  // Already a thumbnail URL
  if (driveUrl.includes("drive.google.com/thumbnail")) {
    return driveUrl;
  }

  // Extract file ID
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w4000`;
  }

  return driveUrl;
}

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

// ==========================================
// 2. MAIN PAGE SETUP & FILTERING
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  fetch("certificates.json")
    .then(res => res.json())
    .then(data => {
      allCertificates = data;
      filteredCertificates = [...allCertificates];
      
      populateFilters();
      renderCertificates();
      renderPagination();
      updateCountBadge();
    });

  document.getElementById("yearFilter").addEventListener("change", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("searchInput").addEventListener("input", applyFilters);

  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("yearFilter").value = "";
    document.getElementById("categoryFilter").value = "";
    applyFilters();
  });
});

function populateFilters() {
  const yearSet = new Set();
  const categorySet = new Set();

  allCertificates.forEach(cert => {
    if (cert.year) yearSet.add(cert.year.toString());
    if (cert.category) categorySet.add(cert.category);
  });

  const yearFilter = document.getElementById("yearFilter");
  const categoryFilter = document.getElementById("categoryFilter");

  yearFilter.innerHTML = '<option value="">All Years</option>';
  [...yearSet]
    .sort((a, b) => b - a)
    .forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  [...categorySet]
    .sort()
    .forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
}

function applyFilters() {
  const selectedYear = document.getElementById("yearFilter").value;
  const selectedCategory = document.getElementById("categoryFilter").value;
  const searchValue = document.getElementById("searchInput").value.toLowerCase();

  filteredCertificates = allCertificates.filter(cert => {
    const matchYear = !selectedYear || cert.year?.toString() === selectedYear;
    
    const matchCategory = !selectedCategory || 
      cert.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchSearch = !searchValue || 
      cert.title.toLowerCase().includes(searchValue) ||
      cert.issuer.toLowerCase().includes(searchValue);

    return matchYear && matchCategory && matchSearch;
  });

  currentPage = 1;
  renderCertificates();
  renderPagination();
  updateCountBadge();
}

function updateCountBadge() {
  const countBadge = document.getElementById("certCount");
  if (countBadge) {
    countBadge.textContent = filteredCertificates.length;
  }
}

// ==========================================
// 3. CERTIFICATE RENDERER
// ==========================================

function renderCertificates() {
  const grid = document.getElementById("certificateContainer");
  grid.innerHTML = "";

  if (filteredCertificates.length === 0) {
    grid.innerHTML = `
      <div class="no-certificates-found">
        <i class="fas fa-search-minus"></i>
        <h3>No Certificates Found</h3>
        <p>Try modifying your search query or filter options.</p>
      </div>
    `;
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  
  // Sort highlighted certificates to show up first in listings
  const sorted = [...filteredCertificates].sort((a, b) => (b.highlight === true) - (a.highlight === true));
  const currentCertificates = sorted.slice(start, end);

  currentCertificates.forEach((cert, index) => {
    const card = document.createElement("div");
    card.className = "certificate-card";
    
    if (cert.highlight) {
      card.classList.add("highlighted-certificate");
      
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
    }

    const imgWrapper = createDriveImage(cert.driveLink, cert.title, "certificate-thumb");
    
    // Zoom viewer trigger
    imgWrapper.addEventListener("click", () => {
      openModal(getGoogleDriveImageUrl(cert.driveLink), start + index, sorted);
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

    grid.appendChild(card);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderCertificates();
      renderPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(btn);
  }
}

// ==========================================
// 4. FULLSCREEN IMAGE VIEWER MODAL
// ==========================================

const modal = document.getElementById("modal");
const image = document.getElementById("imageViewer");
const closeModal = document.getElementById("closeModal");
let scale = 1;
let translateX = 0, translateY = 0;
let isDragging = false, startX, startY;
let activeIndex = 0;
let certsList = [];

function openModal(src, index, list) {
  image.src = src;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  resetTransform();
  
  if (list && list.length > 0) {
    certsList = list;
    activeIndex = index;
    updateModalControls();
  }
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
