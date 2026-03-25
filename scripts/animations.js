(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Navbar intro
  gsap.from('header > div', {
    y: -24,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  });

  const sections = gsap.utils.toArray('main > section');

  sections.forEach((section, index) => {
    const isFullScreenSection = section.classList.contains('h-screen');
    const triggerStart = isFullScreenSection ? 'top 52%' : 'top 60%';
    const variant = index % 3;

    const heading = section.querySelector('h1, h2, h3');
    const accentText = section.querySelectorAll('.w4-cover-meta, p.font-semibold, p.italic');
    const logosAndPhotos = section.querySelectorAll("img[src*='logo'], img[src*='photos']");
    const shapes = section.querySelectorAll(".w4-shape, img[src*='shapes']");
    const floatingShapes = Array.from(shapes).filter((shape) => !shape.classList.contains('w4-shape-static'));
    const icons = section.querySelectorAll("img[src*='icons']");

    // Explicit initial states prevent visible content from jumping back
    // to a "from" state when the trigger starts.
    if (heading) {
      if (variant === 0) gsap.set(heading, { y: 34, autoAlpha: 0 });
      if (variant === 1) gsap.set(heading, { x: -24, autoAlpha: 0 });
      if (variant === 2) gsap.set(heading, { autoAlpha: 0, scale: 0.985 });
    }
    if (accentText.length) gsap.set(accentText, { y: 10, autoAlpha: 0 });
    if (logosAndPhotos.length) gsap.set(logosAndPhotos, { y: 18, autoAlpha: 0, scale: 0.985 });
    if (shapes.length) gsap.set(shapes, { y: 20, autoAlpha: 0, rotate: -4, scale: 0.96, transformOrigin: 'center center' });
    if (icons.length) gsap.set(icons, { y: 10, autoAlpha: 0, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: triggerStart,
        once: true
      }
    });

    if (heading) {
      if (variant === 0) {
        tl.to(heading, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power3.out'
        });
      }

      if (variant === 1) {
        tl.to(heading, {
          x: 0,
          autoAlpha: 1,
          duration: 0.72,
          ease: 'power2.out'
        });
      }

      if (variant === 2) {
        tl.to(heading, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.78,
          ease: 'power2.out'
        });
      }
    }

    // Only accent text gets reveal animations, not all body copy.
    if (accentText.length && variant !== 2) {
      tl.to(
        accentText,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.46,
          stagger: 0.07,
          ease: 'power2.out'
        },
        '-=0.18'
      );
    }

    if (logosAndPhotos.length) {
      tl.to(
        logosAndPhotos,
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: variant === 2 ? 0.78 : 0.64,
          stagger: 0.05,
          ease: 'power2.out'
        },
        '-=0.08'
      );
    }

    if (shapes.length) {
      tl.to(
        shapes,
        {
          y: 0,
          autoAlpha: 1,
          rotate: 0,
          scale: 1,
          transformOrigin: 'center center',
          duration: 0.8,
          stagger: 0.045,
          ease: 'power2.out'
        },
        '-=0.14'
      );

      if (floatingShapes.length) {
        // Start ambient motion only when section enters viewport.
        ScrollTrigger.create({
          trigger: section,
          start: triggerStart,
          once: true,
          onEnter: () => {
            gsap.delayedCall(0.9, () => {
              gsap.to(floatingShapes, {
                y: 'random(-6, 6)',
                rotate: 'random(-2, 2)',
                duration: 'random(3.4, 5.6)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: {
                  each: 0.12,
                  from: 'random'
                }
              });
            });
          }
        });
      }
    }

    if (icons.length) {
      tl.to(
        icons,
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: {
            each: 0.012,
            from: 'start'
          },
          ease: 'back.out(1.45)'
        },
        '-=0.08'
      );
    }
  });

  ScrollTrigger.refresh();
})();
