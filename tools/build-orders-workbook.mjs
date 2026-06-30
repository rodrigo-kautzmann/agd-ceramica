import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.resolve("outputs");
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const orders = workbook.worksheets.add("Pedidos");
const statuses = workbook.worksheets.add("Status");

orders.showGridLines = false;
statuses.showGridLines = false;

orders.getRange("A1:L1").values = [[
  "Recebido em",
  "Status",
  "Pedido ID",
  "Nome",
  "WhatsApp",
  "E-mail",
  "Cidade/UF",
  "CEP",
  "Itens",
  "Total produtos",
  "Observações",
  "Origem"
]];

orders.getRange("A2:L2").values = [[
  "2026-06-30 10:52",
  "Novo",
  "AGD-EXEMPLO",
  "Cliente exemplo",
  "5548999990000",
  "cliente@example.com",
  "Florianópolis, SC",
  "88000-000",
  "1x Conjunto verde petróleo",
  248,
  "Linha de exemplo; pode ser apagada quando chegarem pedidos reais.",
  "site"
]];

statuses.getRange("A1:B1").values = [["Status", "Uso"]];
statuses.getRange("A2:B7").values = [
  ["Novo", "Pedido recebido, aguardando conferência."],
  ["Confirmado", "Disponibilidade e frete confirmados."],
  ["Aguardando pagamento", "Cliente recebeu instruções de pagamento."],
  ["Pago", "Pagamento confirmado."],
  ["Enviado", "Pedido despachado ou retirado."],
  ["Cancelado", "Pedido cancelado."]
];

orders.freezePanes.freezeRows(1);
statuses.freezePanes.freezeRows(1);

orders.getRange("A1:L1").format.fill.color = "#0E5F5C";
orders.getRange("A1:L1").format.font.color = "#FFFFFF";
orders.getRange("A1:L1").format.font.bold = true;
orders.getRange("A1:L1").format.wrapText = true;
orders.getRange("A1:L200").format.borders = {
  insideHorizontal: { style: "thin", color: "#E6E0D5" },
  bottom: { style: "thin", color: "#D7D0C3" }
};

statuses.getRange("A1:B1").format.fill.color = "#9A6F53";
statuses.getRange("A1:B1").format.font.color = "#FFFFFF";
statuses.getRange("A1:B1").format.font.bold = true;
statuses.getRange("A1:B7").format.borders = {
  insideHorizontal: { style: "thin", color: "#E6E0D5" },
  bottom: { style: "thin", color: "#D7D0C3" }
};

orders.getRange("A:A").format.columnWidthPx = 150;
orders.getRange("B:B").format.columnWidthPx = 170;
orders.getRange("C:C").format.columnWidthPx = 130;
orders.getRange("D:D").format.columnWidthPx = 180;
orders.getRange("E:E").format.columnWidthPx = 150;
orders.getRange("F:F").format.columnWidthPx = 210;
orders.getRange("G:G").format.columnWidthPx = 170;
orders.getRange("H:H").format.columnWidthPx = 110;
orders.getRange("I:I").format.columnWidthPx = 260;
orders.getRange("J:J").format.columnWidthPx = 120;
orders.getRange("K:K").format.columnWidthPx = 280;
orders.getRange("L:L").format.columnWidthPx = 110;

orders.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
orders.getRange("E:E").setNumberFormat("@");
orders.getRange("H:H").setNumberFormat("@");
orders.getRange("J:J").setNumberFormat('"R$" #,##0');
orders.getRange("I:K").format.wrapText = true;
orders.getRange("A:L").format.font.name = "Inter";
statuses.getRange("A:B").format.font.name = "Inter";
statuses.getRange("A:A").format.columnWidthPx = 190;
statuses.getRange("B:B").format.columnWidthPx = 360;
statuses.getRange("B:B").format.wrapText = true;

orders.getRange("B2:B500").dataValidation = {
  rule: { type: "list", formula1: "Status!$A$2:$A$7" }
};

const outputPath = path.join(outputDir, "agd-pedidos.xlsx");
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);

const preview = await workbook.render({ sheetName: "Pedidos", range: "A1:L8", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "agd-pedidos-preview.png"), new Uint8Array(await preview.arrayBuffer()));

const inspect = await workbook.inspect({
  kind: "table",
  sheetId: "Pedidos",
  range: "A1:L2",
  tableMaxRows: 4,
  tableMaxCols: 12,
  maxChars: 4000
});

console.log(inspect.ndjson);
console.log(outputPath);
