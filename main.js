// Progressive enhancement: content, native anchors, and details work without JS.
const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-nav");
const narrow = window.matchMedia("(max-width: 760px)");
if (header && menu && nav) {
  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.innerHTML = open
      ? 'Close <span aria-hidden="true">−</span>'
      : 'Menu <span aria-hidden="true">+</span>';
    if (restoreFocus) menu.focus();
  }
  function syncMenu() {
    menu.hidden = !narrow.matches;
    header.classList.toggle("menu-ready", narrow.matches);
    setMenu(false);
  }
  menu.addEventListener("click", () =>
    setMenu(menu.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !narrow.matches) return;
    // Move focus out of the collapsed navigation to the native anchor target.
    if (link.hash && link.pathname === location.pathname) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
    setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true")
      setMenu(false, true);
  });
  narrow.addEventListener("change", syncMenu);
  syncMenu();
}
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
// Keep links shared from the previous portfolio working.
const legacyAnchors = {
  "m-about": "about",
  "m-projects": "projects",
  "m-skills": "skills",
  "m-experience": "experience",
  "m-leadership": "experience",
  "m-contact": "contact",
};
const oldTarget = legacyAnchors[location.hash.slice(1)];
if (oldTarget && document.getElementById(oldTarget)) {
  history.replaceState(null, "", "#" + oldTarget);
  document.getElementById(oldTarget).scrollIntoView({ behavior: "instant" });
}
