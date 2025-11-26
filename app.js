/* app.js — listing data uses local images/ files if present, else falls back to remote Unsplash images,
   and finally to an inline SVG placeholder. Images are cropped to 1200x800 for consistent aspect ratio.
*/
(() => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800' preserveAspectRatio='xMidYMid slice'>
      <rect width='1200' height='800' fill='#eef6ff' />
      <g transform='translate(300,220)'>
        <rect x='0' y='120' width='600' height='360' rx='12' fill='#dbeeff' />
        <path d='M40 200 L120 130 L200 200 L280 130 L360 200' stroke='#c3ddff' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/>
        <text x='300' y='450' font-size='28' font-family='Arial, sans-serif' fill='#7aa2ff' text-anchor='middle'>Image not available</text>
      </g>
    </svg>`;
  const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

  // If you place images in an "images/" folder with these filenames, the app will use them locally.
  // Otherwise it will use the remote Unsplash URLs listed in `img`.
  const sampleProperties = [
    { id: "p1", title: "Cozy 1BHK Apartment", type: "apartment", city: "Bengaluru", price: 22000, beds:1, baths:1, area:"650 sq ft",
      imageFile: "apartment-1.jpg",
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Bright 1BHK with balcony, close to metro and grocery stores. Utilities not included." },
    { id: "p2", title: "Family House with Garden", type: "house", city: "Kolkata", price: 35000, beds:3, baths:2, area:"1500 sq ft",
      imageFile: "house-1.jpg",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Spacious family house with a private garden and parking. Pets allowed on request." },
    { id: "p3", title: "Private Room in Shared Flat", type: "room", city: "Mumbai", price: 14000, beds:1, baths:1, area:"120 sq ft",
      imageFile: "room-1.jpg",
      img: "https://images.unsplash.com/photo-1600585153980-2b6007f7a1b5?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Furnished room in a friendly shared apartment. Utilities split among housemates." },
    { id: "p4", title: "Modern Studio Downtown", type: "apartment", city: "Pune", price: 18000, beds:0, baths:1, area:"420 sq ft",
      imageFile: "studio-1.jpg",
      img: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Compact studio close to IT park and cafes. Perfect for working professionals." },
    { id: "p5", title: "Luxury 2BHK with Terrace", type: "apartment", city: "Hyderabad", price: 48000, beds:2, baths:2, area:"1050 sq ft",
      imageFile: "apartment-2.jpg",
      img: "https://images.unsplash.com/photo-1600585154461-6f4e8f9e7a59?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "High-end apartment with terrace and clubhouse access. Maintained building." },
    { id: "p6", title: "Seaside Villa with Pool", type: "house", city: "Goa", price: 120000, beds:4, baths:4, area:"3200 sq ft",
      imageFile: "villa-1.jpg",
      img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Stunning villa near the beach with private pool and sea view. Ideal for short/long stays." },
    { id: "p7", title: "Urban 3BHK near Tech Park", type: "apartment", city: "Bengaluru", price: 65000, beds:3, baths:3, area:"1400 sq ft",
      imageFile: "apartment-3.jpg",
      img: "https://images.unsplash.com/photo-1542317854-5f5c0b1dc7b1?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Well-connected 3BHK with modern fittings and municipal water supply. Covered parking." },
    { id: "p8", title: "Charming Bungalow", type: "house", city: "Chennai", price: 48000, beds:2, baths:2, area:"1100 sq ft",
      imageFile: "bungalow-1.jpg",
      img: "https://images.unsplash.com/photo-1505691723518-36a4f5f8b9a4?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Quiet bungalow in a safe neighborhood with a small garden and storage room." },
    { id: "p9", title: "Compact Furnished Flat", type: "apartment", city: "Ahmedabad", price: 12000, beds:1, baths:1, area:"500 sq ft",
      imageFile: "apartment-4.jpg",
      img: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Economical furnished flat with AC and kitchen utilities included in rent." },
    { id: "p10", title: "Penthouse with City View", type: "apartment", city: "Delhi", price: 95000, beds:3, baths:3, area:"1800 sq ft",
      imageFile: "penthouse-1.jpg",
      img: "https://images.unsplash.com/photo-1494522358652-4e9f1b7a6d1f?auto=format&fit=crop&w=1200&h=800&q=80",
      description: "Top-floor penthouse with panoramic city views, high ceilings and premium finishes." }
  ];

  // DOM refs
  const el = id => document.getElementById(id);
  const listingsEl = el("listings");
  const searchEl = el("search");
  const typeFilterEl = el("type-filter");
  const priceRangeEl = el("price-range");
  const priceValueEl = el("price-value");
  const sortByEl = el("sort-by");
  const modal = el("modal");
  const modalContent = el("modal-content");
  const modalBackdrop = el("modal-backdrop");
  const modalClose = el("modal-close");
  const favCountEl = el("fav-count");
  const emptyStateEl = el("empty-state");
  const favoritesToggle = el("favorites-toggle");

  // State
  let props = sampleProperties.slice();
  let favorites = loadFavorites();
  let showOnlyFavorites = false;

  // init
  document.getElementById("year").textContent = new Date().getFullYear();
  priceValueEl.textContent = `₹${priceRangeEl.value}`;
  renderList();
  updateFavCount();

  // Listeners
  searchEl.addEventListener("input", onFilterChange);
  typeFilterEl.addEventListener("change", onFilterChange);
  priceRangeEl.addEventListener("input", () => {
    priceValueEl.textContent = `₹${priceRangeEl.value}`;
    onFilterChange();
  });
  sortByEl.addEventListener("change", onFilterChange);
  modalBackdrop.addEventListener("click", closeModal);
  modalClose.addEventListener("click", closeModal);
  favoritesToggle.addEventListener("click", () => {
    showOnlyFavorites = !showOnlyFavorites;
    favoritesToggle.classList.toggle("active", showOnlyFavorites);
    favoritesToggle.textContent = showOnlyFavorites ? "All listings" : `Favorites (${favorites.size})`;
    renderList();
  });

  // Favorites helpers
  function saveFavorites() {
    localStorage.setItem("rentify:favorites", JSON.stringify(Array.from(favorites)));
    updateFavCount();
  }
  function loadFavorites() {
    try {
      const raw = localStorage.getItem("rentify:favorites");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  }
  function updateFavCount() {
    favCountEl.textContent = favorites.size;
  }

  // Render
  function renderList() {
    const query = searchEl.value.trim().toLowerCase();
    const type = typeFilterEl.value;
    const maxPrice = Number(priceRangeEl.value);
    let result = props.filter(p => {
      if (showOnlyFavorites && !favorites.has(p.id)) return false;
      if (type !== "all" && p.type !== type) return false;
      if (p.price > maxPrice) return false;
      if (query) {
        const hay = `${p.title} ${p.city}`.toLowerCase();
        return hay.includes(query);
      }
      return true;
    });

    const sort = sortByEl.value;
    if (sort === "price-asc") result.sort((a,b)=>a.price-b.price);
    if (sort === "price-desc") result.sort((a,b)=>b.price-a.price);

    listingsEl.innerHTML = "";
    if (result.length === 0) {
      emptyStateEl.hidden = false;
      return;
    } else {
      emptyStateEl.hidden = true;
    }

    result.forEach(p => {
      const card = document.createElement("article");
      card.className = "card";

      // Create image element and try local first, then remote, then placeholder.
      const imgEl = document.createElement("img");
      imgEl.loading = "lazy";
      imgEl.alt = p.title;
      imgEl.width = 1200;
      imgEl.height = 800;

      // Start with local path (images/<imageFile>). If that 404s, try remote `p.img`. If that fails, use placeholder.
      imgEl.src = `images/${p.imageFile}`;
      imgEl.dataset.remote = p.img;
      imgEl.addEventListener("error", function onErr() {
        if (!this.dataset.triedRemote) {
          this.dataset.triedRemote = "1";
          this.src = this.dataset.remote;
        } else {
          this.removeEventListener("error", onErr);
          this.src = placeholder;
        }
      });

      const body = document.createElement("div");
      body.className = "card-body";
      body.innerHTML = `
        <div>
          <h3 class="card-title">${escapeHtml(p.title)}</h3>
          <div class="card-sub">${escapeHtml(p.city)} • ${escapeHtml(p.area)}</div>
        </div>
        <div class="card-meta">
          <div>
            <div class="price">₹${formatNumber(p.price)}</div>
            <div class="card-sub">${p.beds} bd • ${p.baths} ba</div>
          </div>
          <div class="card-actions">
            <button class="btn small" data-id="${p.id}" data-action="view">View</button>
            <button class="icon-btn" title="Toggle favorite" data-id="${p.id}" data-action="fav">
              ${favorites.has(p.id) ? "★" : "☆"}
            </button>
          </div>
        </div>
      `;

      card.appendChild(imgEl);
      card.appendChild(body);
      listingsEl.appendChild(card);
    });

    // delegated handlers
    listingsEl.querySelectorAll("[data-action]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
        if (action === "view") openModal(id);
        if (action === "fav") toggleFavorite(id, btn);
      };
    });
  }

  function onFilterChange() { renderList(); }

  function toggleFavorite(id, btnEl) {
    if (favorites.has(id)) { favorites.delete(id); if (btnEl) btnEl.innerHTML = "☆"; }
    else { favorites.add(id); if (btnEl) btnEl.innerHTML = "★"; }
    saveFavorites();
    renderList();
  }

  function openModal(id) {
    const p = props.find(x => x.id === id);
    if (!p) return;

    modalContent.innerHTML = "";
    const title = document.createElement("h2"); title.id = "modal-title"; title.textContent = p.title;
    const sub = document.createElement("p"); sub.className = "card-sub"; sub.textContent = `${p.city} • ${p.area} • ${p.beds} bd • ${p.baths} ba`;

    const img = document.createElement("img");
    img.alt = p.title;
    img.style.width = "100%";
    img.style.maxHeight = "350px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.margin = "0.6rem 0";
    img.src = `images/${p.imageFile}`;
    img.dataset.remote = p.img;
    img.addEventListener("error", function onErr() {
      if (!this.dataset.triedRemote) {
        this.dataset.triedRemote = "1";
        this.src = this.dataset.remote;
      } else {
        this.removeEventListener("error", onErr);
        this.src = placeholder;
      }
    });

    const desc = document.createElement("p"); desc.textContent = p.description;
    const price = document.createElement("p"); price.innerHTML = `<strong>Monthly Rent:</strong> ₹${formatNumber(p.price)}`;

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "0.5rem";
    actions.style.marginTop = "0.75rem";
    const contactBtn = document.createElement("button");
    contactBtn.className = "btn";
    contactBtn.id = "contact-owner";
    contactBtn.textContent = "Contact Owner";
    const favBtn = document.createElement("button");
    favBtn.className = "btn ghost";
    favBtn.id = "toggle-fav-modal";
    favBtn.textContent = favorites.has(p.id) ? "Remove Favorite" : "Save Favorite";
    actions.append(contactBtn, favBtn);

    const hr = document.createElement("hr");
    const h3 = document.createElement("h3"); h3.textContent = "Contact form (demo)";
    const form = document.createElement("form");
    form.id = "contact-form";
    form.innerHTML = `
      <input required name="name" placeholder="Your name" style="padding:0.5rem;width:100%;border-radius:6px;border:1px solid #e6eef9;margin-bottom:0.5rem"/>
      <input required name="email" type="email" placeholder="Email" style="padding:0.5rem;width:100%;border-radius:6px;border:1px solid #e6eef9;margin-bottom:0.5rem"/>
      <textarea required name="message" placeholder="Message" rows="4" style="padding:0.5rem;width:100%;border-radius:6px;border:1px solid #e6eef9;margin-bottom:0.5rem"></textarea>
      <div style="display:flex;gap:0.5rem;">
        <button type="submit" class="btn">Send message</button>
        <button type="button" id="close-modal-cta" class="btn ghost">Close</button>
      </div>
    `;

    modalContent.appendChild(title);
    modalContent.appendChild(sub);
    modalContent.appendChild(img);
    modalContent.appendChild(desc);
    modalContent.appendChild(price);
    modalContent.appendChild(actions);
    modalContent.appendChild(hr);
    modalContent.appendChild(h3);
    modalContent.appendChild(form);

    favBtn.addEventListener("click", () => {
      toggleFavorite(p.id);
      favBtn.textContent = favorites.has(p.id) ? "Remove Favorite" : "Save Favorite";
    });

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const fm = new FormData(ev.target);
      alert(`Thanks ${fm.get("name")} — message sent (demo). Owner will receive your message at ${fm.get("email")}.`);
      closeModal();
    });

    document.getElementById("close-modal-cta").addEventListener("click", closeModal);

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalContent.innerHTML = "";
  }

  // Small utilities
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();