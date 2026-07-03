/* =========================================================================
   GUIDED NOTES — AUTH
   =========================================================================
   Shared by every page that needs a signed-in user (login.html, home.html,
   index.html, instructor.html, builder.html, quiz.html, inbox.html).

   SETUP — do this before anything else works:
   --------------------------------------------------------------------------
   1. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below with the values from
      your Supabase project (Dashboard > Project Settings > API). The anon
      key is safe to put in browser code — it only works within the Row
      Level Security rules set up in supabase-schema.sql.
   2. Run supabase-schema.sql once in your project's SQL Editor.
   3. Create accounts with create-accounts.js (run locally with Node, using
      your service_role key — never in a browser). It prints out a
      username + password for each person you add.

   Students and instructors sign in with a plain username, not an email —
   under the hood this maps to a fake email address
   (username@guidednotes.local) since Supabase Auth needs an email-shaped
   identifier. Nobody ever sees or needs that fake address.
   ========================================================================= */
(function(global){
  "use strict";

  // ====================== FILL THESE IN ======================
  var SUPABASE_URL = "https://qfrnweoijqcpokgnmzat.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmcm53ZW9panFjcG9rZ25temF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDY2ODUsImV4cCI6MjA5ODY4MjY4NX0.A10OoxGw9ohL3lQ6oCBo7e1m5lwJu4lYKaHnP8oEq38";
  // =============================================================

  var EMAIL_DOMAIN = "@guidednotes.local";

  var client = null;
  if(typeof supabase !== "undefined" && SUPABASE_URL.indexOf("YOUR_SUPABASE") !== 0){
    client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function isConfigured(){ return !!client; }

  function usernameToEmail(username){
    return String(username || "").trim().toLowerCase().replace(/\s+/g, "") + EMAIL_DOMAIN;
  }

  async function signIn(username, password){
    if(!client) return { error: "Supabase isn't configured yet — check auth.js." };
    if(!username || !password) return { error: "Enter both a username and password." };
    var email = usernameToEmail(username);
    var res = await client.auth.signInWithPassword({ email: email, password: password });
    if(res.error) return { error: "Incorrect username or password." };
    return { user: res.data.user };
  }

  async function signOut(){
    if(!client) return;
    await client.auth.signOut();
  }

  // Returns { id, username, display_name, role } for the signed-in user,
  // or null if nobody's signed in (or Supabase isn't configured yet).
  async function getProfile(){
    if(!client) return null;
    var sessionRes = await client.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if(!session) return null;
    var profRes = await client.from("profiles").select("*").eq("id", session.user.id).single();
    if(profRes.error || !profRes.data) return null;
    return profRes.data;
  }

  // Call at the very top of any page that should require sign-in.
  // allowedRoles is optional — e.g. ["instructor"] to lock a page down
  // further. Redirects away and returns null if the check fails; otherwise
  // resolves with the signed-in user's profile so the page can use it.
  async function requireAuth(allowedRoles){
    if(!isConfigured()){
      console.warn("Supabase isn't configured in auth.js yet — skipping the sign-in check for now.");
      return { id:"dev", username:"dev", display_name:"Dev Mode", role: (allowedRoles && allowedRoles[0]) || "student" };
    }
    var profile = await getProfile();
    if(!profile){
      window.location.href = "login.html";
      return null;
    }
    if(allowedRoles && allowedRoles.indexOf(profile.role) === -1){
      alert("Your account (" + profile.role + ") doesn't have access to this page.");
      window.location.href = "home.html";
      return null;
    }
    return profile;
  }

  // Drops a small "Signed in as X · Sign out" control into any element.
  function renderAccountBadge(container, profile){
    if(!container || !profile) return;
    container.innerHTML =
      '<span style="font-size:0.8rem;color:var(--ink-faint);">'+profile.display_name+'</span>' +
      '<button id="authSignOutBtn" style="font-size:0.78rem;font-weight:600;color:var(--warn);margin-left:8px;">Sign out</button>';
    var btn = container.querySelector("#authSignOutBtn");
    if(btn) btn.addEventListener("click", async function(){
      await signOut();
      window.location.href = "login.html";
    });
  }

  global.GuidedAuth = {
    isConfigured: isConfigured,
    signIn: signIn,
    signOut: signOut,
    getProfile: getProfile,
    requireAuth: requireAuth,
    usernameToEmail: usernameToEmail,
    renderAccountBadge: renderAccountBadge,
    client: client
  };

})(window);
