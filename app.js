// ==========================================================================
// A Gift From Me To You - Application Logic & Flower Transition Engine
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // State Variables & Countdown Target
  // ------------------------------------------------------------------------
  let isTransitioning = false;

  // Target: 2:30 PM on July 31, 2026 IST (UTC+5:30)
  const TARGET_TIME = new Date('2026-07-31T14:30:00+05:30').getTime();
  let isUnlocked = false;
  let warningTimeout = null;

  // DOM Elements
  const giftScreen = document.getElementById('gift-screen');
  const pageTwo = document.getElementById('page-two');
  const giftBoxTrigger = document.getElementById('gift-box-trigger');
  const flowerOverlay = document.getElementById('flower-transition-overlay');
  const giftSubtitle = document.getElementById('gift-subtitle');
  const giftLockMsg = document.getElementById('gift-lock-msg');

  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');
  const targetNoteEl = document.querySelector('.countdown-target-note');

  // ------------------------------------------------------------------------
  // 0. Countdown Timer Engine
  // ------------------------------------------------------------------------
  function updateCountdown() {
    const now = Date.now();
    const diff = TARGET_TIME - now;

    if (diff <= 0) {
      isUnlocked = true;
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';

      if (giftSubtitle) giftSubtitle.textContent = '(tap to open surprise!)';
      if (targetNoteEl) targetNoteEl.textContent = 'Gift is Unlocked! 🎉';
      return;
    }

    isUnlocked = false;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');

    if (giftSubtitle) giftSubtitle.textContent = '(locked until 2:30 PM, 31/7/26)';
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  function showLockNotice() {
    if (!giftBoxTrigger) return;
    giftBoxTrigger.classList.remove('locked-shake');
    // Force reflow
    void giftBoxTrigger.offsetWidth;
    giftBoxTrigger.classList.add('locked-shake');

    if (giftLockMsg) {
      giftLockMsg.textContent = 'nuh uh bro';
      giftLockMsg.classList.add('visible');

      if (warningTimeout) clearTimeout(warningTimeout);
      warningTimeout = setTimeout(() => {
        giftLockMsg.classList.remove('visible');
      }, 3500);
    }
  }

  // ------------------------------------------------------------------------
  // 1. Gift Box Trigger -> Flower Transition (With Lock & Testing Bypass)
  // ------------------------------------------------------------------------
  function tryOpenGift(e) {
    if (isTransitioning) return;

    // Check if CTRL+SHIFT was held down during click/keypress for testing bypass
    const isBypass = Boolean(e && e.ctrlKey && e.shiftKey);

    if (!isUnlocked && !isBypass) {
      showLockNotice();
      return;
    }

    isTransitioning = true;
    startFlowerTransition();
  }

  if (giftBoxTrigger) {
    giftBoxTrigger.addEventListener('click', (e) => {
      tryOpenGift(e);
    });

    giftBoxTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tryOpenGift(e);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. Mathematical Flower Spiral Transition Engine
  // ------------------------------------------------------------------------
  const flowerImages = [
    '/assets/flower-01-orange-3gMEhNMT.png',
    '/assets/flower-02-yellow-CwT_P8Vg.png',
    '/assets/flower-03-red-DHLM8t3k.png',
    '/assets/flower-04-green-BAk1ivoT.png',
    '/assets/flower-05-mint-DOJw1b5N.png',
    '/assets/flower-06-white-BDbUibcN.png',
    '/assets/flower-07-taupe-C0ymE0lq.png',
    '/assets/flower-08-blue-BAyocECC.png',
    '/assets/flower-09-purple-CIwvbZwq.png',
    '/assets/flower-10-pink-B6SExo9t.png'
  ];

  const EXPAND_DURATION = 6000;
  const PARTING_DURATION = 6000;
  const TOTAL_TRANSITION_TIME = EXPAND_DURATION + PARTING_DURATION;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function generateSpiralPoints(maxRadius) {
    const area = Math.PI * maxRadius * maxRadius;
    const hT = 480, uP = 0.5, cP = 0.5, dT = 1.18, pT = 64, mT = 240, maxPoints = 900;

    let flowerSize = Math.sqrt(area / (hT * uP * cP)) * dT;
    flowerSize = Math.min(mT, Math.max(pT, flowerSize));

    const l = flowerSize * uP;
    const d = (flowerSize * cP) / (2 * Math.PI);
    const f = maxRadius / d + 2 * Math.PI;

    const points = [{ angleRad: 0, radius: 0 }];
    const step = 0.006;
    let g = step, lastRadius = 0, distAcc = 0;

    while (g <= f && points.length < maxPoints) {
      const radius = d * g;
      const dR = radius - lastRadius;
      const dArc = Math.sqrt(dR * dR + radius * step * (radius * step));
      distAcc += dArc;

      if (distAcc >= l) {
        points.push({ angleRad: g, radius });
        distAcc = 0;
      }
      lastRadius = radius;
      g += step;
    }
    return { points, flowerSize };
  }

  function createFlowerData(maxRadius) {
    const { points, flowerSize } = generateSpiralPoints(maxRadius);
    const flowerList = [];
    const minAnimDur = 900, maxAnimDur = 1400;
    const maxStaggerDelay = Math.max(0, EXPAND_DURATION - maxAnimDur - 80);
    const totalPoints = points.length;

    for (let i = 0; i < totalPoints; i++) {
      const pt = points[i];
      const progressRatio = totalPoints > 1 ? i / (totalPoints - 1) : 0;
      const size = flowerSize * (1 + Math.random() * 0.15);
      const sweepRad = (60 + Math.random() * 120) * Math.PI / 180;
      const delay = progressRatio * maxStaggerDelay;
      const duration = minAnimDur + Math.random() * (maxAnimDur - minAnimDur);
      const spinDuration = 1.4 + Math.random() * 2.2;
      const spinDirection = Math.random() > 0.5 ? 1 : -1;
      const finalX = pt.radius * Math.cos(pt.angleRad);
      const finalY = pt.radius * Math.sin(pt.angleRad);

      flowerList.push({
        img: flowerImages[i % flowerImages.length],
        size,
        angleRad: pt.angleRad,
        radiusTarget: pt.radius,
        sweepRad,
        delay,
        duration,
        spinDuration,
        spinDirection,
        finalX,
        finalY
      });
    }
    return flowerList;
  }

  function startFlowerTransition() {
    flowerOverlay.innerHTML = '';
    flowerOverlay.classList.add('active');

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxRadius = (Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight) / 2) * 1.05;

    const flowersData = createFlowerData(maxRadius);
    const flowerElements = [];

    // Create DOM elements for flowers
    flowersData.forEach((f, idx) => {
      const el = document.createElement('div');
      el.className = 'flower-item';
      el.style.width = `${f.size}px`;
      el.style.height = `${f.size}px`;

      const img = document.createElement('img');
      img.src = f.img;
      img.alt = '';
      img.draggable = false;
      img.className = 'flower-spin';
      img.style.animationDuration = `${f.spinDuration}s`;
      img.style.animationDirection = f.spinDirection === 1 ? 'normal' : 'reverse';

      el.appendChild(img);
      flowerOverlay.appendChild(el);
      flowerElements.push(el);
    });

    let animationFrameId = null;
    let startTime = null;
    let isCoveredFired = false;

    function renderSpiral(elapsed) {
      for (let i = 0; i < flowersData.length; i++) {
        const fd = flowersData[i];
        const elem = flowerElements[i];
        if (!elem) continue;

        const timeForFlower = elapsed - fd.delay;
        if (timeForFlower <= 0) {
          elem.style.opacity = '0';
          elem.style.transform = 'translate(-50%, -50%) translate(0px, 0px) scale(0.15)';
          continue;
        }

        const progress = Math.min(timeForFlower / fd.duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentRadius = fd.radiusTarget * easedProgress;
        const currentAngle = fd.angleRad - fd.sweepRad * (1 - easedProgress);

        const posX = currentRadius * Math.cos(currentAngle);
        const posY = currentRadius * Math.sin(currentAngle);

        const fadeProgress = Math.min(timeForFlower / 200, 1);
        const scale = 0.15 + 0.85 * fadeProgress;

        elem.style.opacity = String(fadeProgress);
        elem.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${scale})`;
      }
    }

    function triggerPartingAnimation() {
      const currentWidth = window.innerWidth;
      for (let i = 0; i < flowersData.length; i++) {
        const fd = flowersData[i];
        const elem = flowerElements[i];
        if (!elem) continue;

        const side = fd.finalX < 0 ? 'left' : 'right';
        const offsetDist = currentWidth + fd.size * 1.5;
        const targetX = side === 'left' ? fd.finalX - offsetDist : fd.finalX + offsetDist;

        elem.style.transition = `transform ${PARTING_DURATION}ms cubic-bezier(0.6, 0, 0.4, 1)`;
        elem.style.transform = `translate(-50%, -50%) translate(${targetX}px, ${fd.finalY}px) scale(1)`;
      }
    }

    function animateStep(timestamp) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < EXPAND_DURATION) {
        renderSpiral(elapsed);
        animationFrameId = requestAnimationFrame(animateStep);
      } else {
        if (!isCoveredFired) {
          renderSpiral(EXPAND_DURATION);
          isCoveredFired = true;

          // Switch screen underneath while fully covered
          giftScreen.classList.remove('active');
          pageTwo.classList.add('active');
          document.body.classList.add('page-two-active');

          const herPhoto = document.getElementById('her-photo');
          if (herPhoto && herPhoto.dataset.src) {
            herPhoto.src = herPhoto.dataset.src;
          }

          initScratchCard();

          requestAnimationFrame(() => {
            triggerPartingAnimation();
          });
        }
      }
    }

    animationFrameId = requestAnimationFrame(animateStep);

    // Complete transition overlay cleanup
    setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      flowerOverlay.classList.remove('active');
      flowerOverlay.innerHTML = '';
      isTransitioning = false;
    }, TOTAL_TRANSITION_TIME + 60);
  }

  // ------------------------------------------------------------------------
  // 3. Scratch Off Card Controller
  // ------------------------------------------------------------------------
  const scratchCanvas = document.getElementById('scratch-canvas');
  let isScratching = false;
  let scratchCtx = null;
  let isScratchCleared = false;
  let lastX = 0;
  let lastY = 0;

  function initScratchCard() {
    if (!scratchCanvas) return;
    const card = scratchCanvas.parentElement;
    if (!card) return;

    const width = card.offsetWidth;
    const height = card.offsetHeight;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    scratchCanvas.width = width * dpr;
    scratchCanvas.height = height * dpr;

    scratchCtx = scratchCanvas.getContext('2d');
    scratchCtx.scale(dpr, dpr);

    // Draw dark sleek coating
    scratchCtx.fillStyle = '#0f0f10';
    scratchCtx.fillRect(0, 0, width, height);

    // Add subtle texture grid/sparkle dots
    scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < width; i += 6) {
      for (let j = 0; j < height; j += 6) {
        if ((i + j) % 12 === 0) {
          scratchCtx.fillRect(i, j, 3, 3);
        }
      }
    }

    // Golden inner border
    scratchCtx.strokeStyle = 'rgba(225, 175, 110, 0.4)';
    scratchCtx.lineWidth = 2;
    scratchCtx.strokeRect(12, 12, width - 24, height - 24);

    // Scratch instructions text
    scratchCtx.textAlign = 'center';
    scratchCtx.textBaseline = 'middle';

    scratchCtx.font = 'bold 30px "Caveat", cursive, sans-serif';
    scratchCtx.fillStyle = '#fdf1e3';
    scratchCtx.fillText(' Scratch Here to Reveal ', width / 2, height / 2 - 12);

    scratchCtx.font = '500 15px "Poppins", sans-serif';
    scratchCtx.fillStyle = '#cca89f';
    scratchCtx.fillText('(swipe or drag over card)', width / 2, height / 2 + 24);
  }

  function getScratchPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function scratch(x, y) {
    if (!scratchCtx || isScratchCleared) return;
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 32, 0, Math.PI * 2);
    scratchCtx.fill();

    scratchCtx.lineWidth = 64;
    scratchCtx.lineCap = 'round';
    scratchCtx.beginPath();
    scratchCtx.moveTo(lastX, lastY);
    scratchCtx.lineTo(x, y);
    scratchCtx.stroke();

    lastX = x;
    lastY = y;
  }

  function checkScratchPercentage() {
    if (isScratchCleared || !scratchCtx) return;
    const width = scratchCanvas.width;
    const height = scratchCanvas.height;
    if (width === 0 || height === 0) return;

    try {
      const imageData = scratchCtx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let clearCount = 0;
      const totalPixels = pixels.length / 4;

      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) {
          clearCount += 4;
        }
      }

      if (clearCount / totalPixels > 0.45) {
        isScratchCleared = true;
        scratchCanvas.classList.add('cleared');
      }
    } catch (err) {
      // Ignore if canvas tainted or unavailable
    }
  }

  if (scratchCanvas) {
    const startScratching = (e) => {
      if (isScratchCleared) return;
      isScratching = true;
      const pos = getScratchPos(e);
      lastX = pos.x;
      lastY = pos.y;
      scratch(pos.x, pos.y);
    };

    const moveScratching = (e) => {
      if (!isScratching || isScratchCleared) return;
      if (e.cancelable) e.preventDefault();
      const pos = getScratchPos(e);
      scratch(pos.x, pos.y);
    };

    const stopScratching = () => {
      if (isScratching) {
        isScratching = false;
        checkScratchPercentage();
      }
    };

    scratchCanvas.addEventListener('mousedown', startScratching);
    scratchCanvas.addEventListener('mousemove', moveScratching);
    window.addEventListener('mouseup', stopScratching);

    scratchCanvas.addEventListener('touchstart', startScratching, { passive: false });
    scratchCanvas.addEventListener('touchmove', moveScratching, { passive: false });
    window.addEventListener('touchend', stopScratching);

    window.addEventListener('resize', () => {
      if (!isScratchCleared) initScratchCard();
    });
    setTimeout(initScratchCard, 200);
  }

  // ------------------------------------------------------------------------
  // 4. Retro Pixel Camera Snap Interactivity
  // ------------------------------------------------------------------------
  const cameraTrigger = document.getElementById('camera-trigger');
  const cameraFlash = document.getElementById('camera-flash');

  if (cameraTrigger && cameraFlash) {
    function snapPhoto() {
      cameraFlash.classList.remove('flash-active');
      void cameraFlash.offsetWidth; // Force reflow
      cameraFlash.classList.add('flash-active');

      setTimeout(() => {
        cameraFlash.classList.remove('flash-active');
      }, 250);
    }

    cameraTrigger.addEventListener('click', snapPhoto);
    cameraTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        snapPhoto();
      }
    });
  }

});


