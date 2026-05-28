/* GSAP + Lenis-driven motion & interactions */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const smoothScrollTo = (target, offset = -40) => {
    if (typeof target === "string") target = $(target);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset });
    else window.scrollTo({ top: target.offsetTop + offset, behavior: "smooth" });
  };

  /* ---------- i18n ---------- */
  let lang = "en";
  function applyLang(next) {
    lang = next;
    const dict = window.I18N[lang];
    $$("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    $$("[data-i18n-ph]").forEach(el => {
      const key = el.getAttribute("data-i18n-ph");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });
    $$(".nav__lang button").forEach(b => b.classList.toggle("is-on", b.dataset.lang === lang));
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    if (lenis) lenis.resize();
    ScrollTrigger.refresh();
  }
  $$(".nav__lang button").forEach(b => {
    b.addEventListener("click", () => applyLang(b.dataset.lang));
  });
  applyLang("en");

  /* ---------- Hero entrance ---------- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".hero__title", { y: 50, opacity: 0, duration: 1.2, delay: 0.2 })
    .from(".hero__sub", { y: 30, opacity: 0, duration: 1.0 }, "-=0.7")
    .from(".hero__scroll", { y: 16, opacity: 0, duration: 0.8 }, "-=0.6")
    .from(".nav", { y: -30, opacity: 0, duration: 0.8 }, 0);

  // floating scroll arrow
  gsap.to(".hero__scroll svg", {
    y: 6,
    duration: 1.1,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });

  $(".hero__scroll").addEventListener("click", () => smoothScrollTo("#portfolio"));

  /* ---------- Generic reveal (50px slide up + fade) ---------- */
  $$(".reveal").forEach(el => {
    gsap.fromTo(el,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.0, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      }
    );
  });

  /* ---------- Blur reveal: small texts / paragraphs / labels ---------- */
  const blurSelectors = [
    ".section__desc",
    ".pillar__desc",
    ".service__desc",
    ".founder__role",
    ".founder__bio p",
    ".contact__lead-sub",
    ".info-card__title",
    ".metric__label",
    ".service__num",
    ".tile__type",
    ".video-slot__label"
  ];
  $$(blurSelectors.join(",")).forEach(el => {
    el.classList.add("reveal-blur");
    gsap.fromTo(el,
      { opacity: 0, filter: "blur(15px)", y: 14 },
      {
        opacity: 1, filter: "blur(0px)", y: 0,
        duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%" }
      }
    );
  });

  /* ---------- Scroll-driven typography on big section titles ---------- */
  const scrollTitles = [
    { sel: "#portfolio .section__title", section: "#portfolio" },
    { sel: "#services .section__title",  section: "#services"  },
    { sel: ".pillar__title",             section: ".pillar"    },
    { sel: ".testimonials .section__title", section: ".testimonials" }
  ];
  scrollTitles.forEach(({ sel, section }) => {
    const t = $(sel);
    const s = $(section);
    if (!t || !s) return;
    gsap.fromTo(t,
      { xPercent: -8, opacity: 0.92 },
      {
        xPercent: 8,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2
        }
      }
    );
  });

  /* ---------- Portfolio tile reveal (with stagger) ---------- */
  gsap.fromTo(".portfolio .tile",
    { y: 80, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 1.0, ease: "power3.out",
      stagger: 0.06,
      scrollTrigger: { trigger: ".portfolio", start: "top 82%" }
    }
  );

  /* ---------- Portfolio parallax disabled in masonry mode ---------- */

  /* ---------- Pillar (black band) entrance + counters ---------- */
  gsap.fromTo(".pillar__title",
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: ".pillar", start: "top 80%" }
    }
  );
  gsap.fromTo(".pillar__desc",
    { y: 30, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: 0.12,
      scrollTrigger: { trigger: ".pillar", start: "top 80%" }
    }
  );
  gsap.fromTo(".pillar__metrics .metric",
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: { trigger: ".pillar__metrics", start: "top 85%" }
    }
  );

  $$(".metric__num").forEach(el => {
    const target = parseInt(el.dataset.value, 10);
    const isK = el.dataset.format === "k";
    const display = { v: 0 };
    const numEl = el.querySelector(".metric__val");
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(display, {
          v: target,
          duration: 2.2,
          ease: "power2.out",
          onUpdate: () => {
            const v = Math.round(display.v);
            if (isK) {
              numEl.textContent = v >= 1000 ? Math.round(v / 1000) + "k" : v;
            } else {
              numEl.textContent = v;
            }
          }
        });
      }
    });
  });

  /* ---------- Testimonials marquee ---------- */
  const marquee = $(".marquee");
  if (marquee) {
    const items = Array.from(marquee.children);
    items.forEach(n => marquee.appendChild(n.cloneNode(true)));

    let mqTween;
    const startMarquee = () => {
      const totalWidth = marquee.scrollWidth / 2;
      mqTween = gsap.to(marquee, {
        x: -totalWidth,
        duration: totalWidth / 40,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % -totalWidth)
        }
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(startMarquee));

    marquee.addEventListener("mouseenter", () => mqTween && mqTween.pause());
    marquee.addEventListener("mouseleave", () => mqTween && mqTween.play());
  }

  /* ---------- Founder parallax ---------- */
  gsap.to(".founder__photo", {
    yPercent: -6,
    ease: "none",
    scrollTrigger: {
      trigger: ".founder",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
  gsap.to(".founder__text", {
    yPercent: 3,
    ease: "none",
    scrollTrigger: {
      trigger: ".founder",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });

  /* ---------- Form fields ---------- */
  $$(".field input, .field textarea").forEach(input => {
    const wrap = input.closest(".field");
    const update = () => wrap.classList.toggle("has-value", !!input.value);
    input.addEventListener("focus", () => wrap.classList.add("is-active"));
    input.addEventListener("blur", () => { wrap.classList.remove("is-active"); update(); });
    input.addEventListener("input", update);
  });

  /* ---------- Submit to Netlify without leaving the page ---------- */
$("#contact-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const form = e.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const btn = form.querySelector(".contact__submit");
  const originalText = btn ? btn.innerHTML : "";

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = lang === "pt" ? "ENVIANDO..." : "SENDING...";
  }

  try {
    const formData = new FormData(form);

    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    });

    if (btn) {
      btn.classList.add("is-success");
      btn.innerHTML = lang === "pt" ? "ENVIADO ✓" : "SENT ✓";
    }

    form.reset();
    $$(".field").forEach(f => f.classList.remove("has-value"));

    setTimeout(() => {
      if (btn) {
        btn.classList.remove("is-success");
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }, 2500);

  } catch (error) {
    if (btn) {
      btn.classList.add("is-error");
      btn.innerHTML = lang === "pt" ? "ERRO AO ENVIAR" : "SEND ERROR";

      setTimeout(() => {
        btn.classList.remove("is-error");
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 2500);
    }
  }
});

  /* ---------- Client portal ---------- */
  const portal = $("#portal");
  const openPortal = () => {
    portal.classList.add("is-open");
    gsap.to(portal, { y: 0, duration: 0.9, ease: "power4.out" });
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
  };
  const closePortal = () => {
    gsap.to(portal, { y: "100%", duration: 0.7, ease: "power4.in",
      onComplete: () => { portal.classList.remove("is-open"); }
    });
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  };
  $$("[data-portal-open]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); openPortal(); }));
  $$("[data-portal-close]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); closePortal(); }));
  gsap.set(portal, { y: "100%" });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closePortal(); });

  /* ---------- Mobile burger ---------- */
  const burger = $("#nav-burger");
  const navLinksEl = $("#nav-links");
  const closeMenu = () => {
    burger?.classList.remove("is-open");
    navLinksEl?.classList.remove("is-open");
  };
  burger?.addEventListener("click", () => {
    const open = !burger.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    navLinksEl?.classList.toggle("is-open", open);
  });
  $$('#nav-links a').forEach(a => a.addEventListener("click", closeMenu));

  /* ---------- Smooth in-page nav ---------- */
  $$('a[data-scroll]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      smoothScrollTo(t);
    });
  });

  /* ---------- Active section in nav ---------- */
  const sections = ["#hero", "#portfolio", "#services", "#contact"].map(s => $(s)).filter(Boolean);
  const navLinks = $$('.nav__link[data-scroll]');
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: () => {
      const y = window.scrollY + 120;
      let active = sections[0];
      sections.forEach(s => { if (s.offsetTop <= y) active = s; });
      navLinks.forEach(n => n.classList.toggle("is-active", n.getAttribute("href") === "#" + active.id));
    }
  });
})();

const videoModal = document.getElementById("video-modal");
const videoFrame = document.getElementById("video-frame");
const videoClose = document.getElementById("video-close");
const videoButtons = document.querySelectorAll("[data-video]");

videoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const videoId = button.getAttribute("data-video");

    videoFrame.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&title=0&byline=0&portrait=0`;

    videoModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });
});

function closeVideoModal() {
  videoModal.classList.remove("is-open");
  videoFrame.src = "";
  document.body.style.overflow = "";
}

videoClose.addEventListener("click", closeVideoModal);

videoModal.addEventListener("click", (event) => {
  if (event.target === videoModal || event.target.classList.contains("video-modal__overlay")) {
    closeVideoModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && videoModal.classList.contains("is-open")) {
    closeVideoModal();
  }
});