document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- menu mobile ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- glitch do hero: ao carregar, e depois a cada 7s ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const glitchTitle = document.querySelector(".glitch");

if (glitchTitle && !reduceMotion) {
  const runGlitch = () => {
    glitchTitle.classList.remove("run");
    // força reflow pra poder reiniciar a animação
    void glitchTitle.offsetWidth;
    glitchTitle.classList.add("run");
  };

  window.addEventListener("load", () => setTimeout(runGlitch, 250));
  setInterval(runGlitch, 7000);
}

/* ---------- cursor blob (só em telas com mouse) ---------- */
const cursorBlob = document.getElementById("cursorBlob");
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

if (hasFinePointer && !reduceMotion) {
  window.addEventListener("mousemove", (e) => {
    cursorBlob.style.left = `${e.clientX}px`;
    cursorBlob.style.top = `${e.clientY}px`;
    cursorBlob.classList.add("is-visible");
  });

  document.querySelectorAll("a, button, .project-card, .service-card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorBlob.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursorBlob.classList.remove("is-active"));
  });
}

/* ---------- formulário de contato ---------- */
const form = document.getElementById("contatoForm");
const status = document.getElementById("formStatus");
const DESTINO_EMAIL = "nataliadalpozzopj@gmail.com.br";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const assunto = form.assunto.value.trim();
  const mensagem = form.mensagem.value.trim();

  const corpo = `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`;
  const mailtoUrl =
    `mailto:${DESTINO_EMAIL}` +
    `?subject=${encodeURIComponent(assunto)}` +
    `&body=${encodeURIComponent(corpo)}`;

  window.location.href = mailtoUrl;

  status.textContent = "abrindo seu app de e-mail com a mensagem pronta pra enviar...";
});
