const IMAGE_TRANSLATIONS = {
  "about-poster": { x: 0, y: 0 },
  "outline-part-one": { x: 0, y: 0 },
  "outline-part-two": { x: 0, y: 0 },
  "about-promotion": { x: 0, y: 0 },
  "channel-art-six": { x: 0, y: 0 },
  "channel-screenshot": { x: 0, y: 0 },
  "channel-art-seven": { x: 0, y: 0 },
  "first-post": { x: 0, y: 0 },
  "website-layout": { x: 0, y: 0 },
  "promotional-design": { x: 0, y: 0 },
  "schedule-outline-one": { x: 0, y: 0 },
  "schedule-outline-two": { x: 0, y: 0 },
  "takeaway-image": { x: 0, y: 0 }
};

const FOOTER_BACKGROUND_POSITION = { x: "50%", y: "50%" };

function applyImageTranslations() {
  document.querySelectorAll("[data-image-position]").forEach(function(image) {
    const position = IMAGE_TRANSLATIONS[image.dataset.imagePosition];

    if (!position) {
      return;
    }

    image.style.setProperty("--image-translate-x", `${position.x}px`);
    image.style.setProperty("--image-translate-y", `${position.y}px`);
  });

  const footer = document.querySelector("footer");
  footer.style.setProperty("--background-image-x", FOOTER_BACKGROUND_POSITION.x);
  footer.style.setProperty("--background-image-y", FOOTER_BACKGROUND_POSITION.y);
}

function showTip() {
  const tip = document.getElementById("websiteTip");
  tip.classList.toggle("show");
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  const switchButton = document.getElementById("themeSwitch");
  switchButton.checked = isDark;
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function goToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showCarouselSlide(type, requestedIndex) {
  const slideSelector = type === "about" ? "[data-about-slide]" : "[data-episode-slide]";
  const dotSelector = type === "about" ? "[data-about-dot]" : "[data-episode-dot]";
  const slides = Array.from(document.querySelectorAll(slideSelector));
  const dots = Array.from(document.querySelectorAll(dotSelector));

  if (slides.length === 0) {
    return 0;
  }

  const index = (requestedIndex + slides.length) % slides.length;

  slides.forEach(function(slide, slideIndex) {
    const isActive = slideIndex === index;
    slide.hidden = !isActive;
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  dots.forEach(function(dot, dotIndex) {
    const isActive = dotIndex === index;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-pressed", String(isActive));
  });

  return index;
}

function attachCarousel(type, carouselSelector) {
  const carousel = document.querySelector(carouselSelector);
  const slides = carousel.querySelectorAll(type === "about" ? "[data-about-slide]" : "[data-episode-slide]");
  let activeIndex = 0;
  let touchStartX = 0;

  carousel.querySelectorAll(type === "about" ? "[data-about-direction]" : "[data-episode-direction]").forEach(function(button) {
    button.addEventListener("click", function() {
      activeIndex = showCarouselSlide(type, activeIndex + Number(button.dataset[type + "Direction"]));
    });
  });

  carousel.querySelectorAll(type === "about" ? "[data-about-dot]" : "[data-episode-dot]").forEach(function(dot) {
    dot.addEventListener("click", function() {
      activeIndex = showCarouselSlide(type, Number(dot.dataset[type + "Dot"]));
    });
  });

  carousel.addEventListener("touchstart", function(event) {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener("touchend", function(event) {
    const distance = event.changedTouches[0].screenX - touchStartX;

    if (Math.abs(distance) > 45) {
      activeIndex = showCarouselSlide(type, activeIndex + (distance < 0 ? 1 : -1));
    }
  }, { passive: true });

  return slides.length;
}

window.addEventListener("DOMContentLoaded", function() {
  const themeSwitch = document.getElementById("themeSwitch");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeSwitch.checked = true;
  }

  themeSwitch.addEventListener("change", toggleTheme);
  applyImageTranslations();
  attachCarousel("about", ".about-carousel");
  attachCarousel("episode", ".episode-carousel");

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.getElementById("documentation-menu");

  menuButton.addEventListener("click", function() {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    menu.hidden = isExpanded;
  });

  document.querySelector("[data-document-link]").addEventListener("click", function(event) {
    event.preventDefault();
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");

    const transition = document.getElementById("document-transition");
    transition.classList.add("is-visible");
    transition.setAttribute("aria-hidden", "false");

    window.setTimeout(function() {
      document.getElementById("website").scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "#website");
      transition.classList.remove("is-visible");
      transition.setAttribute("aria-hidden", "true");
    }, 950);
  });

  window.addEventListener("scroll", function() {
    document.getElementById("navbar").style.boxShadow = window.scrollY > 50
      ? "0 5px 20px rgba(18, 59, 82, 0.10)"
      : "none";
  }, { passive: true });

  const sections = document.querySelectorAll("main > section[id]");
  const sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) {
        return;
      }

      document.querySelectorAll(".nav-links a").forEach(function(link) {
        link.classList.toggle("is-active", link.hash === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach(function(section) {
    sectionObserver.observe(section);
  });
});
