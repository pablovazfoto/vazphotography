(function(){
  var root=document.documentElement;
  var EN=(root.lang||'').indexOf('en')===0;
  root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tester
  function store(k,v){try{localStorage.setItem('pv-'+k,v)}catch(e){}}
  function load(k){try{return localStorage.getItem('pv-'+k)}catch(e){return null}}
  document.querySelectorAll('.seg').forEach(function(seg){
    var key=seg.dataset.key, saved=load(key);
    function set(v){
      root.setAttribute('data-'+key,v);
      seg.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===v))});
    }
    if(saved && seg.querySelector('[data-v="'+saved+'"]')) set(saved);
    seg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;set(b.dataset.v);store(key,b.dataset.v)});
  });

  // Header state
  var top=document.getElementById('top');
  function onScrollHeader(){top.classList.toggle('scrolled',window.scrollY>40)}

  // Mobile menu
  var burger=document.querySelector('.burger'), sheet=document.getElementById('sheet');
  function closeMenu(){document.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label',EN?'Open menu':'Abrir menu')}
  burger.addEventListener('click',function(){
    var open=document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?(EN?'Close menu':'Fechar menu'):(EN?'Open menu':'Abrir menu'));
  });
  sheet.addEventListener('click',function(e){if(e.target.closest('a'))closeMenu()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});

  // Reveal on scroll
  var els=document.querySelectorAll('.rv,.rv-clip');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){(en.target.__rv||en.target).classList.add('in');io.unobserve(en.target)}});
    },{rootMargin:'0px 0px -12% 0px',threshold:.08});
    // clip-path hides the element from the observer, so watch its parent instead
    els.forEach(function(el){
      var t=el.classList.contains('rv-clip')?el.parentElement:el;
      if(t!==el){t.__rv=el}
      io.observe(t);
    });
  } else els.forEach(function(el){el.classList.add('in')});

  // Counters
  var counters=document.querySelectorAll('[data-count]');
  function fmt(el,v){var d=+el.dataset.dec||0;var s=EN?v.toFixed(d):v.toFixed(d).replace('.',',');return (el.dataset.prefix||'')+s+(el.dataset.suffix||'')}
  if('IntersectionObserver' in window && !reduce){
    var co=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return; co.unobserve(en.target);
        var el=en.target,end=+el.dataset.count,t0=performance.now(),dur=1600;
        (function step(t){var p=Math.min(1,(t-t0)/dur);var e=1-Math.pow(2,-10*p);el.textContent=fmt(el,end*(p===1?1:e));if(p<1)requestAnimationFrame(step)})(t0);
      });
    },{threshold:.6});
    counters.forEach(function(c){c.textContent=fmt(c,0);co.observe(c)});
  }

  // Parallax
  var par=[].slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking=false;
  function frame(){
    ticking=false;
    onScrollHeader();
    if(reduce)return;
    var vh=window.innerHeight;
    par.forEach(function(el){
      var r=el.parentElement.getBoundingClientRect();
      if(r.bottom<0||r.top>vh)return;
      var c=(r.top+r.height/2-vh/2)/vh;
      el.style.transform='translate3d(0,'+(c*-100*(+el.dataset.parallax))+'%,0)';
    });
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',req,{passive:true});
  window.addEventListener('resize',req);
  frame();

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var label=b.querySelector('span')||b,orig=label.textContent;
      var ok=b.classList.contains('copy-btn')?(EN?'Email copied':'E-mail copiado'):(EN?'Copied':'Copiado');
      function done(t){label.textContent=t;b.setAttribute('data-done','');setTimeout(function(){label.textContent=orig;b.removeAttribute('data-done')},2200)}
      try{navigator.clipboard.writeText(b.dataset.copy).then(function(){done(ok)},function(){done(b.dataset.copy)})}catch(e){done(b.dataset.copy)}
    });
  });

  // Coupon dialog
  var dlg=document.getElementById('cupom');
  if(dlg){
    document.querySelectorAll('[data-cupom]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','')})});
    dlg.querySelector('.x').addEventListener('click',function(){dlg.close()});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  }

  // Crossfading slideshows (like the GIFs on the current site)
  document.querySelectorAll('.slides').forEach(function(box,k){
    var imgs=box.querySelectorAll('img'), dots=box.parentElement.querySelectorAll('.dots i'), n=0;
    if(!imgs.length)return; imgs[0].classList.add('on'); if(dots[0])dots[0].classList.add('on');
    if(reduce||imgs.length<2)return;
    setTimeout(function(){setInterval(function(){
      imgs[n].classList.remove('on'); if(dots[n])dots[n].classList.remove('on');
      n=(n+1)%imgs.length;
      imgs[n].classList.add('on'); if(dots[n])dots[n].classList.add('on');
    },3200)},k*1600);
  });
})();
