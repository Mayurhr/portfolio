let allCertificates = [];
let filteredCertificates = [];
let currentPage = 1;
const itemsPerPage = 9;
const gridBtn = document.getElementById("gridViewBtn");
const listBtn = document.getElementById("listViewBtn");
const container = document.getElementById("certificateContainer");

container.classList.add("grid");

gridBtn.addEventListener("click", () => {
  container.classList.add("grid");
  container.classList.remove("list");
  gridBtn.classList.add("active");
  listBtn.classList.remove("active");
  renderCertificates();
});

listBtn.addEventListener("click", () => {
  container.classList.add("list");
  container.classList.remove("grid");
  listBtn.classList.add("active");
  gridBtn.classList.remove("active");
  renderCertificates();
});


document.addEventListener("DOMContentLoaded", () => {
  fetch("certificates.json")
    .then(res => res.json())
    .then(data => {
      allCertificates = data;
      filteredCertificates = [...allCertificates];

      populateFilters();
      renderCertificates();
      renderPagination();
    });

  document.getElementById("yearFilter").addEventListener("change", applyFilters);
  document.getElementById("issuerFilter").addEventListener("change", applyFilters);
  document.getElementById("categoryFilter").addEventListener("change", applyFilters);
  document.getElementById("sortFilter").addEventListener("change", applyFilters);
  document.getElementById("searchInput").addEventListener("input", applyFilters);

  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("yearFilter").value = "";
    document.getElementById("issuerFilter").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("sortFilter").value = "newest";
    applyFilters();
  });

  const modal = document.getElementById("modal");
  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("modal-maximized", "modal-minimized");
  });

  document.getElementById("minimizeModal").addEventListener("click", () => {
    modal.classList.remove("modal-maximized");
    modal.classList.add("modal-minimized");
  });

  document.getElementById("maximizeModal").addEventListener("click", () => {
    modal.classList.remove("modal-minimized");
    modal.classList.add("modal-maximized");
  });
});

function populateFilters() {
  updateDependentFilters();
}

function updateDependentFilters() {
  const selectedYear = document.getElementById("yearFilter").value;
  const selectedIssuer = document.getElementById("issuerFilter").value;
  const selectedCategory = document.getElementById("categoryFilter").value;

  const filtered = allCertificates.filter(cert => {
    const matchYear = !selectedYear || (cert.year && cert.year.toString() === selectedYear);
    const matchIssuer = !selectedIssuer || (cert.issuer && cert.issuer.toLowerCase() === selectedIssuer.toLowerCase());
    const matchCategory = !selectedCategory || (cert.category && cert.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchYear && matchIssuer && matchCategory;
  });

  const yearSet = new Set();
  const issuerSet = new Set();
  const categorySet = new Set();

  filtered.forEach(cert => {
    if (cert.year) yearSet.add(cert.year.toString());
    if (cert.issuer) issuerSet.add(cert.issuer);
    if (cert.category) categorySet.add(cert.category);
  });

  const yearFilter = document.getElementById("yearFilter");
  const issuerFilter = document.getElementById("issuerFilter");
  const categoryFilter = document.getElementById("categoryFilter");

  const currentYear = yearFilter.value;
  const currentIssuer = issuerFilter.value;
  const currentCategory = categoryFilter.value;

  yearFilter.innerHTML = '<option value="">All Years</option>';
  [...yearSet].sort((a, b) => b - a).forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearFilter.appendChild(option);
  });

  issuerFilter.innerHTML = '<option value="">All Institutes</option>';
  [...issuerSet].sort((a, b) => a.localeCompare(b)).forEach(issuer => {
    const option = document.createElement("option");
    option.value = issuer;
    option.textContent = issuer;
    if (issuer === currentIssuer) option.selected = true;
    issuerFilter.appendChild(option);
  });

  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  [...categorySet].sort((a, b) => a.localeCompare(b)).forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === currentCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function applyFilters() {
  const selectedYear = document.getElementById("yearFilter").value;
  const selectedIssuer = document.getElementById("issuerFilter").value;
  const selectedCategory = document.getElementById("categoryFilter").value;
  const sortOrder = document.getElementById("sortFilter").value;
  const searchValue = document.getElementById("searchInput").value.toLowerCase();

  filteredCertificates = allCertificates.filter(cert => {
    const matchYear = !selectedYear || (cert.year && cert.year.toString() === selectedYear);
    const matchIssuer = !selectedIssuer || (cert.issuer && cert.issuer.toLowerCase() === selectedIssuer.toLowerCase());
    const matchCategory = !selectedCategory || (cert.category && cert.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchSearch =
      cert.title.toLowerCase().includes(searchValue) ||
      cert.issuer.toLowerCase().includes(searchValue);

    return matchYear && matchIssuer && matchCategory && matchSearch;
  });

  if (sortOrder === "newest") {
    filteredCertificates.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  } else if (sortOrder === "oldest") {
    filteredCertificates.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }

  currentPage = 1;
  renderCertificates();
  renderPagination();
  updateDependentFilters();
}

function renderCertificates() {
  const grid = document.getElementById("certificateContainer");
  grid.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  filteredCertificates.sort((a, b) => {
    return (b.highlight === true) - (a.highlight === true);
  });

  const currentCertificates = filteredCertificates.slice(start, end);

  currentCertificates.forEach(cert => {
    const card = document.createElement("div");
    card.className = "certificate-card";
    if (cert.highlight) {
      card.classList.add("highlighted-certificate");
    }

    if (cert.highlight) {
      const badge = document.createElement("div");
      badge.className = "highlight-badge";


      const category = cert.category?.toLowerCase();
      if (category.includes("hackathon")) {
        badge.innerHTML = "🏆 Hackathon";
      } else if (category.includes("quiz")) {
        badge.innerHTML = "🧠 Quiz";
      } else if (category.includes("course")) {
        badge.innerHTML = "🎓 Course";
      } else if (category.includes("workshop")) {
        badge.innerHTML = "📜 Workshop";
      }

      card.appendChild(badge);
    }

    const img = document.createElement("img");
    img.src = cert.file;
    img.className = "certificate-thumb";

    img.addEventListener("click", () => {
      document.getElementById("imageViewer").src = cert.file;
      document.getElementById("modal").classList.remove("hidden");
    });

    const title = document.createElement("div");
    title.className = "certificate-title";
    title.textContent = cert.title;

    const issuer = document.createElement("div");
    issuer.className = "certificate-issuer";
    issuer.textContent = cert.issuer;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(issuer);

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
    });
    pagination.appendChild(btn);
  }
}

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

const modal = document.getElementById("modal");
const image = document.getElementById("imageViewer");
const closeModal = document.getElementById("closeModal");
let scale = 1;
let translateX = 0, translateY = 0;
let isDragging = false, startX, startY;

window.openModal = function (src) {
  image.src = src;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  resetTransform();
};

// Close modal
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
});

// Drag 
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
