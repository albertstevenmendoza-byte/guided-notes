/* =========================================================================
   GUIDED NOTES — UI TOOLKIT
   =========================================================================
   Shared toasts, confirm modals, and loading skeletons. Load this before
   any other app script on every page. Usage:

     UI.toast("Saved!", "success")              // info | success | warn | error
     const ok = await UI.confirm("Delete this?", { danger: true })
     UI.skeleton(container, 3)                   // 3 shimmering placeholder lines
   ========================================================================= */
(function(global){
  "use strict";

  var toastContainer = null;
  function ensureToastContainer(){
    if(toastContainer && document.body.contains(toastContainer)) return toastContainer;
    toastContainer = document.createElement("div");
    toastContainer.id = "uiToastContainer";
    toastContainer.setAttribute("aria-live", "polite");
    toastContainer.setAttribute("role", "status");
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function toast(message, type){
    type = type || "info";
    var el = document.createElement("div");
    el.className = "ui-toast ui-toast-" + type;
    el.textContent = message;
    ensureToastContainer().appendChild(el);
    requestAnimationFrame(function(){ el.classList.add("show"); });
    setTimeout(function(){
      el.classList.remove("show");
      setTimeout(function(){ el.remove(); }, 250);
    }, 3200);
  }

  function confirmModal(message, opts){
    opts = opts || {};
    return new Promise(function(resolve){
      var overlay = document.createElement("div");
      overlay.className = "ui-modal-overlay";
      overlay.innerHTML =
        '<div class="ui-modal-box" role="dialog" aria-modal="true">' +
          '<p class="ui-modal-message"></p>' +
          '<div class="ui-modal-actions">' +
            '<button class="btn" data-action="cancel">'+(opts.cancelText || "Cancel")+'</button>' +
            '<button class="btn btn-primary'+(opts.danger ? " ui-btn-danger" : "")+'" data-action="confirm">'+(opts.confirmText || "Confirm")+'</button>' +
          '</div>' +
        '</div>';
      overlay.querySelector(".ui-modal-message").textContent = message;
      document.body.appendChild(overlay);
      requestAnimationFrame(function(){ overlay.classList.add("open"); });

      var settled = false;
      function cleanup(result){
        if(settled) return;
        settled = true;
        overlay.classList.remove("open");
        document.removeEventListener("keydown", onKey);
        setTimeout(function(){ overlay.remove(); }, 200);
        resolve(result);
      }
      function onKey(e){ if(e.key === "Escape") cleanup(false); }

      overlay.querySelector('[data-action="cancel"]').addEventListener("click", function(){ cleanup(false); });
      overlay.querySelector('[data-action="confirm"]').addEventListener("click", function(){ cleanup(true); });
      overlay.addEventListener("click", function(e){ if(e.target === overlay) cleanup(false); });
      document.addEventListener("keydown", onKey);

      setTimeout(function(){ overlay.querySelector('[data-action="confirm"]').focus(); }, 50);
    });
  }

  function promptModal(message, defaultValue){
    return new Promise(function(resolve){
      var overlay = document.createElement("div");
      overlay.className = "ui-modal-overlay";
      overlay.innerHTML =
        '<div class="ui-modal-box" role="dialog" aria-modal="true">' +
          '<p class="ui-modal-message"></p>' +
          '<input type="text" class="ui-prompt-input">' +
          '<div class="ui-modal-actions">' +
            '<button class="btn" data-action="cancel">Cancel</button>' +
            '<button class="btn btn-primary" data-action="confirm">OK</button>' +
          '</div>' +
        '</div>';
      overlay.querySelector(".ui-modal-message").textContent = message;
      var input = overlay.querySelector(".ui-prompt-input");
      input.value = defaultValue || "";
      document.body.appendChild(overlay);
      requestAnimationFrame(function(){ overlay.classList.add("open"); input.focus(); input.select(); });

      var settled = false;
      function cleanup(result){
        if(settled) return;
        settled = true;
        overlay.classList.remove("open");
        document.removeEventListener("keydown", onKey);
        setTimeout(function(){ overlay.remove(); }, 200);
        resolve(result);
      }
      function onKey(e){
        if(e.key === "Escape") cleanup(null);
        if(e.key === "Enter") cleanup(input.value);
      }
      overlay.querySelector('[data-action="cancel"]').addEventListener("click", function(){ cleanup(null); });
      overlay.querySelector('[data-action="confirm"]').addEventListener("click", function(){ cleanup(input.value); });
      overlay.addEventListener("click", function(e){ if(e.target === overlay) cleanup(null); });
      document.addEventListener("keydown", onKey);
    });
  }

  function skeleton(container, lines){
    lines = lines || 3;
    var html = '<div class="ui-skeleton-wrap">';
    for(var i=0;i<lines;i++){
      var w = 55 + Math.floor(Math.random()*35);
      html += '<div class="ui-skeleton-line" style="width:'+w+'%;"></div>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  global.UI = { toast: toast, confirm: confirmModal, prompt: promptModal, skeleton: skeleton };
})(window);
