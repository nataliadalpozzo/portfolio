// ===== CUSTOM CURSOR =====
const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + "px";
  dot.style.top = mouseY + "px";
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;
  ring.style.left = ringX + "px";
  ring.style.top = ringY + "px";
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll("a, button, .servico-item, .projeto-card").forEach(el => {
  el.addEventListener("mouseenter", () => ring.classList.add("hover"));
  el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
});

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("in"), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// ===== MOBILE MENU =====
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

menuToggle.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

mobileNav.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => mobileNav.classList.remove("open"));
});

// ===== HERO BG TEXT PARALLAX =====
const bgText = document.querySelector(".hero-bg-text");
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  if (bgText) {
    bgText.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.25}px))`;
  }
});
