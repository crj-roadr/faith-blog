import type { Locale } from "./locales"

type LocalizedText = Record<Locale, string>

export type TaxonomyItem = {
  slug: string
  order: number
  labelByLocale: LocalizedText
  descriptionByLocale: LocalizedText
}

const localized = (text: LocalizedText): LocalizedText => text

export const TAXONOMY = {
  categories: [
    {
      slug: "devotional",
      order: 0,
      labelByLocale: localized({
        zh: "灵修",
        en: "Devotional",
        fr: "Dévotionnel",
        es: "Devocional",
        ru: "Размышления",
        ja: "霊的な考察",
        ko: "묵상",
        pt: "Devocional",
        de: "Andacht",
        id: "Renungan",
        ar: "تأملات",
      }),
      descriptionByLocale: localized({
        zh: "信仰与生活",
        en: "A daily moment set aside to cultivate your relationship with God.",
        fr: "Un moment quotidien réservé pour cultiver votre relation avec Dieu.",
        es: "Un momento diario reservado para cultivar tu relación con Dios.",
        ru: "Ежедневный момент, посвященный развитию ваших отношений с Богом.",
        ja: "神との関係を育むための毎日のひととき。",
        ko: "하나님과의 관계를 가꾸기 위해 따로 마련된 매일의 시간입니다.",
        pt: "Um momento diário e reservado para cultivar o relacionamento com Deus.",
        de: "Ein täglicher Moment, der der Pflege Ihrer Beziehung zu Gott gewidmet ist.",
        id: "Momen harian yang dikhususkan untuk memupuk hubungan Anda dengan Tuhan.",
        ar: "لحظة يومية مخصصة لتعميق علاقتك بالله.",
      }),
    },
  ],
  tags: [
    {
      slug: "old-testament",
      order: 1,
      labelByLocale: localized({
        zh: "旧约",
        en: "Old Testament",
        fr: "Ancien Testament",
        es: "Antiguo Testamento",
        ru: "Ветхий Завет",
        ja: "旧約聖書",
        ko: "구약 성경",
        pt: "Antigo Testamento",
        de: "Altes Testament",
        id: "Perjanjian Lama",
        ar: "العهد القديم",
      }),
      descriptionByLocale: localized({
        zh: "耶稣之前的神的话语。",
        en: "The word of God before Jesus.",
        fr: "La parole de Dieu avant Jésus.",
        es: "La palabra de Dios antes de Jesús.",
        ru: "Слово Божье до Иисуса.",
        ja: "イエス様以前の神の言葉。",
        ko: "예수님 이전의 하나님의 말씀.",
        pt: "A palavra de Deus antes de Jesus.",
        de: "Das Wort Gottes vor Jesus.",
        id: "Firman Tuhan sebelum Yesus.",
        ar: "كلمة الله قبل يسوع.",
      }),
    },
    {
      slug: "new-testament",
      order: 2,
      labelByLocale: localized({
        zh: "新约",
        en: "New Testament",
        fr: "Nouveau Testament",
        es: "Nuevo Testamento",
        ru: "Новый Завет",
        ja: "新約聖書",
        ko: "신약 성경",
        pt: "Novo Testamento",
        de: "Neues Testament",
        id: "Perjanjian Baru",
        ar: "العهد الجديد",
      }),
      descriptionByLocale: localized({
        zh: "耶稣之后的神的话语。",
        en: "The word of God after Jesus.",
        fr: "La parole de Dieu après Jésus.",
        es: "La palabra de Dios después de Jesús.",
        ru: "Слово Божье после Иисуса.",
        ja: "イエス様以降の神の言葉。",
        ko: "예수님 이후의 하나님의 말씀.",
        pt: "A palavra de Deus depois de Jesus.",
        de: "Das Wort Gottes nach Jesus.",
        id: "Firman Tuhan setelah Yesus.",
        ar: "كلمة الله بعد يسوع.",
      }),
    },
  ],
} as const

const PRIMARY_CATEGORY_SLUGS = ["devotional"] as const

const TAGS_BY_CATEGORY: Record<
  (typeof PRIMARY_CATEGORY_SLUGS)[number],
  string[]
> = {
  devotional: ["Old Testament", "New Testament"],
}

export function getCategory(slug: string): TaxonomyItem | undefined {
  return TAXONOMY.categories.find((item) => item.slug === slug)
}

export function getTag(slug: string): TaxonomyItem | undefined {
  return TAXONOMY.tags.find((item) => item.slug === slug)
}

const normalizeKey = (value: string): string =>
  value.trim().toLowerCase().replace(/[\s_]+/g, "-")

const categoryAliases: Record<string, string> = {
  investment: "invest",
}

const tagAliases: Record<string, string> = {}

function buildTaxonomyLookup(
  items: readonly TaxonomyItem[],
  aliases: Record<string, string>
): Map<string, string> {
  const lookup = new Map<string, string>()

  for (const item of items) {
    lookup.set(normalizeKey(item.slug), item.slug)
    lookup.set(normalizeKey(item.labelByLocale.en), item.slug)
  }

  for (const [alias, slug] of Object.entries(aliases)) {
    lookup.set(normalizeKey(alias), slug)
  }

  return lookup
}

const categoryLookup = buildTaxonomyLookup(TAXONOMY.categories, categoryAliases)
const tagLookup = buildTaxonomyLookup(TAXONOMY.tags, tagAliases)

export function normalizeCategorySlug(value: string): string {
  return categoryLookup.get(normalizeKey(value)) ?? normalizeKey(value)
}

export function normalizeTagSlug(value: string): string {
  return tagLookup.get(normalizeKey(value)) ?? normalizeKey(value)
}

export function getPrimaryCategories(): TaxonomyItem[] {
  return PRIMARY_CATEGORY_SLUGS.map((slug) => getCategory(slug)).filter(
    (item): item is TaxonomyItem => Boolean(item)
  )
}

export function getTagsForCategory(slug: string): TaxonomyItem[] {
  const tagSlugs =
    TAGS_BY_CATEGORY[slug as (typeof PRIMARY_CATEGORY_SLUGS)[number]] ?? []
  return tagSlugs
    .map((tagSlug) => getTag(tagSlug))
    .filter((item): item is TaxonomyItem => Boolean(item))
}
