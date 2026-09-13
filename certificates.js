let allCertificates = [];
let filteredCertificates = [];
let currentPage = 1;
const itemsPerPage = 9;

// ==========================================
// 1. MAIN PAGE SETUP & FILTERING
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
  
  // Certificates with the richer viewAchievement experience come first
  // (within whatever search/filter has already narrowed the list down to),
  // then featured certificates, preserving original order otherwise.
  const sorted = [...filteredCertificates].sort((a, b) => {
    const byAchievement = (b.viewAchievement === true) - (a.viewAchievement === true);
    if (byAchievement !== 0) return byAchievement;
    return (b.featured === true) - (a.featured === true);
  });
  const currentCertificates = sorted.slice(start, end);

  currentCertificates.forEach((cert, index) => {
    const card = document.createElement("div");
    card.className = "certificate-card";

    if (cert.featured) {
      card.classList.add("highlighted-certificate");

      const badge = document.createElement("div");
      badge.className = "highlight-badge";
      badge.innerHTML = getCertificateBadgeLabel(cert.category);
      card.appendChild(badge);
    }

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
    // has the richer Achievement experience enabled — independent of featured
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
