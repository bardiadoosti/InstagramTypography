(function () {
  const head = document.head || document.getElementsByTagName('head')[0];

  // Favicons
  const favicons = [
    { rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' },
    { rel: 'alternate icon', href: 'favicon.ico' },
    { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' }
  ];

  favicons.forEach(function (attrs) {
    const link = document.createElement('link');
    Object.keys(attrs).forEach(function (key) {
      link.setAttribute(key, attrs[key]);
    });
    head.appendChild(link);
  });

  // Google Analytics (analytics.js)
  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments);
    };
    i[r].l = 1 * new Date();
    a = s.createElement(o);
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    if (m && m.parentNode) {
      m.parentNode.insertBefore(a, m);
    } else {
      head.appendChild(a);
    }
  })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

  if (typeof window.ga === 'function') {
    window.ga('create', 'UA-104609729-1', 'auto');
    window.ga('send', 'pageview');
  }

  // Google Tag Manager (gtag.js)
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-ET2E85YRK6';
  head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'G-ET2E85YRK6');
})();
