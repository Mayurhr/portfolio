// ============================================================================
// CERTIFICATE / ACHIEVEMENT DETAIL VIEW
// Shared by index.html (Featured Certificates) and certificates.html (All
// Certificates). Renders the case-study style Achievement panel for
// certificates that have viewAchievement: true.
//
// Rule followed throughout: NEVER invent data. A section only renders when
// the corresponding field exists and is non-empty on the certificate object.
// ============================================================================

(function () {
  const achievementModal = document.getElementById("achievementModal");
  const achievementBody = document.getElementById("achievementBody");

  if (!achievementModal || !achievementBody) return; // page doesn't include the modal markup

  let lastFocusedElement = null;

  // --------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------
  function escapeHTML(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
  }

  function isNonEmptyArray(v) {
    return Array.isArray(v) && v.length > 0;
  }

  function getBadgeLabel(category) {
    return typeof window.getCertificateBadgeLabel === "function"
      ? window.getCertificateBadgeLabel(category)
      : "🌟 Featured";
  }

  function section(title, innerHtml, extraClass) {
    return `
      <div class="achievement-section${extraClass ? " " + extraClass : ""}">
        <h3 class="achievement-section-title">${escapeHTML(title)}</h3>
        ${innerHtml}
      </div>
    `;
  }

  // --------------------------------------------------------------------
  // Experience text — supports a **bold** lead phrase (e.g. an award or
  // headline) written directly in the JSON `experience` string. Everything
  // else stays normal weight. No separate "result" field — the highlight
  // is part of the experience text itself, just marked with **double
  // asterisks** the way you'd write it in Markdown.
  // --------------------------------------------------------------------
  function renderExperienceHTML(text) {
    const escaped = escapeHTML(text);
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="achievement-highlight">$1</strong>');
  }

  // --------------------------------------------------------------------
  // Proof / Evidence — GitHub, Offer Letter, Watch Demo
  // Only the buttons for fields that are actually present are shown.
  // --------------------------------------------------------------------
  function proofHTML(achievement) {
    const buttons = [];

    if (isNonEmptyString(achievement.github)) {
      buttons.push(`
        <a class="achievement-link-btn" href="${escapeHTML(achievement.github)}" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-github"></i><span>GitHub</span>
        </a>
      `);
    }

    if (isNonEmptyString(achievement.offerLetter)) {
      buttons.push(`
        <a class="achievement-link-btn" href="${escapeHTML(achievement.offerLetter)}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-file-signature"></i><span>View Offer Letter</span>
        </a>
      `);
    }

    if (isNonEmptyString(achievement.demoVideo)) {
      buttons.push(`
        <button type="button" class="achievement-link-btn achievement-demo-btn" data-demo-video="${escapeHTML(achievement.demoVideo)}">
          <i class="fas fa-play"></i><span>Watch Demo</span>
        </button>
      `);
    }

    if (buttons.length === 0) return "";
    return `<div class="achievement-links">${buttons.join("")}</div>`;
  }

  // --------------------------------------------------------------------
  // Event / Project Moments gallery — a slow, continuously auto-scrolling
  // strip. The photo set is rendered twice so the CSS animation loops.
  // --------------------------------------------------------------------
  function galleryHTML(eventPhotos) {
    const renderSet = (hidden) => eventPhotos.map((driveUrl, i) => `
      <div class="achievement-gallery-photo" data-gallery-src="${escapeHTML(driveUrl)}"${hidden ? ' aria-hidden="true" tabindex="-1"' : ` tabindex="0" role="button" aria-label="Preview event photo ${i + 1}"`}></div>
    `).join("");

    return `
      <div class="achievement-gallery-marquee">
        <div class="achievement-gallery-track">
          ${renderSet(false)}
          ${renderSet(true)}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------
  // Build the panel body for a given certificate
  // --------------------------------------------------------------------
  function buildBody(cert) {
    const isFeatured = cert.featured === true;
    const achievement = cert.achievement || {};

    const hasExperience = isNonEmptyString(achievement.experience);
    const hasProof =
      isNonEmptyString(achievement.github) ||
      isNonEmptyString(achievement.offerLetter) ||
      isNonEmptyString(achievement.demoVideo);
    const hasEventPhotos = isNonEmptyArray(achievement.eventPhotos);

    let infoHtml = `
      <div class="achievement-heading">
        ${isFeatured ? `<span class="achievement-kicker">${getBadgeLabel(cert.category)}</span>` : ""}
        <h2 class="achievement-title">${escapeHTML(cert.title)}</h2>
        <div class="achievement-meta">
          ${isNonEmptyString(cert.issuer) ? `<span>${escapeHTML(cert.issuer)}</span>` : ""}
          ${isNonEmptyString(cert.year) ? `<span class="achievement-dot">•</span><span>${escapeHTML(cert.year)}</span>` : ""}
          ${isNonEmptyString(cert.category) ? `<span class="achievement-dot">•</span><span>${escapeHTML(cert.category)}</span>` : ""}
        </div>
      </div>
    `;

    if (hasExperience) {
      infoHtml += section("My Experience", `<p class="achievement-text">${renderExperienceHTML(achievement.experience)}</p>`);
    }
    if (hasProof) {
      infoHtml += section("Proof / Evidence", proofHTML(achievement));
    }
    return `
      <div class="achievement-media">
        <div class="achievement-cert-frame" id="achievementCertFrame">
          <div class="achievement-gallery-spotlight" data-gallery-spotlight aria-hidden="true">
            <div class="achievement-gallery-spotlight-stage">
              <img class="achievement-gallery-spotlight-img" alt="">
            </div>
          </div>
        </div>
        ${hasEventPhotos ? section("Event / Project Moments", galleryHTML(achievement.eventPhotos), "achievement-gallery-section") : ""}
      </div>
      <div class="achievement-info">
        ${infoHtml}
      </div>
    `;
  }

  // --------------------------------------------------------------------
  // Open / Close
  // --------------------------------------------------------------------
  window.openCertificateDetail = function (cert, triggerEl) {
    if (!cert) return;
    lastFocusedElement = triggerEl || document.activeElement;

    achievementBody.innerHTML = buildBody(cert);

    // Insert the certificate image via the existing Drive image loader
    const frame = document.getElementById("achievementCertFrame");
    if (frame && typeof createDriveImage === "function") {
      const imgWrapper = createDriveImage(cert.driveLink, cert.title, "achievement-cert-img");
      imgWrapper.classList.add("achievement-cert-img-wrapper");
      frame.appendChild(imgWrapper);

      // Click to enlarge — opens above the Achievement panel with its own
      // visible × Close button. Closing it never touches the panel behind.
      if (typeof window.wireClickToEnlarge === "function") {
        window.wireClickToEnlarge(imgWrapper, getGoogleDriveImageUrl(cert.driveLink));
      }
    }

    // Populate gallery photo elements (original set + the aria-hidden
    // duplicate set used for the seamless scroll loop)
    const achievement = cert.achievement || {};
    achievementBody.querySelectorAll(".achievement-gallery-photo").forEach((el, i) => {
      const src = el.getAttribute("data-gallery-src");
      if (src && typeof createDriveImage === "function") {
        el.appendChild(createDriveImage(src, `Event photo ${i + 1}`, "achievement-gallery-thumb"));
      }
    });

    const galleryMarquee = achievementBody.querySelector(".achievement-gallery-marquee");
    const gallerySpotlight = achievementBody.querySelector("[data-gallery-spotlight]");
    const gallerySpotlightImg = gallerySpotlight?.querySelector(".achievement-gallery-spotlight-img");

    // Gallery: slow continuous auto-scroll, speed scales gently with photo
    // count so a 3-photo set and a 6-photo set both feel unhurried.
    const galleryTrack = achievementBody.querySelector(".achievement-gallery-track");
    if (galleryTrack && isNonEmptyArray(achievement.eventPhotos)) {
      const duration = Math.max(achievement.eventPhotos.length * 6, 18);
      galleryTrack.style.setProperty("--gallery-duration", duration + "s");

    }

    // Hovering (or keyboard-focusing) a thumbnail temporarily shows that
    // photo full-size over the certificate, which dims/blurs behind it.
    // Gated to mouse pointers so a touch tap can't leave the preview stuck
    // "open" with no hover to leave from.
    if (frame && galleryMarquee && gallerySpotlight && gallerySpotlightImg) {
      const showPhoto = (photo) => {
        const src = photo.getAttribute("data-gallery-src");
        if (!src) return;
        galleryMarquee.classList.add("is-photo-hovered");
        frame.classList.add("is-photo-preview-active");
        gallerySpotlightImg.src = getGoogleDriveImageUrl(src);
        gallerySpotlightImg.alt = photo.querySelector("img")?.alt || "Event photo";
        gallerySpotlight.classList.add("is-visible");
        gallerySpotlight.setAttribute("aria-hidden", "false");
      };

      const hidePhoto = () => {
        galleryMarquee.classList.remove("is-photo-hovered");
        frame.classList.remove("is-photo-preview-active");
        gallerySpotlight.classList.remove("is-visible");
        gallerySpotlight.setAttribute("aria-hidden", "true");
        window.setTimeout(() => {
          if (!gallerySpotlight.classList.contains("is-visible")) {
            gallerySpotlightImg.removeAttribute("src");
            gallerySpotlightImg.alt = "";
          }
        }, 340);
      };

      galleryMarquee.querySelectorAll(".achievement-gallery-photo").forEach((photo) => {
        photo.addEventListener("pointerenter", (e) => {
          if (e.pointerType && e.pointerType !== "mouse") return;
          showPhoto(photo);
        });
        photo.addEventListener("pointerleave", (e) => {
          if (e.pointerType && e.pointerType !== "mouse") return;
          hidePhoto();
        });
        photo.addEventListener("focus", () => showPhoto(photo));
        photo.addEventListener("blur", hidePhoto);
      });
    }

    // Watch Demo — opens the inline video popup, never navigates away
    achievementBody.querySelectorAll("[data-demo-video]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.getAttribute("data-demo-video");
        if (url && typeof window.openDemoVideoModal === "function") {
          window.openDemoVideoModal(url, btn);
        }
      });
    });

    achievementModal.classList.remove("hidden");
    achievementModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    achievementBody.scrollTop = 0;

    const closeBtn = achievementModal.querySelector(".achievement-close-btn");
    if (closeBtn) closeBtn.focus();
  };

  window.closeCertificateDetail = function () {
    achievementModal.classList.add("hidden");
    achievementModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    achievementBody.innerHTML = "";
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  achievementModal.querySelectorAll("[data-achievement-close]").forEach(el => {
    el.addEventListener("click", window.closeCertificateDetail);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (achievementModal.classList.contains("hidden")) return;
    // The quick image overlay always takes priority over Escape so it closes
    // before the Achievement panel behind it.
    if (typeof window.isQuickImageOverlayOpen === "function" && window.isQuickImageOverlayOpen()) return;
    window.closeCertificateDetail();
  });

  // --------------------------------------------------------------------
  // Shared card click/keyboard wiring used by script.js and certificates.js
  //
  // featured  -> controls whether the card shows up in Featured Certificates
  //              (handled entirely by script.js / certificates.js filtering)
  // viewAchievement -> controls what clicking THIS card does:
  //   true  -> open the rich Achievement detail panel
  //   false -> open the normal certificate image viewer directly (no
  //            achievement panel at all, so there's nothing nested)
  // --------------------------------------------------------------------
  window.wireCertificateCard = function (card, cert) {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${cert.viewAchievement === true ? "achievement" : "certificate"} for ${cert.title}`);

    const open = () => {
      if (cert.viewAchievement === true) {
        window.openCertificateDetail(cert, card);
      } else if (typeof window.openModal === "function") {
        window.openModal(getGoogleDriveImageUrl(cert.driveLink), 0, [cert]);
      }
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  };
})();
