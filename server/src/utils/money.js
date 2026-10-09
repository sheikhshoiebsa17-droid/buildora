/**
 * All money arithmetic is done in integer paise to avoid float rounding errors.
 */
const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
const toRupees = (paise) => Number((paise / 100).toFixed(2));

export function computeTotals(items = []) {
  let subtotalP = 0;
  let gstP = 0;
  const perItem = items.map((it) => {
    const lineBase = toPaise(it.quantity) * toPaise(it.rate) / 100; // paise
    const lineP = Math.round(lineBase * (1 - (it.discountPercent || 0) / 100));
    const gst = Math.round(lineP * ((it.gstPercent || 0) / 100));
    subtotalP += lineP;
    gstP += gst;
    return { lineTotal: toRupees(lineP), gst: toRupees(gst) };
  });
  return { subtotal: toRupees(subtotalP), gstTotal: toRupees(gstP), total: toRupees(subtotalP + gstP), perItem };
}

export function round2(n) {
  return toRupees(toPaise(n));
}
