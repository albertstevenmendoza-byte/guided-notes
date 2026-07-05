/* =========================================================================
   GUIDED NOTES — CONTENT FILE
   =========================================================================
   This is the ONLY file instructors need to edit to add a new lecture's
   guided notes. Don't edit app.js or styles.css unless you're changing how
   the app works, not what it says. Whatever you add here shows up
   automatically on both notes.html (students) and instructor.html
   (answer key) — you never write content twice.

   HOW TO ADD A NEW NOTE SET
   --------------------------------------------------------------------------
   1. Copy the example object below (from { to the matching }) and paste it
      into the NOTE_SETS array.
   2. Give it a unique "id" — lowercase, no spaces (e.g. "1b-frequency-tables").
      This id is what saves each student's answers, so once a note set has
      been used in class, don't change its id or you'll wipe saved answers.
   3. Fill in "title", "unit", and "date" (YYYY-MM-DD, controls sort order).
   4. Build the "content" array from these block types:

        { type: "heading", text: "..." }
            A section heading.

        { type: "paragraph", html: "..." }
            Regular text. Drop a blank anywhere with {{b:key}}. You can use
            basic HTML here too, e.g. <strong>bold</strong>, or even an
            <img src="..."> tag if you're hosting an image somewhere.

        { type: "box", tone: "key" | "example" | "tip" | "question",
          label: "...", html: "..." }
            A highlighted callout box. Also supports {{b:key}} blanks.
            tone controls the color + default label:
              key      -> "Key Idea"       (teal)
              example  -> "Example"        (gold)
              tip      -> "Tip"            (blue)
              question -> "Think About It" (plum)
            "label" is optional — omit it to use the tone's default label.

        { type: "table", caption: "...", headers: [...], rows: [[...], ...] }
            Any cell can contain a {{b:key}} blank.

        { type: "diagram", root: "...", branches: [ { html: "...",
          leaves: ["key1", "key2"] }, ... ] }
            A branching tree, like a Think-Pair-Share map: one root box on
            top, 2+ branch boxes below it (each can have {{b:key}} blanks
            in its text), and each branch can have its own row of small
            empty "leaf" boxes for students to fill in freely — list their
            blank keys in "leaves". Leave "leaves" out (or use []) if a
            branch shouldn't have any.

        { type: "graph", key: "...", instructions: "...",
          xMin: -10, xMax: 10, yMin: -10, yMax: 10, xStep: 1, yStep: 1,
          line: { m: 2, b: 1 } }
            An interactive coordinate grid. Students click the grid to plot
            points (click again to remove one) — good for "plot these
            points" or "graph this line" exercises. "key" works like a
            blank key (must be unique in this note set) but isn't wrapped
            in {{b: }} — it's just a plain field on the block. xMin/xMax/
            yMin/yMax/xStep/yStep control the grid range and spacing (all
            optional, default to -10..10 step 1). "line" is optional — if
            set, that line is always drawn as a given reference line for
            both students and instructors (e.g. "here's the line, plot 3
            points on it"). Leave "line" out for a blank grid.

   BLANK SYNTAX
   --------------------------------------------------------------------------
     {{b:key}}          short blank (~1-2 words)
     {{b:key|long}}      wide blank (~short phrase)
     {{b:key|area}}      multi-line textarea (for "explain in your own
                          words" style prompts)
     "key" only needs to be unique WITHIN one note set, not across all of
     them. Use short, descriptive keys, e.g. "slope", "row1", "explain".

   MATH NOTATION
   --------------------------------------------------------------------------
   Wrap any LaTeX math in single dollar signs for inline notation, or double
   dollar signs for a larger, centered equation. Works anywhere text does —
   paragraphs, boxes, table cells, diagram text.

     Inline:  "The formula is $y = mx + b$."
     Block:   "$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$"

   This uses the same LaTeX syntax as most online equation editors — search
   "KaTeX supported functions" if you need the full symbol list.

   Writing about actual money in the same block as math? A lone "$" can get
   mistaken for the start of a math expression. Escape it as "\$" (e.g.
   "This costs \$5") to force it to display as a plain dollar sign.

   ANSWER KEYS (for the instructor page)
   --------------------------------------------------------------------------
   Add an "answerKey" object alongside "content" with the correct answer for
   every blank key you used, e.g.:

       answerKey: {
         slope: "the rate of change",
         yint: "the value of f(x) when x = 0"
       }

   For a "graph" block, the answer is a list of expected points instead of
   text — the instructor page plots them on the same grid:

       answerKey: {
         mygraph: { points: [ { x: 0, y: 1 }, { x: 1, y: 3 } ] }
       }

   Any blank you forget shows up on the instructor page in red as
   "(add answer key)" so it's easy to spot what's missing. The instructor
   page never shows up for students — it's a separate file, instructor.html.

   That's it — no other code changes needed. Save this file and refresh.
   ========================================================================= */

const NOTE_SETS = [

  {
    id: "1a-scale-of-measurements",
    title: "Scale of Measurements",
    unit: "Unit 1",
    date: "2026-08-25",
    content: [

      { type: "heading", text: "Vocabulary" },
      {
        type: "table",
        headers: ["", "", ""],
        rows: [
          ["Nominal", "Interval", "Qualitative"],
          ["Ordinal", "Ratio", "Quantitative"]
        ]
      },

      { type: "heading", text: "Warm-Up" },
      {
        type: "paragraph",
        html: "Take a look at the set of US coins. We'll use them to think about how we categorize and measure data."
      },
      {
        type: "paragraph",
        html: "<strong>1. What data can you obtain by analyzing the US Coin currency?</strong>{{b:warmup1|area}}"
      },
      {
        type: "paragraph",
        html: "<strong>2. What are some categories that you might have?</strong>{{b:warmup2|area}}"
      },

      { type: "heading", text: "The Four Levels of Measurement" },
      {
        type: "table",
        caption: "Fill in each definition, then add your own example in the last column",
        headers: ["Word", "Definition", "Examples"],
        rows: [
          [
            "Nominal",
            "This level of measurement is where variables can be placed into {{b:nom_categories|long}}. They don't have a {{b:nom_order|long}} and so cannot be added, subtracted, divided, or multiplied. They also have no {{b:nom_zero|long}}.",
            "{{b:nom_example|area}}"
          ],
          [
            "Ordinal",
            "This level of measurement represents an {{b:ord_ordered|long}} series of relationships or {{b:ord_rankings|long}}. The differences between each one is not really known.",
            "{{b:ord_example|area}}"
          ],
          [
            "Interval",
            "This level of measurement — both the {{b:int_order|long}} and the exact {{b:int_difference|long}} between the values — are known, with the additional property that the difference between any two data values is meaningful. However, they don't have a \"{{b:int_zero|long}}.\"",
            "{{b:int_example|area}}"
          ],
          [
            "Ratio",
            "This level of measurement tells us about the order. It tells us the exact value between units, AND it also has an {{b:rat_truezero|long}} — which allows for a wide range of both descriptive and inferential statistics to be applied.",
            "{{b:rat_example|area}}"
          ]
        ]
      },

      {
        type: "box",
        tone: "key",
        label: "Key Idea — Absolute Zero (True Zero)",
        html: "It is the value 0 that is included on the scale or instrument used to measure the values of the variable. It is either the natural starting point for the scale and instrument, or it represents the absence of the variable. Additionally, its value is not subjective — in other words, it leaves no room for conflicting opinions."
      },

      { type: "heading", text: "Think-Pair-Share" },
      {
        type: "diagram",
        root: "Variable",
        branches: [
          {
            html: "<strong>Qualitative</strong> (or numerical) data consist of {{b:qual_1}} representing counts or {{b:qual_2|long}}.",
            leaves: ["qual_leaf1", "qual_leaf2"]
          },
          {
            html: "<strong>Quantitative</strong> (or categorical) data can be {{b:quant_1}} into {{b:quant_2}} categories that are distinguished by some non {{b:quant_3|long}}.",
            leaves: ["quant_leaf1", "quant_leaf2"]
          }
        ]
      }
    ],

    /* NOTE: I transcribed this from a scanned/photographed worksheet, so a
       few of these answers are my best inference from context rather than
       pulled from an original key — double check the ones below marked
       with a "?" before relying on this page in class. Also worth a look:
       the original doc labels "Qualitative" as "(or numerical)" and
       "Quantitative" as "(or categorical)" — that's the reverse of how
       those terms are usually used, so confirm whether that's intentional
       or a typo in the source file before this goes out to students. */
    answerKey: {
      warmup1: "Denomination (value), the year minted, material/metal, size, and which president or symbol is shown.",
      warmup2: "By value (penny, nickel, dime...), by material, by year, or by whether they're still in circulation.",

      nom_categories: "categories",
      nom_order: "logical or natural order", // ?
      nom_zero: "meaningful zero point", // ?

      ord_ordered: "ordered",
      ord_rankings: "rankings",

      int_order: "order",
      int_difference: "difference",
      int_zero: "true zero",

      rat_truezero: "true (absolute) zero",

      nom_example: "Eye color, blood type, coin type (penny, nickel, dime, quarter)",
      ord_example: "Race finish place (1st, 2nd, 3rd), coin condition (poor, good, mint)",
      int_example: "Temperature in °F, calendar year",
      rat_example: "Coin's monetary value, height, weight",

      qual_1: "categories", // ?
      qual_2: "measurable amounts", // ?
      quant_1: "divided", // ?
      quant_2: "separate", // ?
      quant_3: "numeric value", // ?

      qual_leaf1: "Nominal",
      qual_leaf2: "Ordinal",
      quant_leaf1: "Interval",
      quant_leaf2: "Ratio"
    }
  },

  {
    id: "1b-plotting-points",
    title: "Plotting Points on a Line",
    unit: "Unit 1",
    date: "2026-08-27",
    content: [
      { type: "heading", text: "Warm-Up" },
      {
        type: "paragraph",
        html: "A linear equation graphs as a {{b:shape}}. Every point that satisfies the equation lies on that line."
      },
      {
        type: "graph",
        key: "line_practice",
        instructions: "The line y = 2x + 1 is graphed for you. Click the grid to plot 3 points that fall on the line.",
        xMin: -5, xMax: 5, yMin: -5, yMax: 5, xStep: 1, yStep: 1,
        line: { m: 2, b: 1 }
      },
      {
        type: "box",
        tone: "tip",
        label: "Tip",
        html: "Pick easy x-values like -1, 0, and 1, then plug each into y = 2x + 1 to find the matching y-value before you click."
      }
    ],
    answerKey: {
      shape: "straight line",
      line_practice: { points: [ { x: -1, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 3 } ] }
    }
  }

  /* Add your team's next note set below this line. Copy an example above,
     paste it here, and update the id / title / unit / date / content /
     answerKey. */

];
