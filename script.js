document.addEventListener("DOMContentLoaded", () => {
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

  const canvas = document.getElementById("stardust");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    let width, height;
    const stars = [];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileDevice = window.innerWidth < 768;
    const isLowPowerDevice = document.documentElement.classList.contains("gpu-lite");

    const initCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const viewportSurfaceArea = width * height;
      const targetStarDensityFactor = 8500; 

      const mobileCap = isLowPowerDevice ? 45 : 70;
      let adjustedCount = Math.min(Math.floor(viewportSurfaceArea / targetStarDensityFactor), isMobileDevice ? mobileCap : 140);
      if (prefersReducedMotion) adjustedCount = Math.floor(adjustedCount * 0.2);

      stars.length = 0;
      for (let i = 0; i < adjustedCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.1,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
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

    const frameInterval = isLowPowerDevice ? 1000 / 20 : isMobileDevice ? 1000 / 24 : 1000 / 60;
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
      const sizeMultiplier = 1.5; 
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

  const marqueeTrack = document.querySelector(".logos__track");
  if (marqueeTrack) {
    const initialContent = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML = initialContent + initialContent;
  }

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

  initTestimonials();

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

const DATOCMS_READ_ONLY_TOKEN = "f4b3b8c10c8dc8ad68ef3f352cece6";

function getYouTubeId(url) {
  if (!url) return "dQw4w9WgXcQ";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\/\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "dQw4w9WgXcQ";
}

function renderTestimonialFallbacks() {
  const textTrack = document.getElementById("textSliderTrack");

  if (textTrack && textTrack.children.length === 0) {
    const fallbackTexts = [
      { companyName: "Zenith Threads", reviewText: "The creative pipeline completely solved our fatigue issues. We scaled our Meta spend by 40% without drops in ROAS.", rating: 5, logo: { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop" } },
      { companyName: "GlowKit", reviewText: "Working directly with the founders made a massive difference. No overhead, just pure performance creative that converts.", rating: 5, logo: { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" } },
      { companyName: "Apex Aura", reviewText: "Unmatched speed and sharp compliance execution. Our ad fatigue problem disappeared overnight.", rating: 5, logo: { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop" } },
    ];
    renderTextSlider(fallbackTexts);
  }
}

async function initTestimonials() {
  const query = `{
    allVideoTestimonials { youtubeLink title }
    allTextTestimonials { companyName reviewText rating logo { url } }
    allLogoStrips { logoImage { url alt } }
    allVoiceTestimonials { voiceNote { url } }
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
      console.error("DatoCMS Request Failed Gracefully:", errors);
      const videoWrapper = document.querySelector(".video-slider-wrapper");
      if (videoWrapper) videoWrapper.style.display = "none";
      renderTestimonialFallbacks();
      renderVoiceSlider([]);
      return;
    }
    
    if (!data.allVideoTestimonials || data.allVideoTestimonials.length === 0) {
      const videoWrapper = document.querySelector(".video-slider-wrapper");
      if (videoWrapper) videoWrapper.style.display = "none";
    } else {
      renderVideoSlider(data.allVideoTestimonials);
    }
    
    if (data.allTextTestimonials && data.allTextTestimonials.length > 0) {
      renderTextSlider(data.allTextTestimonials);
    } else {
      renderTestimonialFallbacks();
    }
    
    renderLogoMarquee(data.allLogoStrips);
    renderVoiceSlider(data.allVoiceTestimonials);
    
  } catch (err) {
    console.error("DatoCMS Request Failed Gracefully:", err);
    const videoWrapper = document.querySelector(".video-slider-wrapper");
    if (videoWrapper) videoWrapper.style.display = "none";
    renderTestimonialFallbacks();
    renderVoiceSlider([]);
  }
}

function renderVideoSlider(videos) {
  const track = document.getElementById("videoSliderTrack");
  const wrapper = document.querySelector(".video-slider-wrapper");
  if (!track || !videos || !videos.length) return;

  const shouldActivateSlider = videos.length > 2;
  const items = shouldActivateSlider ? [...videos, ...videos, ...videos] : videos;

  if (wrapper) {
    if (!shouldActivateSlider) {
      wrapper.classList.add("slider-disabled");
    } else {
      wrapper.classList.remove("slider-disabled");
    }
  }

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

  if (shouldActivateSlider) {
    initFocusCarousel(wrapper, track, videos.length);
  }
}

window.handleVideoPlay = function (container, videoId) {
  container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; inset:0;"></iframe>`;
};

function renderTextSlider(testimonials) {
  const track = document.getElementById("textSliderTrack");
  const wrapper = document.querySelector(".text-slider-wrapper");
  if (!track || !testimonials || !testimonials.length) return;

  const shouldActivateSlider = testimonials.length > 3;
  const items = shouldActivateSlider ? [...testimonials, ...testimonials, ...testimonials] : testimonials;

  if (wrapper) {
    if (!shouldActivateSlider) {
      wrapper.classList.add("slider-disabled");
    } else {
      wrapper.classList.remove("slider-disabled");
    }
  }

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

  if (shouldActivateSlider) {
    initFocusCarousel(wrapper, track, testimonials.length);
  }
}

function renderVoiceSlider(voiceNotes) {
  const track = document.getElementById("voiceSliderTrack");
  const wrapper = document.querySelector(".voice-slider-wrapper");

  if (!track || !voiceNotes || !voiceNotes.length) {
    if (wrapper) wrapper.style.display = "none";
    return;
  }

  if (wrapper) wrapper.style.display = "block";

  const shouldActivateSlider = voiceNotes.length > 3;
  const items = shouldActivateSlider ? [...voiceNotes, ...voiceNotes, ...voiceNotes] : voiceNotes;

  if (wrapper) {
    if (!shouldActivateSlider) {
      wrapper.classList.add("slider-disabled");
    } else {
      wrapper.classList.remove("slider-disabled");
    }
  }

  track.innerHTML = items
    .map((v) => {
      const audioUrl = v.voiceNote?.url || "";
      return `
      <div class="glass-card glass-card--ecom pad voice-card">
        <div class="card-grid-texture"></div>
        <div class="voice-card__header">
          <div class="icon-badge" style="margin-bottom: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
          </div>
          <div>
            <h4 style="margin:0; font-size:1rem; font-weight:600; color:var(--white);">Voice Note Testimonial</h4>
            <span class="testimonial-card__author" style="margin:0; font-size:0.85rem; color: var(--text-muted);">Partner Brand Memo</span>
          </div>
        </div>
        <div class="voice-card__player">
          <div class="cyber-audio-player">
            <audio src="${audioUrl}" preload="metadata"></audio>
            <div class="cyber-audio-controls-row">
              <button class="cyber-audio-play" aria-label="Play audio">
                <svg class="play-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>
              </button>
              <span class="cyber-audio-time">0:00 / --:--</span>
            </div>
            <div class="cyber-audio-progress-wrap">
              <input type="range" class="cyber-audio-progress" min="0" max="100" value="0">
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  track.querySelectorAll('.cyber-audio-player').forEach(player => {
    const audio = player.querySelector('audio');
    const playBtn = player.querySelector('.cyber-audio-play');
    const timeLabel = player.querySelector('.cyber-audio-time');
    const progressBar = player.querySelector('.cyber-audio-progress');
    
    function formatTime(seconds) {
      if (isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateFill(percentage) {
      progressBar.style.setProperty('--seek-percent', `${percentage}%`);
    }
    
    audio.addEventListener('loadedmetadata', () => {
      timeLabel.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });
    
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('audio').forEach(otherAudio => {
        if (otherAudio !== audio) {
          otherAudio.pause();
          const otherPlayer = otherAudio.closest('.cyber-audio-player');
          if (otherPlayer) {
            otherPlayer.querySelector('.cyber-audio-play').innerHTML = '<svg class="play-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>';
          }
        }
      });

      if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<svg class="pause-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      } else {
        audio.pause();
        playBtn.innerHTML = '<svg class="play-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>';
      }
    });
    
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressBar.value = percentage;
      updateFill(percentage);
      timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener('ended', () => {
      playBtn.innerHTML = '<svg class="play-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>';
      progressBar.value = 0;
      updateFill(0);
      timeLabel.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });
    
    progressBar.addEventListener('input', () => {
      if (!audio.duration) return;
      audio.currentTime = (progressBar.value / 100) * audio.duration;
      updateFill(progressBar.value);
    });

    progressBar.addEventListener('mousedown', (e) => e.stopPropagation());
    progressBar.addEventListener('touchstart', (e) => e.stopPropagation());
  });

  if (shouldActivateSlider) {
    initFocusCarousel(wrapper, track, voiceNotes.length);
  }
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

function initFocusCarousel(wrapper, track, setSize, options = {}) {
  if (!wrapper || !track || !setSize || setSize < 1) return;

  const interval = options.interval || 3800;
  let activeIndex = setSize;
  let timer = null;
  let isPaused = false;
  let isPointerDown = false;
  let didDrag = false;
  let startX = 0;
  let dragDx = 0;

  const getCards = () => Array.from(track.children);

  function cardFromEvent(e) {
    let el = e.target;
    while (el && el !== track && el.parentElement !== track) {
      el = el.parentElement;
    }
    return el && el.parentElement === track ? el : null;
  }

  function paint(instant) {
    const cards = getCards();
    if (!cards.length) return;

    if (instant) track.style.transition = "none";

    cards.forEach((el, i) => {
      const isActive = i === activeIndex;
      el.classList.toggle("is-active", isActive);
      if (!isActive) el.classList.remove("is-expanded");
    });

    const active = cards[activeIndex];
    if (active) {
      const target = wrapper.clientWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
      track.style.transform = `translate3d(${Math.round(target)}px, 0, 0)`;
    }

    if (instant) {
      track.offsetHeight;
      track.style.transition = "";
    }
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!isPaused && !isPointerDown) goTo(activeIndex + 1);
    }, interval);
  }

function goTo(index) {
    if (activeIndex >= setSize * 2) {
      const diff = index - activeIndex;
      activeIndex -= setSize;
      paint(true);
      index = activeIndex + diff;
    } else if (activeIndex < setSize) {
      const diff = index - activeIndex;
      activeIndex += setSize;
      paint(true);
      index = activeIndex + diff;
    }

    activeIndex = index;
    paint(false);
    restartTimer();
  }

  track.addEventListener("transitionend", (e) => {
    if (e.target !== track || e.propertyName !== "transform") return;
    if (activeIndex >= setSize * 2) {
      activeIndex -= setSize;
      paint(true);
    } else if (activeIndex < setSize) {
      activeIndex += setSize;
      paint(true);
    }
  });

  wrapper.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".cyber-audio-player")) return;
    isPointerDown = true;
    didDrag = false;
    startX = e.clientX;
    dragDx = 0;
    wrapper.classList.add("is-dragging");
  });

  window.addEventListener("pointermove", (e) => {
    if (!isPointerDown) return;
    dragDx = e.clientX - startX;
    if (Math.abs(dragDx) > 6) didDrag = true;
  });

  window.addEventListener("pointerup", () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    wrapper.classList.remove("is-dragging");
    const threshold = 40;
    if (dragDx <= -threshold) goTo(activeIndex + 1);
    else if (dragDx >= threshold) goTo(activeIndex - 1);
    setTimeout(() => (didDrag = false), 60);
  });

  wrapper.addEventListener(
    "click",
    (e) => {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const card = cardFromEvent(e);
      if (!card) return;
      const idx = getCards().indexOf(card);
      if (idx === -1) return;

      if (idx !== activeIndex) {
        e.preventDefault();
        e.stopPropagation();
        goTo(idx);
        return;
      }

      const quote = card.querySelector(".testimonial-card__quote");
      if (!quote) return;

      const isExpanded = card.classList.contains("is-expanded");
      if (!isExpanded && quote.scrollHeight - quote.clientHeight <= 2) {
        return; 
      }

      e.preventDefault();
      e.stopPropagation();
      card.classList.toggle("is-expanded", !isExpanded);
      isPaused = !isExpanded; 
      restartTimer();
    },
    { capture: true }
  );

  wrapper.addEventListener("mouseenter", () => (isPaused = true));
  wrapper.addEventListener("mouseleave", () => (isPaused = false));

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          restartTimer();
        } else {
          clearInterval(timer);
        }
      });
    },
    { threshold: 0.15 }
  );
  visibilityObserver.observe(wrapper);

  let resizeTimeout;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => paint(true), 150);
    },
    { passive: true }
  );

  paint(true);
}