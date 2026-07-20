/* MetaQuizzes — shared motion helpers */
(function (global) {
  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DURATION = 280;

  function setProgress(fillEl, pct, trackEl) {
    if (!fillEl) return;
    const value = Math.max(0, Math.min(100, Number(pct) || 0));
    fillEl.style.width = value + "%";
    const track = trackEl || fillEl.parentElement;
    if (track && track.getAttribute("role") === "progressbar") {
      track.setAttribute("aria-valuenow", String(Math.round(value)));
    }
  }

  /**
   * Fade/slide between two question panels.
   * @param {HTMLElement|null} fromEl
   * @param {HTMLElement} toEl
   * @param {{activateClass?: string, onDone?: () => void}} [opts]
   */
  function stageQuestion(fromEl, toEl, opts) {
    const options = opts || {};
    const activeClass = options.activateClass || "is-active";

    if (reduced || !fromEl || fromEl === toEl) {
      if (fromEl && fromEl !== toEl) {
        fromEl.classList.remove(activeClass, "is-enter", "is-exit");
        fromEl.hidden = true;
      }
      toEl.hidden = false;
      toEl.classList.add(activeClass);
      toEl.classList.remove("is-exit");
      if (!reduced) {
        toEl.classList.remove("is-enter");
        void toEl.offsetWidth;
        toEl.classList.add("is-enter");
      }
      if (typeof options.onDone === "function") options.onDone();
      return;
    }

    fromEl.classList.remove("is-enter");
    fromEl.classList.add("is-exit");

    window.setTimeout(() => {
      fromEl.classList.remove(activeClass, "is-exit");
      fromEl.hidden = true;

      toEl.hidden = false;
      toEl.classList.add(activeClass);
      toEl.classList.remove("is-exit");
      void toEl.offsetWidth;
      toEl.classList.add("is-enter");

      if (typeof options.onDone === "function") options.onDone();
    }, Math.round(DURATION * 0.85));
  }

  /**
   * Stagger-reveal result rank rows and animate fill widths.
   * Rows should contain `.mq-rank-fill` with `data-width` (e.g. "72%").
   * @param {ParentNode} container
   * @param {string} [rowSelector]
   */
  function staggerReveal(container, rowSelector) {
    if (!container) return;
    const rows = [...container.querySelectorAll(rowSelector || ".mq-rank-row")];

    rows.forEach((row, i) => {
      const fill = row.querySelector(".mq-rank-fill");
      const target = fill ? fill.getAttribute("data-width") || "0%" : "0%";

      if (fill) fill.style.width = "0%";
      row.classList.remove("is-revealed");

      const delay = reduced ? 0 : i * 55;

      window.setTimeout(() => {
        row.classList.add("is-revealed");
        if (fill) {
          if (reduced) {
            fill.style.width = target;
          } else {
            requestAnimationFrame(() => {
              fill.style.width = target;
            });
          }
        }
      }, delay);
    });
  }

  /**
   * Replay enter animation on a freshly rendered stage root.
   * @param {HTMLElement} el
   */
  function pulseEnter(el) {
    if (!el || reduced) return;
    el.classList.remove("is-enter");
    void el.offsetWidth;
    el.classList.add("is-enter");
  }

  global.MQ = {
    reducedMotion: reduced,
    setProgress,
    stageQuestion,
    staggerReveal,
    pulseEnter,
    DURATION,
  };
})(typeof window !== "undefined" ? window : globalThis);
