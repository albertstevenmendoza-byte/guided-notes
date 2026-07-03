<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guided Notes — Home</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
<style>
  .home-shell{ max-width:720px; margin:0 auto; padding:28px 20px 100px; }
  .home-head{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; gap:12px; flex-wrap:wrap; }
  .home-head h1{ font-family:var(--font-display); font-weight:600; font-size:1.6rem; margin:0 0 4px; }
  .home-head p{ margin:0; color:var(--ink-soft); font-size:0.92rem; }
  .account-badge{ display:flex; align-items:center; }

  .nav-grid{ display:grid; grid-template-columns:1fr; gap:14px; }
  @media(min-width:560px){ .nav-grid{ grid-template-columns:1fr 1fr; } }

  .nav-card{
    display:flex; flex-direction:column; gap:8px; background:var(--card); border:1px solid var(--rule);
    border-left:4px solid var(--pine); border-radius:12px; padding:18px 20px; box-shadow:var(--shadow);
    transition:transform .12s ease;
  }
  .nav-card:hover{ transform:translateY(-1px); }
  .nav-card.instructor-only{ border-left-color:var(--warn); }
  .nav-card h3{ font-family:var(--font-display); font-weight:600; font-size:1.08rem; margin:0; }
  .nav-card p{ margin:0; font-size:0.86rem; color:var(--ink-soft); line-height:1.5; }
  .nav-card .go{ font-size:0.84rem; font-weight:600; color:var(--pine-dark); margin-top:4px; }
  .nav-card.instructor-only .go{ color:var(--warn); }
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-inner">
    <div class="brand"><span class="brand-mark">Guided Notes<span class="dot">.</span></span></div>
    <div class="account-badge" id="accountBadge" style="margin-left:auto;"></div>
  </div>
</div>

<div class="home-shell">
  <div class="home-head">
    <div>
      <h1 id="greeting">Welcome</h1>
      <p id="roleLine"></p>
    </div>
  </div>
  <div class="nav-grid" id="navGrid"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="auth.js"></script>
<script>
(function(){
  "use strict";

  GuidedAuth.requireAuth(["student","instructor"]).then(function(profile){
    if(!profile) return;

    document.getElementById("greeting").textContent = "Welcome, " + profile.display_name;
    document.getElementById("roleLine").textContent = profile.role === "instructor" ? "Instructor account" : "Student account";
    GuidedAuth.renderAccountBadge(document.getElementById("accountBadge"), profile);

    var cards = [
      { href:"notes.html", title:"Guided Notes", desc:"Fill in your notes during class. Saves automatically.", roles:["student","instructor"] },
      { href:"quiz.html", title:"Quizzes", desc:"Take a quiz, see your results, and turn in your work.", roles:["student","instructor"] },
      { href:"instructor.html", title:"Answer Keys", desc:"Instructor copy of every guided note set with answers filled in.", roles:["instructor"] },
      { href:"builder.html", title:"Content Builder", desc:"Create new guided notes — tables, blanks, diagrams, graphs.", roles:["instructor"] },
      { href:"inbox.html", title:"Quiz Inbox", desc:"See every quiz your students have submitted, with scores.", roles:["instructor"] }
    ];

    var grid = document.getElementById("navGrid");
    grid.innerHTML = cards
      .filter(function(c){ return c.roles.indexOf(profile.role) > -1; })
      .map(function(c){
        var instructorOnly = c.roles.length === 1 && c.roles[0] === "instructor";
        return '<a class="nav-card'+(instructorOnly ? " instructor-only" : "")+'" href="'+c.href+'">' +
          '<h3>'+c.title+'</h3><p>'+c.desc+'</p>' +
          '<span class="go">Open →</span>' +
        '</a>';
      }).join("");
  });
})();
</script>
</body>
</html>
