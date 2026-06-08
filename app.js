const CART_KEY = "ctc_mock_cart";
const SAVED_KEY = "ctc_saved_designs";

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

function renderCheckout() {
  const list = document.querySelector("#checkoutItems");
  if (!list) return;

  const items = cart();
  const totalUsd = items.reduce((sum, item) => sum + item.estimate.usd, 0);
  const totalHours = items.reduce((sum, item) => sum + item.estimate.hours, 0);

  document.querySelector("#summaryItems").textContent = String(items.length);
  document.querySelector("#summaryUsd").textContent = formatUsd(totalUsd);
  document.querySelector("#summaryPrep").textContent = `${totalHours.toFixed(1)} hrs`;

  if (!items.length) {
    list.innerHTML = '<p class="empty-cart">No cakes yet. Build a custom cake and it will appear here.</p>';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <article class="checkout-item">
          <div>
            <h2>${escapeHtml(item.design.message || "Custom CakeBuilder Demo")}</h2>
            <p>${escapeHtml(designSummary(item.design))}</p>
            <p>${escapeHtml(item.design.decorations.map((decor) => labels.decor[decor]).join(", ") || "No decorations selected")}</p>
          </div>
          <div class="mini-quote">
            <strong>${formatUsd(item.estimate.usd)}</strong>
            <span>${item.estimate.hours.toFixed(1)} hrs</span>
          </div>
          <button class="tool-button" type="button" data-remove-cart="${item.id}">Remove</button>
        </article>
      `
    )
    .join("");
}

function initCheckout() {
  const list = document.querySelector("#checkoutItems");
  if (!list) return;
  renderCheckout();
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-cart]");
    if (!button) return;
    writeJson(
      CART_KEY,
      cart().filter((item) => String(item.id) !== button.dataset.removeCart)
    );
    updateGlobalCartCount();
    renderCheckout();
  });

  document.querySelector("#requestButton")?.addEventListener("click", () => {
    const status = document.querySelector("#requestStatus");
    if (!cart().length) {
      status.textContent = "Add at least one cake before creating a test request.";
      return;
    }
    status.textContent = "Test request created. No backend, payment, or real submission happened.";
  });

  document.querySelector("#clearCart")?.addEventListener("click", () => {
    writeJson(CART_KEY, []);
    updateGlobalCartCount();
    renderCheckout();
    const status = document.querySelector("#requestStatus");
    if (status) status.textContent = "Demo cart cleared.";
  });
}

function initProfile() {
  const target = document.querySelector("#savedDesigns");
  if (!target) return;
  const designs = savedDesigns();
  if (!designs.length) {
    target.textContent = "No design saved yet.";
  } else {
    target.innerHTML = designs
      .map(
        (item) => `
          <div class="saved-design">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(designSummary(item.design))}</span>
            <span>${formatUsd(item.estimate.usd)}</span>
          </div>
        `
      )
      .join("");
  }

  document.querySelector("#clearSaved")?.addEventListener("click", () => {
    writeJson(SAVED_KEY, []);
    target.textContent = "Saved demo designs cleared.";
  });
}

updateGlobalCartCount();
initBuilder();
initCheckout();
initProfile();
