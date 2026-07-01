/* ==========================================================================
   SEAMLESS SOCIAL — script.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
       1. GLOBAL ASSET ERROR HANDLER
       ============================================================ */
  window.handleAssetError = function (img) {
    const slot = img.closest(".asset-slot");
    if (slot) {
      slot.classList.add("asset-slot--empty");
      img.style.display = "none";
    }
  };

  /* ============================================================
       2. COSMIC BACKGROUND CANVAS (Stardust)
       ============================================================ */
  const canvas = document.getElementById("stardust");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width, height;
    const stars = [];

    const initCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", initCanvas);
    initCanvas();

    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
      });
    }

    const animateStars = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)"; // Brought stardust opacity back up to make it clearly visible

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animateStars);
    };
    animateStars();
  }

  /* ============================================================
       3. MOBILE NAVIGATION TOGGLE
       ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !isExpanded);
      navLinks.classList.toggle("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
      }
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("is-open");
      });
    });
  }

  /* ============================================================
       4. SCROLL REVEAL ANIMATIONS
       ============================================================ */
  const revealElements = document.querySelectorAll("[data-reveal]");
  const revealGroups = document.querySelectorAll("[data-reveal-group]");

  revealGroups.forEach((group) => {
    const children = group.querySelectorAll(
      ":scope > [data-reveal], :scope > * [data-reveal]",
    );
    children.forEach((child, index) => {
      child.style.setProperty("--reveal-delay", `${index * 0.12}s`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.02,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ============================================================
       5. INFINITE LOGO MARQUEE
       ============================================================ */
  const marqueeTrack = document.querySelector(".logos__track");
  if (marqueeTrack) {
    const trackContent = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML += trackContent;
  }

  /* ============================================================
       6. FAQ ACCORDION
       ============================================================ */
  const accordionTriggers = document.querySelectorAll(".accordion__trigger");
  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const item = this.closest(".accordion__item");
      const isExpanded = this.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".accordion__item").forEach((accItem) => {
        accItem.classList.remove("is-open");
        accItem
          .querySelector(".accordion__trigger")
          .setAttribute("aria-expanded", "false");
      });

      if (!isExpanded) {
        item.classList.add("is-open");
        this.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ============================================================
       7. MULTI-STEP QUALIFICATION FORM
       ============================================================ */
  const form = document.getElementById("qualifyForm");
  if (form) {
    const steps = form.querySelectorAll(".form-step");
    const dots = document.querySelectorAll(".form-progress__dot");
    const backBtn = document.getElementById("formBack");
    let currentStep = 0;
    let formData = {};

    const updateFormUI = () => {
      steps.forEach((step, index) => {
        step.classList.toggle("is-active", index === currentStep);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentStep);
        dot.classList.toggle("is-done", index < currentStep);
      });
      backBtn.hidden = currentStep === 0;
    };

    const optionBtns = form.querySelectorAll(".option-btn");
    optionBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const parentGrid = this.closest(".option-grid");
        const stepEl = this.closest(".form-step");
        const questionKey = stepEl.dataset.question;

        parentGrid
          .querySelectorAll(".option-btn")
          .forEach((b) => b.classList.remove("is-selected"));
        this.classList.add("is-selected");

        formData[questionKey] = this.dataset.value;

        if (currentStep < steps.length - 1) {
          setTimeout(() => {
            currentStep++;
            updateFormUI();
          }, 300);
        }
      });
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (currentStep > 0) {
          currentStep--;
          updateFormUI();
        }
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const revenue = formData["revenue"];
      const spend = formData["spend"];
      const timeline = formData["timeline"];

      const isRevenueQualified = revenue !== "under40";
      const isSpendQualified = spend !== "under500";
      const isTimelineQualified =
        timeline === "thisweek" || timeline === "thismonth";

      const isQualified =
        isRevenueQualified && isSpendQualified && isTimelineQualified;

      form.hidden = true;
      document.getElementById("formProgress").hidden = true;
      document.getElementById("formResult").hidden = false;

      if (isQualified) {
        document.getElementById("resultQualified").hidden = false;
      } else {
        document.getElementById("resultTeardown").hidden = false;
      }
    });
  }

  /* ============================================================
       8. TESTIMONIALS FALLBACK
       ============================================================ */
  const testimonialsWall = document.getElementById("testimonialsWall");
  if (testimonialsWall && testimonialsWall.children.length === 0) {
    testimonialsWall.innerHTML = `
            <div class="glass-card pad testimonial-placeholder">
                <p>Dynamic testimonials will render here once connected to the CMS.</p>
            </div>
        `;
  }

  /* ============================================================
       9. FOOTER DYNAMIC YEAR
       ============================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

/* ============================================================
   10. DATOCMS INTEGRATION & INFINITE DRAG SLIDERS
   ============================================================ */

const DATOCMS_READ_ONLY_TOKEN = "YOUR_DATOCMS_API_TOKEN_HERE";

// Utility function to extract YouTube IDs cleanly
function getYouTubeId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\/\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

async function initTestimonials() {
  const query = `
    {
      allVideoTestimonials {
        youtubeLink
        title
      }
      allTextTestimonials {
        clientName
        companyName
        reviewText
        rating
        logo {
          url
        }
      }
    }`;

  try {
    const response = await fetch("https://graphql.datocms.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${DATOCMS_READ_ONLY_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    renderVideoSlider(data.allVideoTestimonials);
    renderTextSlider(data.allTextTestimonials);
  } catch (err) {
    console.error("DatoCMS Fetch Error:", err);
  }
}

function renderVideoSlider(videos) {
  const track = document.getElementById("videoSliderTrack");
  if (!track || !videos.length) return;

  // Double items array to easily support infinite looping structures
  const items = [...videos, ...videos];

  track.innerHTML = items
    .map((vid) => {
      const videoId = getYouTubeId(vid.youtubeLink);
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      return `
            <div class="glass-card video-card">
                <div class="video-thumb-container" onclick="handleVideoPlay(this, '${videoId}')">
                    <img src="${thumbUrl}" alt="${vid.title}">
                    <button class="play-btn" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%)" aria-label="Play video">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7-11-7z" fill="currentColor"/></svg>
                    </button>
                </div>
            </div>
        `;
    })
    .join("");

  setupSliderDragging(document.querySelector(".video-slider-wrapper"), track);
}

window.handleVideoPlay = function (container, videoId) {
  // Elegant vanilla JS swap replacing layout element into embedded frame player natively
  container.innerHTML = `
        <iframe width="100%" height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen style="position:absolute; inset:0;">
        </iframe>`;
};

function renderTextSlider(testimonials) {
  const track = document.getElementById("textSliderTrack");
  if (!track || !testimonials.length) return;

  const items = [...testimonials, ...testimonials];

  track.innerHTML = items
    .map((t) => {
      const stars = "★".repeat(t.rating) + "☆".repeat(5 - t.rating);
      return `
            <div class="glass-card pad text-card">
                <div class="text-card__stars">${stars}</div>
                <p class="testimonial-card__quote">"${t.reviewText}"</p>
                <div class="text-card__header">
                    <img class="text-card__logo" src="${t.logo.url}" alt="${t.clientName}">
                    <div>
                        <h4 style="margin:0; font-size:1rem;">${t.clientName}</h4>
                        <span class="testimonial-card__author" style="margin:0;">${t.companyName}</span>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  setupSliderDragging(document.querySelector(".text-wrapper-wrapper"), track);
}

// Global Reusable Touch/Drag Matrix Handler for Infinite Sliders
function setupSliderDragging(wrapper, track) {
  if (!wrapper || !track) return;

  let isDragging = false;
  let startX, scrollLeft;

  wrapper.addEventListener("mousedown", (e) => {
    isDragging = true;
    wrapper.classList.add("active");
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.style.transform
      ? parseInt(
          track.style.transform.replace("translateX(", "").replace("px)", ""),
        ) || 0
      : 0;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    if (wrapper) wrapper.classList.remove("active");
  });

  wrapper.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier factor
    let targetX = scrollLeft + walk;

    // Loop boundaries calculation checking halfway markup points
    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(targetX) >= halfWidth) targetX = 0;
    if (targetX > 0) targetX = -halfWidth;

    track.style.transform = `translateX(${targetX}px)`;
  });

  // Touch support for smooth mobile dragging swipes
  wrapper.addEventListener("touchstart", (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - track.offsetLeft;
    scrollLeft = track.style.transform
      ? parseInt(
          track.style.transform.replace("translateX(", "").replace("px)", ""),
        ) || 0
      : 0;
  });

  wrapper.addEventListener("touchend", () => (isDragging = false));

  wrapper.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    let targetX = scrollLeft + walk;

    const halfWidth = track.scrollWidth / 2;
    if (Math.abs(targetX) >= halfWidth) targetX = 0;
    if (targetX > 0) targetX = -halfWidth;

    track.style.transform = `translateX(${targetX}px)`;
  });
}

// Call inside your existing DOMContentLoaded listener initialization code
document.addEventListener("DOMContentLoaded", () => {
  initTestimonials();
});
