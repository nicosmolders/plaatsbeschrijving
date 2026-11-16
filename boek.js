// Homepagina: kalender met de vrije momenten uit StatePro (functie "agenda").
// De bezoeker kiest dag en uur; de afspraakpagina neemt het moment over en vraagt enkel nog adres en gegevens.
// Staan online afspraken uit of is de agenda niet bereikbaar, dan toont de kaart gewoon de knop naar het aanvraagformulier.
(function () {
  var kaart = document.getElementById('boek');
  if (!kaart) return;
  var lijf = document.getElementById('boekLijf');
  var pand = document.getElementById('boekPand');
  if (!lijf || !pand) return;

  var SB = { url: 'https://mxjwfzqroaylsytxtdtg.supabase.co', key: 'sb_publishable_53Psgu6bEeKo6Q2ljf7auQ_gSNpWaXy', bedrijfId: '2405c237-5a2f-4906-89c3-df6d8dfda36c' };
  var S = { data: null, laadt: true, fout: false, sleutel: '', dag: null, maand: null, uur: null };

  function soort() { var r = kaart.querySelector('input[name=boekSoort]:checked'); return r ? r.value : 'Intrede (begin huur)'; }
  function opdracht() { return { soort: soort(), pandtype: pand.value, meubilair: false }; }

  // Wie terugkomt, ziet zijn vorige keuze van opdracht en pand.
  try {
    var oud = JSON.parse(sessionStorage.getItem('ipb_boek') || 'null');
    if (oud) {
      if ([].some.call(pand.options, function (o) { return o.value === oud.pandtype; })) pand.value = oud.pandtype;
      var r0 = kaart.querySelector('input[name=boekSoort][value="' + oud.soort + '"]'); if (r0) r0.checked = true;
    }
  } catch (e) { /* privévenster */ }

  function datum(iso, opties) { var o = { timeZone: 'UTC' }; for (var k in opties) o[k] = opties[k]; return new Date(iso + 'T12:00:00Z').toLocaleDateString('nl-BE', o); }
  function uurTekst(u) { return u.replace(':', 'u'); }
  function eindUur(u, min) { var p = u.split(':').map(Number), t = p[0] * 60 + p[1] + (min || 0); return ('0' + Math.floor(t / 60) % 24).slice(-2) + ':' + ('0' + t % 60).slice(-2); }
  function plusDag(iso, n) { var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function plusMaand(ym, n) { var p = ym.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1 + n, 1)).toISOString().slice(0, 7); }
  function groot(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function duur(min) {
    if (!(min > 0)) return '';
    if (min === 60) return 'ongeveer een uur';
    if (min === 90) return 'ongeveer anderhalf uur';
    var u = Math.floor(min / 60), m = min % 60;
    return u ? 'ongeveer ' + (u === 1 ? 'een' : u) + ' uur' + (m ? ' en ' + m + ' minuten' : '') : 'ongeveer ' + m + ' minuten';
  }
  function pijl(r) { return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="' + (r < 0 ? '15 18 9 12 15 6' : '9 18 15 12 9 6') + '"/></svg>'; }

  function laad() {
    var o = opdracht(), sleutel = JSON.stringify(o);
    S.sleutel = sleutel; S.laadt = true; S.fout = false; S.uur = null;
    teken();
    fetch(SB.url + '/functions/v1/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB.key, Authorization: 'Bearer ' + SB.key },
      body: JSON.stringify({ bedrijf_id: SB.bedrijfId, actie: 'vrij', pandtype: o.pandtype, soort: o.soort, meubilair: false })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (S.sleutel !== sleutel) return;
      S.data = j; S.laadt = false; teken();
    }).catch(function () {
      if (S.sleutel !== sleutel) return;
      S.data = null; S.fout = true; S.laadt = false; teken();
    });
  }

  function skelet() {
    var cellen = '';
    for (var n = 0; n < 35; n++) cellen += '<span class="boek-cel boek-schim" style="animation-delay:' + (n % 7) * 60 + 'ms"></span>';
    return '<div class="boek-maand" aria-busy="true"><div class="boek-maandkop"><span class="boek-schim boek-schim-titel"></span></div><div class="boek-raster">' + cellen + '</div></div>' +
      '<div class="boek-uren"><p class="boek-laadtekst">Vrije momenten ophalen…</p></div>' +
      '<div class="boek-voet"><button type="button" class="boek-verder" disabled>Kies een dag en een uur</button></div>';
  }
  // uit = online afspraken staan uit of de agenda antwoordt niet: de kaart wordt een gewone aanvraagknop.
  function zonder(tekst, uit) {
    kaart.classList.add('zonder-kalender');
    kaart.classList.toggle('agenda-uit', !!uit);
    if (uit) {
      var h = document.getElementById('boekTitel'); if (h) h.textContent = 'Vraag uw afspraak aan';
      [].forEach.call(document.querySelectorAll('a[href="#boek"]'), function (a) { a.setAttribute('href', '/afspraak/'); a.textContent = 'Afspraak aanvragen'; });
    }
    lijf.innerHTML = '<div class="boek-geen"><p>' + tekst + '</p><a class="knop knop-primair" href="/afspraak/">Afspraak aanvragen</a></div>';
  }

  function teken(richting) {
    if (S.laadt) { lijf.innerHTML = skelet(); return; }
    var j = S.data;
    if (S.fout || !j || j.status !== 'ok' || !j.actief) return zonder('Vul het aanvraagformulier in. U hoort binnen één werkdag van ons met een concreet voorstel van dag en uur.', true);
    if (!j.boekbaar) return zonder('Voor dit type pand stellen wij zelf een moment voor. Vul het aanvraagformulier in, dan hoort u binnen één werkdag van ons.');
    var dagen = j.dagen || [];
    if (!dagen.length) return zonder('De komende weken zijn alle momenten online ingenomen. Vraag aan via het formulier, dan zoeken we binnen één werkdag samen een moment.');
    kaart.classList.remove('zonder-kalender', 'agenda-uit');
    var perDag = {};
    dagen.forEach(function (x) { perDag[x.datum] = x.tijden; });
    var eersteMaand = dagen[0].datum.slice(0, 7), laatsteMaand = dagen[dagen.length - 1].datum.slice(0, 7);
    if (!S.dag || !perDag[S.dag]) { S.dag = dagen[0].datum; S.uur = null; }
    if (!S.maand || S.maand < eersteMaand || S.maand > laatsteMaand) S.maand = S.dag.slice(0, 7);
    if (S.dag.slice(0, 7) !== S.maand) { var e1 = dagen.filter(function (x) { return x.datum.indexOf(S.maand) === 0; })[0]; if (e1) { S.dag = e1.datum; S.uur = null; } }
    if (S.uur && perDag[S.dag].indexOf(S.uur) < 0) S.uur = null;
    var vandaag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Brussels' });
    var jm = S.maand.split('-').map(Number), eersteDag = S.maand + '-01';
    var leeg = (new Date(eersteDag + 'T12:00:00Z').getUTCDay() + 6) % 7;
    var aantal = new Date(Date.UTC(jm[0], jm[1], 0)).getUTCDate();
    var maandNaam = datum(eersteDag, { month: 'long' });
    var cellen = '';
    // Weken die helemaal voorbij zijn, tonen we niet: de maand begint bij de week van de eerste vrije dag of van vandaag.
    var start = 0;
    if (S.maand === eersteMaand) {
      var anker = vandaag.slice(0, 7) === S.maand && vandaag < dagen[0].datum ? vandaag : dagen[0].datum;
      start = Math.max(0, Math.floor((leeg + Number(anker.slice(8)) - 1) / 7) * 7 - leeg);
    }
    if (!start) for (var l = 0; l < leeg; l++) cellen += '<span class="boek-cel" aria-hidden="true"></span>';
    for (var n = start; n < aantal; n++) {
      var d = plusDag(eersteDag, n), t = perDag[d] || [];
      var kl = 'boek-cel ' + (t.length ? 'vrij' : 'dicht') + (d === S.dag ? ' actief' : '') + (d === vandaag ? ' vandaag' : '');
      var label = datum(d, { weekday: 'long', day: 'numeric', month: 'long' }) + (t.length ? ', ' + t.length + (t.length === 1 ? ' vrij moment' : ' vrije momenten') : ', niet beschikbaar');
      var bol = t.length ? '<i class="boek-bol d' + (t.length >= 6 ? 3 : t.length >= 3 ? 2 : 1) + '" aria-hidden="true"><b></b><b></b><b></b></i>' : '';
      cellen += t.length
        ? '<button type="button" class="' + kl + '" data-dag="' + d + '" aria-pressed="' + (d === S.dag) + '" aria-label="' + label + '"><span>' + (n + 1) + '</span>' + bol + '</button>'
        : '<span class="' + kl + '" aria-label="' + label + '"><span>' + (n + 1) + '</span></span>';
    }
    var tijden = perDag[S.dag] || [];
    var eerst = dagen[0];
    var eerstTekst = datum(eerst.datum, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '') + ' om ' + uurTekst(eerst.tijden[0]);
    var eerstGekozen = S.dag === eerst.datum && S.uur === eerst.tijden[0];
    var o = opdracht();
    var gekozen = S.uur ? groot(datum(S.dag, { weekday: 'long', day: 'numeric', month: 'long' })) + ', ' + uurTekst(S.uur) + ' tot ' + uurTekst(eindUur(S.uur, j.duur_min)) : '';
    lijf.innerHTML =
      '<div class="boek-maand">' +
        '<div class="boek-maandkop"><div class="boek-maandnaam" aria-live="polite">' + maandNaam + ' <span>' + jm[0] + '</span></div>' +
          '<div class="boek-nav"><button type="button" class="boek-pijl" data-maand="-1" aria-label="Vorige maand"' + (S.maand <= eersteMaand ? ' disabled' : '') + '>' + pijl(-1) + '</button>' +
          '<button type="button" class="boek-pijl" data-maand="1" aria-label="Volgende maand"' + (S.maand >= laatsteMaand ? ' disabled' : '') + '>' + pijl(1) + '</button></div></div>' +
        '<div class="boek-week" aria-hidden="true"><span>ma</span><span>di</span><span>wo</span><span>do</span><span>vr</span><span>za</span><span>zo</span></div>' +
        '<div class="boek-raster' + (richting ? (richting > 0 ? ' van-rechts' : ' van-links') : '') + '" role="group" aria-label="Kies een dag in ' + maandNaam + '">' + cellen + '</div>' +
        (eerstGekozen ? '' : '<button type="button" class="boek-eerst" data-eerst="1"><i aria-hidden="true"></i>Eerst vrij: <b>' + eerstTekst + '</b></button>') +
      '</div>' +
      '<div class="boek-uren"><div class="boek-dag"><b aria-live="polite">' + groot(datum(S.dag, { weekday: 'long', day: 'numeric', month: 'long' })) + '</b>' + (duur(j.duur_min) ? '<span>duurt ' + duur(j.duur_min) + '</span>' : '') + '</div>' +
        '<div class="boek-urenlijst" role="group" aria-label="Kies een uur">' + tijden.map(function (u) {
          return '<button type="button" class="boek-uur' + (u === S.uur ? ' actief' : '') + '" data-uur="' + u + '" aria-pressed="' + (u === S.uur) + '" aria-label="' + uurTekst(u) + ' tot ' + uurTekst(eindUur(u, j.duur_min)) + '">' + uurTekst(u) + '</button>';
        }).join('') + '</div></div>' +
      '<div class="boek-voet"><button type="button" class="boek-verder" id="boekVerder"' + (S.uur ? '' : ' disabled') + '>' + (S.uur ? 'Verder met dit moment' : 'Kies een dag en een uur') + '</button>' +
        (S.uur ? '<p class="boek-samen"><b>' + gekozen + '</b><br>' + o.soort.replace(/ \(.*/, '') + ' · ' + o.pandtype + '. U bevestigt op de volgende pagina.</p>'
               : '<p class="boek-anders">Intrede en uittrede samen, of werken? <a href="/afspraak/">Naar het aanvraagformulier</a></p>') + '</div>';
  }

  kaart.addEventListener('click', function (e) {
    var w = e.target.closest('[data-maand]'), dg = e.target.closest('[data-dag]'), u = e.target.closest('[data-uur]'), eerst = e.target.closest('[data-eerst]');
    if (w) { if (w.disabled) return; var r = Number(w.dataset.maand); S.maand = plusMaand(S.maand, r); S.uur = null; teken(r); return; }
    if (eerst && S.data && S.data.dagen && S.data.dagen.length) {
      var d0 = S.data.dagen[0]; S.dag = d0.datum; S.maand = d0.datum.slice(0, 7); S.uur = d0.tijden[0]; teken();
      var v = document.getElementById('boekVerder'); if (v) v.focus({ preventScroll: true });
      return;
    }
    if (dg) { S.dag = dg.dataset.dag; S.uur = null; teken(); var k = kaart.querySelector('[data-dag="' + S.dag + '"]'); if (k) k.focus({ preventScroll: true }); return; }
    if (u) { S.uur = u.dataset.uur; teken(); var k2 = kaart.querySelector('[data-uur="' + S.uur + '"]'); if (k2) k2.focus({ preventScroll: true }); return; }
    if (e.target.closest('#boekVerder') && S.uur) {
      var o = opdracht();
      try {
        sessionStorage.setItem('ipb_moment', JSON.stringify({ soort: o.soort, pandtype: o.pandtype, datum: S.dag, uur: S.uur, t: Date.now() }));
        sessionStorage.setItem('ipb_boek', JSON.stringify({ soort: o.soort, pandtype: o.pandtype }));
      } catch (err) { /* privévenster: de afspraakpagina vraagt het moment dan opnieuw */ }
      if (window.ipbMeet) window.ipbMeet('moment_gekozen_home', { soort: o.soort, pandtype: o.pandtype });
      location.href = '/afspraak/?soort=' + (/^Uittrede/.test(o.soort) ? 'uittrede' : 'intrede');
    }
  });
  // Pijltjestoetsen: van vrije dag naar vrije dag, ook over de maandgrens.
  kaart.addEventListener('keydown', function (e) {
    var cel = e.target.closest && e.target.closest('.boek-cel.vrij');
    var stap = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!cel || !stap || !S.data || !S.data.dagen) return;
    e.preventDefault();
    var vrij = S.data.dagen.map(function (x) { return x.datum; }), d = cel.dataset.dag;
    for (var n = 0; n < 62; n++) {
      d = plusDag(d, stap > 0 ? 1 : -1);
      if (Math.abs(stap) === 7 && n < 6) continue;
      if (vrij.indexOf(d) >= 0) break;
      if (d < vrij[0] || d > vrij[vrij.length - 1]) return;
    }
    if (vrij.indexOf(d) < 0) return;
    var r = d.slice(0, 7) === S.maand ? 0 : (d > S.maand ? 1 : -1);
    S.dag = d; S.maand = d.slice(0, 7); S.uur = null; teken(r || undefined);
    var k = kaart.querySelector('[data-dag="' + d + '"]'); if (k) k.focus();
  });
  kaart.addEventListener('change', function (e) {
    if (e.target === pand || e.target.name === 'boekSoort') { S.dag = null; S.maand = null; laad(); }
  });
  // De knop "Kies uw moment" in de tekst links: kaart in beeld en even oplichten.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#boek"]');
    if (!a) return;
    e.preventDefault();
    var rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    kaart.scrollIntoView({ behavior: rustig ? 'auto' : 'smooth', block: window.innerWidth > 900 ? 'nearest' : 'start' });
    kaart.classList.add('wenk'); setTimeout(function () { kaart.classList.remove('wenk'); }, 1400);
  });

  laad();
})();
