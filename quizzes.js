/* =========================================================================
   QUIZZES — CONTENT FILE
   =========================================================================
   This is where quiz content lives. Structured the same way data.js is —
   you're editing a plain array of quiz objects.

   HOW TO ADD A NEW QUIZ
   --------------------------------------------------------------------------
   1. Copy the example object below and paste it into the QUIZZES array.
   2. Give it a unique "id" (lowercase, no spaces). Once students have taken
      a quiz, don't change its id — that's what ties a saved attempt back
      to the right quiz.
   3. Fill in "title", "unit", "date", and "instructorEmail" (used for the
      "Email results" button on the results screen).
   4. Build the "questions" array from these types:

        { type: "mc", id: "...", prompt: "...", choices: [...],
          multiple: false, points: 1 }
            Multiple choice. Set "multiple: true" for select-all-that-apply
            (rendered as checkboxes instead of radio buttons). Grading is
            all-or-nothing — every correct choice must be selected and no
            incorrect ones, no partial credit.

        { type: "short", id: "...", prompt: "...", points: 1 }
            A short typed answer, auto-checked against a list of accepted
            answers (case- and whitespace-insensitive).

        { type: "match", id: "...", prompt: "...", left: [...], right: [...],
          points: <left.length by default> }
            A matching exercise. Each item in "left" gets a dropdown of the
            "right" options. 1 point per correct pair unless you override
            "points".

        { type: "graph", id: "...", prompt: "...", xMin, xMax, yMin, yMax,
          xStep, yStep, line: { m, b } }
            Reuses the same interactive point-plotting grid from the guided
            notes. NOT auto-graded — there's no reliable way to auto-score
            "close enough" plotted points, so these are flagged on the
            results screen for you to review by eye instead of scored.

   5. "allowUpload: true" adds a file-attach field to the results screen, for
      turning in handwritten work alongside the quiz.

   MATH NOTATION
   --------------------------------------------------------------------------
   Any question's "prompt" can include LaTeX math — wrap it in single dollar
   signs inline ("Solve for x: $2x + 3 = 7$") or double dollar signs for a
   larger, centered equation. Same syntax as data.js.

   ANSWER KEYS
   --------------------------------------------------------------------------
   Add an "answerKey" object next to "questions":

       answerKey: {
         q1: { correct: ["B"] },                          // mc (single)
         q2: { correct: ["A","C"] },                       // mc (multiple)
         q3: { accept: ["frequency", "freq"] },             // short answer
         q4: { correct: { "1":"a", "2":"c", "3":"b" } }     // match
         // graph questions don't need an answerKey entry — see above
       }

   IMPORTANT — READ BEFORE USING THIS FOR GRADED WORK
   --------------------------------------------------------------------------
   This answer key ships to the browser in plain text inside this file.
   Anyone who opens developer tools can read it. That's an acceptable
   tradeoff for low-stakes practice quizzes, but don't treat this as secure
   for anything high-stakes until it's wired up to grade server-side
   (e.g. once this is on Supabase).
   ========================================================================= */

const QUIZZES = [

  {
    id: "1a-measurement-check",
    title: "Scale of Measurements — Check",
    unit: "Unit 1",
    date: "2026-08-29",
    instructorEmail: "instructor@example.edu",
    allowUpload: true,
    questions: [
      {
        type: "mc",
        id: "q1",
        prompt: "Which level of measurement has categories with no meaningful order?",
        choices: ["Nominal", "Ordinal", "Interval", "Ratio"],
        multiple: false,
        points: 1
      },
      {
        type: "mc",
        id: "q2",
        prompt: "Select every level of measurement that has a true (absolute) zero.",
        choices: ["Nominal", "Ordinal", "Interval", "Ratio"],
        multiple: true,
        points: 1
      },
      {
        type: "short",
        id: "q3",
        prompt: "What do we call the value 0 when it represents the true absence of a variable?",
        points: 1
      },
      {
        type: "match",
        id: "q4",
        prompt: "Match each level of measurement to its example.",
        left: ["Nominal", "Ordinal", "Interval", "Ratio"],
        right: ["Coin type (penny, nickel...)", "Race finish place", "Temperature in °F", "Coin's monetary value"]
      },
      {
        type: "graph",
        id: "q5",
        prompt: "Plot 3 points that fall on the line y = x + 2.",
        xMin: -5, xMax: 5, yMin: -5, yMax: 5, xStep: 1, yStep: 1,
        line: { m: 1, b: 2 }
      }
    ],
    answerKey: {
      q1: { correct: ["Nominal"] },
      q2: { correct: ["Ratio"] },
      q3: { accept: ["true zero", "absolute zero", "true (absolute) zero"] },
      q4: { correct: {
        "Nominal": "Coin type (penny, nickel...)",
        "Ordinal": "Race finish place",
        "Interval": "Temperature in °F",
        "Ratio": "Coin's monetary value"
      } }
      // q5 is a graph question — no answer key entry needed
    }
  }

  /* Add your team's next quiz below this line. */

];
