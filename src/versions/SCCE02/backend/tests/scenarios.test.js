const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const routesSource = fs.readFileSync(path.join(backendRoot, "routes", "cartRoutes.js"), "utf8");
const controllerSource = fs.readFileSync(
  path.join(backendRoot, "controllers", "cartController.js"),
  "utf8"
);

function loadControllerWithRows(rows) {
  const dbPath = require.resolve("../db");
  const controllerPath = require.resolve("../controllers/cartController");

  delete require.cache[controllerPath];
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
      query: async () => ({ rows }),
    },
  };

  return require("../controllers/cartController");
}

function createMockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("Route mapping: exposes GET /api/cart/:userId through cartRoutes", () => {
  assert.match(routesSource, /router\.get\(['"]\/:userId['"],\s*controller\.getCart\)/);
});

test("Scenario 1: update quantity to 3 should produce quantity 3 and 30000 cents line total", async () => {
  const controller = loadControllerWithRows([
    { id: 1, quantity: 3, status: "ACTIVE", name: "Product A", price_cents: 10000 },
  ]);
  const res = createMockResponse();

  await controller.getCart({ params: { userId: "user-1" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.items[0].quantity, 3);
  assert.equal(res.body.items[0].lineTotal, 30000);
  assert.equal(res.body.totalCents, 30000);
});

test("Scenario 1 expected failure: backend should implement an update quantity endpoint", () => {
  assert.match(routesSource, /router\.(patch|put)\(/);
  assert.match(controllerSource, /(updateQuantity|updateCartItem|updateItem)/);
});

test("Scenario 2 expected failure: backend should implement add-to-cart merge logic", () => {
  assert.match(routesSource, /router\.post\(/);
  assert.match(controllerSource, /(addToCart|addItem|merge)/);
  assert.match(controllerSource, /(stock|quantity)/i);
});

test("Scenario 3: saved items should be excluded from active total but still returned", async () => {
  const controller = loadControllerWithRows([
    { id: 5, quantity: 1, status: "SAVED", name: "Product E", price_cents: 5000 },
  ]);
  const res = createMockResponse();

  await controller.getCart({ params: { userId: "user-1" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.items[0].status, "SAVED");
  assert.equal(res.body.items[0].lineTotal, 5000);
  assert.equal(res.body.totalCents, 0);
});

test("Scenario 3 expected failure: backend should implement save-for-later endpoint", () => {
  assert.match(routesSource, /save|later|saved|toggle/i);
  assert.match(controllerSource, /(saveForLater|toggleSave|saveItem)/);
});

test("Edge Case 1 expected failure: backend should reject current cart quantity plus new quantity beyond stock", () => {
  assert.match(controllerSource, /stock/i);
  assert.match(controllerSource, /(INSUFFICIENT_STOCK|สินค้าไม่เพียงพอ|not enough|exceed)/i);
});

test("Edge Case 2: floating point calculation should remain exact using integer cents", async () => {
  const controller = loadControllerWithRows([
    { id: 6, quantity: 3, status: "ACTIVE", name: "Product F", price_cents: 1999 },
  ]);
  const res = createMockResponse();

  await controller.getCart({ params: { userId: "user-1" } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.items[0].lineTotal, 5997);
  assert.equal(res.body.totalCents, 5997);
});
