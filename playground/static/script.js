const input = document.getElementById("input");
const inputBox = document.getElementById("input-box");
const output = document.getElementById("output");

// History Management
const codeHistory = (function() {

  // All history elements
  let historyCode = [ ];

  // Current offset into history while scanning
  let historyCursor = null;

  // Load any existing history
  try {
    historyCode = JSON.parse(localStorage.getItem("history")) || [ ];
    if (!Array.isArray(historyCode) || historyCode.filter((c) => (typeof(c) !== "string")).length) {
      historyCode = [ ];
    }
  } catch (error) { console.log("JJ", error); }

  function append(code) {
    historyCursor = null;
    if (code !== historyCode[historyCode.length - 1]) {
      historyCode.push(code);
    }
    localStorage.setItem("history", JSON.stringify(historyCode));
  }

  function clear() {
    historyCursor = null;
    historyCode = [ ];
    localStorage.removeItem("history");
  }

  function get(direction) {
    if (direction == -1) {
      if (historyCursor == null) {
        historyCursor = historyCode.length - 1;
      } else {
        historyCursor--;
      }
      if (historyCursor < 0) { historyCursor = 0; }
      if (historyCursor < historyCode.length) {
        return historyCode[historyCursor];
      }
      return null;
    }

    if (historyCursor != null) {
      historyCursor++;
      if (historyCursor < historyCode.length) {
        return historyCode[historyCursor];
      }
      historyCursor = null
      return "";
    }

  }

  return { append, clear, get }
})();

// Worker Management
const { send } = (function () {

  let ready = false;
  const worker = new Worker("sandbox.js");

  let nextId = 1;
  const resolveMap = { };

  function send(action, params) {
    const id = nextId++;
    console.log(">>>", { action, id, params });
    worker.postMessage(JSON.stringify({ action, id, params }));

    return new Promise((resolve) => { resolveMap[String(id)] = resolve; });
  }

  function handleAction(action, id, params) {
  }

  function handleNotice(notice, params) {
    if (notice === "internal") {
      console.log("INTERNAL LOG:", data);

    } else if (notice === "log") {
      const content = params.args.map((c) => ((c === undefined) ? "undefined": c.toString())).join(", ");
      addOutput("log-" + params.logger, content);

    } else if (notice === "async-running") {
      // @TODO: Track with params.id
      addOutput("pending", "pending");
    }
  }

  worker.onmessage = async function(e) {
    const data = JSON.parse(e.data);
    console.log("<<<", data);

    if (!ready && data === "ready") {
      addOutput("entry", "version");
      await evaluate("version");
      addOutput("entry", "provider.network.name");
      await evaluate("provider.network.name");
      ready = true;
      input.focus();

    } else if (data.result) {
      const resolve = resolveMap[String(data.id)];
      if (resolve) {
        delete resolveMap[String(data.id)];
        resolve(data.result);
      } else {
        console.log(`result for ${ id } with no resolver`);
      }

    } else if (data.action) {
      handleAction(data.action, data.id, data.params || { });

    } else if (data.notice) {
      handleNotice(data.notice, data.params || { });
    }
  }

  return { send };
})();

// Auto-completion checker
const { getQuery } = (function() {
  function repeat(c, length) {
    if (c.length === 0) { throw new RangeError("too short"); }
    while (c.length < length) { c += c; }
    return c.substring(0, length);
  }

  const openers = { "}": "{", ")": "(", "]": "[" };
  const closers = { "{": "}", "(": ")", "[": "]" };

  class ParsedResult {
    constructor(code, offset) {
      if (offset == null) { offset = code.length; }

      this.code = code;
      this.offset = offset;

      // Compute the processed code, which has the same offsets as code,
      // but with nuisances removed, which can break simple parsing

      // Nix long comments
      code = code.replace(/(\/\*.*?\*\/)/gm, (all) => {
        return repeat(" ", all.length);
      });
      code = code.replace(/(\/\/(.*$|.*\n))/mg, (all, comment) => repeat(" ", comment.length));

      // Replace string contents with whitespace
      const quoteReplacer = (all, contents) => ('"' + repeat(" ", contents.length) + '"');
      code = code.replace(/'(([^'\\]|\\.)*)'/g, quoteReplacer);
      code = code.replace(/"(([^"\\]|\\.)*)"/g, quoteReplacer);
      code = code.replace(/`(([^`\\]|\\.)*)`/g, quoteReplacer);

      // @TODO: regex

      this.processedCode = code;

      this.brackets = { };

      let brackets = [ ];
      while (offset > 0) {
        offset--;

        const chr = code[offset];

        if (openers[chr]) {
          brackets.push({ offset, chr });

        } else if (closers[chr]) {
          if (brackets.length === 0) {
            console.log("start of internal expression");
            offset++;
            break;
          }

          const bracket = brackets.pop();
          if (closers[chr] !== bracket.chr) {
            console.log("mismatch");
            offset++;
            break;
          }
          this.brackets[String(bracket.offset)] = offset;
          this.brackets[String(offset)] = bracket.offset;

        } else if (brackets.length === 0) {
          // Not a valid identifier character at the root
          if (!chr.match(/^\s|\.|[a-z0-9_$]$/i)) {
            offset++;
            break;
          }
        }
      }

      this.working = code.substring(offset, this.offset);

      this.comps = [ "" ];
      for (let i = offset; i < this.offset; i++) {
        const chr = code[i];

        if (chr.match(/^([a-z0-9_$]|\s)$/i)) {
          this.comps[this.comps.length - 1] += chr;
        } else if (chr === "(" /* fix: ) */) {
          this.comps[this.comps.length - 1] += "()";
          i = this.matchingBracket(i);
          if (i == null) { throw new Error("no matching"); }
        } else if (chr === ".") {
          this.comps.push("");
        } else {
          throw new Error("hmmm...");
        }
      }

      this.comps = this.comps.reduce((accum, comp, index) => {
        //comp = comp.trim();
        const comps = comp.split(/\s+/);
        if (index === 0 && (comps.length === 2 && comps[0] === "new")) {
          comps.push("%new");
          comp = comps[1];
        } else if (comp === "" && index < this.comps.length - 1) {
          throw new Error("double-dot");
        } else if (comps.length !== 1) {
          throw new Error("bad whitespace");
        }
        accum.push(comp);
        return accum;
      }, [ ]);
    }

    matchingBracket(offset) {
      offset = String(offset);
      if (this.brackets[offset]) {
        return this.brackets[offset];
      }
    }
  }

  function getQuery(code, offset) {
    try {
      const result = new ParsedResult(code, offset);
      if (result.comps) {
        const path = result.comps.join(".");
        result.comps.pop();
        const prefixPath = result.comps.join(".");
        return { path, prefixPath };
      }
    } catch (error) {
      console.log("EE", error);
    }
    return { path: null, prefixPath: null };
  }

  return { getQuery };
})();

function addOutput(type, content) {
  const div = document.createElement("div");
  div.classList.add("output");
  div.classList.add(type);
  div.innerText = content;
  output.insertBefore(div, inputBox);
  window.scrollTo(0, document.body.scrollHeight);
}

const suggestions = (function() {
  const suggestions = document.getElementById("suggestions");

  const fontSize = (function() {
    const div = document.getElementById("sizer");
    return parseInt(div.clientWidth / div.textContent.length);
  })();

  function set(options, width) {
    let x = 30 + width * fontSize;
    if (x > output.clientWidth - 270) { x = output.clientWidth - 270; }

    suggestions.style.transform = `translate(${ x }px, -100%)`;

    // Find the reference node for insertBefore
    function findReference(value) {
      const els = Array.prototype.slice.call(suggestions.childNodes);
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (value <= el.innerText.toLowerCase()) { return el; }
      }
      return null;
    }

    // Delete any that no longer matter
    const add = options.reduce((accum, option) => (accum[option] = true, accum), { });
    Array.prototype.slice.call(suggestions.childNodes).forEach((child) => {
      const content = child.innerText;
      if (add[content]) {
        delete add[content];
      } else {
        child.remove();
      }
    });

    // Insert suggestions, sorted (inefficient O(n^2), but fine for small values)
    Object.keys(add).forEach((option) => {
      const ref = findReference(option.toLowerCase());
      const div = document.createElement("div");
      div.textContent = option;
      suggestions.insertBefore(div, ref);
    });
  }

  function up() {
    const current = suggestions.querySelector(".selected");
    if (current == null) {
      if (suggestions.children.length) {
        suggestions.lastChild.classList.add("selected");
      }
    } else if (current.previousSibling) {
      current.previousSibling.classList.add("selected");
      current.classList.remove("selected");
    }
  }

  function down() {
    const current = suggestions.querySelector(".selected");
    if (current != null) {
      if (current != suggestions.lastChild) {
        current.nextSibling.classList.add("selected");
      }
      current.classList.remove("selected");
    }
  }

  function current() {
    const current = suggestions.querySelector(".selected");
    if (current == null) { return null; }
    return current.textContent;
  }

  return { set, up, down, current };
})();

function evaluate(code) {
  return send("eval", { code }).then((result) => {
    addOutput(result.type, result.value);
  });
}

function grow() {
  if (input.scrollHeight > input.clientHeight) {
    input.style.height = input.scrollHeight + "px";
  }
}

function getAssist(text, direction, start, end) {
  const percents = [ ];
  for (let start = 0; start < text.length; start++) {
    // @TODO: escape strings, comments, etc.
    if (text[start] === "%") {
      const match = text.substring(start).match(/^(%[a-z][a-z0-9_]+)/i);
      if (match) {
        percents.push({ start, end: start + match[1].length });
      }
    }
  }
  if (percents.length === 0) { return null; }

  if (direction == null || direction === 1) {
    const match = text.substring(end).match(/^([^%]*)((%([a-zA-Z0-9_]*))(.)*)?$/);
    if (match) {
      if (match[2]) {
        return {
          start: end + match[1].length,
          end: end + match[1].length + match[3].length
        };
      }
    } else {
      console.log("ERROR?", match);
    }

  } else if (direction === -1) {
    let index = -1;
    for (let i = 0; i < percents.length; i++) {
      if (percents[i].start >= start) { break; }
      index = i;
    }
    if (index === -1) { return null; }
    return percents[index];
  }

  return null;
}

let wasHighlit = false;
function insertValue(value, highlight) {
  wasHighlit = highlight;

  let curValue = input.value;
  let curStart = input.selectionStart, curEnd = input.selectionEnd;

  const start = value.length, end = value.length;

  input.value = curValue.substring(0, curStart) + value + curValue.substring(curEnd);

  let selStart = curStart + value.length;
  let selEnd = selStart;

  if (highlight) {
    selStart = curStart;
    selfEnd = curStart + value.length;
  } else {
    const assist = getAssist(value, 1, 0, 0);
    if (assist) {
      selStart = curStart + assist.start;
      selEnd = curStart + assist.end;
    }
  }

  setTimeout(() => {
    input.setSelectionRange(selStart, selEnd);
  }, 0);

  grow();
  input.focus();
}

function setValue(value, assist) {
  let start = value.length, end = value.length;
  if (assist) {
    const match = value.match(/^([^%]*)((%([a-zA-Z0-9_]*))(.)*)?$/);
    if (match) {
      if (match[2]) {
        start = match[1].length;
        end = match[1].length + match[3].length;
      }
    } else {
      console.log("ERROR?", match);
    }
  }

  input.value = value;

  setTimeout(() => {
    input.setSelectionRange(start, end);
  }, 0);

  grow();
}

input.onkeydown = function(e) {
  const meta = (e.altKey || e.ctrlKey || e.shiftKey);
  /*
  console.log("EEEE", e);
  if (e.key === "Backspace" && wasHighlit) {
    // [backspace]; 
    let curStart = input.selectionStart, curEnd = input.selectionEnd;

  const start = value.length, end = value.length;

    input.value = curValue.substring(0, curStart) + value + curValue.substring(curEnd);
  }
  */

  wasHighlit = false;

  if (e.keyCode === 13 && !meta) {
    // [enter]; evaluate
    e.preventDefault();
    e.stopPropagation();

  } else if (e.keyCode === 38 && !meta) {
    // [up]; use previous history entry

    const code = codeHistory.get(-1);
    if (code != null) { setValue(code); }
//    suggestions.up(e);
//    e.preventDefault();
//    e.stopPropagation();

  } else if (e.keyCode === 40 && !meta) {
    // [down]; use next history entry

    const code = codeHistory.get(1);
    if (code != null) { setValue(code); }
//    suggestions.down(e);
//    e.preventDefault();
//    e.stopPropagation();

  } else if (e.keyCode === 9 && !(e.altKey || e.ctrlKey)) {
    // [tab] / [shift-tab]; switch between %args
    bounce(e.shiftKey ? -1: 1, e);
  }

  grow();
};

function bounce(direction, e) {
  const assist = getAssist(input.value, direction, input.selectionStart, input.selectionEnd);
  if (assist) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setTimeout(() => {
      if (e) { input.focus(); }
      input.setSelectionRange(assist.start, assist.end);
    }, 0);

    return true;
  }

  return false;
}

function runCommand(command, args) {
  switch (command) {
    case "reset":
      codeHistory.clear();
      localStorage.removeItem("is-darkMode");
      localStorage.removeItem("is-showOptions");
      addOutput("result-bold", "PLAYGROUND: Reset settings and history");
      break;
    case "clear":
      Array.prototype.forEach.call(output.querySelectorAll("div.output"), (el) => {
        el.remove();
      });
      addOutput("result-bold", "PLAYGROUND: Clear output buffer");
      break;
    case "help":
      addOutput("result-bold", "PLAYGROUND: HELP");
        addOutput("result", "Commands");
        addOutput("result", "  %help            This help screen");
        addOutput("result", "  %reset           Clear command history");
        addOutput("result", "  %clear           Clear output buffer");
        //addOutput("result", " ");
        addOutput("result", "Keys");
        addOutput("result", "  up/down          Cycle through command history");
        addOutput("result", "  tab/shift-tab    Cycle between %vars");
        //addOutput("result", " ");
        addOutput("result", "Magic Variables");
        addOutput("result", "  _                Last evaluated response");
        addOutput("result", "  _p               Last promise result (if _ is a Promise)");
        //addOutput("result", " ");
        addOutput("result", "Cavets");
        addOutput("result", "  - avoid `const` and `let` as each eval is scoped");
        addOutput("result", "    so the variable will not be available afterward");
        break;
      default:
        addOutput("error", `PLAYGROUND: unknown command ${ JSON.stringify(value) } (try "%help")`);
  }
}

let lastInput = null, lastPrefixPath = null;
let suppressAutoComplete = false;
input.onkeyup = function(e) {

  if (e.keyCode === 13 && !(e.altKey || e.ctrlKey || e.shiftKey)) {

    const current = suggestions.current();
    if (current) {
      insertValue(current);

      e.preventDefault();
      e.stopPropagation();

      return false;
    }

    let value = input.value;
    input.style.height = null;
    if (value.trim()) {
      codeHistory.append(value);
    } else {
      value = " ";
    }
    addOutput("entry", value);
    if (value[0] === "%") {
      const command = value.trim().split(/\s+/g)[0];
      runCommand(command.substring(1), value.trim().substring(command.length).trim());
    } else {
      evaluate(value);
    }
    setValue("");

  } else {
    const start = input.selectionStart, end = input.selectionEnd;
    const value = input.value;
    if (start === end) {
      console.log(input.value);
      const { path, prefixPath } = getQuery(value, start);
      /*
      console.log("PP", path, pathPrefix);
      if (prefixPath !== lastPrefixPath) {
        supressAutoComplete = false;
        lastPrefixPath = prefixPath;
      }
      */
      lastInput = input.value;

      if (path && !suppressAutoComplete) {
        return;
        send("inspect", { path }).then((result) => {
          console.log("RES", result);

          suggestions.set(result.possible, input.value.length);

          // @TODO: check start/end
          console.log(input.value, lastInput, input.value !== lastInput);
          if (input.value !== lastInput) { return; }

          if (result.possible.length === 0) { return; }

          let prefix = "";
          for (let i = 0; i < result.possible[0].length; i++) {
            let letter = result.possible[0][i];
            for (let w = 1; w < result.possible.length; w++) {
              if (result.possible[w][i] !== letter) {
                letter = null;
                break;
              }
            }
            if (letter == null) { break; }
            prefix += letter;
          }

          //if (prefix) {
          //  insertValue(prefix.substring(result.prefix.length), true);
          //}
        });
      }
    } else {
      suggestions.set([], 0);
    }
  }
};

/*
(async function(gist) {
  console.log("Fetching:", gist);
  const content = await ethers.utils.fetchJson(`https://api.github.com/gists/${ gist}`);
  console.log("GOT", content);
  const files = Object.keys(content.files).map((filename) => content.files[filename]);
  if (files.length === 1) {
    setTimeout(() => { evaluate(files[0].content); }, 1000);
  }
})("36905b8dcf79d6ba70fe5e3ec2412d5e");
*/
// Setup the options
(function () {
  function create(tag, text, classes) {
    const el = document.createElement(tag);
    if (text) { el.textContent = text; }
    if (classes) {
      classes.split(" ").forEach((c) => { el.classList.add(c); });
    }
    return el;
  }

  let lastGroup = null;
  const optionsItems = document.getElementById("options-items");
  Help.forEach((help) => {

    const div = create("div");
    optionsItems.appendChild(div);

    if (help.group) {
      lastGroup = help;
      const divHeader = create("div", help.group, "group");
      div.appendChild(divHeader);
      return;
    }

    const group = lastGroup;

    const divItem = create("div", null, "item");
    div.appendChild(divItem);

    const spanTitle = create("span", null, "title");
    divItem.appendChild(spanTitle);

    const match = help.name.match(/^(new )?(.*\.)?([^.]+)$/);
    let hasNew = match[1], prefix = match[2], name = match[3];
    if (hasNew) { spanTitle.appendChild(create("span", hasNew)); }
    if (prefix) { spanTitle.appendChild(create("span", prefix, "prefix")); }
    spanTitle.appendChild(create("span", name));


    const spanUse = create("span", "use", "use");
    divItem.appendChild(spanUse);

    const params = [ ];

    const divInfo = create("div", null, "info");

    divInfo.appendChild(create("div", help.description, "description"));

    if (help.returns) {
      divInfo.appendChild(create("div", help.returns, "returns"));
    }

    if (help.params != null) {
      if (help.params.length) {
        help.params.forEach((name, index) => {
          const divParam = create("div", null, "param");
          const divName = create("div", name.match(/^%?(.*)$/)[1], "name");
          if (name[0] === "%") {
            divName.appendChild(create("i", " (optional)"));
          } else {
            params.push(`%${ name }`);
          }
          divParam.appendChild(divName);
          divParam.appendChild(create("div", help.descriptions[index], "description"));

          divInfo.appendChild(divParam);
        });
      } else {
        divInfo.appendChild(create("div", "no parameters", "no-params"));
      }
    } else {
      //divInfo.appendChild(create("div", "", "no-params"));
    }

    // Set up the animation methods for clicking help items
    spanTitle.onclick = () => {

      let anySelected = false;
      Array.prototype.forEach.call(document.querySelectorAll("#options-items > div"), (el) => {
        if (div === el) {
          if (el.classList.contains("selected")) {
            el.classList.remove("selected");
            el.querySelector(".info").style.maxHeight = "0px";
          } else {
            el.classList.add("selected");
            const info = el.querySelector(".info");
            info.style.maxHeight = info.scrollHeight + "px";
            anySelected = true;
          }
        } else {
          el.classList.remove("selected");
          const info = el.querySelector(".info");
          if (info) { info.style.maxHeight = "0px"; }
        }
      });

      document.getElementById("options-items").classList[ (anySelected) ? "add": "remove"]("selected");
    };

    spanUse.onclick = function() {
      let insert = help.insert;
      if (insert == null) {
        insert = params.join(", ");
        if (help.params != null) { insert = `(${ insert })`; }
        insert = help.name + insert;
      }
      if (group && group.insert) {
        if (insert.substring(0, 4) === "new ") {
          insert = `new ${ group.insert }.${ insert.substring(4) }`;
        } else {
          insert = `${ group.insert }.${ insert }`;
        }
      }
      insertValue(insert);
    };

    div.appendChild(divInfo);
  });

  const search = document.getElementById("search");
  search.oninput = () => {
    const query = search.value.trim().toLowerCase();
    const groups = [ ];
    Array.prototype.forEach.call(optionsItems.children, (child, index) => {
      if (Help[index].group != null) {
        groups.push({ count: 0, child });
      } else if (query === "" || Help[index].name.toLowerCase().indexOf(query) >= 0) {
        child.style.display = "block";
        groups[groups.length - 1].count++;
      } else {
        child.style.display = "none";
      }
    });

    groups.forEach(({ child, count }) => {
      child.style.display = (count == 0) ? "none": "block";
    });
  };
})();

function setState(state, on) {

  // Bootstrap; load from storage or fallback onto defaults
  if (on == null) {
      const storedOn = localStorage.getItem(`is-${ state }`);
      if (storedOn == null) {
        // Get the defaults from the HTML
        on = document.body.classList.contains(state)
      } else {
        // Use the stored state
        on = (storedOn === "true");
      }
  }

  if (on) {
    document.body.classList.add(state);
    localStorage.setItem(`is-${ state }`, "true");
  } else {
    document.body.classList.remove(state);
    localStorage.setItem(`is-${ state }`, "false");
  }
}

document.getElementById("button-options").onclick = function() {
  setState("showOptions", !document.body.classList.contains("showOptions"));
};

document.getElementById("button-darkmode").onclick = function() {
  setState("darkMode", !document.body.classList.contains("darkMode"));
};

// Set the initial state
setState("showOptions");
setState("darkMode");

//output.onclick = function() { input.focus(); }

// Enable animations
setTimeout(() => { document.body.classList.remove("disableAnimations"); }, 0);
