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

  var css = '.ck-achter{position:fixed;inset:0;z-index:2147483000;background:rgba(11,49,70,.38);display:flex;align-items:center;justify-content:center;padding:16px;font:14px/1.55 Inter,system-ui,sans-serif}'
    + '.ck-venster{outline:none;background:#fff;color:#4d5560;border-radius:16px;box-shadow:0 20px 60px rgba(11,49,70,.25);width:100%;max-width:440px;padding:26px 26px 22px}'
    + '.ck-titel{font-family:"Source Serif 4",Georgia,serif;font-size:20px;font-weight:700;color:#14181c;margin:0 0 8px}'
    + '.ck-venster p{margin:0 0 18px}.ck-venster a{color:#006ead}'
    + '.ck-knoppen{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ck-knoppen button{font:inherit;font-weight:600;font-size:14px;padding:11px 12px;border-radius:10px;cursor:pointer;border:1.5px solid #cfd6dd;background:#fff;color:#14181c;transition:border-color .15s ease,background .15s ease}'
    + '.ck-knoppen button:hover{border-color:#006ead}.ck-knoppen .ck-alles{background:#75ccff;border-color:#75ccff;color:#0b3146}.ck-knoppen .ck-alles:hover{background:#5ec1fb;border-color:#5ec1fb}'
    + '.ck-meer{display:block;margin:14px auto 0;background:none;border:0;font:inherit;font-size:13px;color:#006ead;cursor:pointer;text-decoration:underline}'
    + '.ck-keuzes{border:1px solid #e8eaec;border-radius:12px;margin:0 0 16px;overflow:hidden}.ck-keuzes[hidden]{display:none}'
    + '.ck-rij{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:12px 14px;border-top:1px solid #e8eaec}.ck-rij:first-child{border-top:0}'
    + '.ck-rij b{display:block;color:#14181c;font-size:14px}.ck-rij small{display:block;font-size:12.5px;color:#7d8792}'
    + '.ck-rij input{width:18px;height:18px;flex-shrink:0;accent-color:#006ead}'
    + '.ck-open{overflow:hidden}'
    + '@media (max-width:480px){.ck-venster{padding:22px 18px 18px}.ck-knoppen{grid-template-columns:1fr}}';

  function sluit(achter) { achter.remove(); document.documentElement.classList.remove('ck-open'); }

  function toonBalk() {
    if (document.querySelector('.ck-achter')) return;
    if (!document.getElementById('ck-stijl')) {
      var st = document.createElement('style');
      st.id = 'ck-stijl';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var achter = document.createElement('div');
    achter.className = 'ck-achter';
    achter.innerHTML = '<div class="ck-venster" role="dialog" aria-modal="true" aria-labelledby="ck-titel">'
      + '<div class="ck-titel" id="ck-titel">Cookies</div>'
      + '<p>Onze website heeft geen cookies nodig om te werken. Met uw toestemming gebruiken we cookies voor bezoekersstatistieken, zodat we de website kunnen verbeteren. <a href="/privacy/#cookies">Meer info</a></p>'
      + '<div class="ck-keuzes" hidden>'
      +   '<label class="ck-rij"><span><b>Noodzakelijk</b><small>Onthoudt uw keuze. Altijd aan.</small></span><input type="checkbox" checked disabled></label>'
      +   '<label class="ck-rij"><span><b>Statistieken</b><small>Google Analytics, nooit voor reclame.</small></span><input type="checkbox" class="ck-stat"></label>'
      + '</div>'
      + '<div class="ck-knoppen"><button type="button" class="ck-nood">Enkel noodzakelijke</button><button type="button" class="ck-alles">Alles aanvaarden</button></div>'
      + '<button type="button" class="ck-meer">Voorkeuren instellen</button>'
      + '</div>';
    var keuzes = achter.querySelector('.ck-keuzes'), meer = achter.querySelector('.ck-meer');
    function kies(ja) { bewaar(ja ? 'ja' : 'nee'); sluit(achter); if (ja) laadGA(); else wisCookies(); }
    achter.querySelector('.ck-alles').addEventListener('click', function () { kies(true); });
    achter.querySelector('.ck-nood').addEventListener('click', function () { kies(false); });
    meer.addEventListener('click', function () {
      if (keuzes.hidden) { keuzes.hidden = false; meer.textContent = 'Mijn keuze bewaren'; return; }
      kies(achter.querySelector('.ck-stat').checked);
    });
    document.body.appendChild(achter);
    document.documentElement.classList.add('ck-open');
    var venster = achter.querySelector('.ck-venster');
    venster.setAttribute('tabindex', '-1');
    setTimeout(function () { try { venster.focus({ preventScroll: true }); } catch (e) { /* stil */ } }, 50);
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
    var leespagina = /^\/(privacy|voorwaarden)\//.test(location.pathname);
    if (keuze === 'ja') laadGA();
    else if (keuze !== 'nee' && !leespagina) toonBalk();
    voegLinkToe();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
