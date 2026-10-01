// Saint Vincent and the Grenadines → Zimbabwe. See ../draw.mjs for the DSL.
import {
  BLACK,
  WHITE,
  band,
  circle,
  crescent,
  cross,
  ensign,
  fill,
  hstripes,
  pixelStar,
  pixels,
  poly,
  rect,
  star,
  unionJack,
  vstripes,
} from "../draw.mjs";

export const flags = {
  "saint-vincent-and-the-grenadines": {
    layers: [
      vstripes(["#0072c6", "#fcd116", "#009e60"], [1, 2, 1]),
      // Three diamonds in a V.
      pixels(
        10,
        5,
        [
          ".g.....g.",
          "ggg...ggg",
          "ggg...ggg",
          ".g..g..g.",
          "...ggg...",
          "...ggg...",
          "....g....",
        ],
        { g: "#009e60" }
      ),
    ],
  },
  samoa: {
    layers: [
      fill("#ce1126"),
      rect(0, 0, 15, 10, "#002b7f"),
      // The Southern Cross: four plus-shaped stars and a little one.
      pixels(
        2,
        0,
        [
          "....w....",
          "...www...",
          "....w..w.",
          ".w....www",
          "www.w..w.",
          ".w.......",
          "....w....",
          "...www...",
          "....w....",
        ],
        { w: WHITE }
      ),
    ],
  },
  "san-marino": {
    layers: [
      hstripes([WHITE, "#5eb6e4"]),
      // The arms: crown over a blue shield in a green wreath.
      pixels(
        12,
        5,
        [".yyy.", ".yyy.", "g.b.g", "gbbbg", "gbwbg", ".gbg.", "..g.."],
        { y: "#f1bf31", g: "#65a30d", b: "#5eb6e4", w: WHITE }
      ),
    ],
  },
  "sao-tome-and-principe": {
    layers: [
      hstripes(["#12ad2b", "#ffce00", "#12ad2b"], [2, 3, 2]),
      poly(
        [
          [0, 0],
          [9, 10],
          [0, 20],
        ],
        "#d21034"
      ),
      pixelStar(12, 7, BLACK),
      pixelStar(19, 7, BLACK),
    ],
  },
  "saudi-arabia": {
    layers: [
      fill("#006c35"),
      // The shahada as a few lines of "script", over the sword.
      pixels(
        6,
        4,
        [
          "w.w..w.ww.w.ww.w",
          "wwwww.wwwwwwwwww",
          "...w..w....w..w.",
          "",
          "",
          "...............w",
          "wwwwwwwwwwwwwwwww",
          "...............w",
        ],
        { w: WHITE }
      ),
    ],
  },
  senegal: {
    layers: [
      vstripes(["#00853f", "#fdef42", "#e31b23"]),
      pixelStar(12, 7, "#00853f"),
    ],
  },
  serbia: {
    layers: [
      hstripes(["#c6363c", "#0c4076", WHITE]),
      // The arms, hoist-side: a crowned red shield with the white eagle.
      pixels(
        6,
        3,
        [
          "..yy..",
          ".yyyy.",
          "rrrrrr",
          "rwrrwr",
          "rwwwwr",
          "rrwwrr",
          "rrwwrr",
          "rwrrwr",
          ".rrrr.",
          "..rr..",
        ],
        { y: "#edb92e", r: "#c6363c", w: WHITE }
      ),
    ],
  },
  seychelles: {
    // Five bands fanning out of the bottom-left corner.
    layers: [
      poly(
        [
          [0, 20],
          [0, 0],
          [10, 0],
        ],
        "#003f87"
      ),
      poly(
        [
          [0, 20],
          [10, 0],
          [20, 0],
        ],
        "#fcd856"
      ),
      poly(
        [
          [0, 20],
          [20, 0],
          [30, 0],
          [30, 6.67],
        ],
        "#d62828"
      ),
      poly(
        [
          [0, 20],
          [30, 6.67],
          [30, 13.33],
        ],
        WHITE
      ),
      poly(
        [
          [0, 20],
          [30, 13.33],
          [30, 20],
        ],
        "#007a3d"
      ),
    ],
  },
  "sierra-leone": { layers: hstripes(["#1eb53a", WHITE, "#0072c6"]) },
  singapore: {
    layers: [
      hstripes(["#ef3340", WHITE]),
      crescent(6, 5, 3.6, 7.6, 5, 3.2, WHITE),
      pixels(7, 2, ["..w..", "w...w", ".....", ".w.w."], { w: WHITE }),
    ],
  },
  slovakia: {
    layers: [
      hstripes([WHITE, "#0b4ea2", "#ee1c25"]),
      // The arms: a white double cross on red, over three blue hills.
      pixels(
        4,
        4,
        [
          "wwwwwwwww",
          "wrrrwrrrw",
          "wrrwwwrrw",
          "wrrrwrrrw",
          "wrwwwwwrw",
          "wrrrwrrrw",
          "wrrrwrrrw",
          "wbbbbbbbw",
          ".wbbbbbw.",
          "..wwwww..",
        ],
        { w: WHITE, r: "#ee1c25", b: "#0b4ea2" }
      ),
    ],
  },
  slovenia: {
    layers: [
      hstripes([WHITE, "#005da4", "#ed1c24"]),
      // The arms: Triglav under three gold stars, edged in red.
      pixels(
        5,
        3,
        [
          "rbybybr",
          "rbbbbbr",
          "rbbwbbr",
          "rbwwwbr",
          "rwwwwwr",
          ".rbbbr.",
          "..rrr..",
        ],
        { r: "#ed1c24", b: "#005da4", y: "#ffdd00", w: WHITE }
      ),
    ],
  },
  "solomon-islands": {
    layers: [
      poly(
        [
          [0, 0],
          [30, 0],
          [0, 20],
        ],
        "#0051ba"
      ),
      poly(
        [
          [30, 0],
          [30, 20],
          [0, 20],
        ],
        "#215b33"
      ),
      band(-1.5, 21, 31.5, -1, 2.2, "#fcd116"),
      pixels(1, 1, ["w...w", "..w..", "w...w"], { w: WHITE }),
    ],
  },
  somalia: { layers: [fill("#4189dd"), star(15, 10, 5.5, WHITE)] },
  "south-africa": {
    layers: [
      hstripes(["#e03c31", "#001489"]),
      poly(
        [
          [0, 0],
          [10.5, 7.2],
          [30, 7.2],
          [30, 12.8],
          [10.5, 12.8],
          [0, 20],
        ],
        WHITE
      ),
      poly(
        [
          [0, 1.6],
          [9.6, 8.3],
          [30, 8.3],
          [30, 11.7],
          [9.6, 11.7],
          [0, 18.4],
        ],
        "#007749"
      ),
      poly(
        [
          [0, 3.3],
          [9.4, 10],
          [0, 16.7],
        ],
        "#ffb612"
      ),
      poly(
        [
          [0, 4.8],
          [7.4, 10],
          [0, 15.2],
        ],
        BLACK
      ),
    ],
  },
  "south-sudan": {
    layers: [
      hstripes([BLACK, WHITE, "#da121a", WHITE, "#078930"], [6, 1, 6, 1, 6]),
      poly(
        [
          [0, 0],
          [12, 10],
          [0, 20],
        ],
        "#0f47af"
      ),
      pixelStar(2, 7, "#fcdd09"),
    ],
  },
  "sri-lanka": {
    layers: [
      fill("#ffb700"),
      // Laid out in exact pixels so the yellow border stays 1px everywhere.
      pixels(1, 1, Array(17).fill("gggooo"), { g: "#005f56", o: "#ff5b00" }),
      pixels(8, 1, Array(17).fill("m".repeat(19)), { m: "#8d153a" }),
      // The lion with its sword, and the four bo leaves.
      pixels(
        9,
        2,
        [
          "y.................y",
          "",
          "......yy...........",
          ".....yyyy..........",
          "..y..yyy...........",
          "..yyyyyyyyy........",
          "...yyyyyyyyy.......",
          "...yyyyyyyy........",
          "...y..y..y.........",
          "...y..y..y.........",
          "",
          "",
          "",
          "",
          "y.................y",
        ].map((row) => row.padEnd(19, ".")),
        { y: "#ffb700" }
      ),
    ],
  },
  sudan: {
    layers: [
      hstripes(["#d21034", WHITE, BLACK]),
      poly(
        [
          [0, 0],
          [10, 10],
          [0, 20],
        ],
        "#007229"
      ),
    ],
  },
  suriname: {
    layers: [
      hstripes(
        ["#377e3f", WHITE, "#b40a2d", WHITE, "#377e3f"],
        [2, 1, 4, 1, 2]
      ),
      pixelStar(12, 7, "#ecc81d"),
    ],
  },
  sweden: { layers: [fill("#006aa7"), cross(11, 10, 4, "#fecc02")] },
  switzerland: {
    layers: [
      fill("#da291c"),
      rect(13, 4, 4, 12, WHITE),
      rect(9, 8, 12, 4, WHITE),
    ],
  },
  syria: {
    layers: [
      hstripes(["#007a3d", WHITE, BLACK]),
      pixelStar(5, 7, "#ce1126"),
      pixelStar(12, 7, "#ce1126"),
      pixelStar(19, 7, "#ce1126"),
    ],
  },
  tajikistan: {
    layers: [
      hstripes(["#cc0000", WHITE, "#006600"], [2, 3, 2]),
      // A crown under an arc of seven stars.
      pixels(
        10,
        6,
        ["..y.y.y..", ".y.....y.", "y...y...y", "..y.y.y..", "..yyyyy.."],
        { y: "#f8c300" }
      ),
    ],
  },
  tanzania: {
    layers: [
      poly(
        [
          [0, 0],
          [30, 0],
          [0, 20],
        ],
        "#1eb53a"
      ),
      poly(
        [
          [30, 0],
          [30, 20],
          [0, 20],
        ],
        "#00a3dd"
      ),
      band(-2, 21.5, 32, -1.5, 7, "#fcd116"),
      band(-2, 21.5, 32, -1.5, 4.6, BLACK),
    ],
  },
  thailand: {
    layers: hstripes(
      ["#a51931", WHITE, "#2d2a4a", WHITE, "#a51931"],
      [1, 1, 2, 1, 1]
    ),
  },
  "timor-leste": {
    layers: [
      fill("#dc241f"),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        "#ffc726"
      ),
      poly(
        [
          [0, 0],
          [10, 10],
          [0, 20],
        ],
        BLACK
      ),
      pixelStar(1, 7, WHITE),
    ],
  },
  togo: {
    layers: [
      hstripes(["#006a4e", "#ffce00", "#006a4e", "#ffce00", "#006a4e"]),
      rect(0, 0, 12, 12, "#d21034"),
      pixelStar(3, 3, WHITE),
    ],
  },
  tonga: {
    layers: [
      fill("#c10000"),
      rect(0, 0, 12, 10, WHITE),
      rect(5, 1.6, 2.2, 6.8, "#c10000"),
      rect(2.6, 4, 7, 2.2, "#c10000"),
    ],
  },
  "trinidad-and-tobago": {
    layers: [
      fill("#da1a35"),
      band(-3, -2, 33, 22, 7, WHITE),
      band(-3, -2, 33, 22, 4.8, BLACK),
    ],
  },
  tunisia: {
    layers: [
      fill("#e70013"),
      circle(15, 10, 6, WHITE),
      pixels(
        10,
        5,
        [
          "..rrrr...",
          ".rr......",
          "rr...r...",
          "r..rrrrr.",
          "r...rrr..",
          "r...r.r..",
          "rr.......",
          ".rr......",
          "..rrrr...",
        ],
        { r: "#e70013" }
      ),
    ],
  },
  turkmenistan: {
    layers: [
      fill("#00843d"),
      rect(4.2, 0, 5.4, 20, "#d22630"),
      // Five carpet guls down the red stripe.
      pixels(
        5,
        1,
        [
          ".w.",
          "wow",
          ".w.",
          "",
          ".w.",
          "wow",
          ".w.",
          "",
          ".w.",
          "wow",
          ".w.",
          "",
          ".w.",
          "wow",
          ".w.",
          "",
          ".w.",
          "wow",
          ".w.",
        ],
        { w: WHITE, o: "#f2a900" }
      ),
      crescent(14, 4.4, 2.8, 15.4, 4.4, 2.4, WHITE),
      pixels(15, 1, ["..w", ".w.w", "...", "w.w"], { w: WHITE }),
    ],
  },
  tuvalu: {
    layers: ensign(
      "#00a1de",
      // Nine stars, one per island, roughly where they sit on the map.
      pixels(
        14,
        1,
        [
          "...........y",
          "............",
          "......y.....",
          "...........y",
          "",
          "...y....y...",
          "",
          "",
          "",
          "y.....y.....",
          "",
          "...y.......y",
        ],
        { y: "#ffce00" }
      )
    ),
  },
  uganda: {
    layers: [
      hstripes([BLACK, "#fcdc04", "#d90000", BLACK, "#fcdc04", "#d90000"]),
      circle(15, 10, 4, WHITE),
      // The grey crowned crane.
      pixels(
        12,
        6,
        ["...y.", "..rg.", "...g.", "..gg.", ".ggg.", "..gg.", "..g.."],
        { y: "#fcdc04", r: "#d90000", g: "#9ca69c" }
      ),
    ],
  },
  ukraine: { layers: hstripes(["#0057b7", "#ffd700"]) },
  "united-arab-emirates": {
    layers: [
      hstripes(["#00732f", WHITE, BLACK]),
      rect(0, 0, 7.5, 20, "#ff0000"),
    ],
  },
  "united-kingdom": { layers: unionJack() },
  "united-states": {
    // 13 stripes don't divide into 19 pixel rows: rounding made every red
    // stripe 1px and every white one 2px, and the flag read mostly white.
    // One stripe per row keeps red and white even (10 rows to 9) instead.
    layers: [
      hstripes(
        Array.from({ length: 19 }, (_, i) => (i % 2 ? WHITE : "#b22234"))
      ),
      // The canton covers the top nine rows, ending on a red stripe as the
      // real one does, with the stars as a sparse staggered grid.
      pixels(
        0,
        0,
        Array.from({ length: 9 }, () => "b".repeat(11)),
        {
          b: "#3c3b6e",
        }
      ),
      pixels(
        0,
        0,
        ["", ".w.w.w.w.w", "", "..w.w.w.w", "", ".w.w.w.w.w", "", "..w.w.w.w"],
        { w: WHITE }
      ),
    ],
  },
  uruguay: {
    layers: [
      hstripes(
        Array.from({ length: 9 }, (_, i) => (i % 2 ? "#0038a8" : WHITE))
      ),
      rect(0, 0, 11.1, 11.1, WHITE),
      // The Sun of May.
      pixels(
        2,
        2,
        [
          "...y...",
          ".y.y.y.",
          "..yyy..",
          "yyyyyyy",
          "..yyy..",
          ".y.y.y.",
          "...y...",
        ],
        { y: "#fcd116" }
      ),
    ],
  },
  uzbekistan: {
    layers: [
      hstripes(
        ["#0099b5", "#ce1126", WHITE, "#ce1126", "#1eb53a"],
        [6, 1, 6, 1, 6]
      ),
      // The crescent and twelve stars, in rows of three, four and five.
      pixels(
        1,
        0,
        [
          ".ww.......w.w.w",
          "ww.............",
          "w.......w.w.w.w",
          "ww.............",
          ".ww...w.w.w.w.w",
        ],
        { w: WHITE }
      ),
    ],
  },
  vanuatu: {
    layers: [
      hstripes(["#d21034", "#009543"]),
      poly(
        [
          [0, 0],
          [14, 8],
          [30, 8],
          [30, 12],
          [14, 12],
          [0, 20],
        ],
        BLACK
      ),
      // The yellow Y, then the black triangle inside it.
      band(0, 1.6, 13, 10, 1.3, "#fdce12"),
      band(0, 18.4, 13, 10, 1.3, "#fdce12"),
      rect(12.5, 9.35, 17.5, 1.3, "#fdce12"),
      poly(
        [
          [0, 3.2],
          [10.5, 10],
          [0, 16.8],
        ],
        BLACK
      ),
      // The boar's tusk.
      pixels(2, 7, [".yy.", "y..y", "y...", ".yy."], { y: "#fdce12" }),
    ],
  },
  "vatican-city": {
    layers: [
      vstripes(["#ffe000", WHITE]),
      // The papal tiara over the crossed gold and silver keys.
      pixels(
        18,
        3,
        [
          "...y...",
          "..yyy..",
          "..yyy..",
          ".yyyyy.",
          "",
          "s.....y",
          ".s...y.",
          "..s.y..",
          "...y...",
          "..y.s..",
          ".y...s.",
          "yy...ss",
        ],
        { y: "#d4a017", s: "#a7a9ac" }
      ),
    ],
  },
  venezuela: {
    layers: [
      hstripes(["#ffcc00", "#00247d", "#cf142b"]),
      // An arc of eight stars.
      pixels(
        8,
        7,
        [
          ".....w.w.....",
          "...w.....w...",
          ".w.........w.",
          "",
          "w...........w",
        ],
        { w: WHITE }
      ),
    ],
  },
  vietnam: {
    layers: [fill("#da251d"), star(15, 10.4, 6.4, "#ffff00", { inner: 0.38 })],
  },
  yemen: { layers: hstripes(["#ce1126", WHITE, BLACK]) },
  zambia: {
    layers: [
      fill("#198a00"),
      rect(20.5, 8, 3.2, 12, "#de2010"),
      rect(23.7, 8, 3.2, 12, BLACK),
      rect(26.9, 8, 3.1, 12, "#ef7d00"),
      // The eagle in flight.
      pixels(21, 3, ["oo..oo", ".oooo.", "..oo.."], { o: "#ef7d00" }),
    ],
  },
  zimbabwe: {
    layers: [
      hstripes([
        "#319208",
        "#ffd200",
        "#d40000",
        BLACK,
        "#d40000",
        "#ffd200",
        "#319208",
      ]),
      poly(
        [
          [0, 0],
          [14, 10],
          [0, 20],
        ],
        BLACK
      ),
      poly(
        [
          [0, 1.4],
          [12, 10],
          [0, 18.6],
        ],
        WHITE
      ),
      pixelStar(2, 7, "#d40000"),
      // The Zimbabwe bird, a speck of gold on the star.
      pixels(4, 9, ["y"], { y: "#ffd200" }),
    ],
  },
};
