const translations = {
  th: {
    stockInsufficient: "สินค้าไม่เพียงพอ",
  },
};

const defaultLocale = "th";

export function t(key, locale = defaultLocale) {
  return translations[locale]?.[key] || key;
}

export function localizeError({ code, message }) {
  if (code === "STOCK_INSUFFICIENT") {
    return t("stockInsufficient");
  }
  return message || "";
}
