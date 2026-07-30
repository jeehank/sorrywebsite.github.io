// ==========================================================================
// A Gift From Me To You - Application Logic & Flower Transition Engine
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // ------------------------------------------------------------------------
  // State Variables
  // ------------------------------------------------------------------------
  let enteredPasscode = '';
  const PASSCODE_LENGTH = 6;
  const CORRECT_PASSCODE = '000000';
  let isUnlocked = false;
  let isTransitioning = false;

  // DOM Elements
  const passcodeScreen = document.getElementById('passcode-screen');
  const giftScreen = document.getElementById('gift-screen');
  const pageTwo = document.getElementById('page-two');
  const dots = document.querySelectorAll('.dot');
  const heartIconWrapper = document.getElementById('heart-icon-wrapper');
  const giftBoxTrigger = document.getElementById('gift-box-trigger');
  const flowerOverlay = document.getElementById('flower-transition-overlay');

  // ------------------------------------------------------------------------
  // 1. Passcode Keypad Logic
  // ------------------------------------------------------------------------
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      handleKeyPress(key);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (passcodeScreen.classList.contains('active')) {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('backspace');
      } else if (e.key === 'c' || e.key === 'C') {
        handleKeyPress('C');
      }
    }
  });

  function handleKeyPress(key) {
    if (isUnlocked) return;

    if (key === 'C') {
      enteredPasscode = '';
    } else if (key === 'backspace') {
      enteredPasscode = enteredPasscode.slice(0, -1);
    } else if (enteredPasscode.length < PASSCODE_LENGTH && /[0-9]/.test(key)) {
      enteredPasscode += key;
    }

    updateDots();

    if (enteredPasscode.length === PASSCODE_LENGTH) {
      // User requested: password is all 0s (accept 000000 or any 6 zeroes)
      if (enteredPasscode === CORRECT_PASSCODE || /^0+$/.test(enteredPasscode)) {
        setTimeout(unlockGiftScreen, 200);
      } else {
        triggerShakeError();
      }
    }
  }

  function updateDots() {
    dots.forEach((dot, idx) => {
      if (idx < enteredPasscode.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function triggerShakeError() {
    heartIconWrapper.classList.add('heart-shake');
    setTimeout(() => {
      heartIconWrapper.classList.remove('heart-shake');
      enteredPasscode = '';
      updateDots();
    }, 600);
  }

  function unlockGiftScreen() {
    isUnlocked = true;
    passcodeScreen.classList.remove('active');
    giftScreen.classList.add('active');
  }

  // ------------------------------------------------------------------------
  // 2. Gift Box Trigger -> Flower Transition
  // ------------------------------------------------------------------------
  giftBoxTrigger.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    startFlowerTransition();
  });

  giftBoxTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      giftBoxTrigger.click();
    }
  });

  // ------------------------------------------------------------------------
  // 3. Mathematical Flower Spiral Transition Engine (Exact Replicant)
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
          initPageTwoFeatures();

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
  // 4. Page Two Features (Scattered Polaroids, Songs & Typewriter)
  // ------------------------------------------------------------------------
  let isPageTwoInitialized = false;

  function initPageTwoFeatures() {
    if (isPageTwoInitialized) return;
    isPageTwoInitialized = true;

    // Scatter 20 Polaroids in Hero Background
    const polaroidContainer = document.getElementById('polaroid-bg');
    if (polaroidContainer) {
      const coupleImages = [
        '/assets/couple-01-BZ9eJWQ5.png', '/assets/couple-02-BwMNUZgW.png',
        '/assets/couple-03-QAQYtGxM.png', '/assets/couple-04-B4jvEXg0.png',
        '/assets/couple-05-CW1FvJc-.png', '/assets/couple-06-BqQbFAze.png',
        '/assets/couple-07-33nfAIMx.png', '/assets/couple-08-CK_au2Kb.png',
        '/assets/couple-09-D4M5uz4u.png', '/assets/couple-10-CKJrD_35.png',
        '/assets/couple-11-B9vjT3xl.png', '/assets/couple-12-Bu87yS1j.png',
        '/assets/couple-13-CkomxFPR.png', '/assets/couple-14-CpZWXyeM.png',
        '/assets/couple-15-CmletKMx.png', '/assets/couple-16-C8lHT1GL.png',
        '/assets/couple-17-Dv5vkScE.png', '/assets/couple-18-oomJV0Ys.png',
        '/assets/couple-19-CSCSJOzT.png', '/assets/couple-20-D2_1kD5A.png'
      ];

      // Random grid positioning points
      coupleImages.forEach((imgSrc, idx) => {
        const frame = document.createElement('div');
        frame.className = 'polaroid-frame';

        const topPct = 5 + Math.floor(Math.random() * 85);
        const leftPct = 3 + Math.floor(Math.random() * 88);
        const rotDeg = -22 + Math.floor(Math.random() * 44);
        const scale = 0.7 + Math.random() * 0.45;
        const widthPx = Math.floor(90 * scale);

        frame.style.top = `${topPct}%`;
        frame.style.left = `${leftPct}%`;
        frame.style.width = `${widthPx}px`;
        frame.style.transform = `rotate(${rotDeg}deg)`;
        frame.style.zIndex = String(Math.floor(Math.random() * 15));

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Memory ${idx + 1}`;
        img.loading = 'lazy';

        frame.appendChild(img);
        polaroidContainer.appendChild(frame);
      });
    }

    // Audio Playback Synthesizer for Songs Section
    let audioCtx = null;
    let activeOsc = null;

    document.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const isPlaying = btn.classList.contains('playing');
        
        // Stop all other buttons
        document.querySelectorAll('.play-btn').forEach(b => {
          b.classList.remove('playing');
          b.innerText = '▶';
        });

        if (isPlaying) {
          if (activeOsc) {
            try { activeOsc.stop(); } catch(e) {}
            activeOsc = null;
          }
        } else {
          btn.classList.add('playing');
          btn.innerText = '⏸';
          playRomanticMelody(btn.getAttribute('data-song'));
        }
      });
    });

    function playRomanticMelody(songId) {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (activeOsc) {
        try { activeOsc.stop(); } catch(e) {}
      }

      const freqs = [
        [261.63, 329.63, 392.00, 523.25], // C Major chord
        [220.00, 261.63, 329.63, 440.00], // A Minor chord
        [174.61, 220.00, 261.63, 349.23], // F Major chord
        [196.00, 246.94, 293.66, 392.00]  // G Major chord
      ];

      const chord = freqs[(parseInt(songId) - 1) % freqs.length];
      let noteIndex = 0;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(chord[0], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 6.0);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();

      const interval = setInterval(() => {
        noteIndex = (noteIndex + 1) % chord.length;
        osc.frequency.setValueAtTime(chord[noteIndex], audioCtx.currentTime);
      }, 400);

      setTimeout(() => {
        clearInterval(interval);
        try { osc.stop(); } catch(e) {}
      }, 6000);

      activeOsc = osc;
    }

    // Typewriter Animation for Final Section
    const typewriterEl = document.getElementById('typewriter-text');
    const finalMessage = "I love you, to the moon and back.";
    let typewriterStarted = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !typewriterStarted) {
          typewriterStarted = true;
          runTypewriter();
        }
      });
    }, { threshold: 0.4 });

    if (typewriterEl) observer.observe(typewriterEl);

    function runTypewriter() {
      let charIdx = 0;
      typewriterEl.innerHTML = '<span class="typewriter-caret">|</span>';

      function typeNext() {
        if (charIdx < finalMessage.length) {
          typewriterEl.innerHTML = finalMessage.slice(0, charIdx + 1) + '<span class="typewriter-caret">|</span>';
          charIdx++;
          setTimeout(typeNext, 65);
        } else {
          typewriterEl.innerHTML = finalMessage + '<span class="typewriter-caret">|</span>';
        }
      }
      setTimeout(typeNext, 200);
    }

    // Go to Start FAB Button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

});
