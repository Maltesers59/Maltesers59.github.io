// Portfolio Léo Ducatillion : menu mobile, compteurs, apparitions, mini-terminal.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Menu mobile ----- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ----- Mini-terminal ----- */
  var termBody = document.getElementById('termBody');
  var termInput = document.getElementById('termInput');
  var history = [];
  var historyPos = 0;

  var commands = {
    help: function () {
      return 'Commandes disponibles :\n' +
        '  about      qui je suis\n' +
        '  skills     mes compétences\n' +
        '  projets    mes réalisations\n' +
        '  stage      mon stage de première année\n' +
        '  certifs    mes certifications\n' +
        '  contact    comment me joindre\n' +
        '  git log    mon parcours, version Git\n' +
        '  date       la date du jour\n' +
        '  clear      vide le terminal';
    },
    about: function () {
      return 'Léo Ducatillion, étudiant en BTS SIO option SLAM (2e année)\nà l\'Ensemble Saint-Luc de Cambrai. Futur développeur d\'applications.';
    },
    skills: function () {
      return 'Langages   : HTML/CSS, JavaScript, PHP, Java, Python, SQL\n' +
        'Outils     : Symfony, Git/GitHub, IntelliJ IDEA, XAMPP\n' +
        'Données    : MySQL, MariaDB, Merise, triggers\n' +
        'Méthodes   : Scrum, user stories, planning de sprints';
    },
    projets: function () {
      return '1. Clinique LPFH : application de pré-admission (Scrum, SQL)\n' +
        '2. Site vitrine d\'une fleuriste (stage, PHP)\n' +
        '3. Générateur de QR code (Java, Swing)';
    },
    stage: function () {
      return 'Du 11 mai au 12 juin 2026 chez Balade Éphémère, artisan fleuriste.\nCréation du site vitrine : maquettes, PHP, HTML/CSS, JavaScript.';
    },
    certifs: function () {
      return 'Certification Pix     : compétences numériques\nCertificat Voltaire   : orthographe et grammaire';
    },
    contact: function () {
      return 'Email    : ducatillion.leo@gmail.com\nGitHub   : github.com/Maltesers59\nOu le formulaire juste en dessous.';
    },
    date: function () {
      return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },
    git: function (args) {
      if (args !== 'log') return 'Essaie : git log';
      return '* a1c9e4f (HEAD -> main) BTS SIO SLAM, deuxième année\n' +
        '*   7e02b51 Merge branch \'stage\' into main\n' +
        '|\\\n' +
        '| * 3f8d0ac (stage) Stage développeur web, Balade Éphémère\n' +
        '|/\n' +
        '* c41b7d2 BTS SIO, première année\n' +
        '* 9b3e07a Lycée Jacquard';
    },
    sudo: function () { return 'Bien tenté, mais tu n\'es pas administrateur ici.'; }
  };

  function printLine(text, className) {
    var p = document.createElement('p');
    if (className) p.className = className;
    p.textContent = text; // textContent : ce que tape le visiteur n'est jamais interprété comme du HTML
    termBody.appendChild(p);
    termBody.scrollTop = termBody.scrollHeight;
  }

  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' && history.length) {
      historyPos = Math.max(0, historyPos - 1);
      termInput.value = history[historyPos];
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown' && history.length) {
      historyPos = Math.min(history.length, historyPos + 1);
      termInput.value = history[historyPos] || '';
      e.preventDefault();
      return;
    }
    if (e.key !== 'Enter') return;

    var typed = termInput.value.trim();
    termInput.value = '';
    if (!typed) return;
    history.push(typed);
    historyPos = history.length;

    printLine('visiteur@portfolio:~$ ' + typed, 'cmd');
    var name = typed.toLowerCase().split(/\s+/)[0];
    if (name === 'clear') { termBody.textContent = ''; return; }
    if (Object.prototype.hasOwnProperty.call(commands, name)) {
      var args = typed.toLowerCase().split(/\s+/).slice(1).join(' ');
      printLine(commands[name](args), 'ok');
    } else {
      printLine('Commande inconnue : ' + typed + '. Tape help pour la liste.');
    }
  });

  /* ----- Parcours : repère « Aujourd'hui » calculé + survol relié frise / liste ----- */
  var ruler = document.querySelector('.ruler');
  if (ruler) {
    var start = new Date(2024, 8, 1);   // bord gauche de la frise : sept. 2024
    var end = new Date(2027, 6, 1);     // bord droit : juil. 2027
    var bts2 = new Date(2026, 8, 1);    // début de la deuxième année
    var now = new Date();
    var clamp = function (v) { return Math.min(100, Math.max(0, v)); };
    ruler.style.setProperty('--today', clamp((now - start) / (end - start) * 100) + '%');
    ruler.style.setProperty('--fill', clamp((now - bts2) / (end - bts2) * 100) + '%');

    document.querySelectorAll('[data-seg]').forEach(function (el) {
      var id = el.dataset.seg;
      function light(on) {
        document.querySelectorAll('[data-seg="' + id + '"]').forEach(function (x) { x.classList.toggle('is-lit', on); });
      }
      el.addEventListener('mouseenter', function () { light(true); });
      el.addEventListener('mouseleave', function () { light(false); });
    });
  }

  /* ----- Effets au défilement ----- */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  // Apparition des blocs
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

  // Compteurs des chiffres clés : montent de 0 à leur valeur quand ils deviennent visibles
  function countUp(el) {
    var target = Number(el.dataset.count);
    var start = null;
    var duration = 1100;
    function step(now) {
      if (start === null) start = now;
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduceMotion) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { countObs.observe(el); });
  }

  // Lien du menu actif selon la section affichée
  var links = {};
  menu.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var activeObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle('is-active', id === entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(links).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) activeObs.observe(section);
  });
})();
