(function () {
  var LANGUAGES = [
    { code: 'en', label: 'English', video: 'assets/hero.mp4?v=2' },
    { code: 'es', label: 'Español', video: 'assets/hero-lang/es.mp4?v=2' },
    { code: 'fr', label: 'Français', video: 'assets/hero-lang/fr.mp4?v=2' },
    { code: 'pt', label: 'Português', video: 'assets/hero-lang/pt.mp4?v=2' },
    { code: 'nl', label: 'Nederlands', video: 'assets/hero-lang/nl.mp4?v=2' },
    { code: 'sv', label: 'Svenska', video: 'assets/hero-lang/sv.mp4?v=2' },
    { code: 'da', label: 'Dansk', video: 'assets/hero-lang/da.mp4?v=2' },
    { code: 'is', label: 'Íslenska', video: 'assets/hero-lang/is.mp4?v=2' },
    { code: 'pl', label: 'Polski', video: 'assets/hero-lang/pl.mp4?v=2' },
    { code: 'cs', label: 'Čeština', video: 'assets/hero-lang/cs.mp4?v=2' },
    { code: 'hu', label: 'Magyar', video: 'assets/hero-lang/hu.mp4?v=2' },
    { code: 'ru', label: 'Русский', video: 'assets/hero-lang/ru.mp4?v=2' },
    { code: 'ga', label: 'Gaeilge', video: 'assets/hero-lang/ga.mp4?v=2' },
    { code: 'vi', label: 'Tiếng Việt', video: 'assets/hero-lang/vi.mp4?v=2' },
    { code: 'th', label: 'ไทย', video: 'assets/hero-lang/th.mp4?v=2' },
    { code: 'ms', label: 'Bahasa Melayu', video: 'assets/hero-lang/ms.mp4?v=2' },
    { code: 'hi', label: 'हिन्दी', video: 'assets/hero-lang/hi.mp4?v=2' },
    { code: 'bn', label: 'বাংলা', video: 'assets/hero-lang/bn.mp4?v=2' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', video: 'assets/hero-lang/pa.mp4?v=2' },
    { code: 'si', label: 'සිංහල', video: 'assets/hero-lang/si.mp4?v=2' },
    { code: 'zu', label: 'isiZulu', video: 'assets/hero-lang/zu.mp4?v=2' }
  ];

  var STORAGE_KEY = 'bloomrecorder_lang';

  function resolvePath(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function fallback(dict, path) {
    var v = resolvePath(dict, path);
    if (v === undefined) v = resolvePath(window.BLOOM_TRANSLATIONS.en, path);
    return v;
  }

  function applyLanguage(code) {
    var lang = LANGUAGES.find(function (l) { return l.code === code; }) || LANGUAGES[0];
    var dict = (window.BLOOM_TRANSLATIONS && window.BLOOM_TRANSLATIONS[lang.code]) || window.BLOOM_TRANSLATIONS.en;

    document.documentElement.lang = lang.code;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var path = el.getAttribute('data-i18n');
      var val = fallback(dict, path);
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var path = el.getAttribute('data-i18n-html');
      var val = fallback(dict, path);
      if (val !== undefined) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-attr-alt]').forEach(function (el) {
      var path = el.getAttribute('data-i18n-attr-alt');
      var val = fallback(dict, path);
      if (val !== undefined) el.setAttribute('alt', val);
    });

    var heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
      var source = heroVideo.querySelector('source');
      var newSrc = lang.video || 'assets/hero.mp4?v=2';
      if (source && source.getAttribute('src') !== newSrc) {
        source.setAttribute('src', newSrc);
        heroVideo.load();
        heroVideo.play().catch(function () {});
      }
    }

    try { localStorage.setItem(STORAGE_KEY, lang.code); } catch (e) {}
  }

  function initSwitcher() {
    var select = document.getElementById('lang-select');
    if (!select) return;
    LANGUAGES.forEach(function (l) {
      var opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      select.appendChild(opt);
    });

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var initial = (saved && LANGUAGES.some(function (l) { return l.code === saved; })) ? saved : 'en';
    select.value = initial;
    applyLanguage(initial);

    var debounceTimer = null;
    select.addEventListener('change', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { applyLanguage(select.value); }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwitcher);
  } else {
    initSwitcher();
  }
})();
