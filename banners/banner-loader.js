/**
 * ZGC — Loader de Banners (multi-produto, hospedado uma vez, usado em qualquer domínio)
 *
 * Uso na página (WordPress/Elementor, Astro, ou qualquer HTML):
 *
 *   <div id="zgc-banner" data-banner-id="endometriose-ebook"></div>
 *   <script src="https://zgc-widgets.pages.dev/banners/banner-loader.js" defer></script>
 *
 * data-banner-id: chave do banner no registry-banners.json.
 * data-registry: URL do registry.json, se for diferente do padrão (opcional).
 *
 * Pra trocar oferta, pausar produto ou ajustar copy: edita só o registry-banners.json
 * no repositório central — nenhuma página precisa ser tocada nem rebuildada.
 */
(function () {
  var DEFAULT_REGISTRY_URL = 'https://zgc-widgets.pages.dev/banners/registry-banners.json';

  var container = document.getElementById('zgc-banner');
  if (!container) return; // página não tem o slot — não faz nada

  var bannerId = container.getAttribute('data-banner-id');
  var registryUrl = container.getAttribute('data-registry') || DEFAULT_REGISTRY_URL;

  if (!bannerId) {
    console.error('zgc-banner: falta o atributo data-banner-id.');
    return;
  }

  fetch(registryUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('Falha ao buscar registry (' + res.status + ')');
      return res.json();
    })
    .then(function (data) {
      var banner = data.banners[bannerId];
      if (!banner) {
        console.error('zgc-banner: banner "' + bannerId + '" não encontrado no registry.');
        return;
      }
      render(container, bannerId, banner);
    })
    .catch(function (err) {
      console.error('Erro ao carregar banner:', err);
    });

  function render(el, id, b) {
    var scope = 'zb-' + id; // classe única por banner, evita colisão de estilo entre instâncias

    var badgesHtml = (b.badges || []).map(function (badge) {
      if (badge.style === 'solid') {
        return '<span class="' + scope + '-badge-solid" style="background:' + badge.bg + ';color:' + badge.color + ';">' + badge.text + '</span>';
      }
      return '<span class="' + scope + '-badge-outline">' + badge.text + '</span>';
    }).join('');

    var disclaimerHtml = b.disclaimer
      ? '<p class="' + scope + '-disclaimer">' + b.disclaimer + '</p>'
      : '';

    var wordmarkHtml = b.footerWordmark
      ? '<span class="' + scope + '-wordmark">' + b.footerWordmark + '</span>'
      : '';

    var css = ''
      + '.' + scope + '{font-family:Inter,sans-serif;background:linear-gradient(120deg,' + b.gradient.join(',') + ');border-radius:.75rem;padding:2rem;margin:2rem 0;color:#fff;position:relative;overflow:hidden;}'
      + '.' + scope + '-top{display:flex;align-items:center;gap:.6rem;margin-bottom:1rem;flex-wrap:wrap;}'
      + '.' + scope + '-badge-outline{font-size:.7rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:9999px;padding:.25rem .85rem;}'
      + '.' + scope + '-badge-solid{font-size:.7rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;border-radius:9999px;padding:.25rem .85rem;}'
      + '.' + scope + '-headline{font-size:1.5rem;font-weight:900;line-height:1.3;margin-bottom:.75rem;max-width:34rem;}'
      + '.' + scope + '-sub{font-size:.95rem;color:rgba(255,255,255,.88);max-width:32rem;margin-bottom:1.5rem;line-height:1.55;}'
      + '.' + scope + '-cta{display:inline-block;font-weight:700;font-size:.9rem;padding:.65rem 1.75rem;border-radius:9999px;text-decoration:none;transition:transform .15s ease,box-shadow .15s ease,opacity .15s ease;}'
      + '.' + scope + '-cta:hover{opacity:.85;transform:translateY(-1px);box-shadow:0 6px 14px rgba(0,0,0,.3);}'
      + '.' + scope + '-disclaimer{margin-top:1.25rem;font-size:.7rem;color:rgba(255,255,255,.55);max-width:32rem;line-height:1.4;}'
      + '.' + scope + '-wordmark{position:absolute;bottom:1.25rem;right:2rem;font-size:.8rem;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.02em;}'
      + '@media(max-width:640px){.' + scope + '-wordmark{display:none;}}';

    el.innerHTML = ''
      + '<style>' + css + '</style>'
      + '<div class="' + scope + '">'
      + '<div class="' + scope + '-top">' + badgesHtml + '</div>'
      + '<div class="' + scope + '-headline">' + b.headline + '</div>'
      + '<p class="' + scope + '-sub">' + b.sub + '</p>'
      + '<a class="' + scope + '-cta" href="' + b.cta.url + '" style="background:' + b.cta.bg + ';color:' + b.cta.color + ';">' + b.cta.text + '</a>'
      + disclaimerHtml
      + wordmarkHtml
      + '</div>';
  }
})();
