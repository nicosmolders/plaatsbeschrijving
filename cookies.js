/* Bezoekersstatistieken met Google Analytics, enkel na toestemming.
   Zonder "Aanvaarden" laadt deze pagina niets van Google en plaatst ze geen cookies.
   De keuze staat in localStorage ('ipb_cookies' = 'ja' of 'nee') en is altijd te wijzigen
   via de link "Cookies" onderaan elke pagina. */
(function () {
  var ID = 'G-66860Q1V7E';
  var SLEUTEL = 'ipb_cookies';
  var geladen = false;

  function lees() { try { return localStorage.getItem(SLEUTEL); } catch (e) { return null; } }
  function bewaar(v) { try { localStorage.setItem(SLEUTEL, v); } catch (e) { /* privévenster */ } }

  function laadGA() {
    if (geladen) return;
    // Enkel op de echte website meten, niet op previews of lokaal.
    if (!/(^|\.)inplaatsbeschrijvingen\.be$/.test(location.hostname)) return;
    geladen = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    window.gtag('js', new Date());
    // Geen advertentiefuncties; cookies maximaal 13 maanden.
    window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 34128000 });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  // Verwijdert de Analytics-cookies als iemand zijn toestemming intrekt.
  function wisCookies() {
    var domein = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var naam = c.split('=')[0].trim();
      if (/^_ga/.test(naam)) {
        ['', '; domain=' + domein, '; domain=.' + domein].forEach(function (d) {
          document.cookie = naam + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  // Voor formulieren: telt een verstuurde aanvraag, enkel als Analytics geladen is.
  window.ipbMeet = function (naam, gegevens) {
    try { if (geladen && window.gtag) window.gtag('event', naam, gegevens || {}); } catch (e) { /* stil */ }
  };

  var css = '.ck-balk{position:fixed;left:20px;bottom:20px;z-index:9999;max-width:340px;background:#fff;color:#4d5560;border:1px solid #e8eaec;border-radius:12px;box-shadow:0 6px 24px rgba(11,49,70,.10);padding:14px 16px;font:13px/1.5 Inter,system-ui,sans-serif}'
    + '.ck-balk p{margin:0 0 10px}.ck-balk a{color:#006ead}'
    + '.ck-knoppen{display:flex;gap:8px}.ck-knoppen button{flex:1;font:inherit;font-weight:600;font-size:13px;padding:7px 12px;border-radius:8px;cursor:pointer;border:1px solid #dfe3e8;background:#fff;color:#14181c;transition:border-color .15s ease,background .15s ease}'
    + '.ck-knoppen button:hover{border-color:#75ccff;background:#eaf6ff}'
    + '@media (max-width:700px){.ck-balk{left:10px;right:10px;bottom:10px;max-width:none;padding:12px 14px}}';

  function toonBalk() {
    if (document.querySelector('.ck-balk')) return;
    if (!document.getElementById('ck-stijl')) {
      var st = document.createElement('style');
      st.id = 'ck-stijl';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var balk = document.createElement('div');
    balk.className = 'ck-balk';
    balk.setAttribute('role', 'dialog');
    balk.setAttribute('aria-label', 'Cookies');
    balk.innerHTML = '<p>Mogen we uw bezoek meetellen met Google Analytics? Nooit voor reclame. <a href="/privacy/#cookies">Meer info</a></p>'
      + '<div class="ck-knoppen"><button type="button" class="ck-nee">Weigeren</button><button type="button" class="ck-ja">Aanvaarden</button></div>';
    balk.querySelector('.ck-ja').addEventListener('click', function () { bewaar('ja'); balk.remove(); laadGA(); });
    balk.querySelector('.ck-nee').addEventListener('click', function () { bewaar('nee'); balk.remove(); wisCookies(); });
    document.body.appendChild(balk);
  }

  function voegLinkToe() {
    var plek = document.querySelector('.voet-rechts');
    if (!plek || plek.querySelector('.ck-link')) return;
    var a = document.createElement('a');
    a.href = '#';
    a.className = 'ck-link';
    a.textContent = 'Cookies';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (lees() === 'ja') { bewaar('nee'); wisCookies(); }
      try { localStorage.removeItem(SLEUTEL); } catch (er) { /* stil */ }
      if (geladen) { location.reload(); return; }
      toonBalk();
    });
    plek.appendChild(a);
  }

  function start() {
    var keuze = lees();
    if (keuze === 'ja') laadGA();
    else if (keuze !== 'nee') toonBalk();
    voegLinkToe();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
