/* =========================================================================
   GUIDED NOTES — APP ENGINE
   =========================================================================
   Shared by notes.html (student view) and instructor.html (answer key view).
   You should not need to edit this file to add or change lecture content —
   that all lives in data.js. This file only needs edits if you're changing
   how the app behaves.
   ========================================================================= */
(function(global){
  "use strict";

  var STORAGE_KEY = "guidedNotesAnswers_v1";
  var APP_MODE = "student"; // "student" | "instructor"
  var store = {};           // student answers: { [noteSetId]: { [blankKey]: value } }
  var saveTimer = null;

  /* ---------------- storage (student mode only) ---------------- */
  function loadStore(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){
      console.warn("Could not read saved notes:", e);
      return {};
    }
  }
  function saveStore(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return true;
    }catch(e){
      console.warn("Could not save notes:", e);
      return false;
    }
  }
  function queueSave(){
    var indicator = document.getElementById("saveIndicator");
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      saveStore();
      if(indicator){
        indicator.classList.add("show");
        setTimeout(function(){ indicator.classList.remove("show"); }, 1400);
      }
    }, 350);
  }

  /* ---------------- helpers ---------------- */
  function escapeHtml(str){
    return String(str == null ? "" : str).replace(/[&<>"]/g, function(c){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c];
    });
  }
  function formatDate(iso){
    if(!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if(isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" });
  }

  function numOr(v, dflt){
    var n = parseFloat(v);
    return isNaN(n) ? dflt : n;
  }
  function clampNum(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  /* ---------------- graph / point-plotting ---------------- */
  // mode "instructor" shows the answer key's expected points (read-only);
  // any other mode shows the student's own plotted points and, unless
  // "preview", wires up click-to-plot.
  function renderGraph(block, noteId, mode, answers, answerKey){
    var PAD = 32, PLOT = 300, VB = PLOT + PAD*2;
    var xMin = numOr(block.xMin, -10), xMax = numOr(block.xMax, 10);
    var yMin = numOr(block.yMin, -10), yMax = numOr(block.yMax, 10);
    var xStep = numOr(block.xStep, 1), yStep = numOr(block.yStep, 1);
    if(xStep <= 0) xStep = 1;
    if(yStep <= 0) yStep = 1;

    function toPx(dx, dy){
      return [
        PAD + (dx - xMin) / (xMax - xMin) * PLOT,
        PAD + (yMax - dy) / (yMax - yMin) * PLOT
      ];
    }

    var gridSvg = "";
    var gx, gy;
    for(gx = Math.ceil(xMin/xStep)*xStep; gx <= xMax + 1e-9; gx += xStep){
      var a = toPx(gx, yMin), b = toPx(gx, yMax);
      var isAxis = Math.abs(gx) < 1e-9;
      gridSvg += '<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" class="'+(isAxis?"graph-axis-line":"graph-grid-line")+'"/>';
      if(!isAxis){
        var lp = toPx(gx, 0);
        gridSvg += '<text x="'+lp[0]+'" y="'+(lp[1]+12)+'" class="graph-tick-label" text-anchor="middle">'+(Math.round(gx*1000)/1000)+'</text>';
      }
    }
    for(gy = Math.ceil(yMin/yStep)*yStep; gy <= yMax + 1e-9; gy += yStep){
      var a2 = toPx(xMin, gy), b2 = toPx(xMax, gy);
      var isAxis2 = Math.abs(gy) < 1e-9;
      gridSvg += '<line x1="'+a2[0]+'" y1="'+a2[1]+'" x2="'+b2[0]+'" y2="'+b2[1]+'" class="'+(isAxis2?"graph-axis-line":"graph-grid-line")+'"/>';
      if(!isAxis2){
        var lp2 = toPx(0, gy);
        gridSvg += '<text x="'+(lp2[0]-6)+'" y="'+(lp2[1]+3)+'" class="graph-tick-label" text-anchor="end">'+(Math.round(gy*1000)/1000)+'</text>';
      }
    }

    var lineSvg = "";
    if(block.line){
      var m = numOr(block.line.m, 1), bb = numOr(block.line.b, 0);
      var y1 = clampNum(m*xMin + bb, yMin, yMax), y2 = clampNum(m*xMax + bb, yMin, yMax);
      var lp1 = toPx(xMin, y1), lp2b = toPx(xMax, y2);
      lineSvg = '<line x1="'+lp1[0]+'" y1="'+lp1[1]+'" x2="'+lp2b[0]+'" y2="'+lp2b[1]+'" class="graph-ref-line"/>';
    }

    var pointsToShow = [];
    if(mode === "instructor"){
      var ak = (answerKey && answerKey[block.key]) || {};
      pointsToShow = Array.isArray(ak.points) ? ak.points : [];
    } else {
      var v = answers && answers[block.key];
      pointsToShow = Array.isArray(v) ? v : [];
    }
    var dotsSvg = pointsToShow.map(function(pt){
      var p = toPx(numOr(pt.x,0), numOr(pt.y,0));
      return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" class="graph-point'+(mode==="instructor"?" graph-point-answer":"")+'"/>';
    }).join("");

    var interactiveLayer = "";
    if(mode !== "instructor" && mode !== "preview"){
      interactiveLayer = '<rect x="'+PAD+'" y="'+PAD+'" width="'+PLOT+'" height="'+PLOT+'" class="graph-hitlayer" ' +
        'data-note="'+noteId+'" data-key="'+block.key+'" ' +
        'data-xmin="'+xMin+'" data-xmax="'+xMax+'" data-ymin="'+yMin+'" data-ymax="'+yMax+'" ' +
        'data-xstep="'+xStep+'" data-ystep="'+yStep+'" data-pad="'+PAD+'" data-plot="'+PLOT+'" data-vb="'+VB+'"/>';
    }

    var instructions = block.instructions ? '<p class="graph-instructions">'+escapeHtml(block.instructions)+'</p>' : "";
    var hint = (mode !== "instructor" && mode !== "preview") ? '<p class="graph-hint">Click the grid to plot a point. Click a point again to remove it.</p>' : "";

    return '<div class="content-block"><div class="graph-wrap">' + instructions +
      '<svg viewBox="0 0 '+VB+' '+VB+'" class="graph-svg" preserveAspectRatio="xMidYMid meet">' +
        '<rect x="'+PAD+'" y="'+PAD+'" width="'+PLOT+'" height="'+PLOT+'" class="graph-bg"/>' +
        gridSvg + lineSvg + dotsSvg + interactiveLayer +
      '</svg>' + hint +
    '</div></div>';
  }


  // {{b:key}} short blank | {{b:key|long}} wide blank | {{b:key|area}} textarea
  var BLANK_SRC = "\\{\\{b:([a-zA-Z0-9_\\-]+)(?:\\|(long|area))?\\}\\}";

  // mode: "student" | "instructor" | "preview" (preview behaves like student
  // but never touches localStorage — used by the content builder)
  function renderBlanks(html, noteId, mode, answers, answerKey){
    var re = new RegExp(BLANK_SRC, "g");
    return html.replace(re, function(_, key, variant){
      if(mode === "instructor"){
        var has = answerKey && Object.prototype.hasOwnProperty.call(answerKey, key) && answerKey[key];
        var ans = has ? answerKey[key] : "(add answer key)";
        return '<mark class="answer-mark'+(has ? "" : " missing")+'">'+escapeHtml(ans)+'</mark>';
      }
      var val = (answers && answers[key]) || "";
      var safeVal = escapeHtml(val);
      if(variant === "area"){
        return '<textarea class="blank-area" data-note="'+noteId+'" data-key="'+key+'" placeholder="Type your answer…">'+safeVal+'</textarea>';
      }
      var width = variant === "long" ? "long" : "short";
      var filledClass = val ? " filled" : "";
      return '<input type="text" class="blank'+filledClass+'" data-w="'+width+'" data-note="'+noteId+'" data-key="'+key+'" value="'+safeVal+'" placeholder="…" autocomplete="off" spellcheck="false">';
    });
  }

  function leafFieldHtml(noteId, key, mode, answers, answerKey){
    if(mode === "instructor"){
      var has = answerKey && Object.prototype.hasOwnProperty.call(answerKey, key) && answerKey[key];
      var ans = has ? answerKey[key] : "(add answer key)";
      return '<div class="diagram-leaf-box"><mark class="answer-mark'+(has ? "" : " missing")+'">'+escapeHtml(ans)+'</mark></div>';
    }
    var val = (answers && answers[key]) || "";
    return '<div class="diagram-leaf-box"><input type="text" class="blank" data-note="'+noteId+'" data-key="'+key+'" value="'+escapeHtml(val)+'" placeholder="…" autocomplete="off" spellcheck="false"></div>';
  }

  function eachBlankKey(noteSet, fn){
    var re = new RegExp(BLANK_SRC, "g");
    function scan(str){
      var m;
      re.lastIndex = 0;
      while((m = re.exec(str)) !== null){ fn(m[1]); }
    }
    noteSet.content.forEach(function(block){
      if(block.html) scan(block.html);
      if(block.type === "table"){
        block.rows.forEach(function(row){ row.forEach(function(cell){ scan(String(cell)); }); });
      }
      if(block.type === "diagram"){
        block.branches.forEach(function(br){
          scan(br.html);
          (br.leaves || []).forEach(function(k){ fn(k); });
        });
      }
    });
  }

  function eachGraphBlock(noteSet, fn){
    noteSet.content.forEach(function(block){ if(block.type === "graph") fn(block); });
  }

  function countBlanks(noteSet){
    var total = 0, filled = 0;
    var answers = store[noteSet.id] || {};
    eachBlankKey(noteSet, function(key){
      total++;
      var v = answers[key];
      if(v && v.trim()) filled++;
    });
    eachGraphBlock(noteSet, function(block){
      total++;
      var pts = answers[block.key];
      if(Array.isArray(pts) && pts.length > 0) filled++;
    });
    return { total: total, filled: filled };
  }

  function countAnswerKey(noteSet){
    var total = 0, provided = 0;
    var ak = noteSet.answerKey || {};
    eachBlankKey(noteSet, function(key){
      total++;
      if(ak[key]) provided++;
    });
    eachGraphBlock(noteSet, function(block){
      total++;
      var entry = ak[block.key];
      if(entry && Array.isArray(entry.points) && entry.points.length > 0) provided++;
    });
    return { total: total, provided: provided };
  }

  /* ---------------- block rendering ---------------- */
  // mode: "student" | "instructor" | "preview". answers is the student's
  // saved-value map for this note (ignored in instructor/preview modes).
  function blockToHtml(block, noteId, mode, answers, answerKey){
    if(block.type === "heading"){
      return '<div class="content-block"><h2>'+escapeHtml(block.text)+'</h2></div>';
    }
    if(block.type === "paragraph"){
      return '<div class="content-block"><p>'+renderBlanks(block.html, noteId, mode, answers, answerKey)+'</p></div>';
    }
    if(block.type === "box"){
      var tone = block.tone || "key";
      var labels = { key:"Key Idea", example:"Example", tip:"Tip", question:"Think About It" };
      var label = block.label || labels[tone] || "Note";
      return '<div class="content-block"><div class="box tone-'+tone+'">' +
        '<span class="box-label">'+escapeHtml(label)+'</span>' +
        '<p>'+renderBlanks(block.html, noteId, mode, answers, answerKey)+'</p>' +
      '</div></div>';
    }
    if(block.type === "table"){
      var thead = '<thead><tr>'+block.headers.map(function(h){ return '<th>'+escapeHtml(h)+'</th>'; }).join("")+'</tr></thead>';
      var tbody = '<tbody>'+block.rows.map(function(row){
        return '<tr>'+row.map(function(cell){ return '<td>'+renderBlanks(String(cell), noteId, mode, answers, answerKey)+'</td>'; }).join("")+'</tr>';
      }).join("")+'</tbody>';
      var caption = block.caption ? '<p class="table-caption">'+escapeHtml(block.caption)+'</p>' : "";
      return '<div class="content-block">'+caption+'<div class="table-wrap"><table>'+thead+tbody+'</table></div></div>';
    }
    if(block.type === "graph"){
      return renderGraph(block, noteId, mode, answers, answerKey);
    }
    if(block.type === "diagram"){
      var branchesHtml = block.branches.map(function(br){
        var leavesHtml = (br.leaves || []).map(function(key){
          return '<div class="diagram-leaf">'+leafFieldHtml(noteId, key, mode, answers, answerKey)+'</div>';
        }).join("");
        var leavesBlock = leavesHtml ?
          '<div class="diagram-leaves-wrap"><div class="diagram-leaves-stem"></div><div class="diagram-leaves">'+leavesHtml+'</div></div>' : "";
        return '<div class="diagram-branch">' +
          '<div class="diagram-branch-node"><p>'+renderBlanks(br.html, noteId, mode, answers, answerKey)+'</p></div>' +
          leavesBlock +
        '</div>';
      }).join("");
      return '<div class="content-block"><div class="diagram">' +
        '<div class="diagram-node-root">'+escapeHtml(block.root)+'</div>' +
        '<div class="diagram-root-stem"></div>' +
        '<div class="diagram-branches">'+branchesHtml+'</div>' +
      '</div></div>';
    }
    return "";
  }

  // Attaches click-to-plot behavior to every .graph-hitlayer inside
  // `container`. onToggle(noteId, key, x, y) is called with the snapped
  // data coordinate that was clicked — the caller decides how/where to
  // store it and how to re-render. Shared by the notes engine (renderNote)
  // and the quiz engine (quizapp.js), so the point-plotting math only
  // exists in one place.
  function wireGraphClicks(container, onToggle){
    container.querySelectorAll(".graph-hitlayer").forEach(function(el){
      el.addEventListener("click", function(evt){
        var svg = el.closest("svg");
        var rect = svg.getBoundingClientRect();
        var vb = numOr(el.getAttribute("data-vb"), 364);
        if(!rect.width || !rect.height) return; // not laid out (e.g. hidden) — ignore
        var scale = vb / rect.width;
        var svgX = (evt.clientX - rect.left) * scale;
        var svgY = (evt.clientY - rect.top) * scale;
        var pad = numOr(el.getAttribute("data-pad"), 32);
        var plot = numOr(el.getAttribute("data-plot"), 300);
        var xMin = numOr(el.getAttribute("data-xmin"), -10), xMax = numOr(el.getAttribute("data-xmax"), 10);
        var yMin = numOr(el.getAttribute("data-ymin"), -10), yMax = numOr(el.getAttribute("data-ymax"), 10);
        var xStep = numOr(el.getAttribute("data-xstep"), 1), yStep = numOr(el.getAttribute("data-ystep"), 1);

        var dataX = xMin + (svgX - pad) / plot * (xMax - xMin);
        var dataY = yMax - (svgY - pad) / plot * (yMax - yMin);
        var snapX = Math.round(Math.round(dataX/xStep) * xStep * 1000) / 1000;
        var snapY = Math.round(Math.round(dataY/yStep) * yStep * 1000) / 1000;
        if(snapX < xMin - 1e-9 || snapX > xMax + 1e-9 || snapY < yMin - 1e-9 || snapY > yMax + 1e-9) return;

        onToggle(el.getAttribute("data-note"), el.getAttribute("data-key"), snapX, snapY);
      });
    });
  }

  function renderMath(container){
    if(typeof renderMathInElement === "function"){
      renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }

  /* ---------------- routing ---------------- */
  function getRoute(){
    var hash = location.hash || "";
    var m = hash.match(/^#\/set\/(.+)$/);
    return m ? { view: "note", id: decodeURIComponent(m[1]) } : { view: "library" };
  }

  /* ---------------- library view ---------------- */
  function renderLibrary(app, searchInput){
    var filterText = searchInput ? searchInput.value : "";
    var groups = {}, order = [];
    var sets = NOTE_SETS.slice().sort(function(a,b){ return (a.date||"").localeCompare(b.date||""); });

    var q = (filterText || "").trim().toLowerCase();
    if(q){
      sets = sets.filter(function(s){ return (s.title+" "+(s.unit||"")).toLowerCase().indexOf(q) !== -1; });
    }
    sets.forEach(function(s){
      var key = s.unit || "Notes";
      if(!groups[key]){ groups[key] = []; order.push(key); }
      groups[key].push(s);
    });

    var intro = APP_MODE === "instructor"
      ? "Every guided note set with its answer key. This page is for instructors only — don't share this link or screen with students."
      : "Pick a lecture below to fill in as we go. Everything you type is saved automatically on this device.";

    var html = '<div class="library-head"><h1>'+(APP_MODE === "instructor" ? "Answer keys" : "Your guided notes")+'</h1><p>'+intro+'</p></div>';

    if(sets.length === 0){
      html += '<div class="empty-state">No notes match “'+escapeHtml(filterText)+'”.</div>';
      app.innerHTML = html;
      return;
    }

    order.forEach(function(groupName){
      html += '<div class="unit-group"><div class="unit-label"><span>'+escapeHtml(groupName)+'</span></div><div class="card-grid">';
      groups[groupName].forEach(function(s){
        var dateLabel = formatDate(s.date);
        var pct, badgeText, badgeTone, ctaText;
        if(APP_MODE === "instructor"){
          var c = countAnswerKey(s);
          pct = c.total ? Math.round((c.provided/c.total)*100) : 100;
          badgeText = c.provided+"/"+c.total+" set";
          badgeTone = (c.provided === c.total) ? "" : "tone-warn";
          ctaText = "View answer key";
        } else {
          var p = countBlanks(s);
          pct = p.total ? Math.round((p.filled/p.total)*100) : 0;
          badgeText = pct+"%";
          badgeTone = "";
          ctaText = pct > 0 ? "Continue" : "Start";
        }
        html += '' +
          '<a class="note-card" href="#/set/'+encodeURIComponent(s.id)+'">' +
            '<div class="note-card-top"><h3>'+escapeHtml(s.title)+'</h3><time>'+dateLabel+'</time></div>' +
            '<div class="progress-row">' +
              '<div class="progress-track"><div class="progress-fill '+badgeTone+'" style="width:'+pct+'%"></div></div>' +
              '<span class="progress-pct">'+badgeText+'</span>' +
            '</div>' +
            '<div class="note-card-cta">'+ctaText+' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>' +
          '</a>';
      });
      html += '</div></div>';
    });

    app.innerHTML = html;
  }

  /* ---------------- note-set view ---------------- */
  function renderNote(app, id){
    var noteSet = NOTE_SETS.filter(function(s){ return s.id === id; })[0];
    if(!noteSet){
      app.innerHTML = '<div class="empty-state">Couldn\'t find that note set.<br><a class="link-quiet" href="#/">Back to library</a></div>';
      return;
    }
    if(APP_MODE === "student" && !store[id]) store[id] = {};

    var answerKey = noteSet.answerKey || {};
    var blocksHtml = noteSet.content.map(function(block){ return blockToHtml(block, id, APP_MODE, store[id], answerKey); }).join("");

    var toolbarHtml, progressHtml, footerNote;
    if(APP_MODE === "instructor"){
      toolbarHtml =
        '<button class="btn btn-primary" id="printBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg> Print answer key</button>';
      var c = countAnswerKey(noteSet);
      progressHtml = '<div class="progress-banner"><div class="progress-track"><div class="progress-fill '+(c.provided===c.total?"":"tone-warn")+'" style="width:'+(c.total?Math.round(c.provided/c.total*100):100)+'%"></div></div><span>'+c.provided+' of '+c.total+' answer keys filled in</span></div>';
      footerNote = "This is the instructor answer key — not visible to students.";
    } else {
      toolbarHtml =
        '<button class="btn btn-primary" id="printBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg> Export / Print PDF</button>' +
        '<button class="btn" id="clearBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg> Clear my answers</button>' +
        '<span class="save-indicator" id="saveIndicator"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg><span>Autosaves as you type</span></span>';
      var p = countBlanks(noteSet);
      var pct = p.total ? Math.round((p.filled/p.total)*100) : 0;
      progressHtml = '<div class="progress-banner"><div class="progress-track"><div class="progress-fill" style="width:'+pct+'%"></div></div><span>'+p.filled+' of '+p.total+' blanks filled</span></div>';
      footerNote = "Saved only on this device — export a PDF to keep a copy elsewhere.";
    }

    app.innerHTML =
      '<a class="back-link" href="#/">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>' +
        ' All guided notes' +
      '</a>' +
      '<div class="note-title-row"><h1>'+escapeHtml(noteSet.title)+'</h1>'+(APP_MODE === "instructor" ? '<span class="answer-key-tag">Answer Key</span>' : '')+'</div>' +
      '<p class="note-meta">'+escapeHtml(noteSet.unit || "")+(noteSet.unit ? " · " : "")+formatDate(noteSet.date)+'</p>' +
      '<div class="toolbar">'+toolbarHtml+'</div>' +
      progressHtml +
      blocksHtml +
      '<div class="footer-actions">' +
        '<a class="link-quiet" href="#/">&larr; Back to all notes</a>' +
        '<span class="link-quiet">'+footerNote+'</span>' +
      '</div>';

    document.getElementById("printBtn").addEventListener("click", function(){ window.print(); });
    renderMath(app);

    if(APP_MODE === "student"){
      app.querySelectorAll(".blank, .blank-area").forEach(function(el){
        el.addEventListener("input", function(){
          var noteId = el.getAttribute("data-note");
          var key = el.getAttribute("data-key");
          if(!store[noteId]) store[noteId] = {};
          store[noteId][key] = el.value;
          if(el.classList.contains("blank")){
            el.classList.toggle("filled", !!el.value.trim());
          }
          var banner = document.querySelector(".progress-banner");
          if(banner){
            var p2 = countBlanks(noteSet);
            var pc2 = p2.total ? Math.round((p2.filled/p2.total)*100) : 0;
            banner.querySelector(".progress-fill").style.width = pc2 + "%";
            banner.querySelector("span").textContent = p2.filled + " of " + p2.total + " blanks filled";
          }
          queueSave();
        });
      });
      wireGraphClicks(app, function(noteId, key, x, y){
        if(!store[noteId]) store[noteId] = {};
        var pts = Array.isArray(store[noteId][key]) ? store[noteId][key] : [];
        var idx = -1;
        for(var i=0;i<pts.length;i++){ if(pts[i].x === x && pts[i].y === y){ idx = i; break; } }
        if(idx > -1) pts.splice(idx,1); else pts.push({ x: x, y: y });
        store[noteId][key] = pts;
        queueSave();
        renderNote(app, noteId);
      });
      var clearBtn = document.getElementById("clearBtn");
      if(clearBtn){
        clearBtn.addEventListener("click", function(){
          if(confirm("Clear all your answers for \""+noteSet.title+"\"? This can't be undone.")){
            store[id] = {};
            saveStore();
            renderNote(app, id);
          }
        });
      }
    }
  }

  /* ---------------- init / dispatch ---------------- */
  function render(app, searchInput){
    var route = getRoute();
    if(route.view === "note") renderNote(app, route.id);
    else renderLibrary(app, searchInput);
    window.scrollTo(0,0);
  }

  function initApp(mode){
    APP_MODE = mode;
    document.body.classList.toggle("is-instructor", mode === "instructor");
    if(mode === "student") store = loadStore();

    var app = document.getElementById("app");
    var searchInput = document.getElementById("searchInput");

    window.addEventListener("hashchange", function(){ render(app, searchInput); });
    if(searchInput){
      searchInput.addEventListener("input", function(){
        if(getRoute().view === "library") renderLibrary(app, searchInput);
      });
    }
    render(app, searchInput);
  }

  global.GuidedNotesApp = {
    init: initApp,
    blockToHtml: blockToHtml,
    escapeHtml: escapeHtml,
    eachBlankKey: eachBlankKey,
    wireGraphClicks: wireGraphClicks,
    numOr: numOr,
    renderMath: renderMath
  };

})(window);
