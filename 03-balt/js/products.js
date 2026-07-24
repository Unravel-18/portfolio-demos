/* Bałt Palarnia — catalog data (single source of truth).
   Prices in PLN. roast: 1 (jasne) … 5 (ciemne). profile keys map to i18n.
   Product photos live in demo/img/ and are mapped by id in store.js (Store.imgFor). */

const PRODUCTS = [
  {
    id: "baltyk-espresso",
    lot: "01",
    name: "Bałtyk Espresso Blend",
    origin: "brazylia-etiopia",
    originLabel: { pl: "Brazylia + Etiopia", en: "Brazil + Ethiopia" },
    roast: 4,
    profile: ["czekoladowa", "orzechowa"],
    format: "ziarna",
    price250: 42, price1000: 145,
    sca: 84,
    hue: 24,
    notes: { pl: "czekolada · karmel · orzech", en: "chocolate · caramel · nut" },
    badges: ["bestseller"],
    desc: {
      pl: "Nasza flagowa mieszanka do ekspresu, komponowana tak, by wybaczała błędy i nagradzała cierpliwość. Brazylijska baza daje gęste ciało i mleczną czekoladę, a etiopski dodatek dokłada słodyczy i lekkiej owocowości w finiszu. Świetnie znosi mleko — w cappuccino wychodzą karmel i orzechy. Nasz domyślny wybór na poranek i do biurowego ekspresu.",
      en: "Our flagship espresso blend, built to forgive mistakes and reward patience. A Brazilian base brings dense body and milk chocolate, while an Ethiopian top adds sweetness and a light fruity finish. It holds up beautifully in milk — caramel and nuts come through in a cappuccino. Our default pick for mornings and the office machine."
    }
  },
  {
    id: "mewa-filter",
    lot: "02",
    name: "Mewa Filter Blend",
    origin: "kolumbia-kenia",
    originLabel: { pl: "Kolumbia + Kenia", en: "Colombia + Kenya" },
    roast: 2,
    profile: ["owocowa", "kwiatowa"],
    format: "ziarna",
    price250: 44, price1000: 152,
    sca: 86,
    hue: 32,
    notes: { pl: "czerwone owoce · miód · herbata", en: "red fruit · honey · tea" },
    badges: [],
    desc: {
      pl: "Jasno palona mieszanka stworzona do metod przelewowych — klarowna, soczysta i pełna życia. Kolumbia daje miodową słodycz i równowagę, a kenijski dodatek dokłada jagodowej kwasowości, która budzi zmysły. Najlepiej wychodzi z Chemexa albo w dripie, przy odrobinie uwagi przy zalewaniu. To kawa, która tłumaczy, po co w ogóle przelewa się kawę.",
      en: "A light-roast blend made for pour-over — clean, juicy and full of life. Colombia brings honeyed sweetness and balance, while a Kenyan top adds a berry acidity that wakes up the senses. It shines from a Chemex or a dripper, with a little care at the pour. The coffee that explains why filter exists in the first place."
    }
  },
  {
    id: "etiopia-yirgacheffe",
    lot: "07",
    name: "Etiopia Yirgacheffe Gedeb",
    origin: "etiopia",
    originLabel: { pl: "Etiopia", en: "Ethiopia" },
    roast: 1,
    profile: ["owocowa", "kwiatowa"],
    format: "ziarna",
    price250: 54, price1000: 189,
    sca: 87,
    hue: 38,
    notes: { pl: "bergamotka · jaśmin · cytrusy", en: "bergamot · jasmine · citrus" },
    badges: ["bestseller"],
    desc: {
      pl: "Myta Etiopia z regionu Gedeb, uprawiana na wysokości 1900–2100 m n.p.m. przez drobnych rolników. W filiżance rozkłada się kwiatowo i herbaciano, z wyraźnym aromatem bergamotki i cytrusowym, orzeźwiającym finiszem. To klasyk jasnego palenia — delikatny, elegancki, bez śladu goryczy. Podawaj bez mleka, najlepiej z przelewu, i daj jej chwilę przestygnąć — wtedy pokazuje pełnię.",
      en: "Washed Ethiopia from the Gedeb area, grown at 1900–2100 m by smallholder farmers. In the cup it unfolds floral and tea-like, with a clear bergamot aroma and a refreshing citrus finish. A light-roast classic — delicate, elegant, without a trace of bitterness. Serve it black, ideally from a pour-over, and let it cool a moment — that's when it blooms."
    }
  },
  {
    id: "kenia-nyeri",
    lot: "09",
    name: "Kenia Nyeri AB",
    origin: "kenia",
    originLabel: { pl: "Kenia", en: "Kenya" },
    roast: 2,
    profile: ["owocowa"],
    format: "ziarna",
    price250: 58, price1000: 205,
    sca: 88,
    hue: 30,
    notes: { pl: "czarna porzeczka · grejpfrut", en: "blackcurrant · grapefruit" },
    badges: ["nowosc"],
    desc: {
      pl: "Kenijskie AB z regionu Nyeri, odmiany SL28 i SL34 znane z intensywności. Uderza kwasowością czarnej porzeczki i grejpfruta, z gęstą, niemal sokową słodyczą w tle. To kawa z charakterem — dla tych, którzy lubią, gdy filiżanka ma pazur. Świetna z przelewu i w aeropressie; im jaśniejsze zaparzenie, tym więcej owoców.",
      en: "Kenyan AB from Nyeri, the SL28 and SL34 varieties famed for their intensity. It hits with blackcurrant and grapefruit acidity over a dense, almost juicy sweetness. A coffee with a backbone — for those who like a cup with claws. Great from pour-over and AeroPress; the lighter you brew it, the more fruit you get."
    }
  },
  {
    id: "kolumbia-huila",
    lot: "11",
    name: "Kolumbia Huila",
    origin: "kolumbia",
    originLabel: { pl: "Kolumbia", en: "Colombia" },
    roast: 3,
    profile: ["karmelowa", "owocowa"],
    format: "ziarna",
    price250: 46, price1000: 159,
    sca: 85,
    hue: 28,
    notes: { pl: "karmel · pomarańcza · śliwka", en: "caramel · orange · plum" },
    badges: [],
    desc: {
      pl: "Zrównoważona, uniwersalna Kolumbia z górzystego regionu Huila. Karmelowa słodycz splata się tu z pomarańczą i śliwką, tworząc filiżankę, która smakuje niemal każdemu. Równie dobrze wychodzi z ekspresu, jak i z przelewu — to bezpieczny wybór na start przygody ze specialty. Jeśli nie wiesz, od czego zacząć, zacznij właśnie stąd.",
      en: "A balanced, versatile Colombia from the mountainous Huila region. Caramel sweetness weaves through orange and plum for a cup that pleases almost everyone. It works equally well from espresso and filter — a safe first step into specialty. If you don't know where to begin, begin right here."
    }
  },
  {
    id: "brazylia-cerrado",
    lot: "12",
    name: "Brazylia Cerrado",
    origin: "brazylia",
    originLabel: { pl: "Brazylia", en: "Brazil" },
    roast: 4,
    profile: ["czekoladowa", "orzechowa"],
    format: "ziarna",
    price250: 39, price1000: 132,
    sca: 83,
    hue: 22,
    notes: { pl: "orzech laskowy · mleczna czekolada", en: "hazelnut · milk chocolate" },
    badges: ["promo"], promo: 0.15,
    desc: {
      pl: "Naturalna Brazylia z wyżyny Cerrado, suszona w całych owocach w słońcu. Efekt to orzechowa, słodka i niskokwasowa filiżanka z nutą laskowego orzecha i mlecznej czekolady. Bezpretensjonalna kawa do mleka, do biura i na co dzień — nie wymaga skupienia, po prostu smakuje. Doskonała baza do latte i flat white.",
      en: "A natural Brazil from the Cerrado plateau, dried whole in the sun. The result is a nutty, sweet, low-acid cup with hazelnut and milk chocolate. An unpretentious coffee for milk, the office and every day — it asks for no focus, it just tastes good. A perfect base for a latte or flat white."
    }
  },
  {
    id: "gwatemala-antigua",
    lot: "14",
    name: "Gwatemala Antigua",
    origin: "gwatemala",
    originLabel: { pl: "Gwatemala", en: "Guatemala" },
    roast: 3,
    profile: ["czekoladowa", "owocowa"],
    format: "ziarna",
    price250: 48, price1000: 165,
    sca: 85,
    hue: 26,
    notes: { pl: "kakao · śliwka · brązowy cukier", en: "cocoa · plum · brown sugar" },
    badges: [],
    desc: {
      pl: "Kawa z wulkanicznej doliny Antigua, gdzie mineralna gleba dodaje ziarnom głębi. W filiżance kakaowa, z ciemną śliwką i słodyczą brązowego cukru — smakuje „poważnie”, ale nie ciężko. Sprawdza się i z ekspresu, i z kawiarki, gdzie wydobywa swoją czekoladową stronę. Dla tych, którzy lubią kawę z klasą i historią.",
      en: "Coffee from the volcanic Antigua valley, where mineral soil lends the beans depth. In the cup it's cocoa-rich, with dark plum and brown-sugar sweetness — it tastes 'serious' without being heavy. It performs from espresso and from a moka pot, which draws out its chocolate side. For those who like coffee with class and a backstory."
    }
  },
  {
    id: "honduras-marcala",
    lot: "16",
    name: "Honduras Marcala",
    origin: "honduras",
    originLabel: { pl: "Honduras", en: "Honduras" },
    roast: 3,
    profile: ["karmelowa", "orzechowa"],
    format: "ziarna",
    price250: 44, price1000: 149,
    sca: 84,
    hue: 27,
    notes: { pl: "toffi · jabłko · migdał", en: "toffee · apple · almond" },
    badges: [],
    desc: {
      pl: "Łagodny Honduras z górskiej Marcali, uprawiany w cieniu drzew. Toffi i migdał spotykają się tu z jabłkową świeżością, dając przyjemną, okrągłą filiżankę bez ostrych krawędzi. To kawa na spokojne popołudnie — prosta, ciepła i pojednawcza. Równie dobra z przelewu, jak i z French pressa.",
      en: "A gentle Honduras from mountainous Marcala, grown in tree shade. Toffee and almond meet apple freshness for a pleasant, round cup with no sharp edges. A coffee for a quiet afternoon — simple, warm and easygoing. Just as good from pour-over as from a French press."
    }
  },
  {
    id: "peru-decaf",
    lot: "18",
    name: "Peru Cajamarca Bezkofeinowa",
    origin: "peru",
    originLabel: { pl: "Peru (decaf EA)", en: "Peru (EA decaf)" },
    roast: 3,
    profile: ["czekoladowa"],
    format: "bezkofeinowa",
    price250: 49, price1000: 169,
    sca: 83,
    hue: 25,
    notes: { pl: "czekolada · daktyle", en: "chocolate · dates" },
    badges: [],
    desc: {
      pl: "Bezkofeinowa Peru odkofeinowana metodą cukrową (EA) — bez chemii rodem z przeszłości, z zachowanym pełnym smakiem. W filiżance czekoladowa i daktylowa, zaskakująco okrągła jak na decaf. To kawa na wieczór bez wyrzeczeń: cały rytuał, zero nieprzespanej nocy. Świetna po kolacji, z ekspresu lub przelewu.",
      en: "A Peru decaf, decaffeinated with the sugar-cane (EA) method — no chemistry from the past, all the flavour kept. In the cup it's chocolatey and date-sweet, surprisingly round for a decaf. An evening coffee without compromise: the whole ritual, none of the sleepless night. Great after dinner, from espresso or pour-over."
    }
  },
  {
    id: "stocznia-dark",
    lot: "21",
    name: "Stocznia Dark",
    origin: "brazylia-indie",
    originLabel: { pl: "Brazylia + Indie", en: "Brazil + India" },
    roast: 5,
    profile: ["czekoladowa"],
    format: "ziarna",
    price250: 38, price1000: 129,
    sca: 82,
    hue: 16,
    notes: { pl: "gorzka czekolada · melasa", en: "dark chocolate · molasses" },
    badges: [],
    desc: {
      pl: "Ciemna, mocna mieszanka z dodatkiem indyjskiej robusty — ukłon w stronę portowych kafejek Gdańska. Gorzka czekolada i melasa budują gęstą kremę i długi, wytrawny finisz. To kawa dla tych, co lubią „grubo”, i do klasycznego, mocnego espresso z crema jak aksamit. Z mlekiem zamienia się w solidne, wytrawne cappuccino.",
      en: "A dark, strong blend with a touch of Indian robusta — a nod to Gdańsk's portside cafés. Dark chocolate and molasses build a thick crema and a long, dry finish. A coffee for those who like it bold, and for a classic, strong espresso with velvet crema. With milk it becomes a solid, dry cappuccino."
    }
  },
  {
    id: "kolumbia-geisha",
    lot: "23",
    name: "Kolumbia Geisha Micro-lot",
    origin: "kolumbia",
    originLabel: { pl: "Kolumbia", en: "Colombia" },
    roast: 1,
    profile: ["kwiatowa", "owocowa"],
    format: "ziarna",
    price250: 89, price1000: null,
    sca: 90,
    hue: 40,
    notes: { pl: "liczi · herbata jaśminowa · płatki róży", en: "lychee · jasmine tea · rose petals" },
    badges: ["limitowane", "wyprzedane"], soldOut: true,
    desc: {
      pl: "Mikrolot odmiany Geisha — najbardziej aromatyczna kawa w naszej ofercie i prawdziwy rarytas. Liczi, herbata jaśminowa i płatki róży unoszą się z filiżanki niemal jak perfumy. To kawa do celebracji, parzona powoli i pita w skupieniu, bez mleka. Nakład jest ściśle limitowany — gdy się skończy, znika do następnego sezonu.",
      en: "A Geisha micro-lot — the most aromatic coffee we offer and a genuine rarity. Lychee, jasmine tea and rose petals lift from the cup almost like perfume. A coffee to celebrate, brewed slowly and sipped with attention, no milk. The batch is strictly limited — when it's gone, it's gone until next season."
    }
  },
  {
    id: "drip-box",
    lot: "—",
    name: "Drip Packi Box (10 szt.)",
    origin: "mix",
    originLabel: { pl: "Mix: Etiopia + Kolumbia", en: "Mix: Ethiopia + Colombia" },
    roast: 2,
    profile: ["owocowa", "karmelowa"],
    format: "drip",
    price250: 45, price1000: null, boxOnly: true,
    sca: 85,
    hue: 34,
    notes: { pl: "10 saszetek · przelew bez sprzętu", en: "10 sachets · brew without gear" },
    badges: [],
    desc: {
      pl: "Dziesięć jednorazowych drip packów — rozrywasz saszetkę, zakładasz ją na kubek i zalewasz gorącą wodą. Świeżo palona kawa bez ekspresu, młynka i całego rytuału: w pracy, w pociągu, na kempingu czy w hotelu. W środku mieszanka Etiopii i Kolumbii — owocowa, słodka i bezpretensjonalna. Idealny prezent i sposób, by spróbować specialty bez sprzętu.",
      en: "Ten single-serve drip packs — tear the sachet, rest it on your mug and pour hot water. Freshly roasted coffee with no machine, grinder or ritual: at work, on the train, camping or in a hotel. Inside, an Ethiopia-and-Colombia blend — fruity, sweet and unpretentious. The perfect gift and a way to try specialty with no gear."
    }
  }
];

if (typeof window !== "undefined") window.PRODUCTS = PRODUCTS;
