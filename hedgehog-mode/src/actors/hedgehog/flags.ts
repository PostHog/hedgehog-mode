/**
 * Something the hedgehog holds, on top of whatever skin it's wearing: a
 * country's flag on a pole, or the whole planet.
 *
 * A `flag` is a flat `flags/<flag>.png` cloth (31x21) that the engine waves
 * from a shared `props/pole.png`; the customization menu shows the same cloth,
 * scaled up. A `globe` spins through `props/<flag>/tile` and is shown in the
 * menu as `icons/<flag>.png`.
 *
 * Every UN member and observer state, plus Taiwan, Kosovo and Western Sahara,
 * the UK's home nations, the EU and the UN, and every territory with a flag of
 * its own — the ISO 3166-1 set, minus places that just fly their sovereign's
 * flag (Réunion, Svalbard...). Every cloth is drawn by
 * texturepacker/flag-generator — add or fix a flag there, not by hand.
 */
export type HedgehogActorFlagInfo = {
  kind: "flag" | "globe";
  /** Display name. */
  name: string;
  /**
   * ISO 3166-1 alpha-2 (3166-2 for the home nations, "XK" for Kosovo), so "us"
   * or "gb" finds the right flag in the picker.
   */
  code?: string;
  /** Other names people search for ("holland", "burma", "ivory coast"). */
  aliases?: readonly string[];
  /**
   * The cloth isn't a full rectangle: its outline is part of the picture
   * (Nepal). Facing left it mirrors with the hedgehog instead of reading the
   * right way round, or its hoist would end up at the free end, off the pole.
   * Set exactly when the cloth has transparent pixels; a test checks.
   */
  shaped?: boolean;
};

export const HedgehogActorFlags = {
  earth: {
    kind: "globe",
    name: "Earth",
    aliases: ["globe", "world", "planet"],
  },
  afghanistan: { kind: "flag", name: "Afghanistan", code: "AF" },
  "aland-islands": { kind: "flag", name: "Åland Islands", code: "AX" },
  albania: { kind: "flag", name: "Albania", code: "AL" },
  algeria: { kind: "flag", name: "Algeria", code: "DZ" },
  "american-samoa": { kind: "flag", name: "American Samoa", code: "AS" },
  andorra: { kind: "flag", name: "Andorra", code: "AD" },
  angola: { kind: "flag", name: "Angola", code: "AO" },
  anguilla: { kind: "flag", name: "Anguilla", code: "AI" },
  "antigua-and-barbuda": {
    kind: "flag",
    name: "Antigua and Barbuda",
    code: "AG",
  },
  argentina: { kind: "flag", name: "Argentina", code: "AR" },
  armenia: { kind: "flag", name: "Armenia", code: "AM" },
  aruba: { kind: "flag", name: "Aruba", code: "AW" },
  australia: { kind: "flag", name: "Australia", code: "AU" },
  austria: { kind: "flag", name: "Austria", code: "AT" },
  azerbaijan: { kind: "flag", name: "Azerbaijan", code: "AZ" },
  bahamas: { kind: "flag", name: "Bahamas", code: "BS" },
  bahrain: { kind: "flag", name: "Bahrain", code: "BH" },
  bangladesh: { kind: "flag", name: "Bangladesh", code: "BD" },
  barbados: { kind: "flag", name: "Barbados", code: "BB" },
  belarus: { kind: "flag", name: "Belarus", code: "BY" },
  belgium: { kind: "flag", name: "Belgium", code: "BE" },
  belize: { kind: "flag", name: "Belize", code: "BZ" },
  benin: { kind: "flag", name: "Benin", code: "BJ" },
  bermuda: { kind: "flag", name: "Bermuda", code: "BM" },
  bhutan: { kind: "flag", name: "Bhutan", code: "BT" },
  bolivia: { kind: "flag", name: "Bolivia", code: "BO" },
  "bosnia-and-herzegovina": {
    kind: "flag",
    name: "Bosnia and Herzegovina",
    code: "BA",
    aliases: ["bosnia"],
  },
  botswana: { kind: "flag", name: "Botswana", code: "BW" },
  brazil: { kind: "flag", name: "Brazil", code: "BR" },
  "british-indian-ocean-territory": {
    kind: "flag",
    name: "British Indian Ocean Territory",
    code: "IO",
    aliases: ["biot", "chagos islands"],
  },
  "british-virgin-islands": {
    kind: "flag",
    name: "British Virgin Islands",
    code: "VG",
    aliases: ["bvi"],
  },
  brunei: { kind: "flag", name: "Brunei", code: "BN" },
  bulgaria: { kind: "flag", name: "Bulgaria", code: "BG" },
  "burkina-faso": { kind: "flag", name: "Burkina Faso", code: "BF" },
  burundi: { kind: "flag", name: "Burundi", code: "BI" },
  "cabo-verde": {
    kind: "flag",
    name: "Cabo Verde",
    code: "CV",
    aliases: ["cape verde"],
  },
  cambodia: { kind: "flag", name: "Cambodia", code: "KH" },
  cameroon: { kind: "flag", name: "Cameroon", code: "CM" },
  canada: { kind: "flag", name: "Canada", code: "CA" },
  "cayman-islands": { kind: "flag", name: "Cayman Islands", code: "KY" },
  "central-african-republic": {
    kind: "flag",
    name: "Central African Republic",
    code: "CF",
  },
  chad: { kind: "flag", name: "Chad", code: "TD" },
  chile: { kind: "flag", name: "Chile", code: "CL" },
  china: { kind: "flag", name: "China", code: "CN" },
  "christmas-island": { kind: "flag", name: "Christmas Island", code: "CX" },
  "cocos-islands": {
    kind: "flag",
    name: "Cocos (Keeling) Islands",
    code: "CC",
  },
  colombia: { kind: "flag", name: "Colombia", code: "CO" },
  comoros: { kind: "flag", name: "Comoros", code: "KM" },
  congo: {
    kind: "flag",
    name: "Congo",
    code: "CG",
    aliases: ["republic of the congo", "congo-brazzaville"],
  },
  "cook-islands": { kind: "flag", name: "Cook Islands", code: "CK" },
  "costa-rica": { kind: "flag", name: "Costa Rica", code: "CR" },
  "cote-divoire": {
    kind: "flag",
    name: "Côte d'Ivoire",
    code: "CI",
    aliases: ["ivory coast"],
  },
  croatia: { kind: "flag", name: "Croatia", code: "HR" },
  cuba: { kind: "flag", name: "Cuba", code: "CU" },
  curacao: { kind: "flag", name: "Curaçao", code: "CW" },
  cyprus: { kind: "flag", name: "Cyprus", code: "CY" },
  czechia: {
    kind: "flag",
    name: "Czechia",
    code: "CZ",
    aliases: ["czech republic"],
  },
  denmark: { kind: "flag", name: "Denmark", code: "DK" },
  djibouti: { kind: "flag", name: "Djibouti", code: "DJ" },
  dominica: { kind: "flag", name: "Dominica", code: "DM" },
  "dominican-republic": {
    kind: "flag",
    name: "Dominican Republic",
    code: "DO",
  },
  "dr-congo": {
    kind: "flag",
    name: "DR Congo",
    code: "CD",
    aliases: ["democratic republic of the congo", "drc", "congo-kinshasa"],
  },
  ecuador: { kind: "flag", name: "Ecuador", code: "EC" },
  egypt: { kind: "flag", name: "Egypt", code: "EG" },
  "el-salvador": { kind: "flag", name: "El Salvador", code: "SV" },
  england: { kind: "flag", name: "England", code: "GB-ENG" },
  "equatorial-guinea": { kind: "flag", name: "Equatorial Guinea", code: "GQ" },
  eritrea: { kind: "flag", name: "Eritrea", code: "ER" },
  estonia: { kind: "flag", name: "Estonia", code: "EE" },
  eswatini: {
    kind: "flag",
    name: "Eswatini",
    code: "SZ",
    aliases: ["swaziland"],
  },
  ethiopia: { kind: "flag", name: "Ethiopia", code: "ET" },
  "european-union": { kind: "flag", name: "European Union", code: "EU" },
  "falkland-islands": { kind: "flag", name: "Falkland Islands", code: "FK" },
  "faroe-islands": {
    kind: "flag",
    name: "Faroe Islands",
    code: "FO",
    aliases: ["faroes"],
  },
  fiji: { kind: "flag", name: "Fiji", code: "FJ" },
  finland: { kind: "flag", name: "Finland", code: "FI" },
  france: { kind: "flag", name: "France", code: "FR" },
  "french-polynesia": {
    kind: "flag",
    name: "French Polynesia",
    code: "PF",
    aliases: ["tahiti"],
  },
  "french-southern-territories": {
    kind: "flag",
    name: "French Southern and Antarctic Lands",
    code: "TF",
    aliases: ["french southern territories"],
  },
  gabon: { kind: "flag", name: "Gabon", code: "GA" },
  gambia: { kind: "flag", name: "Gambia", code: "GM" },
  georgia: { kind: "flag", name: "Georgia", code: "GE" },
  germany: { kind: "flag", name: "Germany", code: "DE" },
  ghana: { kind: "flag", name: "Ghana", code: "GH" },
  gibraltar: { kind: "flag", name: "Gibraltar", code: "GI" },
  greece: { kind: "flag", name: "Greece", code: "GR" },
  greenland: { kind: "flag", name: "Greenland", code: "GL" },
  grenada: { kind: "flag", name: "Grenada", code: "GD" },
  guam: { kind: "flag", name: "Guam", code: "GU" },
  guatemala: { kind: "flag", name: "Guatemala", code: "GT" },
  guernsey: { kind: "flag", name: "Guernsey", code: "GG" },
  guinea: { kind: "flag", name: "Guinea", code: "GN" },
  "guinea-bissau": { kind: "flag", name: "Guinea-Bissau", code: "GW" },
  guyana: { kind: "flag", name: "Guyana", code: "GY" },
  haiti: { kind: "flag", name: "Haiti", code: "HT" },
  honduras: { kind: "flag", name: "Honduras", code: "HN" },
  "hong-kong": { kind: "flag", name: "Hong Kong", code: "HK" },
  hungary: { kind: "flag", name: "Hungary", code: "HU" },
  iceland: { kind: "flag", name: "Iceland", code: "IS" },
  india: { kind: "flag", name: "India", code: "IN" },
  indonesia: { kind: "flag", name: "Indonesia", code: "ID" },
  iran: { kind: "flag", name: "Iran", code: "IR" },
  iraq: { kind: "flag", name: "Iraq", code: "IQ" },
  ireland: { kind: "flag", name: "Ireland", code: "IE" },
  "isle-of-man": { kind: "flag", name: "Isle of Man", code: "IM" },
  israel: { kind: "flag", name: "Israel", code: "IL" },
  italy: { kind: "flag", name: "Italy", code: "IT" },
  jamaica: { kind: "flag", name: "Jamaica", code: "JM" },
  japan: { kind: "flag", name: "Japan", code: "JP" },
  jersey: { kind: "flag", name: "Jersey", code: "JE" },
  jordan: { kind: "flag", name: "Jordan", code: "JO" },
  kazakhstan: { kind: "flag", name: "Kazakhstan", code: "KZ" },
  kenya: { kind: "flag", name: "Kenya", code: "KE" },
  kiribati: { kind: "flag", name: "Kiribati", code: "KI" },
  kosovo: { kind: "flag", name: "Kosovo", code: "XK" },
  kuwait: { kind: "flag", name: "Kuwait", code: "KW" },
  kyrgyzstan: { kind: "flag", name: "Kyrgyzstan", code: "KG" },
  laos: { kind: "flag", name: "Laos", code: "LA" },
  latvia: { kind: "flag", name: "Latvia", code: "LV" },
  lebanon: { kind: "flag", name: "Lebanon", code: "LB" },
  lesotho: { kind: "flag", name: "Lesotho", code: "LS" },
  liberia: { kind: "flag", name: "Liberia", code: "LR" },
  libya: { kind: "flag", name: "Libya", code: "LY" },
  liechtenstein: { kind: "flag", name: "Liechtenstein", code: "LI" },
  lithuania: { kind: "flag", name: "Lithuania", code: "LT" },
  luxembourg: { kind: "flag", name: "Luxembourg", code: "LU" },
  macau: { kind: "flag", name: "Macau", code: "MO", aliases: ["macao"] },
  madagascar: { kind: "flag", name: "Madagascar", code: "MG" },
  malawi: { kind: "flag", name: "Malawi", code: "MW" },
  malaysia: { kind: "flag", name: "Malaysia", code: "MY" },
  maldives: { kind: "flag", name: "Maldives", code: "MV" },
  mali: { kind: "flag", name: "Mali", code: "ML" },
  malta: { kind: "flag", name: "Malta", code: "MT" },
  "marshall-islands": { kind: "flag", name: "Marshall Islands", code: "MH" },
  mauritania: { kind: "flag", name: "Mauritania", code: "MR" },
  mauritius: { kind: "flag", name: "Mauritius", code: "MU" },
  mexico: { kind: "flag", name: "Mexico", code: "MX" },
  micronesia: {
    kind: "flag",
    name: "Micronesia",
    code: "FM",
    aliases: ["federated states of micronesia"],
  },
  moldova: { kind: "flag", name: "Moldova", code: "MD" },
  monaco: { kind: "flag", name: "Monaco", code: "MC" },
  mongolia: { kind: "flag", name: "Mongolia", code: "MN" },
  montenegro: { kind: "flag", name: "Montenegro", code: "ME" },
  montserrat: { kind: "flag", name: "Montserrat", code: "MS" },
  morocco: { kind: "flag", name: "Morocco", code: "MA" },
  mozambique: { kind: "flag", name: "Mozambique", code: "MZ" },
  myanmar: { kind: "flag", name: "Myanmar", code: "MM", aliases: ["burma"] },
  namibia: { kind: "flag", name: "Namibia", code: "NA" },
  nauru: { kind: "flag", name: "Nauru", code: "NR" },
  nepal: { kind: "flag", name: "Nepal", code: "NP", shaped: true },
  netherlands: {
    kind: "flag",
    name: "Netherlands",
    code: "NL",
    aliases: ["holland"],
  },
  "new-zealand": { kind: "flag", name: "New Zealand", code: "NZ" },
  nicaragua: { kind: "flag", name: "Nicaragua", code: "NI" },
  niger: { kind: "flag", name: "Niger", code: "NE" },
  nigeria: { kind: "flag", name: "Nigeria", code: "NG" },
  niue: { kind: "flag", name: "Niue", code: "NU" },
  "norfolk-island": { kind: "flag", name: "Norfolk Island", code: "NF" },
  "north-korea": {
    kind: "flag",
    name: "North Korea",
    code: "KP",
    aliases: ["dprk"],
  },
  "north-macedonia": {
    kind: "flag",
    name: "North Macedonia",
    code: "MK",
    aliases: ["macedonia"],
  },
  "northern-ireland": {
    kind: "flag",
    name: "Northern Ireland",
    code: "GB-NIR",
  },
  "northern-mariana-islands": {
    kind: "flag",
    name: "Northern Mariana Islands",
    code: "MP",
  },
  norway: { kind: "flag", name: "Norway", code: "NO" },
  oman: { kind: "flag", name: "Oman", code: "OM" },
  pakistan: { kind: "flag", name: "Pakistan", code: "PK" },
  palau: { kind: "flag", name: "Palau", code: "PW" },
  palestine: { kind: "flag", name: "Palestine", code: "PS" },
  panama: { kind: "flag", name: "Panama", code: "PA" },
  "papua-new-guinea": { kind: "flag", name: "Papua New Guinea", code: "PG" },
  paraguay: { kind: "flag", name: "Paraguay", code: "PY" },
  peru: { kind: "flag", name: "Peru", code: "PE" },
  philippines: { kind: "flag", name: "Philippines", code: "PH" },
  "pitcairn-islands": { kind: "flag", name: "Pitcairn Islands", code: "PN" },
  poland: { kind: "flag", name: "Poland", code: "PL" },
  portugal: { kind: "flag", name: "Portugal", code: "PT" },
  "puerto-rico": { kind: "flag", name: "Puerto Rico", code: "PR" },
  qatar: { kind: "flag", name: "Qatar", code: "QA" },
  romania: { kind: "flag", name: "Romania", code: "RO" },
  russia: { kind: "flag", name: "Russia", code: "RU" },
  rwanda: { kind: "flag", name: "Rwanda", code: "RW" },
  "saint-helena": {
    kind: "flag",
    name: "Saint Helena",
    code: "SH",
    aliases: ["st helena"],
  },
  "saint-kitts-and-nevis": {
    kind: "flag",
    name: "Saint Kitts and Nevis",
    code: "KN",
    aliases: ["st kitts and nevis"],
  },
  "saint-lucia": {
    kind: "flag",
    name: "Saint Lucia",
    code: "LC",
    aliases: ["st lucia"],
  },
  "saint-vincent-and-the-grenadines": {
    kind: "flag",
    name: "Saint Vincent and the Grenadines",
    code: "VC",
    aliases: ["st vincent and the grenadines"],
  },
  samoa: { kind: "flag", name: "Samoa", code: "WS" },
  "san-marino": { kind: "flag", name: "San Marino", code: "SM" },
  "sao-tome-and-principe": {
    kind: "flag",
    name: "São Tomé and Príncipe",
    code: "ST",
  },
  "saudi-arabia": { kind: "flag", name: "Saudi Arabia", code: "SA" },
  scotland: { kind: "flag", name: "Scotland", code: "GB-SCT" },
  senegal: { kind: "flag", name: "Senegal", code: "SN" },
  serbia: { kind: "flag", name: "Serbia", code: "RS" },
  seychelles: { kind: "flag", name: "Seychelles", code: "SC" },
  "sierra-leone": { kind: "flag", name: "Sierra Leone", code: "SL" },
  singapore: { kind: "flag", name: "Singapore", code: "SG" },
  "sint-maarten": { kind: "flag", name: "Sint Maarten", code: "SX" },
  slovakia: { kind: "flag", name: "Slovakia", code: "SK" },
  slovenia: { kind: "flag", name: "Slovenia", code: "SI" },
  "solomon-islands": { kind: "flag", name: "Solomon Islands", code: "SB" },
  somalia: { kind: "flag", name: "Somalia", code: "SO" },
  "south-africa": { kind: "flag", name: "South Africa", code: "ZA" },
  "south-georgia": {
    kind: "flag",
    name: "South Georgia and the South Sandwich Islands",
    code: "GS",
    aliases: ["south sandwich islands"],
  },
  "south-korea": {
    kind: "flag",
    name: "South Korea",
    code: "KR",
    aliases: ["korea"],
  },
  "south-sudan": { kind: "flag", name: "South Sudan", code: "SS" },
  spain: { kind: "flag", name: "Spain", code: "ES" },
  "sri-lanka": { kind: "flag", name: "Sri Lanka", code: "LK" },
  sudan: { kind: "flag", name: "Sudan", code: "SD" },
  suriname: { kind: "flag", name: "Suriname", code: "SR" },
  sweden: { kind: "flag", name: "Sweden", code: "SE" },
  switzerland: { kind: "flag", name: "Switzerland", code: "CH" },
  syria: { kind: "flag", name: "Syria", code: "SY" },
  taiwan: { kind: "flag", name: "Taiwan", code: "TW" },
  tajikistan: { kind: "flag", name: "Tajikistan", code: "TJ" },
  tanzania: { kind: "flag", name: "Tanzania", code: "TZ" },
  thailand: { kind: "flag", name: "Thailand", code: "TH" },
  "timor-leste": {
    kind: "flag",
    name: "Timor-Leste",
    code: "TL",
    aliases: ["east timor"],
  },
  togo: { kind: "flag", name: "Togo", code: "TG" },
  tokelau: { kind: "flag", name: "Tokelau", code: "TK" },
  tonga: { kind: "flag", name: "Tonga", code: "TO" },
  "trinidad-and-tobago": {
    kind: "flag",
    name: "Trinidad and Tobago",
    code: "TT",
  },
  tunisia: { kind: "flag", name: "Tunisia", code: "TN" },
  turkiye: { kind: "flag", name: "Türkiye", code: "TR", aliases: ["turkey"] },
  turkmenistan: { kind: "flag", name: "Turkmenistan", code: "TM" },
  "turks-and-caicos-islands": {
    kind: "flag",
    name: "Turks and Caicos Islands",
    code: "TC",
  },
  tuvalu: { kind: "flag", name: "Tuvalu", code: "TV" },
  "us-virgin-islands": {
    kind: "flag",
    name: "U.S. Virgin Islands",
    code: "VI",
    aliases: ["usvi", "united states virgin islands"],
  },
  uganda: { kind: "flag", name: "Uganda", code: "UG" },
  ukraine: { kind: "flag", name: "Ukraine", code: "UA" },
  "united-arab-emirates": {
    kind: "flag",
    name: "United Arab Emirates",
    code: "AE",
    aliases: ["uae"],
  },
  "united-kingdom": {
    kind: "flag",
    name: "United Kingdom",
    code: "GB",
    aliases: ["uk", "great britain", "britain"],
  },
  "united-nations": { kind: "flag", name: "United Nations", aliases: ["un"] },
  "united-states": {
    kind: "flag",
    name: "United States",
    code: "US",
    aliases: ["usa", "america"],
  },
  uruguay: { kind: "flag", name: "Uruguay", code: "UY" },
  uzbekistan: { kind: "flag", name: "Uzbekistan", code: "UZ" },
  vanuatu: { kind: "flag", name: "Vanuatu", code: "VU" },
  "vatican-city": {
    kind: "flag",
    name: "Vatican City",
    code: "VA",
    aliases: ["holy see"],
  },
  venezuela: { kind: "flag", name: "Venezuela", code: "VE" },
  vietnam: { kind: "flag", name: "Vietnam", code: "VN" },
  wales: { kind: "flag", name: "Wales", code: "GB-WLS", aliases: ["cymru"] },
  "wallis-and-futuna": { kind: "flag", name: "Wallis and Futuna", code: "WF" },
  "western-sahara": { kind: "flag", name: "Western Sahara", code: "EH" },
  yemen: { kind: "flag", name: "Yemen", code: "YE" },
  zambia: { kind: "flag", name: "Zambia", code: "ZM" },
  zimbabwe: { kind: "flag", name: "Zimbabwe", code: "ZW" },
} as const satisfies Record<string, HedgehogActorFlagInfo>;

export type HedgehogActorFlagOption = keyof typeof HedgehogActorFlags;

/** The globe first, then every country alphabetically. */
export const HedgehogActorFlagOptions = Object.keys(
  HedgehogActorFlags
) as HedgehogActorFlagOption[];

const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

type SearchEntry = {
  flag: HedgehogActorFlagOption;
  code?: string;
  names: string[];
};

// Built on first search rather than at import: the engine imports this module
// on every page, and almost nobody opens the picker.
let searchIndex: SearchEntry[] | undefined;
const getSearchIndex = (): SearchEntry[] =>
  (searchIndex ??= HedgehogActorFlagOptions.map((flag) => {
    const info: HedgehogActorFlagInfo = HedgehogActorFlags[flag];
    return {
      flag,
      code: info.code?.toLowerCase(),
      names: [info.name, ...(info.aliases ?? [])].map(normalize),
    };
  }));

/**
 * Flags matching what someone typed into the picker, best match first: an
 * exact ISO code, name or alias ("us", "uk" — not Ukraine), then names
 * starting with the query, then names with
 * a word starting with it ("korea" finds both Koreas), then anything
 * containing it. An empty query matches everything, in the usual order.
 */
export function searchFlags(query: string): HedgehogActorFlagOption[] {
  const q = normalize(query);
  if (!q) {
    return [...HedgehogActorFlagOptions];
  }
  const rank = ({ code, names }: SearchEntry): number => {
    if (code === q || names.includes(q)) {
      return 0;
    }
    if (names.some((name) => name.startsWith(q))) {
      return 1;
    }
    if (names.some((name) => name.includes(` ${q}`))) {
      return 2;
    }
    return names.some((name) => name.includes(q)) ? 3 : -1;
  };
  return getSearchIndex()
    .map((entry) => ({ flag: entry.flag, rank: rank(entry) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map(({ flag }) => flag);
}
