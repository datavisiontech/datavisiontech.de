// Mobile menu
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();

// Contact form: opens the visitor's email program with the message filled in.
// Replace with a form service (e.g. Formspree or a Cloudflare Worker) before go-live if wanted.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var d = new FormData(form);
    var subject = (d.get('topic') || '') + ' – ' + (d.get('company') || d.get('name') || '');
    var body = [
      'Name: ' + (d.get('name') || ''),
      'Company: ' + (d.get('company') || ''),
      'Email: ' + (d.get('email') || ''),
      'Phone: ' + (d.get('phone') || ''),
      '',
      d.get('message') || ''
    ].join('\n');
    window.location.href = 'mailto:' + form.dataset.to +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
})();
