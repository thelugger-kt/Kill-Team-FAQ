(function () {
  "use strict";

  var sheetsContainer = document.getElementById("sheets");
  var searchInput = document.getElementById("searchInput");
  var clearBtn = document.getElementById("clearSearch");
  var toggleSheetsBtn = document.getElementById("toggleSheets");
  var resultCount = document.getElementById("resultCount");

  if (!sheetsContainer) {
    return; // Not on the browse page.
  }

  var CHEVRON_SVG =
    '<svg class="chevron" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
    '<path d="M5 3l6 5-6 5V3z"/></svg>';

  var allSheets = [];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, query) {
    var safe = escapeHtml(text);
    if (!query) {
      return safe;
    }
    var re = new RegExp("(" + escapeRegExp(query) + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function entryMatches(entry, query) {
    if (!query) {
      return true;
    }
    var haystack = [entry.Question, entry.Answer, entry.Faction, entry.Season]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function buildEntryEl(entry, query) {
    var wrap = document.createElement("div");
    wrap.className = "entry";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "entry-question";
    btn.innerHTML = CHEVRON_SVG + '<span class="entry-question-text">' + highlight(entry.Question, query) + "</span>";
    btn.addEventListener("click", function () {
      wrap.classList.toggle("open");
    });

    var answer = document.createElement("div");
    answer.className = "entry-answer";
    answer.innerHTML = "<strong>Answer: </strong>" + highlight(entry.Answer || "", query);

    wrap.appendChild(btn);
    wrap.appendChild(answer);
    return wrap;
  }

  function updateToggleSheetsButton() {
    var sheets = Array.prototype.slice.call(sheetsContainer.querySelectorAll(".sheet"));
    var entries = Array.prototype.slice.call(sheetsContainer.querySelectorAll(".entry"));
    var allOpen = sheets.length > 0 && entries.length > 0 &&
      sheets.every(function (sheet) {
        return sheet.classList.contains("open");
      }) &&
      entries.every(function (entry) {
        return entry.classList.contains("open");
      });
    var hasSections = sheets.length > 0;
    toggleSheetsBtn.disabled = !hasSections;
    toggleSheetsBtn.textContent = allOpen ? "Collapse all" : "Expand all";
  }

  function setAllOpen(open) {
    var sheets = sheetsContainer.querySelectorAll(".sheet");
    var entries = sheetsContainer.querySelectorAll(".entry");
    Array.prototype.forEach.call(sheets, function (sheet) {
      sheet.classList.toggle("open", open);
    });
    Array.prototype.forEach.call(entries, function (entry) {
      entry.classList.toggle("open", open);
    });
  }

  function buildSheetEl(sheet, query, forceOpen) {
    var matching = sheet.entries.filter(function (e) {
      return entryMatches(e, query);
    });
    if (!matching.length) {
      return null;
    }

    var wrap = document.createElement("div");
    wrap.className = "sheet" + (forceOpen ? " open" : "");

    var header = document.createElement("button");
    header.type = "button";
    header.className = "sheet-header";
    header.innerHTML =
      CHEVRON_SVG +
      "<span>" + escapeHtml(sheet.name) + "</span>";
    header.addEventListener("click", function () {
      wrap.classList.toggle("open");
    });

    var body = document.createElement("div");
    body.className = "sheet-body";
    matching.forEach(function (entry) {
      body.appendChild(buildEntryEl(entry, query));
    });

    wrap.appendChild(header);
    wrap.appendChild(body);
    return wrap;
  }

  function render(query) {
    sheetsContainer.innerHTML = "";
    var normalized = (query || "").trim().toLowerCase();
    var totalMatches = 0;
    var anySheet = false;

    allSheets.forEach(function (sheet) {
      var matching = sheet.entries.filter(function (e) {
        return entryMatches(e, normalized);
      });
      totalMatches += matching.length;
      var el = buildSheetEl(sheet, normalized, !!normalized);
      if (el) {
        anySheet = true;
        sheetsContainer.appendChild(el);
      }
    });

    if (!anySheet) {
      var none = document.createElement("p");
      none.className = "no-results";
      none.textContent = "No rulings match your search.";
      sheetsContainer.appendChild(none);
    }
    updateToggleSheetsButton();

    if (normalized) {
      resultCount.textContent =
        totalMatches + (totalMatches === 1 ? " result" : " results") + ' for "' + query.trim() + '"';
    } else {
      resultCount.textContent = "";
    }

    clearBtn.hidden = !normalized;
  }

  function init(data) {
    allSheets = data.sheets || [];
    render("");
  }

  searchInput.addEventListener("input", function () {
    render(searchInput.value);
  });

  clearBtn.addEventListener("click", function () {
    searchInput.value = "";
    render("");
    searchInput.focus();
  });

  toggleSheetsBtn.addEventListener("click", function () {
    var shouldOpen = toggleSheetsBtn.textContent === "Expand all";
    setAllOpen(shouldOpen);
    updateToggleSheetsButton();
  });

  fetch("data/rulings.json")
    .then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    })
    .then(init)
    .catch(function (err) {
      sheetsContainer.innerHTML =
        '<p class="no-results">Could not load rulings data. If you are viewing this file directly ' +
        "from disk, try running a local server (e.g. <code>python -m http.server</code>) instead of " +
        "opening index.html directly.<br><small>" + escapeHtml(err.message) + "</small></p>";
    });
})();

// Shared mobile nav toggle for all pages.
(function () {
  "use strict";
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
})();
