const FALLBACK_IMAGE =
  "file:///C:/Users/denil/Downloads/ChatGPT%20Image%2023%20de%20jun.%20de%202026,%2009_45_10.png";

const defaultSettings = {
  storeName: "JR Multimarcas",
  storeInitials: "JR",
  heroEyebrow: "Revendedor Autorizado",
  heroTitle: "Pronta entrega ou faça já o seu pedido!",
  heroSubtitle: "Envie seu pedido diretamente pelo WhatsApp.",
  heroImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  whatsapp: "82981719446"
};

const starterProducts = [
  {
    id: crypto.randomUUID(),
    name: "Camiseta Essencial",
    category: "Roupas",
    price: 79.9,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description: "Malha confortavel para usar no dia a dia."
  },
  {
    id: crypto.randomUUID(),
    name: "Bolsa Urbana",
    category: "Acessorios",
    price: 149.9,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    description: "Bolsa versatil com acabamento resistente."
  },
  {
    id: crypto.randomUUID(),
    name: "Kit Autocuidado",
    category: "Beleza",
    price: 119.9,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    description: "Selecao de itens para rotina de cuidado pessoal."
  }
];

const state = {
  settings: loadSettings(),
  products: loadProducts(),
  cart: []
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const productGrid = document.querySelector("#productGrid");
const categoryFilter = document.querySelector("#categoryFilter");
const searchInput = document.querySelector("#searchInput");
const sortFilter = document.querySelector("#sortFilter");
const productForm = document.querySelector("#productForm");
const cartPanel = document.querySelector("#cartPanel");
const cartButton = document.querySelector("#cartButton");
const closeCart = document.querySelector("#closeCart");
const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const whatsappStoreLink = document.querySelector("#whatsappStoreLink");
const formTitle = document.querySelector("#formTitle");
const submitProduct = document.querySelector("#submitProduct");
const cancelEdit = document.querySelector("#cancelEdit");
const settingsForm = document.querySelector("#settingsForm");
const resetSettings = document.querySelector("#resetSettings");
const settingsImagePreview = document.querySelector("#settingsImagePreview");
const brandLink = document.querySelector("#brandLink");
const brandInitials = document.querySelector("#brandInitials");
const brandName = document.querySelector("#brandName");
const heroEyebrow = document.querySelector("#heroEyebrow");
const heroTitle = document.querySelector("#heroTitle");
const heroSubtitle = document.querySelector("#heroSubtitle");
const heroImage = document.querySelector("#heroImage");
const heroCartButton = document.querySelector("#heroCartButton");
const isAdminMode = document.body.dataset.mode === "admin";

function loadSettings() {
  const saved = localStorage.getItem("minha-loja-settings");
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
}

function saveSettings() {
  localStorage.setItem("minha-loja-settings", JSON.stringify(state.settings));
}

function loadProducts() {
  const saved = localStorage.getItem("minha-loja-products");
  return saved ? JSON.parse(saved) : starterProducts;
}

function saveProducts() {
  localStorage.setItem("minha-loja-products", JSON.stringify(state.products));
}

function renderSettings() {
  document.title = state.settings.storeName;
  brandLink.setAttribute("aria-label", state.settings.storeName);
  brandInitials.textContent = state.settings.storeInitials;
  brandName.textContent = state.settings.storeName;
  heroEyebrow.textContent = state.settings.heroEyebrow;
  heroTitle.textContent = state.settings.heroTitle;
  heroSubtitle.textContent = state.settings.heroSubtitle;
  heroImage.src = state.settings.heroImage || defaultSettings.heroImage;
  heroImage.alt = `Foto principal de ${state.settings.storeName}`;
  settingsImagePreview.src = state.settings.heroImage || defaultSettings.heroImage;
  whatsappStoreLink.href = buildWhatsappUrl();

  if (!isAdminMode) return;

  settingsForm.elements.storeName.value = state.settings.storeName;
  settingsForm.elements.storeInitials.value = state.settings.storeInitials;
  settingsForm.elements.heroEyebrow.value = state.settings.heroEyebrow;
  settingsForm.elements.heroTitle.value = state.settings.heroTitle;
  settingsForm.elements.heroSubtitle.value = state.settings.heroSubtitle;
  settingsForm.elements.heroImage.value = state.settings.heroImage;
  settingsForm.elements.whatsapp.value = state.settings.whatsapp;
}

function getVisibleProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  return [...state.products]
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(term);
      const matchesCategory = category === "todos" || product.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortFilter.value === "menor-preco") return a.price - b.price;
      if (sortFilter.value === "maior-preco") return b.price - a.price;
      return 0;
    });
}

function renderCategories() {
  const selected = categoryFilter.value;
  const categories = [...new Set(state.products.map((product) => product.category))].sort();
  categoryFilter.innerHTML = '<option value="todos">Todas</option>';

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  }

  categoryFilter.value = categories.includes(selected) ? selected : "todos";
}

function renderProducts() {
  const products = getVisibleProducts();
  productGrid.innerHTML = "";

  if (!products.length) {
    productGrid.innerHTML = '<p class="empty-state">Nenhum produto encontrado.</p>';
    return;
  }

  for (const product of products) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image || FALLBACK_IMAGE}" alt="${product.name}">
      <div class="product-info">
        <span class="category-pill">${product.category}</span>
        <div class="product-topline">
          <h3>${product.name}</h3>
          <span class="price">${currency.format(product.price)}</span>
        </div>
        <p>${product.description || "Produto disponivel para pedido."}</p>
        <div class="product-actions">
          <button class="primary-action" type="button" data-add="${product.id}">Adicionar</button>
          ${isAdminMode ? `<button class="edit-button" type="button" data-edit="${product.id}">Editar</button>` : ""}
          ${isAdminMode ? `<button class="delete-button" type="button" data-delete="${product.id}" aria-label="Excluir ${product.name}">x</button>` : ""}
        </div>
      </div>
    `;
    productGrid.append(card);
  }
}

function renderCart() {
  cartCount.textContent = state.cart.reduce((total, item) => total + item.quantity, 0);
  cartItems.innerHTML = "";

  if (!state.cart.length) {
    cartItems.innerHTML = '<p class="empty-state">Seu carrinho esta vazio.</p>';
  }

  for (const item of state.cart) {
    const product = state.products.find((current) => current.id === item.id);
    if (!product) continue;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${product.image || FALLBACK_IMAGE}" alt="${product.name}">
      <div>
        <strong>${product.name}</strong>
        <span>${item.quantity} x ${currency.format(product.price)}</span>
      </div>
      <button class="delete-button" type="button" data-remove="${product.id}" aria-label="Remover ${product.name}">x</button>
    `;
    cartItems.append(row);
  }

  const total = state.cart.reduce((sum, item) => {
    const product = state.products.find((current) => current.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  cartTotal.textContent = currency.format(total);
  checkoutButton.href = buildWhatsappUrl();
}

function buildWhatsappUrl() {
  const lines = state.cart.map((item) => {
    const product = state.products.find((current) => current.id === item.id);
    return product ? `${item.quantity}x ${product.name} - ${currency.format(product.price)}` : "";
  });
  const total = state.cart.reduce((sum, item) => {
    const product = state.products.find((current) => current.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
  const message = lines.length
    ? `Ola! Quero fazer este pedido:\n\n${lines.join("\n")}\n\nTotal: ${currency.format(total)}`
    : "Ola! Quero conhecer os produtos da loja.";
  return `https://wa.me/${state.settings.whatsapp}?text=${encodeURIComponent(message)}`;
}

function addToCart(id) {
  const item = state.cart.find((current) => current.id === id);
  if (item) {
    item.quantity += 1;
  } else {
    state.cart.push({ id, quantity: 1 });
  }
  renderCart();
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
}

function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  renderCart();
}

function deleteProduct(id) {
  state.products = state.products.filter((product) => product.id !== id);
  state.cart = state.cart.filter((item) => item.id !== id);
  saveProducts();
  resetForm();
  renderAll();
}

function startEditProduct(id) {
  const product = state.products.find((current) => current.id === id);
  if (!product) return;

  productForm.elements.id.value = product.id;
  productForm.elements.name.value = product.name;
  productForm.elements.category.value = product.category;
  productForm.elements.price.value = product.price;
  productForm.elements.image.value = product.image;
  productForm.elements.description.value = product.description;
  formTitle.textContent = "Editar produto";
  submitProduct.textContent = "Salvar alteracoes";
  cancelEdit.classList.remove("hidden");
  document.querySelector("#cadastro").scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  productForm.reset();
  productForm.elements.id.value = "";
  formTitle.textContent = "Adicionar produto";
  submitProduct.textContent = "Cadastrar produto";
  cancelEdit.classList.add("hidden");
}

function renderAll() {
  renderSettings();
  renderCategories();
  renderProducts();
  renderCart();
}

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(settingsForm);

  state.settings = {
    storeName: form.get("storeName").trim(),
    storeInitials: form.get("storeInitials").trim().toUpperCase(),
    heroEyebrow: form.get("heroEyebrow").trim(),
    heroTitle: form.get("heroTitle").trim(),
    heroSubtitle: form.get("heroSubtitle").trim(),
    heroImage: form.get("heroImage").trim(),
    whatsapp: form.get("whatsapp").replace(/\D/g, "")
  };

  saveSettings();
  renderAll();
  document.querySelector("#inicio").scrollIntoView({ behavior: "smooth" });
});

if (isAdminMode) {
  settingsForm.elements.heroImage.addEventListener("input", () => {
    settingsImagePreview.src = settingsForm.elements.heroImage.value || defaultSettings.heroImage;
  });

  resetSettings.addEventListener("click", () => {
    state.settings = { ...defaultSettings };
    saveSettings();
    renderAll();
  });
}

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(productForm);
  const id = form.get("id");
  const productData = {
    name: form.get("name").trim(),
    category: form.get("category").trim(),
    price: Number(form.get("price")),
    image: form.get("image").trim(),
    description: form.get("description").trim()
  };

  if (id) {
    state.products = state.products.map((product) =>
      product.id === id ? { ...product, ...productData } : product
    );
  } else {
    state.products.unshift({
      id: crypto.randomUUID(),
      ...productData
    });
  }

  saveProducts();
  resetForm();
  renderAll();
  document.querySelector("#produtos").scrollIntoView({ behavior: "smooth" });
});

productGrid.addEventListener("click", (event) => {
  const addId = event.target.dataset.add;
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (addId) addToCart(addId);
  if (editId) startEditProduct(editId);
  if (deleteId) deleteProduct(deleteId);
});

cancelEdit.addEventListener("click", resetForm);

cartItems.addEventListener("click", (event) => {
  const id = event.target.dataset.remove;
  if (id) removeFromCart(id);
});

cartButton.addEventListener("click", () => {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
});

closeCart.addEventListener("click", () => {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
});

heroCartButton?.addEventListener("click", () => {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortFilter.addEventListener("change", renderProducts);

renderAll();
