/* script.js
   Replace RELATIONSHIP_START, music path in HTML, and image URLs with your own.
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- CONFIG ---------- */
  // Set your relationship start date (YYYY-MM-DD)
  const RELATIONSHIP_START = '2022-02-03';

  // Selectors
  const typingTextEl = document.getElementById('typing-text');
  const floatingHeartsContainer = document.getElementById('floating-hearts');
  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const carousel = document.getElementById('carousel');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const surpriseBtn = document.getElementById('surprise-btn');
  const surpriseModal = document.getElementById('surprise-modal');
  const surpriseClose = document.getElementById('surprise-close');
  const daysCountEl = document.getElementById('days-count');
  const monthsCountEl = document.getElementById('months-count');
  const memoriesCountEl = document.getElementById('memories-count');
  const heartsCanvas = document.getElementById('hearts-canvas');
  const scrollProgress = document.getElementById('scroll-progress');

  /* ---------- Typing effect ---------- */
  (function typingEffect() {
    const phrases = [
      'You make ordinary days extraordinary.',
      'My favorite place is right next to you.',
      'Thank you for being you.'
    ];
    let pIndex = 0;
    let chIndex = 0;
    let direction = 1; // 1 typing, -1 deleting

    function tick() {
      const current = phrases[pIndex];
      if (direction === 1) {
        chIndex++;
        typingTextEl.textContent = current.slice(0, chIndex);
        if (chIndex === current.length) {
          direction = -1;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        chIndex--;
        typingTextEl.textContent = current.slice(0, chIndex);
        if (chIndex === 0) {
          direction = 1;
          pIndex = (pIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, direction === 1 ? 70 : 30);
    }
    tick();
  })();

  /* ---------- Floating hearts DOM decoration ---------- */
  (function spawnLittleHearts(){
    // Simple CSS hearts using inline elements animated with CSS via JS (create few)
    for (let i=0;i<10;i++){
      createHeart(i*500);
    }
    function createHeart(delay){
      const heart = document.createElement('div');
      heart.className = 'float-heart';
      heart.style.position = 'absolute';
      heart.style.left = Math.random()*100 + '%';
      heart.style.bottom = '-10px';
      heart.style.width = `${10 + Math.random()*20}px`;
      heart.style.height = heart.style.width;
      heart.style.opacity = (0.45 + Math.random()*0.6).toString();
      heart.style.pointerEvents = 'none';
      heart.style.transform = `translateY(${Math.random()*10}px)`;
      heart.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="rgba(242,108,145,0.9)" d="M12 21s-7-4.35-9-7.5C1 9.75 5.58 5 8.5 5 10.3 5 12 6.2 12 6.2S13.7 5 15.5 5C18.42 5 23 9.75 21 13.5 19 16.65 12 21 12 21z"></path></svg>`;
      floatingHeartsContainer.appendChild(heart);

      // animate via JS to keep it lightweight
      const duration = 6000 + Math.random()*4000;
      setTimeout(() => {
        heart.animate([
          { transform: `translateY(0) scale(0.8)`, opacity: heart.style.opacity },
          { transform: `translateY(-${380 + Math.random()*120}px) scale(1)`, opacity: 0 }
        ], {
          duration,
          easing: 'cubic-bezier(.2,.9,.3,1)'
        }).onfinish = ()=>heart.remove();
      }, delay);
    }

    // repeat periodically
    setInterval(()=>createHeart(0), 1700);
  })();

  /* ---------- Carousel functionality (auto + swipe) ---------- */
  (function setupCarousel(){
    let index = 0;
    const slides = Array.from(carouselTrack.children);
    const slideCount = slides.length;
    const slideWidth = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(carouselTrack).gap || 16);

    function goTo(i, smooth=true){
      index = (i+slideCount)%slideCount;
      const offset = index * slideWidth();
      carouselTrack.scrollTo({left: offset, behavior: smooth ? 'smooth' : 'auto'});
    }
    nextBtn.addEventListener('click', ()=>goTo(index+1));
    prevBtn.addEventListener('click', ()=>goTo(index-1));

    // Auto slide
    let autoSlide = setInterval(()=>goTo(index+1), 4500);
    carousel.addEventListener('mouseenter', ()=> clearInterval(autoSlide));
    carousel.addEventListener('mouseleave', ()=> autoSlide = setInterval(()=>goTo(index+1), 4500));

    // Touch swipe
    let startX = 0;
    carouselTrack.addEventListener('touchstart', (e)=> {
      startX = e.touches[0].clientX;
    }, {passive:true});
    carouselTrack.addEventListener('touchend', (e)=> {
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if (dx > 40) goTo(index-1);
      else if (dx < -40) goTo(index+1);
    });

    // Resize: re-align
    window.addEventListener('resize', ()=> goTo(index, false));
  })();

  /* ---------- Lazy loading images using IntersectionObserver ---------- */
  (function lazyLoad(){
    const lazyImages = document.querySelectorAll('img.lazy');
    if ('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries,observer)=>{
        entries.forEach(entry=>{
          if (entry.isIntersecting){
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src){
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.remove('lazy');
            }
            observer.unobserve(img);
          }
        });
      },{rootMargin:'200px'});
      lazyImages.forEach(img => obs.observe(img));
    } else {
      // fallback
      lazyImages.forEach(img=> { img.src = img.dataset.src; img.classList.remove('lazy'); });
    }
  })();

  /* ---------- Lightbox gallery (click any image) ---------- */
  (function lightboxGallery(){
    const clickables = document.querySelectorAll('img:not(.no-lightbox)');
    const gallery = Array.from(clickables);
    let current = 0;

    function open(idx){
      const img = gallery[idx];
      if (!img) return;
      lightboxImg.src = img.src || img.getAttribute('data-src') || '';
      lightboxImg.alt = img.alt || '';
      lightboxCaption.textContent = img.alt || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      current = idx;
    }
    function close(){
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden','true');
      lightboxImg.src = '';
    }
    gallery.forEach((img, i) => {
      img.addEventListener('click', ()=> open(i));
      img.style.cursor = 'zoom-in';
    });

    lightboxClose.addEventListener('click', close);
    lightbox.addEventListener('click', (e)=> {
      if (e.target === lightbox) close();
    });
    lightboxPrev.addEventListener('click', ()=> open((current-1+gallery.length)%gallery.length));
    lightboxNext.addEventListener('click', ()=> open((current+1)%gallery.length));
    document.addEventListener('keydown', (e)=> {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') lightboxPrev.click();
      if (e.key === 'ArrowRight') lightboxNext.click();
    });
  })();

  /* ---------- Timeline reveal ---------- */
  (function revealTimeline(){
    const items = document.querySelectorAll('.timeline-item');
    if ('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries,observer)=>{
        entries.forEach(entry=>{
          if (entry.isIntersecting){
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {threshold: 0.12});
      items.forEach(i => obs.observe(i));
    } else {
      items.forEach(i => i.classList.add('visible'));
    }
  })();

  /* ---------- Counters (days, months, memories) ---------- */
  (function counters(){
const start = new Date(RELATIONSHIP_START + 'T00:00:00');
    const now = new Date();
    const diffMs = now - start;
    const days = Math.floor(diffMs / (1000*60*60*24));
    // months: approximate full months difference
    let months = (now.getFullYear() - start.getFullYear())*12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months--;

    const memories = document.querySelectorAll('.memory-card').length + document.querySelectorAll('.slide').length;

    animateCount(daysCountEl, days, 1400);
    animateCount(monthsCountEl, months, 1000);
    animateCount(memoriesCountEl, memories, 1200);

    function animateCount(el, target, duration){
      const startVal = 0;
      const startTime = performance.now();
      function frame(nowT){
        const progress = Math.min((nowT - startTime)/duration, 1);
        const eased = easeOutCubic(progress);
        el.textContent = Math.floor(startVal + (target - startVal)*eased);
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    function easeOutCubic(t){ return (--t)*t*t+1; }
  })();

  /* ---------- Music play / pause ---------- */
  (function music(){
    let playing = false;
    musicToggle.addEventListener('click', ()=>{
      if (!playing){
        bgMusic.play().catch(()=>{/* autoplay may be blocked; user can click again */});
        musicToggle.setAttribute('aria-pressed','true');
        playing = true;
      } else {
        bgMusic.pause();
        musicToggle.setAttribute('aria-pressed','false');
        playing = false;
      }
    });
    // reflect state when media ends
    bgMusic.addEventListener('pause', ()=> musicToggle.setAttribute('aria-pressed','false'));
    bgMusic.addEventListener('play', ()=> musicToggle.setAttribute('aria-pressed','true'));
  })();

  /* ---------- Surprise: confetti + modal + floating hearts ---------- */
  (function surprise(){
    surpriseBtn.addEventListener('click', () => {
      openModal();
      launchConfetti();
      spawnFloatingHeartsBurst();
    });
    surpriseClose.addEventListener('click', closeModal);
    function openModal(){
      surpriseModal.classList.add('open');
      surpriseModal.setAttribute('aria-hidden','false');
    }
    function closeModal(){
      surpriseModal.classList.remove('open');
      surpriseModal.setAttribute('aria-hidden','true');
    }

    // small confetti canvas effect
    function launchConfetti(){
      const c = document.createElement('canvas');
      c.style.position = 'fixed';
      c.style.left = 0; c.style.top = 0;
      c.style.width = '100%'; c.style.height = '100%';
      c.style.pointerEvents = 'none';
      c.style.zIndex = 200;
      document.body.appendChild(c);
      const ctx = c.getContext('2d');
      function resize(){ c.width = innerWidth; c.height = innerHeight; }
      resize(); window.addEventListener('resize', resize);

      const colors = ['#f6a5c0','#d2b4ff','#ffd6e0','#ffb3c6','#ffd1a8'];
      const pieces = [];
      for (let i=0;i<120;i++){
        pieces.push({
          x: Math.random()*c.width,
          y: Math.random()*-c.height*0.6,
          r: Math.random()*6+4,
          color: colors[Math.floor(Math.random()*colors.length)],
          vx: (Math.random()-0.5)*4,
          vy: Math.random()*4+2,
          rot: Math.random()*360,
          vr: (Math.random()-0.5)*6
        });
      }
      let t0 = null;
      function render(t){
        if (!t0) t0 = t;
        const dt = t - t0;
        ctx.clearRect(0,0,c.width,c.height);
        pieces.forEach(p=>{
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03;
          p.rot += p.vr;
          ctx.save();
          ctx.translate(p.x,p.y);
          ctx.rotate(p.rot*Math.PI/180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.8);
          ctx.restore();
        });
        if (dt < 3200) requestAnimationFrame(render);
        else {
          ctx.clearRect(0,0,c.width,c.height);
          c.remove();
        }
      }
      requestAnimationFrame(render);
    }

    // quick floating hearts burst
    function spawnFloatingHeartsBurst(){
      for (let i=0;i<12;i++){
        const el = document.createElement('div');
        el.className = 'float-heart';
        el.style.position = 'fixed';
        el.style.left = `${40 + Math.random()*20}%`;
        el.style.bottom = '18%';
        el.style.width = `${18 + Math.random()*30}px`;
        el.style.height = el.style.width;
        el.style.zIndex = 210;
        el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="rgba(246,165,192,0.95)" d="M12 21s-7-4.35-9-7.5C1 9.75 5.58 5 8.5 5 10.3 5 12 6.2 12 6.2S13.7 5 15.5 5C18.42 5 23 9.75 21 13.5 19 16.65 12 21 12 21z"></path></svg>`;
        document.body.appendChild(el);
        el.animate([
          { transform: 'translateY(0) rotate(0deg)', opacity:1 },
          { transform: `translateY(-${240 + Math.random()*160}px) rotate(${Math.random()*120-60}deg)`, opacity:0 }
        ], { duration: 1800 + Math.random()*600, easing:'cubic-bezier(.2,.9,.3,1)' })
        .onfinish = ()=>el.remove();
      }
    }
  })();

  /* ---------- Floating hearts canvas for subtle particles (background) ---------- */
  (function heartsCanvasAnim(){
    const canvas = heartsCanvas;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    window.addEventListener('resize', ()=>{ w = canvas.width = innerWidth; h = canvas.height = innerHeight; });

    const hearts = Array.from({length:18}).map(()=>createHeartParticle());
    function createHeartParticle(){
      return {
        x: Math.random()*w,
        y: Math.random()*h,
        size: 8 + Math.random()*24,
        vy: 0.2 + Math.random()*0.4,
        vx: (Math.random()-0.5)*0.3,
        opacity: 0.12 + Math.random()*0.25,
        phase: Math.random()*Math.PI*2
      };
    }
    function drawHeart(x,y,size,opacity){
      ctx.save();
      ctx.translate(x,y);
      ctx.scale(size/24, size/24);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffd3df';
      ctx.beginPath();
      ctx.moveTo(12,21);
      ctx.bezierCurveTo(-7,8,6,-5,12,5);
      ctx.bezierCurveTo(18,-5,31,8,12,21);
      ctx.fill();
      ctx.restore();
    }
    function loop(){
      ctx.clearRect(0,0,w,h);
      hearts.forEach(hp=>{
        hp.y -= hp.vy;
        hp.x += hp.vx + Math.sin(hp.phase + performance.now()/6000)*0.2;
        if (hp.y < -50) { hp.y = h + 40; hp.x = Math.random()*w; }
        drawHeart(hp.x, hp.y, hp.size, hp.opacity);
      });
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ---------- Scroll progress indicator ---------- */
  (function progress(){
    function update(){
      const doc = document.documentElement;
      const percent = (doc.scrollTop) / (doc.scrollHeight - doc.clientHeight) * 100;
      scrollProgress.style.width = `${percent}%`;
    }
    document.addEventListener('scroll', update, {passive:true});
    update();
  })();

  /* ---------- Small utility: keyboard accessibility for Surprise (Enter) ---------- */
  surpriseBtn.addEventListener('keyup', (e)=> {
    if (e.key === 'Enter') surpriseBtn.click();
  });

});