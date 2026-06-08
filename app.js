const CART_KEY = "ctc_mock_cart";
const SAVED_KEY = "ctc_saved_designs";
const CHECKOUT_KEY = "ctc_checkout_state";
const ORDERS_KEY = "ctc_mock_orders";

const defaultDesign = {
  tiers: 2,
  diameter: 10,
  tierHeight: 3.5,
  lean: 0,
  shape: "round",
  flavor: "vanilla",
  filling: "cream",
  frosting: "#fff4df",
  drip: "#0f766e",
  gloss: 42,
  piping: 54,
  sprinkles: 18,
  topperScale: 100,
  messageCurve: 30,
  message: "Crack it",
  occasion: "daily",
  complexity: "clean",
  tilt: 58,
  lighting: 58,
  decorations: ["cherries", "stars"],
  spin: -18,
  zoom: 1,
};

const state = { ...defaultDesign };

const labels = {
  flavor: {
    vanilla: "Vanilla bean",
    redVelvet: "Red velvet",
    lemon: "Lemon cream",
    caramel: "Salted caramel",
    espresso: "Espresso brownie",
  },
  filling: {
    cream: "Light cream",
    jam: "Cherry jam",
    lemonCurd: "Lemon curd",
    ganache: "Dark ganache",
  },
  shape: {
    round: "Round",
    square: "Square",
    heart: "Heart",
    cloud: "Cloud",
  },
  complexity: {
    clean: "Clean",
    styled: "Styled",
    chaos: "Party chaos",
    couture: "Couture",
  },
  occasion: {
    daily: "No occasion",
    birthday: "Birthday",
    wedding: "Wedding",
    launch: "Brand launch",
    houseParty: "House party",
  },
  decor: {
    cherry: "Cherry",
    pearl: "Pearl",
    star: "Gold star",
    bow: "Bow",
    brownie: "Brownie",
    candle: "Candle",
    flowers: "Sugar flowers",
    lace: "Lace piping",
    goldLeaf: "Gold leaf",
    monogram: "Monogram topper",
    candles: "Tall candles",
    sprinkles: "Sprinkle blast",
    balloons: "Balloon toppers",
    brownies: "Brownie chunks",
    drip: "Signature drip",
    fruit: "Fresh fruit",
    charms: "Sticker charms",
    messageTopper: "Message topper",
    cherries: "Cherries",
    stars: "Gold stars",
    brownie: "Brownie chunks",
    bows: "Tiny bows",
    stickers: "Sticker charms",
    pearls: "Pearl ring",
  },
};

const costs = {
  tierBase: 31,
  diameterInch: 4.25,
  tierHeight: 5.5,
  shape: { round: 0, square: 8, heart: 18, cloud: 22 },
  flavor: { vanilla: 0, redVelvet: 8, lemon: 10, caramel: 12, espresso: 11 },
  filling: { cream: 0, jam: 7, lemonCurd: 10, ganache: 10 },
  complexity: { clean: 0, styled: 24, chaos: 42, couture: 68 },
  occasion: { daily: 0, birthday: 8, wedding: 55, launch: 22, houseParty: 12 },
  decoration: 8,
};

const prepBase = {
  complexity: { clean: 0.8, styled: 2.1, chaos: 3.4, couture: 5.5 },
  occasion: { daily: 0, birthday: 0.5, wedding: 3.5, launch: 1.2, houseParty: 0.7 },
};

const presetData = {
  signature: {
    ...defaultDesign,
  },
  wedding: {
    ...defaultDesign,
    tiers: 3,
    diameter: 11,
    tierHeight: 4,
    shape: "round",
    flavor: "vanilla",
    filling: "cream",
    frosting: "#fff4df",
    drip: "#f7c948",
    gloss: 36,
    piping: 82,
    sprinkles: 8,
    topperScale: 80,
    message: "Forever",
    occasion: "wedding",
    complexity: "couture",
    decorations: ["pearls", "stars"],
  },
  party: {
    ...defaultDesign,
    tiers: 2,
    diameter: 12,
    tierHeight: 4.5,
    shape: "heart",
    flavor: "redVelvet",
    filling: "jam",
    frosting: "#f4a896",
    drip: "#e97863",
    gloss: 86,
    piping: 65,
    sprinkles: 66,
    topperScale: 138,
    message: "Too much",
    occasion: "houseParty",
    complexity: "chaos",
    decorations: ["cherries", "bows", "stickers", "stars"],
  },
  citrus: {
    ...defaultDesign,
    tiers: 2,
    diameter: 10,
    tierHeight: 3,
    shape: "cloud",
    flavor: "lemon",
    filling: "lemonCurd",
    frosting: "#fff4df",
    drip: "#f7c948",
    gloss: 62,
    piping: 46,
    sprinkles: 25,
    topperScale: 110,
    message: "Bright mood",
    occasion: "daily",
    complexity: "styled",
    decorations: ["stars", "pearls"],
  },
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cart() {
  return readJson(CART_KEY, []);
}

function savedDesigns() {
  return readJson(SAVED_KEY, []);
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateEstimate(design = state) {
  const fineDetail =
    design.gloss * 0.08 +
    design.piping * 0.13 +
    design.sprinkles * 0.28 +
    design.topperScale * 0.07 +
    design.messageCurve * 0.05;

  const usd =
    design.tiers * costs.tierBase +
    design.diameter * costs.diameterInch +
    design.tierHeight * design.tiers * costs.tierHeight +
    costs.shape[design.shape] +
    costs.flavor[design.flavor] +
    costs.filling[design.filling] +
    costs.complexity[design.complexity] +
    costs.occasion[design.occasion] +
    design.decorations.length * costs.decoration +
    fineDetail +
    (design.message.trim() ? 6 : 0);

  const hours =
    1.6 +
    design.tiers * 1.15 +
    design.tierHeight * 0.32 +
    design.diameter * 0.08 +
    prepBase.complexity[design.complexity] +
    prepBase.occasion[design.occasion] +
    design.decorations.length * 0.42 +
    design.piping * 0.018 +
    design.sprinkles * 0.012 +
    (design.message.trim() ? 0.25 : 0);

  const roundedUsd = Math.round(usd);

  return {
    usd: roundedUsd,
    hours,
  };
}

function updateGlobalCartCount() {
  const count = cart().length;
  document.querySelectorAll(".cart-count").forEach((node) => {
    node.textContent = String(count);
  });
}

function initNavigation() {
  const menus = Array.from(document.querySelectorAll(".site-header details"));
  if (!menus.length) return;

  document.addEventListener("click", (event) => {
    menus.forEach((menu) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    menus.forEach((menu) => {
      menu.open = false;
    });
  });

  document.querySelectorAll(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      const menu = link.closest("details");
      if (menu) menu.open = false;
    });
  });
}

function applyDesign(next) {
  Object.assign(state, next);
  syncControlsFromState();
  renderBuilder();
}

function syncControlsFromState() {
  const mappings = [
    "tiers",
    "diameter",
    "tierHeight",
    "lean",
    "shape",
    "flavor",
    "filling",
    "gloss",
    "piping",
    "sprinkles",
    "topperScale",
    "messageCurve",
    "message",
    "occasion",
    "complexity",
    "tilt",
    "lighting",
  ];

  mappings.forEach((id) => {
    const input = document.querySelector(`#${id}`);
    if (input) input.value = state[id];
  });

  document.querySelectorAll('input[name="decor"]').forEach((input) => {
    input.checked = state.decorations.includes(input.value);
  });

  document.querySelectorAll(".swatch").forEach((button) => {
    button.classList.toggle("active", button.dataset.color === state.frosting);
  });

  document.querySelectorAll(".drip-swatch").forEach((button) => {
    button.classList.toggle("active", button.dataset.drip === state.drip);
  });
}

function createSprinkles() {
  const field = document.querySelector("#sprinkleField");
  if (!field) return;
  field.innerHTML = "";
  const colors = ["#0f766e", "#f4a896", "#f7c948", "#52bdb6", "#4e2a84", "#fff4df"];
  for (let index = 0; index < state.sprinkles; index += 1) {
    const sprinkle = document.createElement("span");
    sprinkle.className = "sprinkle";
    sprinkle.style.left = `${12 + ((index * 31) % 76)}%`;
    sprinkle.style.top = `${8 + ((index * 47) % 72)}%`;
    sprinkle.style.rotate = `${(index * 29) % 180}deg`;
    sprinkle.style.background = colors[index % colors.length];
    field.append(sprinkle);
  }
}

function createToppers() {
  const ring = document.querySelector("#toppingsRing");
  if (!ring) return;
  ring.innerHTML = "";
  const codes = {
    cherries: "CH",
    stars: "ST",
    brownie: "BR",
    bows: "BO",
    stickers: "SK",
    pearls: "PE",
  };
  const colors = {
    cherries: "#e51d24",
    stars: "#d9a441",
    brownie: "#3a1a12",
    bows: "#ff7aad",
    stickers: "#52bdb6",
    pearls: "#fff8ef",
  };
  const items = state.decorations.flatMap((decor) => [decor, decor]);
  const count = Math.max(items.length, 1);

  items.forEach((decor, index) => {
    const topper = document.createElement("span");
    topper.className = "topper";
    topper.textContent = codes[decor] || "CT";
    topper.style.color = decor === "pearls" ? "#082f49" : "#fffaf3";
    topper.style.background = colors[decor] || "#d9a441";
    topper.style.setProperty("--angle", `${(360 / count) * index}deg`);
    topper.style.setProperty("--radius", `${76 + (index % 2) * 18}px`);
    ring.append(topper);
  });
}

function renderBuilder() {
  const cakeStack = document.querySelector("#cakeStack");
  if (!cakeStack) return;

  cakeStack.style.setProperty("--frosting", state.frosting);
  cakeStack.style.setProperty("--drip", state.drip);
  cakeStack.style.setProperty("--spin", `${state.spin}deg`);
  cakeStack.style.setProperty("--tilt", `${state.tilt}deg`);
  cakeStack.style.setProperty("--zoom", state.zoom);
  cakeStack.style.setProperty("--lean", `${state.lean}deg`);
  cakeStack.style.setProperty("--tier-height", `${86 + state.tierHeight * 10}px`);
  cakeStack.style.setProperty("--diameter-scale", 0.82 + state.diameter / 28);
  cakeStack.style.setProperty("--gloss", state.gloss / 100);
  cakeStack.style.setProperty("--piping-opacity", state.piping / 100);
  cakeStack.style.setProperty("--topper-scale", state.topperScale / 100);
  cakeStack.style.setProperty("--lighting", `${state.lighting}%`);
  cakeStack.dataset.tiers = String(state.tiers);
  cakeStack.dataset.shape = state.shape;

  const message = document.querySelector("#cakeMessage");
  if (message) {
    message.textContent = state.message.trim() || "Celebrate";
    message.style.letterSpacing = `${state.messageCurve / 36}px`;
  }

  createSprinkles();
  createToppers();
  updateOutputs();
  updateEstimate();
}

function updateOutputs() {
  const outputMap = {
    tierOutput: `${state.tiers} tier${state.tiers === 1 ? "" : "s"}`,
    diameterOutput: `${state.diameter} in`,
    heightOutput: `${state.tierHeight} in`,
    leanOutput: `${state.lean} deg`,
    glossOutput: `${state.gloss}%`,
    pipingOutput: `${state.piping}%`,
    sprinkleOutput: `${state.sprinkles}`,
    topperOutput: `${state.topperScale}%`,
    curveOutput: `${state.messageCurve}%`,
    tiltOutput: `${state.tilt} deg`,
    lightingOutput: `${state.lighting}%`,
  };

  Object.entries(outputMap).forEach(([id, value]) => {
    const output = document.querySelector(`#${id}`);
    if (output) output.textContent = value;
  });

  const camera = document.querySelector("#cameraReadout");
  if (camera) camera.textContent = `Orbit ${Math.round(state.spin)} / Zoom ${state.zoom.toFixed(2)}`;

  const score = Math.min(99, Math.round(62 + state.decorations.length * 4 + state.piping / 7 + state.gloss / 10));
  const buildScore = document.querySelector("#buildScore");
  if (buildScore) buildScore.textContent = `Studio score ${score}`;
}

function updateEstimate() {
  const estimate = calculateEstimate();
  const priceUsd = document.querySelector("#priceUsd");
  const prepTime = document.querySelector("#prepTime");
  const estimateCopy = document.querySelector("#estimateCopy");

  if (priceUsd) priceUsd.textContent = formatUsd(estimate.usd);
  if (prepTime) prepTime.textContent = `${estimate.hours.toFixed(1)} hrs`;
  if (estimateCopy) {
    estimateCopy.textContent = `${labels.complexity[state.complexity]} build, ${state.decorations.length} decor sets, ${labels.occasion[state.occasion]}`;
  }
}

function designSummary(design) {
  const flavor = labels.flavor[design.flavor] || "Lemon cream";
  const shape = labels.shape[design.shape] || "Round";
  const complexity = labels.complexity[design.complexity] || "Styled";
  return `${design.tiers} tier${design.tiers === 1 ? "" : "s"} / ${shape} / ${flavor} / ${complexity}`;
}

function addCurrentDesignToCart() {
  const item = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    design: { ...state, decorations: [...state.decorations] },
    estimate: calculateEstimate(),
  };
  const nextCart = [...cart(), item];
  writeJson(CART_KEY, nextCart);
  updateGlobalCartCount();
  window.location.href = "checkout.html";
}

function saveCurrentDesign() {
  const item = {
    id: Date.now(),
    name: state.message.trim() || "Custom CakeBuilder Demo",
    design: { ...state, decorations: [...state.decorations] },
    estimate: calculateEstimate(),
  };
  writeJson(SAVED_KEY, [item, ...savedDesigns()].slice(0, 6));
  const button = document.querySelector("#saveDesign");
  if (button) {
    button.textContent = "Saved";
    setTimeout(() => {
      button.textContent = "Save design";
    }, 1000);
  }
}

function initBuilder() {
  if (!document.querySelector("#cakeStack")) return;

  const urlStyle = new URLSearchParams(window.location.search).get("style");
  const presetFromUrl = urlStyle === "wedding" ? "wedding" : urlStyle === "party" ? "party" : urlStyle === "launch" ? "signature" : urlStyle === "daily" ? "citrus" : null;
  if (presetFromUrl) Object.assign(state, presetData[presetFromUrl]);

  syncControlsFromState();
  renderBuilder();

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-preset]").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      applyDesign({ ...presetData[button.dataset.preset] });
    });
  });

  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.name === "decor") {
        state.decorations = Array.from(document.querySelectorAll('input[name="decor"]:checked')).map((node) => node.value);
      } else if (input.type === "range") {
        state[input.id] = Number(input.value);
      } else {
        state[input.id] = input.value;
      }
      renderBuilder();
    });
  });

  document.querySelectorAll(".swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.frosting = button.dataset.color;
      syncControlsFromState();
      renderBuilder();
    });
  });

  document.querySelectorAll(".drip-swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.drip = button.dataset.drip;
      syncControlsFromState();
      renderBuilder();
    });
  });

  document.querySelectorAll("[data-spin]").forEach((button) => {
    button.addEventListener("click", () => {
      state.spin += Number(button.dataset.spin);
      renderBuilder();
    });
  });

  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      state.zoom = Math.max(0.78, Math.min(1.28, state.zoom + Number(button.dataset.zoom)));
      renderBuilder();
    });
  });

  document.querySelector("[data-randomize]")?.addEventListener("click", () => {
    const presets = Object.values(presetData);
    const base = presets[Math.floor(Math.random() * presets.length)];
    applyDesign({
      ...base,
      spin: -24 + Math.round(Math.random() * 48),
      sprinkles: Math.round(Math.random() * 80),
      gloss: 20 + Math.round(Math.random() * 80),
      topperScale: 80 + Math.round(Math.random() * 60),
    });
  });

  document.querySelector("#saveDesign")?.addEventListener("click", saveCurrentDesign);

  document.querySelector("#cakeForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    addCurrentDesignToCart();
  });

  let dragStart = null;
  const scene = document.querySelector("#cakeScene");
  scene?.addEventListener("pointerdown", (event) => {
    dragStart = { x: event.clientX, spin: state.spin };
    scene.setPointerCapture(event.pointerId);
  });
  scene?.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    state.spin = dragStart.spin + (event.clientX - dragStart.x) * 0.2;
    renderBuilder();
  });
  scene?.addEventListener("pointerup", () => {
    dragStart = null;
  });
}

const profileDefaults = {
  contact: {
    name: "Faeye The Wise",
    email: "faeye@example.com",
    phone: "+1 (555) 123-4567",
  },
  addresses: [
    {
      id: "default",
      label: "Default Delivery Point",
      line1: "123 Cake Lane",
      city: "Sweet City",
      state: "CA",
      zip: "90210",
      country: "United States",
    },
    {
      id: "studio",
      label: "Event Studio",
      line1: "45 Celebration Ave",
      city: "Sweet City",
      state: "CA",
      zip: "90211",
      country: "United States",
    },
  ],
};

const checkoutSteps = ["Contact", "Delivery", "Review", "Payment", "Confirmation"];
let checkoutState = null;

function orders() {
  return readJson(ORDERS_KEY, []);
}

function formatDateForInput(date) {
  return date.toISOString().slice(0, 10);
}

function defaultDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return formatDateForInput(date);
}

function displayDate(value) {
  if (!value) return "Not selected";
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatAddress(address) {
  if (!address) return "No delivery address selected";
  return `${address.line1}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
}

function addressLines(address) {
  if (!address) return ["No delivery address selected"];
  return [address.line1, `${address.city}, ${address.state} ${address.zip}`, address.country];
}

function checkoutDefaults() {
  return {
    step: 0,
    contact: { ...profileDefaults.contact, updates: true },
    delivery: {
      addressMode: "saved",
      savedAddressId: "default",
      customAddress: {
        line1: "",
        city: "",
        state: "",
        zip: "",
        country: "United States",
      },
      date: defaultDeliveryDate(),
      timeWindow: "10:00 AM - 2:00 PM",
      notes: "",
    },
    payment: {
      method: "card",
      cardNumber: "1234 5678 9012 3456",
      expiry: "",
      cvc: "",
      nameOnCard: profileDefaults.contact.name,
    },
    order: null,
  };
}

function getCheckoutState() {
  const stored = readJson(CHECKOUT_KEY, {});
  const defaults = checkoutDefaults();
  return {
    ...defaults,
    ...stored,
    contact: { ...defaults.contact, ...(stored.contact || {}) },
    delivery: {
      ...defaults.delivery,
      ...(stored.delivery || {}),
      customAddress: { ...defaults.delivery.customAddress, ...((stored.delivery || {}).customAddress || {}) },
    },
    payment: { ...defaults.payment, ...(stored.payment || {}) },
  };
}

function saveCheckoutState() {
  writeJson(CHECKOUT_KEY, checkoutState);
}

function selectedDeliveryAddress() {
  if (!checkoutState) return profileDefaults.addresses[0];
  if (checkoutState.delivery.addressMode === "new") return checkoutState.delivery.customAddress;
  return profileDefaults.addresses.find((address) => address.id === checkoutState.delivery.savedAddressId) || profileDefaults.addresses[0];
}

function checkoutItemTitle(item) {
  return item.design.message?.trim() || "Custom CakeBuilder Demo";
}

function checkoutItemMeta(item) {
  const flavor = labels.flavor[item.design.flavor] || "Vanilla bean";
  const size = `${item.design.diameter || 8} inch`;
  return `${size}, ${flavor}`;
}

function checkoutItemServes(item) {
  const diameter = Number(item.design.diameter || 8);
  const tiers = Number(item.design.tiers || 1);
  return `Serves ~${Math.max(8, Math.round(diameter * tiers * 1.8))}`;
}

function checkoutPricing(items = cart()) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.estimate?.usd || 0), 0);
  const deliveryFee = subtotal ? 10 : 0;
  const tax = subtotal ? Math.round((subtotal + deliveryFee) * 0.086 * 100) / 100 : 0;
  return {
    subtotal,
    deliveryFee,
    tax,
    total: Math.round((subtotal + deliveryFee + tax) * 100) / 100,
  };
}

function checkoutThumbClass(index) {
  return ["thumb-teal", "thumb-lemon", "thumb-ivory", "thumb-ocean", "thumb-minimal"][index % 5];
}

function orderSummaryMarkup(items = cart(), pricingOverride = null) {
  const pricing = pricingOverride || checkoutPricing(items);
  if (!items.length) {
    return `
      <article class="checkout-summary-card-empty">
        <h2>Order Summary</h2>
        <p>No cakes are in the cart yet.</p>
        <a class="secondary-action full" href="builder.html">Open Cake Designer</a>
      </article>
    `;
  }

  return `
    <div class="checkout-summary-heading">
      <h2>Order Summary</h2>
      <span>${items.length} item${items.length === 1 ? "" : "s"}</span>
    </div>
    <div class="checkout-summary-items">
      ${items
        .map(
          (item, index) => `
            <article class="checkout-summary-item">
              <span class="order-cake-thumb ${checkoutThumbClass(index)}" aria-hidden="true"></span>
              <div>
                <strong>${escapeHtml(checkoutItemTitle(item))}</strong>
                <small>${escapeHtml(checkoutItemMeta(item))}</small>
                <small>${escapeHtml(checkoutItemServes(item))}</small>
              </div>
              <b>${formatUsd(item.estimate?.usd || 0)}</b>
            </article>
          `
        )
        .join("")}
    </div>
    <div class="checkout-price-lines">
      <div><span>Subtotal</span><strong>${formatUsd(pricing.subtotal)}</strong></div>
      <div><span>Delivery Fee</span><strong>${formatUsd(pricing.deliveryFee)}</strong></div>
      <div><span>Estimated Tax</span><strong>${formatUsd(pricing.tax)}</strong></div>
      <div class="checkout-total-line"><span>Total</span><strong>${formatUsd(pricing.total)}</strong></div>
    </div>
  `;
}

function updateCheckoutSummary() {
  const confirmedOrder = checkoutState?.step === 4 ? checkoutState.order || orders()[0] : null;
  const items = confirmedOrder ? confirmedOrder.items : cart();
  const pricing = confirmedOrder ? confirmedOrder.pricing : checkoutPricing(items);
  const summary = orderSummaryMarkup(items, pricing);
  document.querySelector("#orderSummaryDesktop").innerHTML = summary;
  document.querySelector("#orderSummaryMobile").innerHTML = summary;
  const mobileTotal = document.querySelector("#mobileSummaryTotal");
  if (mobileTotal) mobileTotal.textContent = formatUsd(pricing.total);
}

function renderCheckoutStepper() {
  const stepper = document.querySelector("#checkoutStepper");
  if (!stepper) return;
  stepper.innerHTML = checkoutSteps
    .map((label, index) => {
      const isDone = index < checkoutState.step;
      const isCurrent = index === checkoutState.step;
      return `
        <li class="${isDone ? "done" : ""} ${isCurrent ? "current" : ""}">
          <span>${isDone ? "✓" : index + 1}</span>
          <strong>${label}</strong>
        </li>
      `;
    })
    .join("");
}

function emptyCheckoutMarkup() {
  return `
    <section class="checkout-step-inner">
      <p class="eyebrow">Empty cart</p>
      <h2>Your checkout is ready when the cake is.</h2>
      <p>Add a cake from the designer and the guided checkout will collect contact, delivery, review, and payment details.</p>
      <div class="checkout-actions">
        <a class="primary-button" href="builder.html">Open Cake Designer</a>
        <a class="secondary-action" href="index.html">Return Home</a>
      </div>
    </section>
  `;
}

function fieldValue(path) {
  return path.split(".").reduce((value, key) => value?.[key], checkoutState) ?? "";
}

function contactStepMarkup() {
  return `
    <form class="checkout-step-inner" data-checkout-form="contact">
      <div class="checkout-section-title">
        <p class="eyebrow">Step 1</p>
        <h2>Contact Information</h2>
        <p>We will use this information to contact you about the mock order.</p>
      </div>
      <label>Full Name
        <input required autocomplete="name" data-checkout-field="contact.name" value="${escapeHtml(fieldValue("contact.name"))}" />
      </label>
      <label>Email Address
        <input required type="email" autocomplete="email" data-checkout-field="contact.email" value="${escapeHtml(fieldValue("contact.email"))}" />
      </label>
      <label>Phone Number
        <input required type="tel" autocomplete="tel" data-checkout-field="contact.phone" value="${escapeHtml(fieldValue("contact.phone"))}" />
      </label>
      <label class="checkout-check-row">
        <input type="checkbox" data-checkout-field="contact.updates" ${checkoutState.contact.updates ? "checked" : ""} />
        <span>Email me order updates and offers</span>
      </label>
      <div class="checkout-actions">
        <a class="checkout-back-link" href="builder.html">Back to Cart</a>
        <button class="primary-button" type="submit">Continue to Delivery</button>
      </div>
    </form>
  `;
}

function deliveryStepMarkup() {
  const selected = selectedDeliveryAddress();
  return `
    <form class="checkout-step-inner" data-checkout-form="delivery">
      <div class="checkout-section-title">
        <p class="eyebrow">Step 2</p>
        <h2>Delivery Information</h2>
        <p>Choose where and when you would like the cake delivered.</p>
      </div>
      <fieldset class="checkout-fieldset">
        <legend>Saved Addresses</legend>
        <div class="saved-address-grid">
          ${profileDefaults.addresses
            .map(
              (address) => `
                <label class="saved-address-card ${checkoutState.delivery.addressMode === "saved" && checkoutState.delivery.savedAddressId === address.id ? "selected" : ""}">
                  <input type="radio" name="addressMode" value="${address.id}" data-saved-address ${checkoutState.delivery.addressMode === "saved" && checkoutState.delivery.savedAddressId === address.id ? "checked" : ""} />
                  <strong>${escapeHtml(address.label)}</strong>
                  <span>${escapeHtml(address.line1)}</span>
                  <span>${escapeHtml(`${address.city}, ${address.state} ${address.zip}`)}</span>
                  <span>${escapeHtml(address.country)}</span>
                </label>
              `
            )
            .join("")}
        </div>
        <label class="new-address-toggle">
          <input type="radio" name="addressMode" value="new" data-new-address ${checkoutState.delivery.addressMode === "new" ? "checked" : ""} />
          <span>Use a different address</span>
        </label>
      </fieldset>
      <div class="custom-address-fields ${checkoutState.delivery.addressMode === "new" ? "active" : ""}">
        <label>Delivery Address
          <input autocomplete="street-address" data-checkout-field="delivery.customAddress.line1" ${checkoutState.delivery.addressMode === "new" ? "required" : ""} value="${escapeHtml(fieldValue("delivery.customAddress.line1"))}" />
        </label>
        <div class="checkout-two-col">
          <label>City
            <input autocomplete="address-level2" data-checkout-field="delivery.customAddress.city" ${checkoutState.delivery.addressMode === "new" ? "required" : ""} value="${escapeHtml(fieldValue("delivery.customAddress.city"))}" />
          </label>
          <label>State
            <input autocomplete="address-level1" data-checkout-field="delivery.customAddress.state" ${checkoutState.delivery.addressMode === "new" ? "required" : ""} value="${escapeHtml(fieldValue("delivery.customAddress.state"))}" />
          </label>
        </div>
        <div class="checkout-two-col">
          <label>ZIP Code
            <input autocomplete="postal-code" data-checkout-field="delivery.customAddress.zip" ${checkoutState.delivery.addressMode === "new" ? "required" : ""} value="${escapeHtml(fieldValue("delivery.customAddress.zip"))}" />
          </label>
          <label>Country
            <input autocomplete="country-name" data-checkout-field="delivery.customAddress.country" value="${escapeHtml(fieldValue("delivery.customAddress.country"))}" />
          </label>
        </div>
      </div>
      <div class="checkout-section-title small">
        <h3>Delivery Date & Time</h3>
      </div>
      <div class="checkout-two-col">
        <label>Delivery Date
          <input required type="date" data-checkout-field="delivery.date" value="${escapeHtml(checkoutState.delivery.date)}" />
        </label>
        <label>Delivery Time Window
          <select required data-checkout-field="delivery.timeWindow">
            ${["10:00 AM - 2:00 PM", "2:00 PM - 6:00 PM", "6:00 PM - 8:00 PM"]
              .map((windowLabel) => `<option value="${windowLabel}" ${checkoutState.delivery.timeWindow === windowLabel ? "selected" : ""}>${windowLabel}</option>`)
              .join("")}
          </select>
        </label>
      </div>
      <label>Optional Delivery Notes
        <textarea rows="4" data-checkout-field="delivery.notes" placeholder="Gate code, drop-off instructions, or event timing">${escapeHtml(checkoutState.delivery.notes)}</textarea>
      </label>
      <div class="checkout-info-note">
        Orders must be placed at least 24 hours in advance. Large event cakes may require 72 hours.
      </div>
      <div class="checkout-actions">
        <button class="checkout-back-link" type="button" data-step-target="0">Back to Contact Information</button>
        <button class="primary-button" type="submit">Continue to Review</button>
      </div>
      <p class="sr-only">Selected delivery address: ${escapeHtml(formatAddress(selected))}</p>
    </form>
  `;
}

function reviewCard(title, body, editStep) {
  return `
    <article class="review-info-card">
      <div>
        <h3>${title}</h3>
        ${body}
      </div>
      <button class="link-button" type="button" data-step-target="${editStep}">Edit</button>
    </article>
  `;
}

function reviewStepMarkup() {
  const address = selectedDeliveryAddress();
  const items = cart();
  const pricing = checkoutPricing(items);
  return `
    <section class="checkout-step-inner">
      <div class="checkout-section-title">
        <p class="eyebrow">Step 3</p>
        <h2>Review Order</h2>
        <p>Please review the full demo order before continuing to payment.</p>
      </div>
      <div class="review-stack">
        ${reviewCard(
          "Contact Information",
          `<p>${escapeHtml(checkoutState.contact.name)}</p><p>${escapeHtml(checkoutState.contact.email)}</p><p>${escapeHtml(checkoutState.contact.phone)}</p>`,
          0
        )}
        ${reviewCard(
          "Delivery Information",
          `<p>${addressLines(address).map(escapeHtml).join("<br />")}</p><p>${displayDate(checkoutState.delivery.date)} / ${escapeHtml(checkoutState.delivery.timeWindow)}</p><p>${escapeHtml(checkoutState.delivery.notes || "No delivery notes")}</p>`,
          1
        )}
        <article class="review-info-card wide">
          <div>
            <h3>Cake Details</h3>
            <div class="review-cake-list">
              ${items
                .map(
                  (item, index) => `
                    <div class="review-cake-row">
                      <span class="order-cake-thumb ${checkoutThumbClass(index)}" aria-hidden="true"></span>
                      <div>
                        <strong>${escapeHtml(checkoutItemTitle(item))}</strong>
                        <small>${escapeHtml(checkoutItemMeta(item))}</small>
                        <small>${escapeHtml((item.design.decorations || []).map((decor) => labels.decor[decor] || decor).join(", ") || "No decorations selected")}</small>
                      </div>
                      <span>Qty 1</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        </article>
        <article class="review-info-card wide">
          <div>
            <h3>Pricing Breakdown</h3>
            <div class="checkout-price-lines review-lines">
              <div><span>Subtotal</span><strong>${formatUsd(pricing.subtotal)}</strong></div>
              <div><span>Delivery Fee</span><strong>${formatUsd(pricing.deliveryFee)}</strong></div>
              <div><span>Tax</span><strong>${formatUsd(pricing.tax)}</strong></div>
              <div class="checkout-total-line"><span>Total</span><strong>${formatUsd(pricing.total)}</strong></div>
            </div>
          </div>
        </article>
      </div>
      <div class="checkout-actions">
        <button class="checkout-back-link" type="button" data-step-target="1">Back to Delivery</button>
        <button class="primary-button" type="button" data-step-target="3">Continue to Payment</button>
      </div>
    </section>
  `;
}

function paymentStepMarkup() {
  const pricing = checkoutPricing();
  return `
    <form class="checkout-step-inner" data-checkout-form="payment">
      <div class="checkout-section-title">
        <p class="eyebrow">Step 4</p>
        <h2>Payment</h2>
        <p>This is a demo checkout. No card is charged and no payment data is submitted.</p>
      </div>
      <div class="payment-total-card">
        <span>Order total</span>
        <strong>${formatUsd(pricing.total)}</strong>
      </div>
      <fieldset class="checkout-fieldset">
        <legend>Payment Method</legend>
        <label class="payment-method-card active">
          <input type="radio" name="paymentMethod" value="card" checked />
          <span>Credit / Debit Card</span>
          <strong>Demo</strong>
        </label>
        <button class="payment-method-card future" type="button" data-coming-soon>Apple Pay <span>Future</span></button>
        <button class="payment-method-card future" type="button" data-coming-soon>Google Pay <span>Future</span></button>
        <button class="payment-method-card future" type="button" data-coming-soon>PayPal <span>Future</span></button>
      </fieldset>
      <div class="card-fields">
        <label>Card Number
          <input required inputmode="numeric" autocomplete="cc-number" data-checkout-field="payment.cardNumber" value="${escapeHtml(checkoutState.payment.cardNumber)}" />
        </label>
        <div class="checkout-two-col">
          <label>Expiration Date
            <input required autocomplete="cc-exp" placeholder="MM / YY" data-checkout-field="payment.expiry" value="${escapeHtml(checkoutState.payment.expiry)}" />
          </label>
          <label>CVC
            <input required inputmode="numeric" autocomplete="cc-csc" data-checkout-field="payment.cvc" value="${escapeHtml(checkoutState.payment.cvc)}" />
          </label>
        </div>
        <label>Name on Card
          <input required autocomplete="cc-name" data-checkout-field="payment.nameOnCard" value="${escapeHtml(checkoutState.payment.nameOnCard)}" />
        </label>
      </div>
      <p class="checkout-secure-note">Payment information is mocked for the demo and remains in this browser only.</p>
      <div class="checkout-actions">
        <button class="checkout-back-link" type="button" data-step-target="2">Back to Review</button>
        <button class="primary-button" type="submit">Place Order</button>
      </div>
    </form>
  `;
}

function createOrder() {
  const existingOrders = orders();
  const pricing = checkoutPricing();
  const address = selectedDeliveryAddress();
  const order = {
    id: Date.now(),
    number: `ORD-${String(1005 + existingOrders.length).padStart(4, "0")}`,
    receiptId: `RCT-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: "Demo confirmed",
    contact: { ...checkoutState.contact },
    delivery: {
      ...checkoutState.delivery,
      address: { ...address },
    },
    items: cart(),
    pricing,
  };
  writeJson(ORDERS_KEY, [order, ...existingOrders].slice(0, 20));
  writeJson(CART_KEY, []);
  updateGlobalCartCount();
  checkoutState.step = 4;
  checkoutState.order = order;
  saveCheckoutState();
}

function confirmationStepMarkup() {
  const order = checkoutState.order || orders()[0];
  if (!order) return emptyCheckoutMarkup();
  return `
    <section class="checkout-step-inner confirmation-step">
      <div class="confirmation-mark" aria-hidden="true">✓</div>
      <div class="checkout-section-title centered">
        <p class="eyebrow">Step 5</p>
        <h2>Order Confirmed</h2>
        <p>Thank you, ${escapeHtml(order.contact.name)}. Your demo order has been placed successfully.</p>
      </div>
      <div class="mock-order-number">
        <span>Order ID</span>
        <strong>#${escapeHtml(order.number)}</strong>
      </div>
      <article class="confirmation-next-card">
        <h3>What is next?</h3>
        <p>This mock confirmation has been saved to local storage and will appear in the profile order history.</p>
        <div class="confirmation-details-grid">
          <div><span>Order Date</span><strong>${displayDate(order.createdAt.slice(0, 10))}</strong></div>
          <div><span>Delivery Date</span><strong>${displayDate(order.delivery.date)}</strong></div>
          <div><span>Delivery Address</span><strong>${escapeHtml(addressLines(order.delivery.address).join(", "))}</strong></div>
        </div>
      </article>
      <div class="checkout-actions confirmation-actions">
        <a class="secondary-action" href="profile.html#order-history">View Order History</a>
        <a class="primary-button" href="index.html">Return to Home</a>
      </div>
    </section>
  `;
}

function renderCheckoutStep() {
  const target = document.querySelector("#checkoutStepContent");
  if (!target) return;
  const items = cart();
  renderCheckoutStepper();
  updateCheckoutSummary();

  if (!items.length && checkoutState.step !== 4) {
    target.innerHTML = emptyCheckoutMarkup();
    return;
  }

  const templates = [contactStepMarkup, deliveryStepMarkup, reviewStepMarkup, paymentStepMarkup, confirmationStepMarkup];
  target.innerHTML = templates[checkoutState.step]();
  initComingSoonActions(target);
}

function setCheckoutField(path, value) {
  const keys = path.split(".");
  let current = checkoutState;
  keys.slice(0, -1).forEach((key) => {
    current = current[key];
  });
  current[keys[keys.length - 1]] = value;
  saveCheckoutState();
}

function goToCheckoutStep(step) {
  checkoutState.step = Math.max(0, Math.min(4, step));
  saveCheckoutState();
  renderCheckoutStep();
  document.querySelector("#checkoutTitle")?.focus?.();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initCheckout() {
  if (!document.querySelector("#checkoutStepContent")) return;
  checkoutState = getCheckoutState();
  if (cart().length && checkoutState.step === 4) {
    checkoutState = checkoutDefaults();
    saveCheckoutState();
  }
  renderCheckoutStep();

  document.addEventListener("input", (event) => {
    const field = event.target.closest("[data-checkout-field]");
    if (!field) return;
    setCheckoutField(field.dataset.checkoutField, field.type === "checkbox" ? field.checked : field.value);
  });

  document.addEventListener("change", (event) => {
    const savedAddress = event.target.closest("[data-saved-address]");
    const newAddress = event.target.closest("[data-new-address]");
    if (savedAddress) {
      checkoutState.delivery.addressMode = "saved";
      checkoutState.delivery.savedAddressId = savedAddress.value;
      saveCheckoutState();
      renderCheckoutStep();
    }
    if (newAddress) {
      checkoutState.delivery.addressMode = "new";
      saveCheckoutState();
      renderCheckoutStep();
    }
  });

  document.addEventListener("click", (event) => {
    const stepButton = event.target.closest("[data-step-target]");
    if (!stepButton) return;
    event.preventDefault();
    goToCheckoutStep(Number(stepButton.dataset.stepTarget));
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-checkout-form]");
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (form.dataset.checkoutForm === "contact") {
      goToCheckoutStep(1);
      return;
    }

    if (form.dataset.checkoutForm === "delivery") {
      goToCheckoutStep(2);
      return;
    }

    if (form.dataset.checkoutForm === "payment") {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Processing...";
      }
      setTimeout(() => {
        createOrder();
        renderCheckoutStep();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 900);
    }
  });
}

const mockProfileDesigns = [
  { name: "Teal Elegance", date: "Saved on May 12, 2024", theme: "thumb-teal" },
  { name: "Lemon Dream", date: "Saved on Apr 28, 2024", theme: "thumb-lemon" },
  { name: "Ivory Bliss", date: "Saved on Apr 15, 2024", theme: "thumb-ivory" },
  { name: "Ocean Breeze", date: "Saved on Mar 30, 2024", theme: "thumb-ocean" },
  { name: "Minimal Chic", date: "Saved on Mar 18, 2024", theme: "thumb-minimal" },
];

const mockProfileOrders = [
  {
    number: "ORD-1004",
    date: "May 20, 2024",
    cake: "Teal Elegance",
    meta: "8 inch, vanilla",
    status: "Delivered",
    total: "$75",
    theme: "thumb-teal",
  },
  {
    number: "ORD-1003",
    date: "Apr 28, 2024",
    cake: "Lemon Dream",
    meta: "6 inch, lemon",
    status: "Delivered",
    total: "$55",
    theme: "thumb-lemon",
  },
  {
    number: "ORD-1002",
    date: "Apr 10, 2024",
    cake: "Ivory Bliss",
    meta: "8 inch, vanilla",
    status: "Delivered",
    total: "$70",
    theme: "thumb-ivory",
  },
];

function renderProfileDesigns(target) {
  const designs = savedDesigns();
  const cards = designs.length
    ? designs.map((item, index) => ({
        name: item.name,
        date: `${formatUsd(item.estimate.usd)} estimated quote`,
        detail: designSummary(item.design),
        theme: ["thumb-teal", "thumb-lemon", "thumb-ivory", "thumb-ocean", "thumb-minimal"][index % 5],
      }))
    : mockProfileDesigns;

  target.innerHTML = cards
    .map(
      (item) => `
        <article class="profile-design-card">
          <span class="profile-design-thumb ${item.theme}" aria-hidden="true"></span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.date)}</small>
          ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}
        </article>
      `
    )
    .join("");
}

function renderProfileOrders(target) {
  const completedOrders = orders();
  const rows = completedOrders.length
    ? completedOrders.map((order, index) => {
        const firstItem = order.items[0];
        return {
          number: order.number,
          date: displayDate(order.createdAt.slice(0, 10)),
          cake: firstItem ? checkoutItemTitle(firstItem) : "Custom CakeBuilder Demo",
          meta: firstItem ? checkoutItemMeta(firstItem) : "Demo cake",
          status: order.status || "Demo confirmed",
          total: formatUsd(order.pricing.total),
          theme: checkoutThumbClass(index),
          receipt: order.receiptId,
        };
      })
    : mockProfileOrders;

  target.innerHTML = rows
    .map(
      (order) => `
        <tr>
          <td>#${escapeHtml(order.number)}</td>
          <td>${escapeHtml(order.date)}</td>
          <td><span class="order-cake-thumb ${order.theme}" aria-hidden="true"></span> ${escapeHtml(order.cake)}<br /><small>${escapeHtml(order.meta)}</small></td>
          <td><span class="delivered-pill">${escapeHtml(order.status)}</span></td>
          <td>${escapeHtml(order.total)}</td>
          <td><button class="receipt-button" type="button" aria-label="Open receipt ${escapeHtml(order.receipt || order.number)}" data-coming-soon>View</button></td>
        </tr>
      `
    )
    .join("");
}

function showComingSoonToast() {
  let toast = document.querySelector("#comingSoonToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "comingSoonToast";
    toast.className = "coming-soon-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.textContent = "Coming soon";
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
}

function initComingSoonActions(scope = document) {
  scope.querySelectorAll("[data-coming-soon]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      showComingSoonToast();
    });
  });
}

function initProfile() {
  const target = document.querySelector("#savedDesigns");
  if (!target) return;
  const orderTarget = document.querySelector("#orderHistoryRows");
  renderProfileDesigns(target);
  if (orderTarget) renderProfileOrders(orderTarget);
  initComingSoonActions();

  document.querySelector("#clearSaved")?.addEventListener("click", () => {
    writeJson(SAVED_KEY, []);
    renderProfileDesigns(target);
    const status = document.querySelector("#savedDesignsStatus");
    if (status) status.textContent = "Saved demo designs reset to the mock profile examples.";
  });
}

updateGlobalCartCount();
initNavigation();
initBuilder();
initCheckout();
initProfile();
