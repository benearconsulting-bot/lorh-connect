/* lorh-global.js — Navigation mobile + utilitaires */

// ---- Menu mobile ----
function toggleMenu() {
  var menu  = document.getElementById('mobile-menu');
  var burger = document.querySelector('.lorh-burger');
  if (!menu) return;
  var open = menu.classList.toggle('open');
  menu.setAttribute('aria-hidden', !open);
  burger.setAttribute('aria-expanded', open);
}

// Fermer le menu au clic sur un lien
document.addEventListener('DOMContentLoaded', function () {
  var mobileLinks = document.querySelectorAll('.lorh-mobile-menu a');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var menu = document.getElementById('mobile-menu');
      if (menu) { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); }
    });
  });

  // Marquer le lien actif dans la nav
  var current = window.location.pathname;
  document.querySelectorAll('.lorh-nav__links a').forEach(function (a) {
    if (a.getAttribute('href') && current.includes(a.getAttribute('href').replace('/pages/', '').replace('.html', ''))) {
      a.style.color = 'var(--lorh-navy)';
      a.style.fontWeight = '500';
    }
  });
});

// ---- Formulaires multi-étapes ----
var LORH_steps = {};

function lerhInitForm(formId, total) {
  LORH_steps[formId] = 1;
  updateFormNav(formId, total);
}

function lerhNextStep(formId, total) {
  var cur = LORH_steps[formId] || 1;
  var panel = document.querySelector('[data-form="' + formId + '"][data-step="' + cur + '"]');
  if (!panel) return;

  // Validation champs requis
  var inputs = panel.querySelectorAll('[required]');
  var valid = true;
  inputs.forEach(function (inp) {
    inp.style.borderColor = '';
    if (!inp.value.trim()) {
      inp.style.borderColor = 'var(--lorh-danger)';
      if (valid) inp.focus();
      valid = false;
    }
  });
  if (!valid) return;

  panel.classList.remove('active');
  LORH_steps[formId] = cur + 1;
  var next = document.querySelector('[data-form="' + formId + '"][data-step="' + LORH_steps[formId] + '"]');
  if (next) next.classList.add('active');
  updateFormNav(formId, total);
  updateProgress(formId, total);
  if (formId === 'transport' && LORH_steps[formId] === total) buildTransportRecap();
}

function lerhPrevStep(formId, total) {
  var cur = LORH_steps[formId] || 1;
  if (cur <= 1) return;
  var panel = document.querySelector('[data-form="' + formId + '"][data-step="' + cur + '"]');
  if (panel) panel.classList.remove('active');
  LORH_steps[formId] = cur - 1;
  var prev = document.querySelector('[data-form="' + formId + '"][data-step="' + LORH_steps[formId] + '"]');
  if (prev) prev.classList.add('active');
  updateFormNav(formId, total);
  updateProgress(formId, total);
}

function updateFormNav(formId, total) {
  var cur  = LORH_steps[formId] || 1;
  var prev = document.getElementById('prev-' + formId);
  var next = document.getElementById('next-' + formId);
  var ctr  = document.getElementById('counter-' + formId);
  if (prev) prev.style.visibility = cur === 1 ? 'hidden' : 'visible';
  if (next) next.style.display = cur === total ? 'none' : 'inline-flex';
  if (ctr)  ctr.textContent = 'Étape ' + cur + ' / ' + total;
}

function updateProgress(formId, total) {
  var cur = LORH_steps[formId] || 1;
  for (var i = 1; i <= total; i++) {
    var circle = document.getElementById('pc-' + formId + '-' + i);
    var label  = document.getElementById('pl-' + formId + '-' + i);
    var line   = document.getElementById('pline-' + formId + '-' + i);
    if (circle) {
      circle.className = 'lorh-progress__circle lorh-progress__circle--' +
        (i < cur ? 'done' : i === cur ? 'active' : 'todo');
      circle.textContent = i < cur ? '✓' : i;
    }
    if (label) {
      label.className = 'lorh-progress__label' + (i === cur ? ' lorh-progress__label--active' : '');
    }
    if (line) {
      line.className = 'lorh-progress__line' + (i < cur ? ' lorh-progress__line--done' : '');
    }
  }
}

function selectCamion(el, name, inputId) {
  el.closest('.lorh-truck-grid').querySelectorAll('.lorh-truck-option').forEach(function (o) {
    o.classList.remove('selected');
  });
  el.classList.add('selected');
  var inp = document.getElementById(inputId);
  if (inp) inp.value = name;
}

function buildTransportRecap() {
  var recap = document.getElementById('recap-transport');
  if (!recap) return;
  var fields = [
    ['Départ',       '[name="depart"]'],
    ['Destination',  '[name="destination"]'],
    ['Date',         '[name="date_collecte"]'],
    ['Marchandise',  '[name="marchandise"]'],
    ['Poids (kg)',   '[name="poids"]'],
    ['Camion',       '#camion-val'],
  ];
  var html = '';
  fields.forEach(function (f) {
    var el  = document.querySelector(f[1]);
    var val = el ? (el.value || '—') : '—';
    html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--lorh-gray-200);font-size:13px">' +
      '<span style="color:var(--lorh-gray-600)">' + f[0] + '</span>' +
      '<span style="font-weight:500;color:var(--lorh-navy)">' + val + '</span></div>';
  });
  recap.innerHTML = html;
}

// ---- Switch formulaires devis ----
function switchDevisForm(service) {
  ['transport','automobile','pieces','import'].forEach(function (s) {
    var panel = document.getElementById('form-' + s);
    var tab   = document.getElementById('tab-' + s);
    if (panel) panel.style.display = s === service ? 'block' : 'none';
    if (tab) {
      tab.classList.toggle('active', s === service);
    }
  });
  // Mettre à jour l'URL sans rechargement
  var url = new URL(window.location.href);
  url.searchParams.set('service', service);
  window.history.replaceState({}, '', url);
}

// ---- Init depuis URL params ----
document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(window.location.search);

  // Service devis pré-sélectionné
  var svc = params.get('service');
  if (svc && document.getElementById('form-' + svc)) {
    switchDevisForm(svc);
  }

  // Camion pré-sélectionné (depuis page camions)
  var camion = params.get('camion');
  if (camion) {
    var opts = document.querySelectorAll('.lorh-truck-option');
    opts.forEach(function (opt) {
      if (opt.dataset.camion === camion) opt.click();
    });
  }

  // Init barres de progression pour chaque formulaire
  [
    { id: 'transport', total: 5 },
    { id: 'automobile', total: 4 },
    { id: 'pieces', total: 3 },
    { id: 'import', total: 4 },
  ].forEach(function (f) {
    if (document.querySelector('[data-form="' + f.id + '"]')) {
      lerhInitForm(f.id, f.total);
    }
  });
});
