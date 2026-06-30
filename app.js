const storeConfig = {
  brand: "AGD Cerâmica",
  whatsappNumber: "5548999938223",
  storeEmail: "aracellighedin@gmail.com"
};

const products = [
  {
    id: "conjunto-verde-petroleo",
    name: "Conjunto verde petróleo",
    price: 248,
    image: "assets/conjunto-verde-petroleo.jpg",
    description:
      "Kit artesanal com xícara, pires, prato baixo e bowl. Esmalte verde petróleo com base em argila aparente.",
    tags: ["4 peças", "Pequena tiragem", "R$ 248 o conjunto"]
  }
];

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0
});

const productGrid = document.querySelector("#productGrid");
const cartTotal = document.querySelector("#cartTotal");
const cartItems = document.querySelector("#cartItems");
const orderForm = document.querySelector("#orderForm");
const dialog = document.querySelector("#messageDialog");
const preparedMessage = document.querySelector("#preparedMessage");
const copyMessage = document.querySelector("#copyMessage");

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <figure>
            <img src="${product.image}" alt="${product.name}">
          </figure>
          <div class="product-body">
            <div class="product-meta">
              <h3>${product.name}</h3>
              <span class="price">${formatter.format(product.price)}</span>
            </div>
            <p>${product.description}</p>
            <ul class="tag-list">
              ${product.tags.map((tag) => `<li>${tag}</li>`).join("")}
            </ul>
            <div class="quantity-row">
              <input
                type="number"
                min="0"
                max="20"
                value="0"
                aria-label="Quantidade de ${product.name}"
                data-product-id="${product.id}"
              >
              <button class="button secondary" type="button" data-add-one="${product.id}">
                Adicionar
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function getCartLines() {
  return products
    .map((product) => {
      const input = document.querySelector(`[data-product-id="${product.id}"]`);
      const quantity = Number(input?.value || 0);
      return { ...product, quantity, subtotal: quantity * product.price };
    })
    .filter((product) => product.quantity > 0);
}

function updateCartSummary() {
  const lines = getCartLines();
  const total = lines.reduce((sum, item) => sum + item.subtotal, 0);

  cartTotal.textContent = formatter.format(total);
  cartItems.textContent = lines.length
    ? lines.map((item) => `${item.quantity}x ${item.name}`).join(", ")
    : "Escolha um produto na coleção.";
}

function buildOrderMessage(formData) {
  const lines = getCartLines();
  const total = lines.reduce((sum, item) => sum + item.subtotal, 0);
  const productLines = lines
    .map(
      (item) =>
        `- ${item.quantity}x ${item.name}: ${formatter.format(item.subtotal)}`
    )
    .join("\n");

  return [
    `Olá, ${storeConfig.brand}. Quero confirmar um pedido:`,
    "",
    productLines,
    `Total dos produtos: ${formatter.format(total)}`,
    "Frete: a calcular",
    "",
    `Nome: ${formData.get("name")}`,
    `WhatsApp: ${formData.get("phone")}`,
    `E-mail: ${formData.get("email") || "não informado"}`,
    `Cidade/UF: ${formData.get("city")}`,
    `CEP: ${formData.get("zip")}`,
    `Observações: ${formData.get("notes") || "nenhuma"}`,
    "",
    "Aguardo confirmação de disponibilidade, prazo e frete. O pagamento pode ser informado depois da confirmação."
  ].join("\n");
}

function openPreparedMessage(message) {
  preparedMessage.value = message;

  if (storeConfig.whatsappNumber) {
    const url = `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  }

  const formData = new FormData(orderForm);
  if (storeConfig.storeEmail) {
    const subject = `Cópia do pedido - ${storeConfig.brand}`;
    const mailtoUrl = `mailto:${storeConfig.storeEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, "_blank", "noopener");
  }

  dialog.showModal();
}

renderProducts();
updateCartSummary();

productGrid.addEventListener("input", (event) => {
  if (event.target.matches("[data-product-id]")) {
    updateCartSummary();
  }
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-one]");
  if (!button) return;

  const input = document.querySelector(`[data-product-id="${button.dataset.addOne}"]`);
  input.value = Number(input.value || 0) + 1;
  updateCartSummary();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const lines = getCartLines();

  if (!lines.length) {
    cartItems.textContent = "Adicione pelo menos um produto antes de preparar o pedido.";
    return;
  }

  const formData = new FormData(orderForm);
  const message = buildOrderMessage(formData);
  openPreparedMessage(message);
});

copyMessage.addEventListener("click", async () => {
  await navigator.clipboard.writeText(preparedMessage.value);
  copyMessage.textContent = "Copiado";
  setTimeout(() => {
    copyMessage.textContent = "Copiar mensagem";
  }, 1800);
});
