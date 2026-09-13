(function () {
  var A = window.ALEGI;
  if (!A) return;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  window.toggleMenu = function () {
    var nav = $("#mobileNav");
    if (nav) nav.classList.toggle("open");
  };

  $all("[data-phone]").forEach(function (el) {
    el.textContent = A.phoneDisplay;
  });
  $all("a[data-wa]").forEach(function (el) {
    var custom = el.getAttribute("data-wa");
    el.href = A.waLink(custom || "Hola Alegi, quiero hacer un pedido");
  });
  $all("a[data-ig]").forEach(function (el) {
    el.href = A.instagramUrl;
  });
  $all("[data-ig-handle]").forEach(function (el) {
    el.textContent = A.instagramHandle;
  });

  var search = $("#siteSearch");
  if (search) {
    search.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var q = encodeURIComponent(search.value.trim());
        window.location.href = "catalogo.html" + (q ? "?q=" + q : "");
      }
    });
  }

  function productCard(p, opts) {
    opts = opts || {};
    var btnClass = opts.pink ? "btn btn-primary" : "btn btn-wa";
    var priceClass = opts.pink ? "price pink" : "price";
    var msg = "Hola Alegi, me interesa " + p.name + " (" + A.formatPrice(p.price) + ") Ref: " + p.ref;
    return (
      '<article class="card" data-category="' + p.category + '" data-price="' + p.price + '" data-popular="' + p.popular + '">' +
        '<a class="card-media" href="producto.html?id=' + p.id + '">' +
          (p.badge ? '<span class="pill">' + p.badge + "</span>" : "") +
          '<img src="' + p.image + '" alt="' + p.name + '">' +
        "</a>" +
        '<div class="card-body">' +
          '<span class="cat-label">' + p.categoryLabel + "</span>" +
          "<h3>" + p.name + "</h3>" +
          '<div class="' + priceClass + '">' + A.formatPrice(p.price) + "</div>" +
          '<a class="' + btnClass + '" target="_blank" rel="noopener" href="' + A.waLink(msg) + '">Pedir por WhatsApp</a>' +
        "</div>" +
      "</article>"
    );
  }

  var featured = $("#featuredGrid");
  if (featured) {
    featured.innerHTML = A.products.slice(0, 8).map(function (p) {
      return productCard(p, { pink: true });
    }).join("");
  }

  var catalogGrid = $("#productGrid");
  if (catalogGrid) {
    var params = new URLSearchParams(location.search);
    var currentCat = params.get("cat") || "all";
    var currentQ = (params.get("q") || "").toLowerCase();
    var sort = "newest";

    function render() {
      var list = A.products.slice();
      if (currentCat !== "all") list = list.filter(function (p) { return p.category === currentCat; });
      if (currentQ) {
        list = list.filter(function (p) {
          return (p.name + " " + p.categoryLabel).toLowerCase().indexOf(currentQ) !== -1;
        });
      }
      if (sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
      if (sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
      if (sort === "popular") list.sort(function (a, b) { return b.popular - a.popular; });
      catalogGrid.innerHTML = list.length
        ? list.map(function (p) { return productCard(p); }).join("")
        : '<p class="empty">No encontramos prendas con ese filtro. Escríbenos y te asesoramos.</p>';
      $all(".chip").forEach(function (c) {
        c.classList.toggle("active", c.getAttribute("data-filter") === currentCat);
      });
      var count = $("#resultCount");
      if (count) count.textContent = list.length + (list.length === 1 ? " prenda" : " prendas");
    }

    $all(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        currentCat = chip.getAttribute("data-filter");
        render();
      });
    });
    var sortEl = $("#sortSelect");
    if (sortEl) {
      sortEl.addEventListener("change", function () {
        sort = sortEl.value;
        render();
      });
    }
    if (currentQ && search) search.value = params.get("q");
    render();
  }

  var productRoot = $("#productRoot");
  if (productRoot) {
    var id = new URLSearchParams(location.search).get("id") || "pantalon-wide-leg";
    var p = A.products.find(function (x) { return x.id === id; }) || A.products[5];
    var gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
    var related = A.products.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
    var sizeHtml = (p.sizes || []).map(function (s, i) {
      return '<button type="button" class="size' + (i === 2 ? " active" : "") + '" data-size="' + s + '">' + s + "</button>";
    }).join("");
    var colorHtml = (p.colors || []).map(function (c, i) {
      return '<button type="button" class="swatch' + (i === 0 ? " active" : "") + '" data-color="' + c + '">' + c + "</button>";
    }).join("");
    var thumbs = gallery.map(function (src, i) {
      return '<button type="button" class="' + (i === 0 ? "active" : "") + '" data-src="' + src + '"><img src="' + src + '" alt=""></button>';
    }).join("");

    productRoot.innerHTML =
      '<div class="crumbs wrap"><a href="index.html">Inicio</a> / <a href="catalogo.html?cat=' + p.category + '">' + p.categoryLabel + "</a> / " + p.name + "</div>" +
      '<div class="wrap product-layout">' +
        "<div>" +
          '<div class="gallery-main"><img id="mainPhoto" src="' + gallery[0] + '" alt="' + p.name + '"></div>' +
          '<div class="thumbs" id="thumbs">' + thumbs + "</div>" +
          '<div class="guarantees">' +
            "<div><strong>Envíos Colombia</strong><span>Seguimiento por WhatsApp</span></div>" +
            "<div><strong>Pagos acordados</strong><span>Nequi, Bancolombia, contraentrega</span></div>" +
            "<div><strong>Asesoría de talla</strong><span>Te ayudamos antes de enviar</span></div>" +
          "</div>" +
        "</div>" +
        "<div>" +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
            '<span class="kicker">' + p.categoryLabel + "</span>" +
            '<span class="ref-pill">Ref: ' + p.ref + "</span>" +
          "</div>" +
          '<h1 class="display" style="font-size:34px">' + p.name + "</h1>" +
          '<p class="price pink" style="font-size:28px;font-family:Playfair Display,serif">' + A.formatPrice(p.price) +
            (p.compareAt ? ' <span class="tiny" style="text-decoration:line-through;margin-left:8px">' + A.formatPrice(p.compareAt) + "</span>" : "") +
          "</p>" +
          "<p>" + p.description + "</p>" +
          (p.highlights ? "<ul class='highlights'>" + p.highlights.map(function (h) { return "<li>" + h + "</li>"; }).join("") + "</ul>" : "") +
          (colorHtml ? "<div class='tiny'>COLOR</div><div class='swatches' id='colors'>" + colorHtml + "</div>" : "") +
          (sizeHtml ? "<div class='tiny'>TALLA</div><div class='sizes' id='sizes'>" + sizeHtml + "</div>" : "") +
          '<a class="btn btn-wa" id="waProduct" target="_blank" rel="noopener" href="#">Pedir este producto por WhatsApp</a>' +
          '<div style="height:8px"></div>' +
          '<a class="btn btn-outline" data-wa="Hola Alegi, quiero consultar envío y pago de ' + p.name + '" target="_blank" rel="noopener">Consultar envío y pago</a>' +
          '<div class="pay-note">Confirmamos disponibilidad, talla, envío y forma de pago por WhatsApp o llamada al <strong>' + A.phoneDisplay + "</strong>. Aceptamos Nequi, Bancolombia, Daviplata y contraentrega.</div>" +
        "</div>" +
      "</div>" +
      '<section class="section wrap"><p class="kicker">Completa tu outfit</p><h2>También te puede gustar</h2><div class="grid-4" id="related"></div></section>';

    $("#related").innerHTML = related.map(function (x) { return productCard(x); }).join("");

    function selected(sel) {
      var el = $(sel + " .active");
      return el ? (el.getAttribute("data-size") || el.getAttribute("data-color")) : "";
    }
    function refreshWa() {
      var bits = ["Hola Alegi, me interesa " + p.name, A.formatPrice(p.price), "Ref: " + p.ref];
      var c = selected("#colors");
      var s = selected("#sizes");
      if (c) bits.push("Color: " + c);
      if (s) bits.push("Talla: " + s);
      $("#waProduct").href = A.waLink(bits.join(" · "));
    }
    $all("#sizes .size").forEach(function (b) {
      b.addEventListener("click", function () {
        $all("#sizes .size").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        refreshWa();
      });
    });
    $all("#colors .swatch").forEach(function (b) {
      b.addEventListener("click", function () {
        $all("#colors .swatch").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        refreshWa();
      });
    });
    $all("#thumbs button").forEach(function (b) {
      b.addEventListener("click", function () {
        $all("#thumbs button").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        $("#mainPhoto").src = b.getAttribute("data-src");
      });
    });
    $all("a[data-wa]").forEach(function (el) {
      el.href = A.waLink(el.getAttribute("data-wa"));
    });
    refreshWa();
  }
})();
