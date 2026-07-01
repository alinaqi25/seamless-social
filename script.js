/* ==========================================================================
   SEAMLESS SOCIAL — script.js
   ========================================================================== */

/* ============================================================
     1. GLOBAL ASSET ERROR HANDLER (Moved to top to prevent race conditions)
     ============================================================ */
window.handleAssetError = function (img) {
  const slot = img.closest(".asset-slot");
  if (slot) {
    slot.classList.add("asset-slot--empty");
    img.style.display = "none";
  }
};

document.addEventListener("DOMContentLoaded", () => {
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
       8. TESTIMONIALS SYSTEM INTEGRATION WITH FALLBACKS
       ============================================================ */
  initTestimonials();

  /* ============================================================
       9. FOOTER DYNAMIC YEAR
       ============================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
/* ==========================================================================
   10. DATOCMS INTEGRATION & LUXURY INFINITE DRAG SLIDERS (OVERHAULED)
   ========================================================================== */

const DATOCMS_READ_ONLY_TOKEN = "f4b3b8c10c8dc8ad68ef3f352cece6";

// Utility function to extract YouTube IDs cleanly
function getYouTubeId(url) {
  if (!url) return "dQw4w9WgXcQ"; 
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\/\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "dQw4w9WgXcQ";
}

// Reusable local backup system if CMS returns errors or holds zero rows
function renderTestimonialFallbacks() {
  const videoTrack = document.getElementById("videoSliderTrack");
  const textTrack = document.getElementById("textSliderTrack");

  if (videoTrack && videoTrack.children.length === 0) {
    const fallbackVideos = [
      { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Client Video Review" },
      { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Brand Growth Story" }
    ];
    renderVideoSlider(fallbackVideos);
  }

  if (textTrack && textTrack.children.length === 0) {
    const fallbackTexts = [
      {
        companyName: "Zenith Threads",
        reviewText: "The creative pipeline completely solved our fatigue issues. We scaled our Meta spend by 40% without drops in ROAS.",
        rating: 5,
        logo: { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop" }
      },
      {
        companyName: "GlowKit",
        reviewText: "Working directly with the founders made a massive difference. No overhead, just pure performance creative that converts.",
        rating: 5,
        logo: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" }
      }
    ];
    renderTextSlider(fallbackTexts);
  }
}

async function initTestimonials() {
  const query = `
    {
      allVideoTestimonials {
        youtubeLink
        title
      }
      allTextTestimonials {
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

    const { data, errors } = await response.json();

    if (errors) {
      console.error("❌ DatoCMS GraphQL Error Details:\n", errors.map(e => e.message).join("\n\n"));
      renderTestimonialFallbacks();
      return;
    }

    if (!data || !data.allVideoTestimonials || !data.allTextTestimonials) {
      console.error("DatoCMS Fetch Error: no data or incomplete structure returned from API");
      renderTestimonialFallbacks();
      return;
    }

    renderVideoSlider(data.allVideoTestimonials);
    renderTextSlider(data.allTextTestimonials);
  } catch (err) {
    console.error("DatoCMS Network Fetch Error:", err);
    renderTestimonialFallbacks();
  }
}

function renderVideoSlider(videos) {
  const track = document.getElementById("videoSliderTrack");
  if (!track || !videos || !videos.length) return;

  // Triplicate or duplicate to guarantee smooth infinite fill across ultra-wide viewports
  const items = [...videos, ...videos, ...videos];

  track.innerHTML = items
    .map((vid) => {
      const videoId = getYouTubeId(vid.youtubeLink);
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      return `
            <div class="glass-card video-card">
                <div class="video-thumb-container" onclick="handleVideoPlay(this, '${videoId}')">
                    <img src="${thumbUrl}" alt="${vid.title || 'Video testimonial'}" draggable="false">
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
  container.innerHTML = `
        <iframe width="100%" height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen style="position:absolute; inset:0;">
        </iframe>`;
};

function renderTextSlider(testimonials) {
  const track = document.getElementById("textSliderTrack");
  if (!track || !testimonials || !testimonials.length) return;

  const items = [...testimonials, ...testimonials, ...testimonials];

  track.innerHTML = items
    .map((t) => {
      const targetRating = typeof t.rating === 'number' ? t.rating : 5;
      const stars = "★".repeat(targetRating) + "☆".repeat(Math.max(0, 5 - targetRating));
      const logoUrl = t.logo?.url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44' fill='%231B4CF2'><circle cx='22' cy='22' r='22'/></svg>";
      
      return `
            <div class="glass-card pad text-card">
                <div class="text-card__stars">${stars}</div>
                <p class="testimonial-card__quote">"${t.reviewText || ''}"</p>
                <div class="text-card__header">
                    <img class="text-card__logo" src="${logoUrl}" alt="${t.companyName || 'Client'}" draggable="false">
                    <div>
                        <h4 style="margin:0; font-size:1rem;">${t.companyName || 'Verified Founder'}</h4>
                        <span class="testimonial-card__author" style="margin:0;">Partner Brand</span>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  setupSliderDragging(document.querySelector(".text-slider-wrapper"), track);
}

function setupSliderDragging(wrapper, track) {
  if (!wrapper || !track) return;

  let currentX = 0;
  let isDragging = false;
  let isHovered = false;
  let startX = 0;
  let dragStartTranslate = 0;
  let totalDragDistance = 0;
  
  // Luxury auto-scroll speed (pixels per frame)
  const autoScrollSpeed = 0.5; 

  // Direct script configuration to bypass any CSS transitions entirely
  track.style.transition = "none";

  function update() {
    if (!isDragging && !isHovered) {
      currentX -= autoScrollSpeed;
      
      // Since elements are perfectly cloned, split width down into 3 clean sets
      const setWidth = track.scrollWidth / 3;
      if (Math.abs(currentX) >= setWidth) {
        currentX = 0; // Seamless snap-back
      }
      track.style.transform = `translateX(${currentX}px) translateZ(0)`;
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  // Mouse Down / Touch Start
  const startInteraction = (clientX) => {
    isDragging = true;
    wrapper.classList.add("is-dragging");
    startX = clientX;
    dragStartTranslate = currentX;
    totalDragDistance = 0;
  };

  // Mouse Move / Touch Move
  const moveInteraction = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    totalDragDistance = Math.abs(deltaX);
    currentX = dragStartTranslate + deltaX;

    const setWidth = track.scrollWidth / 3;
    
    // Bounds wrapping logic inside drag state to prevent empty spaces
    if (currentX > 0) {
      currentX -= setWidth;
      dragStartTranslate -= setWidth;
    } else if (Math.abs(currentX) >= setWidth) {
      currentX += setWidth;
      dragStartTranslate += setWidth;
    }

    track.style.transform = `translateX(${currentX}px) translateZ(0)`;
  };

  // End Interaction
  const endInteraction = () => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.classList.remove("is-dragging");
  };

  // Mouse Listeners
  wrapper.addEventListener("mousedown", (e) => startInteraction(e.clientX));
  window.addEventListener("mousemove", (e) => moveInteraction(e.clientX));
  window.addEventListener("mouseup", endInteraction);

  // Touch Listeners
  wrapper.addEventListener("touchstart", (e) => startInteraction(e.touches[0].clientX), { passive: true });
  wrapper.addEventListener("touchmove", (e) => moveInteraction(e.touches[0].clientX), { passive: true });
  wrapper.addEventListener("touchend", endInteraction);

  // Auto-scroll pause mechanics when cursor targets elements
  wrapper.addEventListener("mouseenter", () => isHovered = true);
  wrapper.addEventListener("mouseleave", () => {
    isHovered = false;
    isDragging = false; 
    wrapper.classList.remove("is-dragging");
  });

  // CRITICAL FIX: Intercepts and completely destroys click events if the user was dragging
  wrapper.addEventListener("click", (e) => {
    if (totalDragDistance > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true); // Capturing phase execution preserves structure and kills downstream functions
}