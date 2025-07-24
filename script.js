let allCertificates = [];
let filteredCertificates = [];
let currentPage = 1;
const itemsPerPage = 9;

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
  document.getElementById("sortFilter").addEventListener("change", applyFilters);
  document.getElementById("searchInput").addEventListener("input", applyFilters);

  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("yearFilter").value = "";
    document.getElementById("issuerFilter").value = "";
    document.getElementById("sortFilter").value = "newest";
    applyFilters();
  });

  // Modal button actions
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


const closeModalBtn = document.getElementById("closeModal");
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("pdfViewer").src = "";
  });
}

function populateFilters() {
  const yearSet = new Set();
  const issuerSet = new Set();

  allCertificates.forEach(cert => {
    if (cert.year) yearSet.add(cert.year.toString());
    if (cert.issuer) issuerSet.add(cert.issuer);
  });

  const yearFilter = document.getElementById("yearFilter");
  const issuerFilter = document.getElementById("issuerFilter");

  yearFilter.innerHTML = '<option value="">All Years</option>';
  issuerFilter.innerHTML = '<option value="">All Institutes</option>';

  [...yearSet].sort((a, b) => b - a).forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  [...issuerSet].sort().forEach(issuer => {
    const option = document.createElement("option");
    option.value = issuer;
    option.textContent = issuer;
    issuerFilter.appendChild(option);
  });
}

function applyFilters() {
  const selectedYear = document.getElementById("yearFilter").value;
  const selectedIssuer = document.getElementById("issuerFilter").value;
  const sortOrder = document.getElementById("sortFilter").value;
  const searchValue = document.getElementById("searchInput").value.toLowerCase();

  filteredCertificates = allCertificates.filter(cert => {
    const matchYear = !selectedYear || (cert.year && cert.year.toString() === selectedYear);
    const matchIssuer = !selectedIssuer || (cert.issuer && cert.issuer.toLowerCase() === selectedIssuer.toLowerCase());
    const matchSearch =
      cert.title.toLowerCase().includes(searchValue) ||
      cert.issuer.toLowerCase().includes(searchValue);

    return matchYear && matchIssuer && matchSearch;
  });

  if (sortOrder === "newest") {
    filteredCertificates.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  } else if (sortOrder === "oldest") {
    filteredCertificates.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }

  currentPage = 1;
  renderCertificates();
  renderPagination();
}

function renderCertificates() {
  const grid = document.getElementById("certificateContainer");
  grid.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentCertificates = filteredCertificates.slice(start, end);

  currentCertificates.forEach(cert => {
    const card = document.createElement("div");
    card.className = "certificate-card";

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
