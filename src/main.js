const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

$('#year').textContent = new Date().getFullYear();
const navigation = $('#site-navigation');
const menu = $('.menu-toggle');
function closeMenu() {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
}
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', expanded);
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a, button')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); }
});
matchMedia('(min-width: 761px)').addEventListener('change', (event) => { if (event.matches) closeMenu(); });

const stages = {
  kindergarten: { number: '01', label: 'THE FIRST LITTLE STEPS', title: 'A world of discovery', description: 'A gentle introduction to school life, where play, stories and new friendships make learning feel like an adventure.', points: ['Early language, listening and expression', 'Numbers, colours and playful discovery', 'Confidence, kindness and friendship'], enquiry: 'Kindergarten' },
  nursery: { number: '02', label: 'GROWING IN CONFIDENCE', title: 'Small discoveries. Big smiles.', description: 'Building on early curiosity with a joyful introduction to reading, writing and numbers, alongside the everyday skills that help children grow.', points: ['Early reading, writing and number foundations', 'Creative expression and learning through play', 'Sharing, independence and good character'], enquiry: 'Nursery' },
  primary: { number: '03', label: 'FOUNDATIONS FOR THE FUTURE', title: 'Ready for a bigger world', description: 'A stronger foundation in literacy, numeracy and discovery, enriched by Quran memorisation, computer learning and the confidence to keep asking questions.', points: ['Reading, writing, mathematics and discovery', 'Quran memorisation and everyday values', 'Computer learning and growing independence'], enquiry: 'Primary' },
};
const tabs = $$('.stage-tab');
let selectedStage = 'kindergarten';
function chooseStage(tab, focus = false) {
  const key = tab.dataset.stage;
  const stage = stages[key];
  selectedStage = key;
  for (const candidate of tabs) {
    const active = candidate === tab;
    candidate.classList.toggle('active', active);
    candidate.setAttribute('aria-selected', String(active));
    candidate.tabIndex = active ? 0 : -1;
  }
  $('#learning-panel').setAttribute('aria-labelledby', tab.id);
  $('.learning-number').textContent = stage.number;
  $('#stage-label').textContent = stage.label;
  $('#stage-title').textContent = stage.title;
  $('#stage-description').textContent = stage.description;
  $('#stage-points').replaceChildren(...stage.points.map(text => {
    const point = document.createElement('li'); point.textContent = text; return point;
  }));
  const link = $('.learning-detail [data-enquire]');
  link.replaceChildren(document.createTextNode(`Ask about ${key} `));
  const icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = '↗'; link.append(icon);
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => chooseStage(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); chooseStage(tabs[next], true); }
  });
});

function openDialog(dialog, trigger) {
  if (dialog.open) return;
  dialog.returnTrigger = trigger;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
$$('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    const trigger = dialog.returnTrigger;
    if (trigger && !trigger.getClientRects().length && navigation.contains(trigger)) menu.focus();
    else trigger?.focus();
  });
});
$$('[data-enquire]').forEach(button => button.addEventListener('click', () => {
  $('#class-interest').value = button.closest('.learning-detail') ? stages[selectedStage].enquiry : 'Primary';
  openDialog($('#enquiry-dialog'), button);
}));
$('#enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const name = String(fields.get('parentName') ?? '').trim();
  const stage = String(fields.get('stage') ?? 'Primary');
  const question = String(fields.get('question') ?? '').trim();
  const message = `Hello IQRA Model School!${name ? ` My name is ${name}.` : ''} I'm interested in ${stage}.${question ? `\n\n${question}` : ' Please share the admission details and how to arrange a school visit.'}`;
  const url = `https://wa.me/2348140672194?text=${encodeURIComponent(message)}`;
  window.location.assign(url);
});

const gallery = {
  pupils: { title: 'Our school community', image: './assets/pupils.jpeg', alt: 'IQRA Model School pupils in their green uniforms during a school outing', description: 'Growing together, proudly wearing our school colours.' },
  poster: { title: 'Admissions · 2026/2027', image: './assets/admissions-poster.jpeg', alt: 'Official IQRA Model School 2026/2027 admission poster', description: 'The school’s original admissions poster. Call our team for current availability and enrolment details.' },
};
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  const item = gallery[button.dataset.gallery];
  $('#gallery-heading').textContent = item.title;
  $('#gallery-image').src = item.image;
  $('#gallery-image').alt = item.alt;
  $('#gallery-description').textContent = item.description;
  openDialog($('#gallery-dialog'), button);
}));
$('.privacy-link').addEventListener('click', event => openDialog($('#privacy-dialog'), event.currentTarget));

$$('[data-stock-image]').forEach(image => {
  function fallback() { image.hidden = true; image.nextElementSibling.hidden = false; }
  image.addEventListener('error', fallback);
  if (image.complete && image.naturalWidth === 0) fallback();
});
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }, { threshold: 0.08 });
  $$('.about-grid, .section-heading, .values-grid, .gallery-grid, .contact-grid').forEach(element => {
    element.classList.add('reveal-ready'); observer.observe(element);
  });
}
