document.addEventListener('DOMContentLoaded', function() {
  const video1 = document.getElementById('video1');
  const video2 = document.getElementById('video2');

  video1.addEventListener('ended', function() {
    video1.style.display = 'none';
    video2.style.display = 'block';
    video2.play();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  var lightswitch = document.getElementById("switch"),
    on = false;
  lightswitch.addEventListener('click', toggleLights, false);

  gsap.set('.switchnob', {y: '+=90'});

  function toggleLights(){
    if(on){
      on = false;
      gsap.to('.light', {duration: .2, filter: 'none', opacity: 0.55});
      gsap.to('.switchnob', {duration: .2, y: '+=90'});
    }else{
      gsap.to('.switchnob', {duration: .2, y: '-=90'});
      gsap.to('.light', {duration: .5, filter: 'url(#glow)', opacity: 1, stagger: 0.04});
      on = true;
    }
  }

  gsap.set(".anim-container", {perspective: 600});

  var total = 30;
  var warp = document.getElementById("container");
  var w = warp.offsetWidth;
  var h = warp.offsetHeight;  // ارتفاع فقط بخش anim-container

  for (var i = 0; i < total; i++) { 
    var Div = document.createElement('div');
    gsap.set(Div, {
      attr: {class: 'dot'},
      x: R(0, w),
      y: R(-200, -100),   // برف از بالای همین بخش شروع می‌شود
      z: R(-200, 200)
    });
    warp.appendChild(Div);
    animm(Div);
  }
   
  function animm(elm){   
    // مدت زمان بیشتر برای پوشش کامل ارتفاع بخش
    gsap.to(elm, {duration: R(10, 20), y: h + 100, ease: "none", repeat: -1, delay: -15});
    gsap.to(elm, {duration: R(4, 8), x: '+=100', rotationZ: R(0, 180), repeat: -1, yoyo: true, ease: "sine.inOut"});
    gsap.to(elm, {duration: R(2, 8), rotationX: R(0, 360), rotationY: R(0, 360), repeat: -1, yoyo: true, ease: "sine.inOut", delay: -5});
  }

  function R(min, max) { 
    return min + Math.random() * (max - min); 
  }

  // بروزرسانی ابعاد هنگام تغییر اندازه پنجره
  window.addEventListener('resize', function() {
    w = warp.offsetWidth;
    h = warp.offsetHeight;

    var dots = document.querySelectorAll('.dot');
    dots.forEach(dot => {
      gsap.killTweensOf(dot);
      gsap.set(dot, {x: R(0, w), y: R(-200, -100), z: R(-200, 200)});
      animm(dot);
    });
  });
});

 $(document).ready(function() {
      var $clickMe = $('.click-icon'),
          $card = $('.card');

      $card.on('click', function() {
        $(this).toggleClass('is-opened');
        $clickMe.toggleClass('is-hidden');
      });
    });