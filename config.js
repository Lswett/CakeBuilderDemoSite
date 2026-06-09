(function () {
  const pricing = {
    locale: "en-US",
    currency: "USD",
    checkout: {
      deliveryFee: 10,
      taxRate: 0.086,
    },
    designer: {
      tierBase: 31,
      diameterInch: 4.25,
      tierHeight: 5.5,
      shape: { round: 0, square: 8, heart: 18, cloud: 22 },
      flavor: { vanilla: 0, redVelvet: 8, lemon: 10, caramel: 12, espresso: 11 },
      filling: { cream: 0, jam: 7, lemonCurd: 10, ganache: 10 },
      complexity: { clean: 0, styled: 24, chaos: 42, couture: 68 },
      occasion: { daily: 0, birthday: 8, wedding: 55, launch: 22, houseParty: 12 },
      decoration: 8,
      message: 6,
      fineDetail: {
        gloss: 0.08,
        piping: 0.13,
        sprinkles: 0.28,
        topperScale: 0.07,
        messageCurve: 0.05,
      },
      prep: {
        base: 1.6,
        tier: 1.15,
        tierHeight: 0.32,
        diameter: 0.08,
        decoration: 0.42,
        piping: 0.018,
        sprinkles: 0.012,
        message: 0.25,
        complexity: { clean: 0.8, styled: 2.1, chaos: 3.4, couture: 5.5 },
        occasion: { daily: 0, birthday: 0.5, wedding: 3.5, launch: 1.2, houseParty: 0.7 },
      },
    },
    guidedDesigner: {
      typeBase: { wedding: 95, party: 55, custom: 65 },
      tier: { wedding: 38, party: 24, custom: 28 },
      decoration: { wedding: 28, party: 12, custom: 16 },
      flavor: { vanilla: 0, redVelvet: 8, lemon: 10, caramel: 12, espresso: 10 },
      finish: { smooth: 0, glossy: 10, textured: 8, fondant: 18 },
      message: 6,
      prep: {
        base: 1.8,
        tier: 0.9,
        decoration: 0.55,
        cakeType: { wedding: 2.5, party: 0.8, custom: 1.2 },
      },
    },
  };

  function money(value) {
    return new Intl.NumberFormat(pricing.locale, {
      style: "currency",
      currency: pricing.currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function calculateGuidedEstimate(design) {
    const rates = pricing.guidedDesigner;
    const cakeType = design.cakeType || "custom";
    const decorations = design.decorations || [];
    const usd =
      rates.typeBase[cakeType] +
      design.tiers * rates.tier[cakeType] +
      decorations.length * rates.decoration[cakeType] +
      rates.flavor[design.flavor] +
      rates.finish[design.finish] +
      (design.message?.trim() ? rates.message : 0);
    const hours =
      rates.prep.base +
      design.tiers * rates.prep.tier +
      decorations.length * rates.prep.decoration +
      rates.prep.cakeType[cakeType];

    return { usd, hours };
  }

  function calculateDesignerEstimate(design) {
    const rates = pricing.designer;
    const decorations = design.decorations || [];
    const fineDetail =
      design.gloss * rates.fineDetail.gloss +
      design.piping * rates.fineDetail.piping +
      design.sprinkles * rates.fineDetail.sprinkles +
      design.topperScale * rates.fineDetail.topperScale +
      design.messageCurve * rates.fineDetail.messageCurve;

    const usd =
      design.tiers * rates.tierBase +
      design.diameter * rates.diameterInch +
      design.tierHeight * design.tiers * rates.tierHeight +
      rates.shape[design.shape] +
      rates.flavor[design.flavor] +
      rates.filling[design.filling] +
      rates.complexity[design.complexity] +
      rates.occasion[design.occasion] +
      decorations.length * rates.decoration +
      fineDetail +
      (design.message?.trim() ? rates.message : 0);

    const hours =
      rates.prep.base +
      design.tiers * rates.prep.tier +
      design.tierHeight * rates.prep.tierHeight +
      design.diameter * rates.prep.diameter +
      rates.prep.complexity[design.complexity] +
      rates.prep.occasion[design.occasion] +
      decorations.length * rates.prep.decoration +
      design.piping * rates.prep.piping +
      design.sprinkles * rates.prep.sprinkles +
      (design.message?.trim() ? rates.prep.message : 0);

    return {
      usd: Math.round(usd),
      hours,
    };
  }

  function calculateCakeEstimate(design) {
    if (design.cakeType || design.finish) return calculateGuidedEstimate(design);
    return calculateDesignerEstimate(design);
  }

  function calculateCheckoutPricing(items = []) {
    const subtotal = items.reduce((sum, item) => sum + Number(item.estimate?.usd || 0), 0);
    const deliveryFee = subtotal ? pricing.checkout.deliveryFee : 0;
    const tax = subtotal ? Math.round((subtotal + deliveryFee) * pricing.checkout.taxRate * 100) / 100 : 0;

    return {
      subtotal,
      deliveryFee,
      tax,
      total: Math.round((subtotal + deliveryFee + tax) * 100) / 100,
    };
  }

  window.CakeBuilderConfig = {
    pricing,
    money,
    calculateCakeEstimate,
    calculateCheckoutPricing,
  };
})();
