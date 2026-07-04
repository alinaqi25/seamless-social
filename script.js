document.addEventListener("DOMContentLoaded", () => {
  // Throttle heavy layout actions while actively scrolling
  window.isScrolling = false;
  let scrollTimeout;

  window.addEventListener(
    "scroll",
    () => {
      window.isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        window.isScrolling = false;
      }, 120);
    },
    { passive: true }
  );

  // Background starfield rendering loop
  const canvas = document.getElementById("stardust");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    let width, height;
    const stars = [];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileDevice = window.innerWidth < 768;

    const initCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      const viewportSurfaceArea = width * height;
      const targetStarDensityFactor = isMobileDevice ? 14000 : 8500;

      let adjustedCount = Math.min(Math.floor(viewportSurfaceArea / targetStarDensityFactor), isMobileDevice ? 50 : 140);
      if (prefersReducedMotion) adjustedCount = Math.floor(adjustedCount * 0.2);

      stars.length = 0;
      for (let i = 0; i < adjustedCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.1, 
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initCanvas, 150);
      },
      { passive: true }
    );

    initCanvas();

    const frameInterval = isMobileDevice ? 1000 / 30 : 1000 / 60;
    let lastRenderTime = performance.now();

    const animateStars = (currentTime) => {
      requestAnimationFrame(animateStars);

      if (document.hidden || window.isScrolling) return;

      const delta = currentTime - lastRenderTime;
      if (delta < frameInterval) return;

      lastRenderTime = currentTime - (delta % frameInterval);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isMobileDevice ? "rgba(255, 255, 255, 1.0)" : "rgba(245, 247, 255, 0.75)";
      const len = stars.length;
      const sizeMultiplier = 1.5; // Fixed to match standard PC size scaling multiplier
      for (let i = 0; i < len; i++) {
        const star = stars[i];

        star.x += star.vx * (isMobileDevice ? 1.5 : 1);
        star.y += star.vy * (isMobileDevice ? 1.5 : 1);

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.fillRect(star.x, star.y, star.radius * sizeMultiplier, star.radius * sizeMultiplier);
      }
    };
    requestAnimationFrame(animateStars);
  }

  // Mobile navigation menu toggle
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

  // Trigger hero entrance animations on initial page load
  const heroRevealElements = document.querySelectorAll("#hero [data-reveal]");
  heroRevealElements.forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${index * 0.12}s`);
    el.style.willChange = "transform, opacity";

    requestAnimationFrame(() => {
      el.classList.add("is-visible");
    });

    el.addEventListener(
      "transitionend",
      function clearLayer() {
        el.style.willChange = "";
        el.removeEventListener("transitionend", clearLayer);
      },
      { once: true }
    );
  });

  // Duplicate client logo strip to create seamless marquee loop
  const marqueeTrack = document.querySelector(".logos__track");
  if (marqueeTrack) {
    const initialContent = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML = initialContent + initialContent;
  }

  // FAQ accordion toggling
  const accordionTriggers = document.querySelectorAll(".accordion__trigger");
  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const item = this.closest(".accordion__item");
      const isExpanded = this.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".accordion__item").forEach((accItem) => {
        accItem.classList.remove("is-open");
        accItem.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
      });

      if (!isExpanded) {
        item.classList.add("is-open");
        this.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Multi-step lead form mechanics
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

        parentGrid.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("is-selected"));
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

      const clientName = document.getElementById("fieldName").value.trim();
      const clientContact = document.getElementById("fieldContact").value.trim();

      const revenue = formData["revenue"];
      const spend = formData["spend"];
      const timeline = formData["timeline"];

      const isRevenueQualified = revenue !== "under40";
      const isSpendQualified = spend !== "under500";
      const isTimelineQualified = timeline === "thisweek" || timeline === "thismonth";
      const isQualified = isRevenueQualified && isSpendQualified && isTimelineQualified;

      form.hidden = true;
      document.getElementById("formProgress").hidden = true;
      document.getElementById("formResult").hidden = false;

      if (isQualified) {
        document.getElementById("resultQualified").hidden = false;
        const CALENDLY_LINK = "https://calendly.com/seamlesssocial2/30min";

        if (window.Calendly) {
          window.Calendly.initInlineWidget({
            url: CALENDLY_LINK,
            parentElement: document.getElementById("calendly-inline-widget"),
            prefill: {
              name: clientName,
              email: clientContact.includes("@") ? clientContact : "",
            },
            pageSettings: {
              backgroundColor: "010209",
              hideTextColor: false,
              textLinkColor: "7C8CFF",
              textColor: "F5F7FF",
            },
            utm: {},
          });
        } else {
          const widgetContainer = document.getElementById("calendly-inline-widget");
          if (widgetContainer) {
            widgetContainer.innerHTML = `
              <div style="padding: 2rem; text-align: center; border: 1px dashed var(--glass-border); border-radius: var(--radius-md); margin-top: 1.5rem; background: rgba(255,255,255,0.01);">
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">An ad-blocker or privacy setting is blocking our calendar widget.</p>
                <a href="${CALENDLY_LINK}" target="_blank" rel="noopener" class="btn btn--primary">
                  Click here to book your call directly &rarr;
                </a>
              </div>
            `;
          }
        }
      } else {
        document.getElementById("resultTeardown").hidden = false;
      }
    });
  }

  initTestimonials();

  // Set dynamic footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// DatoCMS client data loader + fallback generators
const DATOCMS_READ_ONLY_TOKEN = "f4b3b8c10c8dc8ad68ef3f352cece6";

function getYouTubeId(url) {
  if (!url) return "dQw4w9WgXcQ";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\/\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "dQw4w9WgXcQ";
}

function renderTestimonialFallbacks() {
  const videoTrack = document.getElementById("videoSliderTrack");
  const textTrack = document.getElementById("textSliderTrack");

  if (videoTrack && videoTrack.children.length === 0) {
    const fallbackVideos = [
      { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Client Video Review" },
      { youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Brand Growth Story" },
    ];
    renderVideoSlider(fallbackVideos);
  }

  if (textTrack && textTrack.children.length === 0) {
    const fallbackTexts = [
      { companyName: "Zenith Threads", reviewText: "The creative pipeline completely solved our fatigue issues. We scaled our Meta spend by 40% without drops in ROAS.", rating: 5, logo: { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop" } },
      { companyName: "GlowKit", reviewText: "Working directly with the founders made a massive difference. No overhead, just pure performance creative that converts.", rating: 5, logo: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" } },
    ];
    renderTextSlider(fallbackTexts);
  }
}

async function initTestimonials() {
  const query = `{
    allVideoTestimonials { youtubeLink title }
    allTextTestimonials { companyName reviewText rating logo { url } }
    allLogoStrips { logoImage { url alt } }
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
    const { data, errors = null } = await response.json();
    if (errors || !data) {
      renderTestimonialFallbacks();
      return;
    }
    renderVideoSlider(data.allVideoTestimonials);
    renderTextSlider(data.allTextTestimonials);
    renderLogoMarquee(data.allLogoStrips);
  } catch (err) {
    renderTestimonialFallbacks();
  }
}

function renderVideoSlider(videos) {
  const track = document.getElementById("videoSliderTrack");
  if (!track || !videos || !videos.length) return;
  const items = [...videos, ...videos, ...videos];
  track.innerHTML = items
    .map((vid) => {
      const videoId = getYouTubeId(vid.youtubeLink);
      return `
      <div class="glass-card glass-card--ecom video-card">
        <div class="card-grid-texture"></div>
        <div class="video-thumb-container" onclick="handleVideoPlay(this, '${videoId}')">
          <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${vid.title || "Video testimonial"}" draggable="false" loading="lazy">
          <button class="play-btn" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%)" aria-label="Play video">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7-11-7z" fill="currentColor"/></svg>
          </button>
        </div>
      </div>`;
    })
    .join("");
  setupSliderDragging(document.querySelector(".video-slider-wrapper"), track);
}

window.handleVideoPlay = function (container, videoId) {
  container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; inset:0;"></iframe>`;
};

function renderTextSlider(testimonials) {
  const track = document.getElementById("textSliderTrack");
  if (!track || !testimonials || !testimonials.length) return;
  const items = [...testimonials, ...testimonials, ...testimonials];
  track.innerHTML = items
    .map((t) => {
      const targetRating = typeof t.rating === "number" ? t.rating : 5;
      const logoUrl = t.logo?.url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44' fill='%231B4CF2'><circle cx='22' cy='22' r='22'/></svg>";
      return `
      <div class="glass-card glass-card--ecom pad text-card">
        <div class="card-grid-texture"></div>
        <div class="text-card__stars">${"★".repeat(targetRating)}</div>
        <p class="testimonial-card__quote">"${t.reviewText || ""}"</p>
        <div class="text-card__header">
          <img class="text-card__logo" src="${logoUrl}" alt="${t.companyName || "Client"}" draggable="false" loading="lazy">
          <div>
            <h4 style="margin:0; font-size:1rem;">${t.companyName || "Verified Founder"}</h4>
            <span class="testimonial-card__author" style="margin:0;">Partner Brand</span>
          </div>
        </div>
      </div>`;
    })
    .join("");
  setupSliderDragging(document.querySelector(".text-slider-wrapper"), track);
}

function renderLogoMarquee(logoStrips) {
  const track = document.querySelector(".logos__track");
  if (!track || !logoStrips || !logoStrips.length) return;
  let extendedLogos = [...logoStrips];

  while (extendedLogos.length < 8) {
    extendedLogos = extendedLogos.concat(logoStrips);
  }
  track.innerHTML = extendedLogos
    .map(
      (logoStrip) => `
    <span class="asset-slot asset-slot--logo-strip" data-label="LOGO">
      <img src="${logoStrip.logoImage?.url || ""}" alt="${logoStrip.logoImage?.alt || "Client logo"}" onerror="handleAssetError(this)" loading="lazy" decoding="async" />
    </span>`
    )
    .join("");

  track.innerHTML += track.innerHTML;
}

// Drag loop handling for testimonials sliders
function setupSliderDragging(wrapper, track) {
  if (!wrapper || !track) return;
  let currentX = 0,
    isDragging = false,
    isHovered = false,
    startX = 0,
    dragStartTranslate = 0;
  const autoScrollSpeed = 0.4;
  let isSliderVisible = false;
  let animationFrameId = null;

  function getSetWidth() {
    return track.scrollWidth / 3;
  }

  // Pre-position track at Set 2 so users can drag left immediately
  function initPosition() {
    const setWidth = getSetWidth();
    if (setWidth > 0) {
      currentX = -setWidth;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
  }

  initPosition();
  setTimeout(initPosition, 100);
  setTimeout(initPosition, 400);

  function update() {
    if (!isSliderVisible || window.isScrolling) {
      if (!isDragging) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }
    }

    const setWidth = getSetWidth();

    if (!isDragging && !isHovered && isSliderVisible && !window.isScrolling && setWidth > 0) {
      currentX -= autoScrollSpeed;
      if (currentX <= -2 * setWidth) {
        currentX += setWidth;
      }
    }

    animationFrameId = requestAnimationFrame(update);
    if (setWidth > 0 && !isDragging) {
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
  }

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isSliderVisible = entry.isIntersecting;
        if (isSliderVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(update);
        }
      });
    },
    { threshold: 0.01 }
  );
  visibilityObserver.observe(wrapper);

  wrapper.addEventListener("mousedown", (e) => {
    isDragging = true;
    wrapper.classList.add("is-dragging");
    startX = e.clientX;
    dragStartTranslate = currentX;
    if (!animationFrameId) animationFrameId = requestAnimationFrame(update);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    currentX = dragStartTranslate + deltaX;
    const setWidth = getSetWidth();
    if (setWidth > 0) {
      if (currentX >= 0) {
        currentX -= setWidth;
        dragStartTranslate -= setWidth;
      } else if (currentX <= -2 * setWidth) {
        currentX += setWidth;
        dragStartTranslate += setWidth;
      }
    }
    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    wrapper.classList.remove("is-dragging");
  });

  wrapper.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      dragStartTranslate = currentX;
      if (!animationFrameId) animationFrameId = requestAnimationFrame(update);
    },
    { passive: true }
  );

  wrapper.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      currentX = dragStartTranslate + (e.touches[0].clientX - startX);
      const setWidth = getSetWidth();
      if (setWidth > 0) {
        if (currentX >= 0) {
          currentX -= setWidth;
          dragStartTranslate -= setWidth;
        } else if (currentX <= -2 * setWidth) {
          currentX += setWidth;
          dragStartTranslate += setWidth;
        }
      }
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    },
    { passive: true }
  );

  wrapper.addEventListener("touchend", () => (isDragging = false));
  wrapper.addEventListener("mouseenter", () => (isHovered = true));
  wrapper.addEventListener("mouseleave", () => {
    isHovered = false;
    isDragging = false;
  });
}