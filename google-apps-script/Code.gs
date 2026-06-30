const CONFIG = {
  SPREADSHEET_ID: "1mkQUUNdvF7okaQpQFXSulmuBCPhP3ymoIQad6AimvbI",
  ORDERS_SHEET: "Pedidos",
  NOTIFY_EMAIL: "aracellighedin@gmail.com"
};

function doPost(e) {
  const data = parsePayload_(e);
  const orderId = data.orderId || makeOrderId_();
  const total = Number(data.total || 0);

  const row = [
    new Date(),
    "Novo",
    orderId,
    data.name || "",
    data.phone || "",
    data.email || "",
    data.city || "",
    data.zip || "",
    data.items || "",
    total,
    data.notes || "",
    "site"
  ];

  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.ORDERS_SHEET);
  sheet.appendRow(row);

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: `Novo pedido AGD - ${orderId}`,
    body: buildEmailBody_(data, orderId, total)
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, orderId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePayload_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return {};
}

function makeOrderId_() {
  const now = new Date();
  const date = Utilities.formatDate(now, "America/Sao_Paulo", "yyyyMMdd-HHmmss");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AGD-${date}-${suffix}`;
}

function buildEmailBody_(data, orderId, total) {
  return [
    "Novo pedido recebido pelo site da AGD Cerâmica.",
    "",
    `Pedido ID: ${orderId}`,
    `Nome: ${data.name || ""}`,
    `WhatsApp: ${data.phone || ""}`,
    `E-mail: ${data.email || ""}`,
    `Cidade/UF: ${data.city || ""}`,
    `CEP: ${data.zip || ""}`,
    "",
    "Itens:",
    data.items || "",
    "",
    `Total dos produtos: R$ ${total.toFixed(2).replace(".", ",")}`,
    "Frete: a calcular",
    "",
    `Observações: ${data.notes || "nenhuma"}`,
    "",
    "A planilha de pedidos foi atualizada automaticamente."
  ].join("\n");
}
