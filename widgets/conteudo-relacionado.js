/**
 * ZGC — Widget de Conteúdo Relacionado (multi-pool, hospedado uma vez, usado em qualquer domínio)
 *
 * Uso na página (WordPress/Elementor, Astro, ou qualquer HTML):
 *
 *   <div id="zgc-relacionados"
 *        data-pools="sua-saude-treino-forca,painel-saude-institucional"
 *        data-modo="aleatorio"
 *        data-qtd="3"></div>
 *   <script src="https://zgc-widgets.pages.dev/widgets/conteudo-relacionado.js" defer></script>
 *
 * data-pools: lista separada por vírgula dos pools a considerar (ver registry-conteudo-relacionado.json).
 *             Se omitido, usa todos os pools do registro.
 * data-modo: "aleatorio" (sorteia 1 pool a cada carregamento) ou "alternado"
 *            (roda os pools em sequência determinística, baseado no dia do ano —
 *            todas as páginas mostram o MESMO pool no mesmo dia, mudando dia a dia).
 * data-qtd: quantos cards mostrar (padrão 3).
 * data-registry: URL do registry.json, se for diferente do padrão (opcional).
 */
(function () {
  var DEFAULT_REGISTRY_URL = 'https://zgc-widgets.pages.dev/widgets/registry-conteudo-relacionado.json';

  var container = document.getElementById('zgc-relacionados');
  if (!container) return; // página não tem o slot — não faz nada

  var poolsAttr = container.getAttribute('data-pools');
  var modo = container.getAttribute('data-modo') || 'aleatorio';
  var qtd = parseInt(container.getAttribute('data-qtd'), 10) || 3;
  var registryUrl = container.getAttribute('data-registry') || DEFAULT_REGISTRY_URL;

  container.innerHTML = '<p style="font-family:Inter,sans-serif;color:#333;">Carregando…</p>';

  fetch(registryUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('Falha ao buscar registry (' + res.status + ')');
      return res.json();
    })
    .then(function (data) {
      var allPoolIds = Object.keys(data.pools);
      var allowedIds = poolsAttr
        ? poolsAttr.split(',').map(function (s) { return s.trim(); }).filter(function (id) { return allPoolIds.indexOf(id) !== -1; })
        : allPoolIds;

      if (!allowedIds.length) {
        container.innerHTML = '<p style="font-family:Inter,sans-serif;color:#333;">Nenhum pool de conteúdo configurado.</p>';
        return;
      }

      var poolId;
      if (modo === 'alternado') {
        var dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        poolId = allowedIds[dayOfYear % allowedIds.length];
      } else {
        poolId = allowedIds[Math.floor(Math.random() * allowedIds.length)];
      }

      var pool = data.pools[poolId];
      var path = window.location.pathname;

      var candidates = pool.items.filter(function (item) {
        var slug = item.url.replace(/^https?:\/\/[^/]+/, '');
        return path.indexOf(slug) === -1; // exclui a própria página, se ela estiver no pool
      });

      // Fisher-Yates
      for (var i = candidates.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = candidates[i]; candidates[i] = candidates[j]; candidates[j] = tmp;
      }

      var chosen = candidates.slice(0, qtd);
      renderCards(container, pool.label, chosen);
    })
    .catch(function (err) {
      container.innerHTML = '';
      console.error('Erro ao carregar widget de conteúdo relacionado:', err);
    });

  function renderCards(el, poolLabel, items) {
    var html = ''
      + '<style>'
      + '#zgc-relacionados{font-family:Inter,sans-serif;background-color:#F2F2F2;border-radius:.75rem;padding:2rem 1.5rem;margin:2rem 0;}'
      + '#zgc-relacionados h2{color:#005082;font-size:1.5rem;font-weight:700;margin-bottom:.25rem;}'
      + '#zgc-relacionados .zr-sub{color:#6b7280;font-size:.875rem;margin-bottom:1.5rem;max-width:42rem;}'
      + '#zgc-relacionados .zr-grid{display:grid;grid-template-columns:1fr;gap:1.5rem;}'
      + '@media(min-width:768px){#zgc-relacionados .zr-grid{grid-template-columns:repeat(' + items.length + ',1fr);}}'
      + '#zgc-relacionados .zr-card{background:#fff;border-radius:.5rem;box-shadow:0 4px 6px -1px rgb(0 0 0/.1),0 2px 4px -2px rgb(0 0 0/.1);padding:1.5rem;display:flex;flex-direction:column;height:100%;text-decoration:none;transition:transform .15s,box-shadow .15s;border-left:4px solid #00A1E4;}'
      + '#zgc-relacionados .zr-card:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgb(0 0 0/.1);}'
      + '#zgc-relacionados .zr-tag{display:inline-block;font-size:.75rem;font-weight:700;color:#0077C0;background:#E6F4FB;border-radius:9999px;padding:.15rem .75rem;margin-bottom:.75rem;width:fit-content;}'
      + '#zgc-relacionados .zr-title{font-size:1.05rem;font-weight:700;color:#005082;margin-bottom:.5rem;line-height:1.3;}'
      + '#zgc-relacionados .zr-desc{font-size:.875rem;color:#333;flex-grow:1;}'
      + '#zgc-relacionados .zr-link{font-size:.85rem;font-weight:700;color:#0077C0;margin-top:1rem;}'
      + '</style>'
      + '<h2>Continue Lendo — ' + poolLabel + '</h2>'
      + '<div class="zr-grid">';

    items.forEach(function (item) {
      html += '<a class="zr-card" href="' + item.url + '">'
        + '<span class="zr-tag">' + item.tag + '</span>'
        + '<div class="zr-title">' + item.title + '</div>'
        + '<p class="zr-desc">' + item.desc + '</p>'
        + '<span class="zr-link">Ler matéria completa →</span>'
        + '</a>';
    });

    html += '</div>';
    el.innerHTML = html;
  }
})();
