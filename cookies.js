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

  var css = '.ck-achter{position:fixed;inset:0;z-index:2147483000;background:rgba(11,49,70,.45);display:flex;align-items:center;justify-content:center;padding:16px;font:15px/1.6 Inter,system-ui,sans-serif}'
    + '.ck-venster{outline:none;background:#fff;color:#4d5560;border-radius:16px;box-shadow:0 24px 70px rgba(11,49,70,.3);width:100%;max-width:660px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden}'
    + '.ck-kop{padding:20px 26px;border-bottom:1px solid #e8eaec;flex-shrink:0}.ck-kop img{height:46px;width:auto;display:block}'
    + '.ck-inhoud{padding:22px 26px 6px;overflow-y:auto}'
    + '.ck-titel{font-size:17px;font-weight:700;color:#14181c;margin:0 0 12px}'
    + '.ck-inhoud p{margin:0 0 14px}.ck-inhoud a{color:#14181c;text-decoration:underline}'
    + '.ck-keuzes{border:1px solid #e8eaec;border-radius:12px;margin:4px 0 18px;overflow:hidden}.ck-keuzes[hidden]{display:none}'
    + '.ck-rij{display:flex;gap:14px;align-items:center;justify-content:space-between;padding:13px 16px;border-top:1px solid #e8eaec;margin:0;cursor:pointer;font-weight:400}.ck-schak{position:relative;display:block;flex-shrink:0}.ck-rij:first-child{border-top:0;cursor:default}'
    + '.ck-rij b{display:block;color:#14181c;font-size:14.5px}.ck-rij small{display:block;font-size:13px;font-weight:400;color:#7d8792;line-height:1.45}'
    + '.ck-rij input{position:absolute;opacity:0;width:1px;height:1px}.ck-rij i{display:block;width:40px;height:22px;border-radius:99px;background:#cfd6dd;position:relative;flex-shrink:0;transition:background .15s ease}'
    + '.ck-rij i:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .15s ease}'
    + '.ck-rij input:checked+i{background:#006ead}.ck-rij input:checked+i:after{transform:translateX(18px)}.ck-rij input:disabled+i{opacity:.55}.ck-rij input:focus-visible+i{outline:2px solid #006ead;outline-offset:2px}'
    + '.ck-voet{display:flex;align-items:center;gap:12px;padding:16px 26px;border-top:1px solid #e8eaec;flex-shrink:0}.ck-voet .ck-rechts{display:flex;gap:12px;margin-left:auto}'
    + '.ck-voet button{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-weight:600;font-size:15px;padding:12px 24px;border-radius:99px;cursor:pointer;border:1.5px solid #006ead;background:#fff;color:#006ead;white-space:nowrap;transition:background .15s ease,border-color .15s ease}'
    + '.ck-voet button:hover{background:#eaf6ff}.ck-voet .ck-ja{background:#75ccff;border-color:#75ccff;color:#0b3146}.ck-voet .ck-ja:hover{background:#5ec1fb;border-color:#5ec1fb}'
    + '.ck-open{overflow:hidden}'
    + '@media (max-width:640px){.ck-achter{align-items:flex-end;padding:10px}.ck-kop,.ck-inhoud,.ck-voet{padding-left:18px;padding-right:18px}.ck-inhoud{font-size:14px}'
    + '.ck-voet{flex-direction:column-reverse;align-items:stretch}.ck-voet .ck-rechts{flex-direction:column-reverse;margin-left:0}.ck-voet button{width:100%}}';

  var TANDWIEL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  var PIJL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

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
      + '<div class="ck-kop"><img src="/mail-logo.png" alt="Inplaatsbeschrijvingen"></div>'
      + '<div class="ck-inhoud">'
      +   '<div class="ck-titel" id="ck-titel">Cookies op onze website</div>'
      +   '<p>Onze website werkt zonder cookies. Met uw toestemming gebruiken we wel cookies van Google Analytics. Zo zien we hoeveel bezoekers we hebben en welke pagina\'s ze bekijken, en kunnen we onze website verbeteren. Voor reclame gebruiken we ze nooit.</p>'
      +   '<p class="ck-uitleg">Wilt u zelf kiezen, klik dan op \'Zelf instellen\'. Met \'Accepteren en doorgaan\' gaat u akkoord met de cookies zoals beschreven in onze <a href="/privacy/#cookies">privacyverklaring</a>. U kan uw keuze altijd wijzigen via \'Cookies\' onderaan elke pagina.</p>'
      +   '<div class="ck-keuzes" hidden>'
      +     '<div class="ck-rij"><span><b>Noodzakelijk</b><small>Onthoudt uw cookiekeuze. Altijd actief.</small></span><span class="ck-schak"><input type="checkbox" checked disabled><i></i></span></div>'
      +     '<label class="ck-rij"><span><b>Statistieken</b><small>Google Analytics: hoeveel bezoekers en welke pagina\'s. Nooit voor reclame.</small></span><span class="ck-schak"><input type="checkbox" class="ck-stat"><i></i></span></label>'
      +   '</div>'
      + '</div>'
      + '<div class="ck-voet">'
      +   '<button type="button" class="ck-zelf">Zelf instellen ' + TANDWIEL + '</button>'
      +   '<div class="ck-rechts"><button type="button" class="ck-nee">Weigeren</button><button type="button" class="ck-ja">Accepteren en doorgaan ' + PIJL + '</button></div>'
      + '</div>'
      + '</div>';
    var keuzes = achter.querySelector('.ck-keuzes'), zelf = achter.querySelector('.ck-zelf');
    function kies(ja) { bewaar(ja ? 'ja' : 'nee'); sluit(achter); if (ja) laadGA(); else wisCookies(); }
    achter.querySelector('.ck-ja').addEventListener('click', function () { kies(true); });
    achter.querySelector('.ck-nee').addEventListener('click', function () { kies(false); });
    zelf.addEventListener('click', function () {
      if (keuzes.hidden) {
        keuzes.hidden = false;
        achter.querySelector('.ck-uitleg').hidden = true;
        zelf.textContent = 'Keuze bewaren';
        return;
      }
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
