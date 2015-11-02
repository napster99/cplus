
/* ----------------------------------
 * TOGGLE v2.0.1
 * Licensed under The MIT License
 * http://opensource.org/licenses/MIT
 * ---------------------------------- */
!(function () {
  'use strict';

  var start     = {};
  var touchMove = false;
  var distanceX = false;
  var toggle    = false;

  var findToggle = function (target) {
    var i, toggles = document.querySelectorAll('.toggle');
    for (; target && target !== document; target = target.parentNode) {
      for (i = toggles.length; i--;) {
        if (toggles[i] === target) {
          return target;
        }
      }
    }
  };

  window.addEventListener('touchstart', function (e) {
    e = e.originalEvent || e;

    toggle = findToggle(e.target);

    if (!toggle) {
      return;
    }

    //登录
    if(toggle.getAttribute('requireLogin') === 'yes') {
     // if(window.WebViewJavascriptBridge) {
     //    WebViewJavascriptBridge.send({'type':'tip','action':3,'text':'登录后可以订阅喜爱的主播','button':{'btn1':'注册账号','btn2':'立即登录','btn3':'取消'},'which':'notice'});
     //  }
      return;
    }

    var handle      = toggle.querySelector('.toggle-handle');
    var toggleWidth = toggle.clientWidth;
    var handleWidth = handle.clientWidth;
    var offset      = toggle.classList.contains('active') ? (toggleWidth - handleWidth) : 0;

    start     = { pageX : e.touches[0].pageX - offset, pageY : e.touches[0].pageY };
    touchMove = false;
  });

  window.addEventListener('touchmove', function (e) {
    e = e.originalEvent || e;

    if (e.touches.length > 1) {
      return; // Exit if a pinch
    }

    if (!toggle) {
      return;
    }

    var handle      = toggle.querySelector('.toggle-handle');
    var current     = e.touches[0];
    var toggleWidth = toggle.clientWidth;
    var handleWidth = handle.clientWidth;
    var offset      = toggleWidth - handleWidth;

    touchMove = true;
    distanceX = current.pageX - start.pageX;

    if (Math.abs(distanceX) < Math.abs(current.pageY - start.pageY)) {
      return;
    }

    e.preventDefault();

    if (distanceX < 0) {
      return (handle.style.webkitTransform = 'translate3d(0,0,0)');
    }
    if (distanceX > offset) {
      return (handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)');
    }

    handle.style.webkitTransform = 'translate3d(' + distanceX + 'px,0,0)';

    toggle.classList[(distanceX > (toggleWidth/2 - handleWidth/2)) ? 'add' : 'remove']('active');
  });

  window.addEventListener('touchend', function (e) {
    if (!toggle) {
      return;
    }

    var handle      = toggle.querySelector('.toggle-handle');
    var toggleWidth = toggle.clientWidth;
    var handleWidth = handle.clientWidth;
    var offset      = (toggleWidth - handleWidth);
    var slideOn     = (!touchMove && !toggle.classList.contains('active')) || (touchMove && (distanceX > (toggleWidth/2 - handleWidth/2)));

    if (slideOn) {
      handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';
    } else {
      handle.style.webkitTransform = 'translate3d(0,0,0)';
    }

    try{

      var isNight;

      if(slideOn) {
        isNight = 'yes';
         //加上夜间CSS TODO
        $('body').addClass('dark-style');
        api.setStatusBarStyle({
          style: 'light'
        });
      }else{
        isNight = 'no';
        $('body').removeClass('dark-style');
        api.setStatusBarStyle({
          style: 'dark'
        });
      }
      $api.setStorage('isNight', isNight);


    }catch(e) {

    }

    toggle.classList[slideOn ? 'add' : 'remove']('active');

    // e = new CustomEvent('toggle', {
    //   detail: { isActive: slideOn },
    //   bubbles: true,
    //   cancelable: true
    // });

    // toggle.dispatchEvent(e);

    touchMove = false;
    toggle    = false;
  });

}());
