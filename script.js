const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const prefersReducedMotion = () => reducedMotionQuery.matches;

const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 60);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a, .nav-cta");

if (navbar && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "Fechar" : "Menu";
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
    });
  });
}

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  const icon = item.querySelector(".faq-icon");

  button?.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((faqItem) => {
      const faqButton = faqItem.querySelector(".faq-question");
      const faqAnswer = faqItem.querySelector(".faq-answer");
      const faqIcon = faqItem.querySelector(".faq-icon");

      faqItem.classList.remove("is-open");
      faqButton?.setAttribute("aria-expanded", "false");

      if (faqAnswer) {
        faqAnswer.style.maxHeight = "0px";
      }

      if (faqIcon) {
        faqIcon.textContent = "+";
      }
    });

    if (!isOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");

      if (answer) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }

      if (icon) {
        icon.textContent = "-";
      }
    }
  });
});

const syncOpenFaqHeight = () => {
  const openAnswer = document.querySelector(".faq-item.is-open .faq-answer");

  if (openAnswer) {
    openAnswer.style.maxHeight = `${openAnswer.scrollHeight}px`;
  }
};

syncOpenFaqHeight();

const slides = Array.from(document.querySelectorAll("[data-slide]"));
const counterLabel = document.querySelector("[data-counter]");
const sliderButtons = document.querySelectorAll(".slider-button");
let activeSlideIndex = 0;

const updateSlides = (index) => {
  if (slides.length === 0) {
    return;
  }

  activeSlideIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSlideIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  if (counterLabel) {
    counterLabel.textContent = `${activeSlideIndex + 1} / ${slides.length}`;
  }
};

sliderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = Number(button.getAttribute("data-direction") || "1");
    updateSlides(activeSlideIndex + direction);
  });
});

updateSlides(0);

const animatedCounters = Array.from(document.querySelectorAll("[data-counter-target]"));

const formatCounterValue = (value, counter) => {
  const prefix = counter.dataset.counterPrefix || "";
  const suffix = counter.dataset.counterSuffix || "";
  const formattedNumber = new Intl.NumberFormat("en-US").format(value);
  return `${prefix}${formattedNumber}${suffix}`;
};

const animateCounter = (counter) => {
  const targetValue = Number(counter.dataset.counterTarget || "0");
  const duration = 850;
  const startTime = performance.now();

  counter.textContent = formatCounterValue(0, counter);

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(targetValue * easedProgress);

    counter.textContent = formatCounterValue(currentValue, counter);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window && animatedCounters.length > 0 && !prefersReducedMotion()) {
  animatedCounters.forEach((counter) => {
    counter.textContent = formatCounterValue(0, counter);
  });

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.45,
    },
  );

  animatedCounters.forEach((counter) => counterObserver.observe(counter));
} else {
  animatedCounters.forEach((counter) => {
    const targetValue = Number(counter.dataset.counterTarget || "0");
    counter.textContent = formatCounterValue(targetValue, counter);
  });
}

const horizontalSections = Array.from(
  document.querySelectorAll("[data-horizontal-section]"),
).map((section) => ({
  section,
  pin: section.querySelector("[data-horizontal-pin]"),
  track: section.querySelector("[data-horizontal-track]"),
  maxTranslate: 0,
}));

const progressiveChats = Array.from(document.querySelectorAll("[data-scroll-chat]"))
  .map((section) => {
    const card = section.querySelector(".chat-card-progressive");
    const steps = Array.from(section.querySelectorAll("[data-chat-step]"));

    if (!card || steps.length === 0) {
      return null;
    }

    card.classList.add("is-enhanced");

    return {
      section,
      card,
      steps,
    };
  })
  .filter(Boolean);

const revealAllChatSteps = (chat) => {
  chat.steps.forEach((step) => step.classList.add("is-visible"));
};

const updateProgressiveChats = () => {
  progressiveChats.forEach((chat) => {
    if (prefersReducedMotion() || window.innerWidth <= 900) {
      revealAllChatSteps(chat);
      return;
    }

    const rect = chat.section.getBoundingClientRect();
    const progress = clamp(
      (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.18),
      0,
      1,
    );

    chat.steps.forEach((step, index) => {
      const threshold = chat.steps.length === 1 ? 0 : index / (chat.steps.length - 1);
      step.classList.toggle("is-visible", progress + 0.08 >= threshold);
    });
  });
};

const revealEls = Array.from(document.querySelectorAll("[data-reveal]")).filter(
  (el) => !el.closest("[data-horizontal-track]"),
);

if ("IntersectionObserver" in window && !prefersReducedMotion()) {
  revealEls.forEach((el) => el.classList.add("will-reveal"));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.remove("will-reveal");
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -60px 0px" },
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

const measureHorizontalSections = () => {
  horizontalSections.forEach((item) => {
    if (!item.pin || !item.track) {
      return;
    }

    if (prefersReducedMotion() || window.innerWidth <= 1120) {
      item.maxTranslate = 0;
      item.section.style.height = "auto";
      item.track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const pinHeight = item.pin.offsetHeight;
    const maxTranslate = Math.max(item.track.scrollWidth - item.pin.clientWidth, 0);

    item.maxTranslate = maxTranslate;
    item.section.style.height = `${pinHeight + maxTranslate}px`;
  });
};

const updateHorizontalSections = () => {
  horizontalSections.forEach((item) => {
    if (!item.pin || !item.track) {
      return;
    }

    if (prefersReducedMotion() || window.innerWidth <= 1120 || item.maxTranslate <= 0) {
      item.track.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const rect = item.section.getBoundingClientRect();
    const scrollDistance = Math.max(item.section.offsetHeight - item.pin.offsetHeight, 1);
    const progress = clamp(-rect.top / scrollDistance, 0, 1);
    const translateX = item.maxTranslate * progress;

    item.track.style.transform = `translate3d(${-translateX}px, 0, 0)`;
  });
};

let sceneFrame = 0;

const renderScrollScenes = () => {
  sceneFrame = 0;
  updateHorizontalSections();
  updateProgressiveChats();
};

const requestSceneRender = () => {
  if (sceneFrame !== 0) {
    return;
  }

  sceneFrame = window.requestAnimationFrame(renderScrollScenes);
};

const handleViewportChange = () => {
  syncOpenFaqHeight();
  measureHorizontalSections();
  requestSceneRender();
};

window.addEventListener("scroll", requestSceneRender, { passive: true });
window.addEventListener("resize", handleViewportChange);
window.addEventListener("load", handleViewportChange);

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", handleViewportChange);
}

measureHorizontalSections();
requestSceneRender();
