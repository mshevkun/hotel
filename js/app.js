/* =========================================================
   APP INIT (ONE FILE, CLEAN)
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     MOBILE / DESKTOP NAV MENU (FULLSCREEN)
  ========================================================= */
  (() => {
    const body = document.body;
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("main-menu");
    const closeBtn = document.querySelector(".menu-close");
    const label = toggle?.querySelector(".nav-toggle-label");

    if (!toggle || !menu || !label) return;

    const items = Array.from(menu.children);
    const isMobile = () => window.innerWidth <= 768;

    let startX = 0;
    let currentX = 0;
    let tracking = false;
    let menuOpenedOnce = false;

    function scrollToActiveMenuItem() {
      const active = menu.querySelector(".menu-item--active");
      if (!active) return;

      requestAnimationFrame(() => {
        active.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      });
    }

    function expandActiveSubmenusDeep() {
      if (!isMobile()) return;

      let current = menu.querySelector(".menu-item--active");
      if (!current) return;

      while (current) {
        const parent = current.closest(".menu-item--has-children");
        if (!parent) break;

        parent.classList.add("menu-open");
        current = parent.parentElement;
      }
    }

    function openMenu() {
      body.classList.add("nav-open");
      menu.classList.add("menu--open");
      toggle.setAttribute("aria-expanded", "true");

      if (!menuOpenedOnce) {
        items.forEach((item, i) => {
          item.style.setProperty("--delay", `${i * 40}ms`);
          item.classList.add("menu-item-animate");
        });
        menuOpenedOnce = true;
      }

      expandActiveSubmenusDeep();
      scrollToActiveMenuItem();
    }

    function closeMenu() {
      body.classList.remove("nav-open");
      menu.classList.remove("menu--open");
      toggle.setAttribute("aria-expanded", "false");
      label.textContent = "Menu";

      items.forEach((item) =>
        item.classList.remove("menu-item-animate", "menu-open")
      );
    }

    /* burger */
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      body.classList.contains("nav-open") ? closeMenu() : openMenu();
    });

    /* close (X) */
    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMenu();
    });

    /* click outside */
    document.addEventListener("click", (e) => {
      if (
        body.classList.contains("nav-open") &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    /* accordion with navigation support (mobile only) */
    menu.querySelectorAll(".menu-item--has-children").forEach((item) => {
      const link = item.querySelector(":scope > a");

      if (!link) return;

      link.addEventListener("click", (e) => {
        if (!isMobile()) return;

        const isOpen = item.classList.contains("menu-open");

        if (!isOpen) {
          e.preventDefault();

          // close siblings on same level
          Array.from(item.parentElement.children)
            .filter(
              (el) =>
                el !== item && el.classList.contains("menu-item--has-children")
            )
            .forEach((el) => el.classList.remove("menu-open"));

          item.classList.add("menu-open");
        }
        // second tap → browser navigates
      });
    });

    /* swipe to close */
    menu.addEventListener("touchstart", (e) => {
      if (!body.classList.contains("nav-open")) return;
      startX = e.touches[0].clientX;
      tracking = true;
    });

    menu.addEventListener("touchmove", (e) => {
      if (!tracking) return;
      currentX = e.touches[0].clientX;
    });

    menu.addEventListener("touchend", () => {
      if (!tracking) return;
      if (startX - currentX > 60) closeMenu();
      tracking = false;
    });

    /* esc */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        closeMenu();
      }
    });
  })();

  /* =========================================================
     HERO SLIDER (IMPROVED WITH ARROWS & TRANSITIONS)
  ========================================================= */
  (() => {
    const slider = document.querySelector("[data-slider]");
    if (!slider) return;

    const slides = [...slider.querySelectorAll(".slide")];
    const dots = [...slider.querySelectorAll(".slider-pagination button")];
    const prevBtn = slider.querySelector('[data-action="prev"]');
    const nextBtn = slider.querySelector('[data-action="next"]');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    let isTransitioning = false;
    const INTERVAL = 5000;
    const TRANSITION_DURATION = 500; // Match CSS transition duration

    // Navigate to specific slide
    function goToSlide(index) {
      if (isTransitioning) return;
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      isTransitioning = true;

      // Remove active class from current slide
      slides[currentIndex].classList.remove("is-active");
      dots[currentIndex]?.removeAttribute("aria-current");

      // Add active class to new slide
      currentIndex = index;
      slides[currentIndex].classList.add("is-active");
      dots[currentIndex]?.setAttribute("aria-current", "true");

      // Reset transition lock after animation completes
      setTimeout(() => {
        isTransitioning = false;
      }, TRANSITION_DURATION);

      // Restart auto-play timer
      startAutoPlay();
    }

    // Navigate to next slide
    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    // Navigate to previous slide
    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Auto-play functionality
    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(nextSlide, INTERVAL);
    }

    function stopAutoPlay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Event listeners for navigation arrows
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nextSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        prevSlide();
      });
    }

    // Event listeners for pagination dots
    dots.forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        const i = Number(dot.dataset.slide);
        if (!Number.isNaN(i) && i !== currentIndex) {
          goToSlide(i);
        }
      });
    });

    // Pause on hover
    slider.addEventListener("mouseenter", stopAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50;

    slider.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
      }
    }

    // Keyboard navigation
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    });

    // Make slider focusable for keyboard navigation
    if (!slider.hasAttribute("tabindex")) {
      slider.setAttribute("tabindex", "0");
    }

    // Initialize
    goToSlide(0);
    startAutoPlay();
  })();

  /* =========================================================
     GUEST COUNTERS
  ========================================================= */
  (() => {
    document.querySelectorAll(".guest-counter").forEach((counter) => {
      const input = counter.querySelector("input");
      const dec = counter.querySelector('[data-action="decrement"]');
      const inc = counter.querySelector('[data-action="increment"]');
      if (!input || !dec || !inc) return;

      const min = Number(counter.dataset.min ?? input.min ?? 0);
      const max = Number(counter.dataset.max ?? input.max ?? 99);

      const update = (v) => {
        dec.disabled = v <= min;
        inc.disabled = v >= max;
      };

      update(Number(input.value));

      dec.onclick = () => {
        let v = Number(input.value);
        if (v > min) input.value = --v;
        update(v);
      };

      inc.onclick = () => {
        let v = Number(input.value);
        if (v < max) input.value = ++v;
        update(v);
      };
    });
  })();

  /* =========================================================
     RANDOM EXPLORE
  ========================================================= */
  (() => {
    const source = [...document.querySelectorAll("#all-explore p")];
    const target = document.getElementById("random-explore");
    if (!source.length || !target) return;

    source
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .forEach((el) => target.appendChild(el.cloneNode(true)));
  })();

  /* =========================================================
     ACTIVE MENU ITEM
  ========================================================= */
  (() => {
    const current = location.pathname.replace(/\/$/, "").toLowerCase();

    document.querySelectorAll(".site-nav a").forEach((link) => {
      const path = new URL(link.href, location.origin).pathname
        .replace(/\/$/, "")
        .toLowerCase();

      if (path === current) {
        const item = link.closest(".menu-item");
        item?.classList.add("menu-item--active");
        item
          ?.closest(".sub-menu")
          ?.closest(".menu-item")
          ?.classList.add("menu-item--active");
      }
    });
  })();
});

/* =========================================================
   BOOKING FORM -> HOTELS.COM
========================================================= */
(() => {
  const form = document.querySelector(".booking-form");
  if (!form) return;

  const HOTEL_URL =
    "https://www.hotels.com/ho1885664576/hudson-valley-resort-kerhonkson-united-states-of-america/";

  const checkInInput = form.querySelector('[name="checkIn"]');
  const checkOutInput = form.querySelector('[name="checkOut"]');

  // Real-time date validation
  function validateDates() {
    if (!checkInInput || !checkOutInput) return true;

    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Clear previous error states
    checkInInput.setCustomValidity("");
    checkOutInput.setCustomValidity("");

    if (checkInInput.value && checkIn < today) {
      checkInInput.setCustomValidity("Check-in date cannot be in the past");
      return false;
    }

    if (checkInInput.value && checkOutInput.value && checkOut <= checkIn) {
      checkOutInput.setCustomValidity("Check-out date must be after check-in date");
      return false;
    }

    return true;
  }

  // Set minimum dates
  if (checkInInput) {
    const today = new Date().toISOString().split("T")[0];
    checkInInput.setAttribute("min", today);
    checkInInput.addEventListener("change", validateDates);
  }

  if (checkOutInput) {
    checkOutInput.addEventListener("change", validateDates);
    // Update min when check-in changes
    if (checkInInput) {
      checkInInput.addEventListener("change", () => {
        if (checkInInput.value) {
          const nextDay = new Date(checkInInput.value);
          nextDay.setDate(nextDay.getDate() + 1);
          checkOutInput.setAttribute("min", nextDay.toISOString().split("T")[0]);
        }
      });
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateDates()) {
      form.reportValidity();
      return;
    }

    const checkIn = checkInInput?.value;
    const checkOut = checkOutInput?.value;
    let adults = +form.querySelector('[name="adults"]')?.value || 1;
    let children = +form.querySelector('[name="children"]')?.value || 0;
    let rooms = +form.querySelector('[name="rooms"]')?.value || 1;

    if (!checkIn || !checkOut) return;

    adults = Math.max(adults, rooms);

    const params = new URLSearchParams({ chkin: checkIn, chkout: checkOut });

    for (let i = 1; i <= rooms; i++) {
      params.set(
        `rm${i}`,
        `a${Math.floor(adults / rooms)}c${Math.floor(children / rooms)}`
      );
    }

    window.open(`${HOTEL_URL}?${params}`, "_blank", "noopener");
  });
})();

/* =========================================================
   GALLERY IMAGE FADE-IN
========================================================= */
document.querySelectorAll(".cool-gallery img").forEach((img) => {
  if (img.complete) {
    img.classList.add("loaded");
  } else {
    img.addEventListener("load", () => {
      img.classList.add("loaded");
    });
    img.addEventListener("error", () => {
      img.classList.add("loaded"); // avoid invisible broken images
    });
  }
});
/* =========================================================
   GALLERY LIGHTBOX (FIXED)
========================================================= */
(() => {
  const gallery = document.querySelector(".cool-gallery");
  if (!gallery) return;

  const images = Array.from(gallery.querySelectorAll("img"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  // Early return if lightbox elements don't exist
  if (!lightbox || !lightboxImg) return;

  const btnClose = lightbox.querySelector(".lightbox-close");
  const btnPrev = lightbox.querySelector(".lightbox-prev");
  const btnNext = lightbox.querySelector(".lightbox-next");

  // Additional safety check
  if (!btnClose || !btnPrev || !btnNext) return;

  let currentIndex = 0;

  function openLightbox(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
  }

  images.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));
    img.style.cursor = "zoom-in";
  });

  btnClose.addEventListener("click", closeLightbox);
  btnNext.addEventListener("click", showNext);
  btnPrev.addEventListener("click", showPrev);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
})();
