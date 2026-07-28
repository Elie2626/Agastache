(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: shrink + hide on scroll down ---------- */
  const header = document.getElementById("site-header");
  let lastY = window.scrollY;
  const onScrollHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    if (y > 300 && y > lastY + 6 && !mobileNav.classList.contains("is-open")) {
      header.classList.add("is-hidden");
    } else if (y < lastY - 4 || y < 300) {
      header.classList.remove("is-hidden");
    }
    lastY = y;
  };

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById("progress-bar");
  const onScrollProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };

  /* ---------- Parallax ---------- */
  const parallaxEls = prefersReduced ? [] : [...document.querySelectorAll("[data-parallax]")];
  const onScrollParallax = () => {
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const rect = (el.closest("section") || el).getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) continue;
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      el.style.transform = `translateY(${(-progress * speed * 100).toFixed(2)}px)`;
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      onScrollProgress();
      onScrollParallax();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  const setNav = (open) => {
    mobileNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    mobileNav.setAttribute("aria-hidden", String(!open));
    navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  navToggle.addEventListener("click", () => setNav(!mobileNav.classList.contains("is-open")));
  mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) setNav(false);
  });

  /* ---------- Reveal on scroll (staggered per batch) ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-img");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        visible.forEach((entry, i) => {
          if (!entry.target.style.getPropertyValue("--rd")) {
            entry.target.style.setProperty("--rd", `${i * 90}ms`);
          }
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Menu tabs ---------- */
  const tabs = [...document.querySelectorAll(".menu-tab")];
  const tabsWrap = document.querySelector(".menu-tabs");
  const skyScene = document.getElementById("sky-scene");
  const panels = {
    "tab-dejeuner": document.getElementById("panel-dejeuner"),
    "tab-diner": document.getElementById("panel-diner"),
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
        const panel = panels[t.id];
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
        if (active) {
          panel.style.animation = "none";
          void panel.offsetWidth;
          panel.style.animation = "";
        }
      });
      tabsWrap.dataset.active = String(index);
      skyScene.classList.toggle("is-night", tab.id === "tab-diner");
    });
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
