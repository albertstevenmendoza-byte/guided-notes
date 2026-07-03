/* =========================================================================
   CREATE ACCOUNTS — run this LOCALLY with Node, never in a browser
   =========================================================================
   This script uses your Supabase SERVICE ROLE key, which has full admin
   access to your entire database — it completely bypasses Row Level
   Security. That key must never appear in any file that ends up in a
   browser, a public repo, or anywhere a student could see it.

   This file is safe to commit to GitHub as-is — the actual secret and your
   roster both live in create-accounts.config.js, which .gitignore excludes
   from every commit. That way there's no edited version of *this* file
   that could accidentally get swept into a commit.

   SETUP
   --------------------------------------------------------------------------
   1. npm install @supabase/supabase-js
   2. Copy create-accounts.config.example.js to create-accounts.config.js
      (the .js one, not .example.js) and fill in your real values there.
      .gitignore already excludes create-accounts.config.js by name, so it
      never gets committed even with `git add .`.
   3. Run: node create-accounts.js
   4. It prints progress and writes roster-credentials.csv with everyone's
      username + password. .gitignore excludes that file too. Print or hand
      the credentials out, then delete the file — don't leave it sitting
      around even locally.

   Re-running is safe for people already in the roster — it skips creating
   an account if that username already exists, so you can keep adding new
   people to the roster in create-accounts.config.js over the school year
   and re-run any time.
   ========================================================================= */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

let config;
try{
  config = require("./create-accounts.config.js");
}catch(e){
  console.error("Couldn't find create-accounts.config.js — copy create-accounts.config.example.js to that filename and fill in your real values first.");
  process.exit(1);
}
const SUPABASE_URL = config.SUPABASE_URL;
const SERVICE_ROLE_KEY = config.SERVICE_ROLE_KEY;
const ROSTER = config.ROSTER;

const EMAIL_DOMAIN = "@guidednotes.local";

const WORDS = [
  "coral","otter","maple","comet","amber","brisk","cedar","delta","ember","fable",
  "grove","haven","ivory","jolly","karma","lunar","mango","noble","olive","pearl",
  "quartz","raven","sable","tidal","umber","vivid","willow","yield","zephyr","alder"
];

function randomPassword(){
  function pick(){ return WORDS[Math.floor(Math.random() * WORDS.length)]; }
  var num = Math.floor(10 + Math.random() * 90);
  return pick() + "-" + pick() + "-" + num;
}

function slugify(name){
  return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function usernameTaken(supabase, username){
  const { data } = await supabase.from("profiles").select("username").eq("username", username).maybeSingle();
  return !!data;
}

async function uniqueUsername(supabase, base){
  let candidate = base, i = 2;
  while(await usernameTaken(supabase, candidate)){
    candidate = base + "-" + i;
    i++;
  }
  return candidate;
}

async function run(){
  if(!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR_SUPABASE") === 0 || !SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.indexOf("YOUR_SERVICE") === 0){
    console.error("Fill in SUPABASE_URL and SERVICE_ROLE_KEY in create-accounts.config.js before running this.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const results = [];

  for(const person of ROSTER){
    const base = slugify(person.name);
    if(!base){ console.warn("Skipping entry with no usable name:", person); continue; }

    const alreadyExists = await usernameTaken(supabase, base);
    if(alreadyExists){
      console.log("Skipping " + person.name + " — username \"" + base + "\" already exists.");
      continue;
    }

    const username = await uniqueUsername(supabase, base);
    const password = randomPassword();
    const email = username + EMAIL_DOMAIN;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { display_name: person.name, username: username }
    });

    if(authError){
      console.error("Failed to create auth user for " + person.name + ":", authError.message);
      continue;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username: username,
      display_name: person.name,
      role: person.role
    });

    if(profileError){
      console.error("Created the login for " + person.name + " but failed to save their profile:", profileError.message);
      continue;
    }

    results.push({ name: person.name, role: person.role, username: username, password: password });
    console.log("Created: " + person.name + " -> username \"" + username + "\"");
  }

  if(results.length === 0){
    console.log("\nNo new accounts created.");
    return;
  }

  const csvLines = ["name,role,username,password"].concat(
    results.map(function(r){ return '"' + r.name + '",' + r.role + "," + r.username + "," + r.password; })
  );
  fs.writeFileSync("roster-credentials.csv", csvLines.join("\n"));
  console.log("\n" + results.length + " account(s) created. Credentials saved to roster-credentials.csv.");
  console.log("Hand those out, then delete the file — don't leave it lying around.");
}

run().catch(function(err){
  console.error("Something went wrong:", err.message);
  process.exit(1);
});
