import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const CART_KEY = "ctc_mock_cart";
const SAVED_KEY = "ctc_saved_designs";
const { calculateCakeEstimate, money } = window.CakeBuilderConfig;

const cakeTypes = {
  wedding: {
    title: "Wedding cake",
    note: "Wedding cakes start from a polished default preview. Pick up to 2 decoration sets.",
    limit: 2,
    defaults: {
      tiers: 3,
      flavor: "vanilla",
      finish: "fondant",
      baseColor: "#fff1d8",
      accentColor: "#d9a441",
      message: "Forever",
      decorations: ["flowers", "pearls"],
    },
    decorations: [
      { id: "flowers", label: "Sugar flowers", description: "Cascading floral clusters across the tiers.", zone: "front cascade" },
      { id: "lace", label: "Lace piping", description: "Delicate piped lace around each tier.", zone: "side bands" },
      { id: "pearls", label: "Pearl ring", description: "Small pearl details for a refined edge.", zone: "tier rims" },
      { id: "goldLeaf", label: "Gold leaf", description: "Metallic accent flakes and trim.", zone: "side accents" },
      { id: "monogram", label: "Monogram topper", description: "Initials or short name as a topper.", zone: "top center" },
    ],
  },
  party: {
    title: "Party cake",
    note: "Party cakes are allowed to be louder. Pick up to 5 decoration sets.",
    limit: 5,
    defaults: {
      tiers: 2,
      flavor: "redVelvet",
      finish: "glossy",
      baseColor: "#f4a896",
      accentColor: "#e97863",
      message: "Too much",
      decorations: ["candles", "sprinkles", "cherries"],
    },
    decorations: [
      { id: "candles", label: "Tall candles", description: "Colorful party candles.", zone: "inset top ring" },
      { id: "sprinkles", label: "Sprinkle blast", description: "Bright sprinkle scatter on top.", zone: "top surface" },
      { id: "cherries", label: "Cherry pop", description: "Glossy red cherries.", zone: "top edge" },
      { id: "balloons", label: "Balloon toppers", description: "Playful floating topper shapes.", zone: "back corners" },
      { id: "brownies", label: "Brownie chunks", description: "Chocolate blocks and bites.", zone: "side shelves" },
    ],
  },
  custom: {
    title: "Custom cake",
    note: "Custom keeps the menu flexible. Pick up to 5 decoration sets.",
    limit: 5,
    defaults: {
      tiers: 2,
      flavor: "lemon",
      finish: "smooth",
      baseColor: "#fff4df",
      accentColor: "#0f766e",
      message: "Crack it",
      decorations: ["drip", "stars"],
    },
    decorations: [
      { id: "drip", label: "Signature drip", description: "Glossy demo color drip around the upper rim.", zone: "upper rims" },
      { id: "stars", label: "Gold stars", description: "Small metallic star accents.", zone: "front sparkle" },
      { id: "fruit", label: "Fresh fruit", description: "Fruit garnish for color and texture.", zone: "top trio" },
      { id: "charms", label: "Sticker charms", description: "Social-media style mini charms.", zone: "side accents" },
      { id: "messageTopper", label: "Message topper", description: "A short phrase or occasion topper.", zone: "top center" },
    ],
  },
};

const messageLimits = {
  1: 26,
  2: 20,
  3: 16,
  4: 12,
};

const labels = {
  flavor: {
    vanilla: "Vanilla bean",
    redVelvet: "Red velvet",
    lemon: "Lemon cream",
    caramel: "Salted caramel",
    espresso: "Espresso brownie",
  },
  finish: {
    smooth: "Smooth buttercream",
    glossy: "Glossy glaze",
    textured: "Textured frosting",
    fondant: "Fondant clean edge",
  },
  decor: {
    flowers: "Sugar flowers",
    lace: "Lace piping",
    pearls: "Pearl ring",
    goldLeaf: "Gold leaf",
    monogram: "Monogram topper",
    candles: "Tall candles",
    sprinkles: "Sprinkle blast",
    cherries: "Cherry pop",
    balloons: "Balloon toppers",
    brownies: "Brownie chunks",
    drip: "Signature drip",
    stars: "Gold stars",
    fruit: "Fresh fruit",
    charms: "Sticker charms",
    messageTopper: "Message topper",
  },
};

const design = {
  cakeType: "wedding",
  tiers: 3,
  flavor: "vanilla",
  finish: "fondant",
  baseColor: "#fff1d8",
  accentColor: "#d9a441",
  message: "Forever",
  decorations: ["flowers", "pearls"],
};

const canvas = document.querySelector("#cakeCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#fff3df");

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const root = new THREE.Group();
scene.add(root);

const hemi = new THREE.HemisphereLight("#fff8ef", "#7b2f2f", 1.8);
scene.add(hemi);

const key = new THREE.DirectionalLight("#fff4df", 3.2);
key.position.set(5, 8, 7);
key.castShadow = true;
scene.add(key);

const rim = new THREE.PointLight("#f4a896", 1, 18);
rim.position.set(-6, 4, -5);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8.5, 96),
  new THREE.MeshStandardMaterial({ color: "#f8dec0", roughness: 0.72 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

let orbit = { theta: 0.72, phi: 0.62, radius: 14 };
let drag = null;
let currentStep = 0;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initialTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const style = params.get("style") || params.get("type");
  return cakeTypes[style] ? style : "wedding";
}

function readJson(keyName, fallback) {
  try {
    return JSON.parse(localStorage.getItem(keyName)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(keyName, value) {
  localStorage.setItem(keyName, JSON.stringify(value));
}

function updateCartCount() {
  const count = readJson(CART_KEY, []).length;
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

function material(color, options = {}) {
  const finish = {
    smooth: { roughness: 0.48, metalness: 0 },
    glossy: { roughness: 0.16, metalness: 0.02 },
    textured: { roughness: 0.78, metalness: 0 },
    fondant: { roughness: 0.34, metalness: 0 },
  }[design.finish];
  return new THREE.MeshStandardMaterial({ color, ...finish, ...options });
}

function clearRoot() {
  while (root.children.length) {
    const child = root.children.pop();
    child.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) node.material.dispose();
    });
  }
}

function addCakeBoard() {
  const boardRadius = tierRadius(0) + 0.62;
  const board = new THREE.Mesh(
    new THREE.CylinderGeometry(boardRadius, boardRadius * 1.02, 0.18, 128),
    material("#f4d6a1", { roughness: 0.38, metalness: 0.02 })
  );
  board.position.y = 0.02;
  board.castShadow = true;
  board.receiveShadow = true;
  root.add(board);

  const boardRim = new THREE.Mesh(new THREE.TorusGeometry(boardRadius * 0.98, 0.07, 10, 128), material(design.accentColor));
  boardRim.position.y = 0.13;
  boardRim.rotation.x = Math.PI / 2;
  root.add(boardRim);
}

function tierRadius(index) {
  return Math.max(1.2, 2.85 - index * 0.45);
}

function topY() {
  return design.tiers * 1.35 + 0.35;
}

function topRadius() {
  return tierRadius(design.tiers - 1);
}

function tierTopY(index) {
  return (index + 1) * 1.35 + 0.08;
}

function tierSideY(index, offset = 0.68) {
  return index * 1.35 + offset;
}

function tierPoint(index, radiusFactor, angle, yOffset = 0.08) {
  const radius = tierRadius(index) * radiusFactor;
  return {
    x: Math.cos(angle) * radius,
    y: tierTopY(index) + yOffset,
    z: Math.sin(angle) * radius,
  };
}

function messageLimit() {
  return messageLimits[design.tiers] || 16;
}

function enforceMessageLimit() {
  const limit = messageLimit();
  if (design.message.length > limit) design.message = design.message.slice(0, limit);
  const input = document.querySelector("#message");
  const help = document.querySelector("#messageHelp");
  if (input) {
    input.maxLength = limit;
    input.value = design.message;
  }
  if (help) {
    help.textContent = `${design.message.length} of ${limit} characters. More tiers leave less room on the top tier.`;
  }
}

function makeTier(index) {
  const radius = tierRadius(index);
  const height = 1.35;
  const y = index * height + height / 2;
  const group = new THREE.Group();
  group.position.y = index * height;

  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.98, height, 96), material(design.baseColor));
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.01, radius * 1.01, 0.08, 96),
    material(design.baseColor, { color: new THREE.Color(design.baseColor).offsetHSL(0, 0.02, 0.04) })
  );
  top.position.y = height + 0.04;
  top.castShadow = true;
  group.add(top);

  const trim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.97, 0.07, 10, 96), material(design.accentColor));
  trim.position.y = height + 0.08;
  trim.rotation.x = Math.PI / 2;
  trim.castShadow = true;
  group.add(trim);

  const lowerTrim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.96, 0.035, 8, 96), material(design.accentColor));
  lowerTrim.position.y = 0.08;
  lowerTrim.rotation.x = Math.PI / 2;
  lowerTrim.castShadow = true;
  group.add(lowerTrim);

  if (design.decorations.includes("drip") || design.finish === "glossy") {
    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * Math.PI * 2;
      const length = 0.22 + ((i * 31) % 38) / 100;
      const drop = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, length, 6, 10), material(design.accentColor));
      drop.position.set(Math.cos(angle) * radius * 0.96, height - length / 2, Math.sin(angle) * radius * 0.96);
      group.add(drop);
    }
  }

  return group;
}

function addSphere(type, x, y, z, color, scale = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 24, 16), material(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  root.add(mesh);
}

function addFlowerCluster(x, y, z, petalColor = "#f3b7c8", centerColor = "#d9a441", scale = 1, yaw = 0) {
  const group = new THREE.Group();
  const petalMaterial = material(petalColor);
  const centerMaterial = material(centerColor, { roughness: 0.24 });
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 18, 10), petalMaterial);
    petal.scale.set(1.55, 0.52, 0.82);
    petal.position.set(Math.cos(angle) * 0.24 * scale, 0.04, Math.sin(angle) * 0.18 * scale);
    petal.rotation.y = angle + yaw;
    petal.rotation.z = 0.12;
    petal.castShadow = true;
    group.add(petal);
  }
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 16, 10), centerMaterial);
  center.position.y = 0.1;
  center.castShadow = true;
  group.add(center);
  const leafMaterial = material("#6b8e4e", { roughness: 0.58 });
  [-1, 1, 1.8].forEach((side) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 14, 8), leafMaterial);
    leaf.scale.set(1.8, 0.34, 0.72);
    leaf.position.set(side * 0.24 * scale, -0.04, -0.12 * scale);
    leaf.rotation.y = yaw + side * 0.62;
    group.add(leaf);
  });
  group.position.set(x, y, z);
  group.rotation.y = yaw;
  root.add(group);
}

function addFlowerBud(x, y, z, color = "#fff8ef", scale = 1) {
  const bud = new THREE.Group();
  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 14, 10), material(color));
  bloom.scale.set(1, 0.82, 1);
  bloom.castShadow = true;
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 12, 8), material("#6b8e4e"));
  leaf.scale.set(1.55, 0.32, 0.68);
  leaf.position.set(0.13 * scale, -0.06 * scale, 0.02 * scale);
  bud.add(bloom, leaf);
  bud.position.set(x, y, z);
  root.add(bud);
}

function addBox(x, y, z, color, scale = 1, rot = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.42 * scale, 0.28 * scale, 0.42 * scale), material(color));
  mesh.position.set(x, y, z);
  mesh.rotation.y = rot;
  mesh.castShadow = true;
  root.add(mesh);
}

function addCone(x, y, z, color, scale = 1) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.24 * scale, 0.54 * scale, 5), material(color, { metalness: 0.28, roughness: 0.24 }));
  mesh.position.set(x, y, z);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  root.add(mesh);
}

function addCandle(x, y, z, color) {
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 18), material(color));
  candle.position.set(x, y + 0.3, z);
  candle.castShadow = true;
  root.add(candle);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.012, 6, 18), material("#fff8ef"));
  stripe.position.set(x, y + 0.42, z);
  stripe.rotation.x = Math.PI / 2;
  root.add(stripe);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), material("#f7c948", { emissive: "#f7a900", emissiveIntensity: 1.4 }));
  flame.position.set(x, y + 0.72, z);
  flame.scale.set(0.7, 1.35, 0.7);
  root.add(flame);
}

function addBow(x, y, z, color) {
  const left = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12), material(color));
  left.scale.set(1.35, 0.62, 0.8);
  left.position.set(x - 0.2, y, z);
  const right = left.clone();
  right.position.x = x + 0.2;
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), material("#fff3df"));
  knot.position.set(x, y, z);
  root.add(left, right, knot);
}

function ringPoint(radius, angle, yOffset = 0) {
  const y = topY() + yOffset;
  return {
    x: Math.cos(angle) * radius,
    y,
    z: Math.sin(angle) * radius,
  };
}

function addPearlRing(radius, count, yOffset = 0.02) {
  for (let i = 0; i < count; i += 1) {
    const point = ringPoint(radius, (i / count) * Math.PI * 2, yOffset);
    addSphere("pearl", point.x, point.y, point.z, "#fff8ef", 0.5);
  }
}

function addSprinklePatch(radius, count) {
  const colors = ["#0f766e", "#f4a896", "#f7c948", "#52bdb6", "#4e2a84"];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + 0.18;
    const innerRadius = radius * (0.28 + ((i * 17) % 42) / 100);
    addBox(
      Math.cos(angle) * innerRadius,
      topY() + 0.05,
      Math.sin(angle) * innerRadius,
      colors[i % colors.length],
      0.26,
      angle
    );
  }
}

function addLaceArc(tierIndex) {
  const radius = tierRadius(tierIndex) * 0.96;
  const count = 14;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.PI * 0.12 + (i / (count - 1)) * Math.PI * 0.76;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), material("#fff8ef"));
    bead.position.set(Math.cos(angle) * radius, tierSideY(tierIndex, 0.95), Math.sin(angle) * radius);
    root.add(bead);
    if (i % 2 === 0) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), material("#fff8ef"));
      drop.position.set(Math.cos(angle) * radius, tierSideY(tierIndex, 0.78), Math.sin(angle) * radius);
      root.add(drop);
    }
  }
}

function addTextSprite() {
  const textCanvas = document.createElement("canvas");
  textCanvas.width = 512;
  textCanvas.height = 160;
  const ctx = textCanvas.getContext("2d");
  const limit = messageLimit();
  const fontSize = Math.max(34, Math.min(58, 72 - design.message.length * 1.45 - (design.tiers - 1) * 3));
  ctx.font = `700 ${fontSize}px Georgia`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#082f49";
  ctx.fillText((design.message || "Celebrate").slice(0, limit), 256, 80, 420);
  const texture = new THREE.CanvasTexture(textCanvas);
  const width = Math.max(1.6, topRadius() * 1.45);
  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width * 0.31),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(0, topY() + 0.09, 0.02);
  root.add(decal);
}

function placeDecorations() {
  const y = topY();
  const top = topRadius();
  const edge = Math.max(0.8, top * 0.82);
  const side = Math.max(0.9, top * 0.72);
  const placements = {
    flowers: () => {
      const palette = ["#f3b7c8", "#fff8ef", "#f7ccd6", "#ffd8a8"];
      const cascade = [
        { tier: design.tiers - 1, factor: 0.48, angle: Math.PI * 0.48, y: 0.18, scale: 0.98 },
        { tier: Math.max(0, design.tiers - 2), factor: 0.9, angle: Math.PI * 0.36, y: 0.03, scale: 0.86 },
        { tier: Math.max(0, design.tiers - 2), factor: 0.92, angle: Math.PI * 0.5, y: -0.22, scale: 0.72 },
        { tier: 0, factor: 0.91, angle: Math.PI * 0.64, y: -0.02, scale: 0.78 },
        { tier: 0, factor: 0.78, angle: Math.PI * 0.76, y: 0.18, scale: 0.58 },
      ].filter((spot, index, spots) => spot.tier < design.tiers && spots.findIndex((candidate) => `${candidate.tier}-${candidate.angle}` === `${spot.tier}-${spot.angle}`) === index);

      cascade.forEach((spot, index) => {
        const point = tierPoint(spot.tier, spot.factor, spot.angle, spot.y);
        addFlowerCluster(point.x, point.y, point.z, palette[index % palette.length], "#d9a441", spot.scale, -spot.angle + Math.PI / 2);
      });

      const budPath = [
        { tier: design.tiers - 1, factor: 0.66, angle: Math.PI * 0.4, y: -0.06 },
        { tier: Math.max(0, design.tiers - 2), factor: 0.96, angle: Math.PI * 0.44, y: -0.42 },
        { tier: Math.max(0, design.tiers - 2), factor: 0.96, angle: Math.PI * 0.58, y: -0.44 },
        { tier: 0, factor: 0.96, angle: Math.PI * 0.54, y: -0.4 },
      ].filter((spot) => spot.tier < design.tiers);

      budPath.forEach((spot, index) => {
        const point = tierPoint(spot.tier, spot.factor, spot.angle, spot.y);
        addFlowerBud(point.x, point.y, point.z, palette[(index + 1) % palette.length], 0.75);
      });
    },
    pearls: () => {
      for (let tier = 0; tier < design.tiers; tier += 1) {
        const count = tier === design.tiers - 1 ? 12 : 18;
        const radius = tierRadius(tier) * 0.92;
        for (let i = 0; i < count; i += 1) {
          const angle = (i / count) * Math.PI * 2;
          addSphere("pearl", Math.cos(angle) * radius, tierSideY(tier, 1.12), Math.sin(angle) * radius, "#fff8ef", 0.42);
        }
      }
    },
    goldLeaf: () => {
      for (let tier = 0; tier < design.tiers; tier += 1) {
        const radius = tierRadius(tier);
        const angle = Math.PI * (1.15 + tier * 0.23);
        addBox(Math.cos(angle) * radius * 0.98, tierSideY(tier, 0.78), Math.sin(angle) * radius * 0.98, "#d9a441", 0.48, angle);
      }
    },
    monogram: () => addCone(0, y + 0.24, -edge, design.accentColor, 1.05),
    candles: () => {
      const radius = topRadius() * 0.58;
      const count = design.cakeType === "party" ? 7 : 5;
      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI * 0.15 + (i / count) * Math.PI * 2;
        addCandle(Math.cos(angle) * radius, y, Math.sin(angle) * radius, design.accentColor);
      }
    },
    sprinkles: () => addSprinklePatch(top, 28),
    cherries: () => {
      const points = [Math.PI * 0.16, Math.PI * 0.42, Math.PI * 0.74, Math.PI * 1.08];
      points.forEach((angle) => {
        const point = tierPoint(design.tiers - 1, 0.72, angle, 0.1);
        addSphere("cherry", point.x, point.y, point.z, "#e51d24", 0.78);
      });
    },
    balloons: () => {
      addSphere("balloon", -side * 0.95, y + 0.68, -edge * 0.92, "#f4a896", 1.0);
      addSphere("balloon", side * 0.95, y + 0.58, -edge * 0.92, "#52bdb6", 1.0);
    },
    brownies: () => {
      addBox(-side * 0.78, y + 0.08, edge * 0.62, "#3a1a12", 0.72, 0.5);
      addBox(side * 0.78, y + 0.08, edge * 0.62, "#3a1a12", 0.72, -0.3);
      if (design.tiers > 1) addBox(0, tierSideY(design.tiers - 2, 1.05), tierRadius(design.tiers - 2) * 0.9, "#3a1a12", 0.58, 0.2);
    },
    stars: () => {
      addCone(-side * 0.84, y + 0.12, edge * 0.35, "#d9a441", 0.65);
      addCone(side * 0.84, y + 0.12, edge * 0.35, "#d9a441", 0.65);
      if (design.tiers > 1) addCone(0, tierSideY(design.tiers - 2, 1.08), tierRadius(design.tiers - 2) * 0.92, "#d9a441", 0.55);
    },
    fruit: () => {
      addSphere("fruit", -side * 0.72, y + 0.05, edge * 0.55, "#f7c948", 0.82);
      addSphere("fruit", side * 0.72, y + 0.05, edge * 0.55, "#e51d24", 0.82);
      addSphere("fruit", 0, y + 0.06, -edge * 0.78, "#52bdb6", 0.72);
    },
    charms: () => {
      addBow(-side, y + 0.12, 0, "#ff7aad");
      addCone(side, y + 0.14, 0, "#52bdb6", 0.7);
    },
    messageTopper: () => addCone(0, y + 0.24, -edge, design.accentColor, 0.98),
  };

  design.decorations.forEach((id) => placements[id]?.());
  if (design.decorations.includes("lace")) {
    for (let tier = 0; tier < design.tiers; tier += 1) addLaceArc(tier);
  }
}

function rebuildScene() {
  clearRoot();
  addCakeBoard();
  for (let i = 0; i < design.tiers; i += 1) root.add(makeTier(i));
  placeDecorations();
  addTextSprite();
  updateEstimate();
}

function calculateEstimate() {
  return calculateCakeEstimate(design);
}

function updateEstimate() {
  const estimate = calculateEstimate();
  document.querySelector("#priceUsd").textContent = money(estimate.usd);
  document.querySelector("#priceNote").textContent = "Mock materials and prep estimate";
  document.querySelector("#prepTime").textContent = `${estimate.hours.toFixed(1)} hrs`;
  document.querySelector("#estimateCopy").textContent = `${cakeTypes[design.cakeType].title}, ${design.decorations.length} decor sets`;
  document.querySelector("#previewUsd").textContent = money(estimate.usd);
  document.querySelector("#previewPrep").textContent = `${estimate.hours.toFixed(1)} hrs`;
  renderReview();
}

function renderReview() {
  const target = document.querySelector("#reviewList");
  if (!target) return;
  const decorText = design.decorations.map((id) => labels.decor[id]).join(", ") || "No decoration sets";
  target.innerHTML = `
    <div><span>Type</span><strong>${cakeTypes[design.cakeType].title}</strong></div>
    <div><span>Tiers</span><strong>${design.tiers}</strong></div>
    <div><span>Flavor</span><strong>${labels.flavor[design.flavor]}</strong></div>
    <div><span>Finish</span><strong>${labels.finish[design.finish]}</strong></div>
    <div><span>Decor</span><strong>${escapeHtml(decorText)}</strong></div>
    <div><span>Message</span><strong>${escapeHtml(design.message || "None")}</strong></div>
  `;
}

function showStep(step) {
  currentStep = Math.max(0, Math.min(6, step));
  document.querySelectorAll(".wizard-step").forEach((node) => {
    node.classList.toggle("active", Number(node.dataset.step) === currentStep);
  });
  document.querySelectorAll(".progress-step").forEach((node) => {
    const index = Number(node.dataset.progressStep);
    node.classList.toggle("active", index === currentStep);
    node.classList.toggle("done", index < currentStep);
  });
  document.querySelector("#prevStep").disabled = currentStep === 0;
  document.querySelector("#nextStep").textContent = currentStep === 6 ? "Review complete" : "Next";
  document.querySelector("#nextStep").disabled = currentStep === 6;
  renderReview();
}

function renderChoices() {
  const config = cakeTypes[design.cakeType];
  const container = document.querySelector("#decorationChoices");
  container.innerHTML = config.decorations
    .map(
      (option) => `
        <label class="choice-card">
          <input type="checkbox" name="decorations" value="${option.id}" ${design.decorations.includes(option.id) ? "checked" : ""} />
          <span>
            <strong>${option.label}</strong>
            <small>${option.description}</small>
            <em>${option.zone}</em>
          </span>
        </label>
      `
    )
    .join("");
  document.querySelector("#decorLegend").textContent = `${config.title} decorations: choose up to ${config.limit}`;
  updateChoiceLimit();
}

function updateChoiceLimit() {
  const config = cakeTypes[design.cakeType];
  document.querySelector("#choiceLimit").textContent = `${design.decorations.length} of ${config.limit} selected`;
}

function setControlValues() {
  enforceMessageLimit();
  document.querySelector("#tiers").value = design.tiers;
  document.querySelector("#flavor").value = design.flavor;
  document.querySelector("#finish").value = design.finish;
  document.querySelector("#baseColor").value = design.baseColor;
  document.querySelector("#accentColor").value = design.accentColor;
  document.querySelector("#message").value = design.message;
}

function applyCakeType(type) {
  Object.assign(design, { cakeType: type }, structuredClone(cakeTypes[type].defaults));
  document.querySelector("#previewTitle").textContent = cakeTypes[type].title;
  document.querySelector("#typeNote").textContent = cakeTypes[type].note;
  document.querySelectorAll("[data-cake-type]").forEach((button) => {
    const active = button.dataset.cakeType === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  setControlValues();
  renderChoices();
  rebuildScene();
}

function saveDesign() {
  const estimate = calculateEstimate();
  const item = {
    id: Date.now(),
    name: design.message.trim() || cakeTypes[design.cakeType].title,
    design: exportDesign(),
    estimate,
  };
  const saved = readJson(SAVED_KEY, []);
  writeJson(SAVED_KEY, [item, ...saved].slice(0, 8));
  const button = document.querySelector("#saveDesign");
  button.textContent = "Saved";
  setTimeout(() => {
    button.textContent = "Save design";
  }, 900);
}

function exportDesign() {
  return {
    ...design,
    shape: "round",
    filling: "cream",
    occasion: design.cakeType,
    complexity: design.cakeType === "wedding" ? "couture" : design.cakeType === "party" ? "chaos" : "styled",
  };
}

function addToCheckout() {
  const item = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    design: exportDesign(),
    estimate: calculateEstimate(),
  };
  writeJson(CART_KEY, [...readJson(CART_KEY, []), item]);
  window.location.href = "checkout.html";
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function updateCamera() {
  const x = Math.sin(orbit.theta) * Math.cos(orbit.phi) * orbit.radius;
  const z = Math.cos(orbit.theta) * Math.cos(orbit.phi) * orbit.radius;
  const y = Math.sin(orbit.phi) * orbit.radius;
  camera.position.set(x, y, z);
  camera.lookAt(0, design.tiers * 0.7, 0);
}

function animate() {
  resize();
  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function initEvents() {
  document.querySelectorAll("[data-cake-type]").forEach((button) => {
    button.addEventListener("click", () => applyCakeType(button.dataset.cakeType));
  });

  ["tiers", "flavor", "finish", "baseColor", "accentColor", "message"].forEach((id) => {
    document.querySelector(`#${id}`).addEventListener("input", (event) => {
      const value = id === "tiers" ? Number(event.target.value) : event.target.value;
      design[id] = value;
      if (id === "tiers" || id === "message") enforceMessageLimit();
      rebuildScene();
    });
  });

  document.querySelector("#decorationChoices").addEventListener("change", (event) => {
    if (!event.target.matches('input[name="decorations"]')) return;
    const selected = Array.from(document.querySelectorAll('input[name="decorations"]:checked')).map((input) => input.value);
    const limit = cakeTypes[design.cakeType].limit;
    if (selected.length > limit) {
      event.target.checked = false;
      return;
    }
    design.decorations = selected;
    updateChoiceLimit();
    rebuildScene();
  });

  document.querySelector("#resetScene").addEventListener("click", () => applyCakeType(design.cakeType));
  document.querySelector("#saveDesign").addEventListener("click", saveDesign);
  document.querySelector("#addToCheckout").addEventListener("click", addToCheckout);
  document.querySelector("#prevStep").addEventListener("click", () => showStep(currentStep - 1));
  document.querySelector("#nextStep").addEventListener("click", () => showStep(currentStep + 1));
  document.querySelector("#jumpReview").addEventListener("click", () => showStep(6));
  document.querySelectorAll(".progress-step").forEach((node) => {
    node.addEventListener("click", () => showStep(Number(node.dataset.progressStep)));
  });

  canvas.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, y: event.clientY, theta: orbit.theta, phi: orbit.phi };
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;
    orbit.theta = drag.theta - (event.clientX - drag.x) * 0.008;
    orbit.phi = Math.max(0.22, Math.min(1.1, drag.phi + (event.clientY - drag.y) * 0.005));
  });
  canvas.addEventListener("pointerup", () => {
    drag = null;
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    orbit.radius = Math.max(8, Math.min(20, orbit.radius + event.deltaY * 0.01));
  }, { passive: false });

  window.addEventListener("resize", resize);
}

updateCartCount();
initNavigation();
initEvents();
applyCakeType(initialTypeFromUrl());
showStep(0);
animate();
