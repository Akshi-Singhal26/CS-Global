const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const form = document.getElementById("contact-form");
const statusMessage = document.getElementById("form-status");
const revealElements = document.querySelectorAll(".reveal");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    navMenu.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const targetElement = targetId ? document.querySelector(targetId) : null;

      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      }

      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    });
  });
}

// Respect reduced-motion preferences by revealing everything immediately.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const validators = {
  name: (value) => {
    if (!value.trim()) {
      return "Please enter your name.";
    }

    if (value.trim().length < 2) {
      return "Name must be at least 2 characters.";
    }

    return "";
  },
  email: (value) => {
    if (!value.trim()) {
      return "Please enter your email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  },
  message: (value) => {
    if (!value.trim()) {
      return "Please enter your message.";
    }

    if (value.trim().length < 10) {
      return "Message must be at least 10 characters.";
    }

    return "";
  }
};

function setFieldError(field, message) {
  const errorElement = field.parentElement.querySelector(".error-message");
  field.setAttribute("aria-invalid", String(Boolean(message)));
  errorElement.textContent = message;
}

function validateField(field) {
  const validator = validators[field.name];
  if (!validator) {
    return true;
  }

  const errorMessage = validator(field.value);
  setFieldError(field, errorMessage);
  return !errorMessage;
}

if (form) {
  const fields = Array.from(form.querySelectorAll("input, textarea"));

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = fields.every((field) => validateField(field));

    if (!isFormValid) {
      statusMessage.textContent = "Please correct the highlighted fields and try again.";
      return;
    }

    statusMessage.textContent = "Thank you. Your message is ready to be shared with our team.";
    form.reset();
    fields.forEach((field) => setFieldError(field, ""));
  });
}
