const input = document.getElementById("input");
const inputBox = document.getElementById("input-box");
const output = document.getElementById("output");

const settings = (function() {
  const flags = [ "showSidebar", "darkMode" ];

  // Storage Operations

  function load() {
    const settings = localStorage.getItem("settings-v1");
    try {
      if (settings) { return JSON.parse(settings); }
    } catch(error) { }
    return { };
  }
  function save(settings) {
    localStorage.setItem("settings-v1", JSON.stringify(settings));
    return settings;
  }
  function update(key, value) {
    const settings = load();
    settings[key] = value;
    return save(settings);
  }
  function clear() {
    localStorage.removeItem("settings-v1");
  }

  // Migrate legacy options; this can go away in the future, since
  // by then most people who use this regularly will have relaunched
  // it migrating the values
  {
    function migrate(key, target, convertFunc) {
      key = `is-${ key }`;
      let value = localStorage.getItem(key);
      if (value == null) { return; }
      value = convertFunc(value);
      console.log(`Migrated ${ key } => settings.${ target }: ${ value }`);
      update(target, value);
      localStorage.removeItem(key);
    }
    migrate("showOptions", "showSidebar", (v) => (v === "true"));
    migrate("darkMode", "darkMode", (v) => (v === "true"));
  }

  // Set the UI state for flags on the body
  function setState(key, value) {
    document.body.classList[value ? "add": "remove"](key);
  }

  // Settings methods

  function get(key) {
    const value = load()[key];
    if (value != null) { return value; }
    if (flags.indexOf(key) === -1) { return null; }
    return document.body.classList.contains(key);
  }

  function set(key, value) {
    const settings = update(key, value);
    if (flags.indexOf(key) >= 0) { setState(key, value); }
    return value;
  }

  function toggle(key) {
    if (flags.indexOf(key) === -1) {
      throw new Error(`not a binary value: ${ key }`);
    }
    return set(key, !get(key));
  }

  // Returns a function which will toggle the state of a key
  function toggleFunc(key) { return (function() { toggle(key); }); }

  // Initialize the UI state based on defaults and settings
  flags.forEach((flag) => { setState(flag, get(flag)); });

  // Enable animations in the next event loop
  setTimeout(() => { document.body.classList.remove("disableAnimations"); }, 0);

  // Our exports
  return { clear, get, set, setState, toggle, toggleFunc };
})();

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
const worker = (function () {

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

  async function handleAction(action, params) {
    throw new Erro(`unknown action: ${ action }`);
  }

  function handleNotice(notice, params) {
    if (notice === "internal") {
      const content = params.args.map((c) => ((c === undefined) ? "undefined": c.toString())).join(", ");
      console.log('== INTERNAL LOG ===');
      console.log(content);
      console.log('===================');

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
    //console.log("<<<", data);

    if (!ready && data === "ready") {
      ready = true;
      addOutput("entry", "version");
      await evaluate("version");
      addOutput("entry", "provider.network.name");
      await evaluate("provider.network.name");
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
      handleAction(data.action, data.params || { }).then((result) => {
        postMessage(JSON.stringify({ id, result }));
      }, (error) => {
        console.log(error);
      });

    } else if (data.notice) {
      handleNotice(data.notice, data.params || { });
    }
  }

  return { send };
})();


// Auto-completion lexer for identifier chains
//
// Returns a list of tokens for a given string of code, parsed
// backwards from a starting cursor position, lumping expressions,
// strings, comments, etc. into a minimum chain of identifiers which
// can be used to (in many cases) determine what values can be derived
// for the purposes of auto-completion.
//
// This is not perfect, and does not really aim to be. Context-Free
// languages require quite a lot of additional support. This is meant
// as a good enough solution, and remains relatively compact.

const { getTokens } = (function() {
  function repeat(c, length) {
    if (c.length === 0) { throw new RangeError("too short"); }
    while (c.length < length) { c += c; }
    return c.substring(0, length);
  }

  const openers = { "}": "{", ")": "(", "]": "[" };
  const closers = { "{": "}", "(": ")", "[": "]" };

  const matchable = /* Fix: [ ( { */{ "}": "BRACE", ")": "PAREN", "]": "BRACKET" };

  // Safe characters before an identifier chain; this has limitations
  // as there is no semantic checking on these characters.
  // For example `foo++` would be identified as a safe starting point
  // because of it ends in a `+`, which isn't identified as a unary
  // postfi operation.
  const safeRoot = "([{=;,!%^&*-+|/"; /* fix: }]) */

  // @TODO: precompile all the regex

  // Compute the processed code, which has the same offsets as code,
  // but with nuisances removed, which can break simple parsing
  function getSafeCode(code, markComments) {
    // Nix comments (optionally flagging them to easily identify)
    if (markComments) {
      code = code.replace(/\/\*(.*?)\*\//mg, (all, comment) => ("/\*" + repeat("#", comment.length) + "*\/"));
      code = code.replace(/\/\/(.*$|.*\n)/mg, (all, comment) => ("/\/" + repeat("#", comment.length)));
    } else {
      code = code.replace(/\/\*(.*?)\*\//mg, (all, comment) => ("  " + repeat(" ", comment.length) + "  "));
      code = code.replace(/\/\/(.*$|.*\n)/mg, (all, comment) => ("  " + repeat(" ", comment.length)));
    }

    // Replace string contents with non-identifier, non-conflicting character
    const quoteReplacer = (all, contents) => ('"' + repeat("#", contents.length) + '"');
    code = code.replace(/'(([^'\\]|\\.)*)'/g, quoteReplacer);
    code = code.replace(/"(([^"\\]|\\.)*)"/g, quoteReplacer);
    code = code.replace(/`(([^`\\]|\\.)*)`/g, quoteReplacer);

    // @TODO: regex

    return code;
  }

  // We tokenize the code from offset backwards, stopping when we
  // can no longer process tokens. This allows us to auto-complete
  // mid-code, based on the most recent identifier chain.
  function getTokens(code, offset) {
    let asyncEnabled = false;
    if (code.substring(0, 6) === "%async") {
      asyncEnabled = true;
      code = repeat(" ", 6) + code.substring(6);
    }

    const safeCode = getSafeCode(code);

    const precog = safeCode.substring(offset).match(/[a-z0-9_$]*/i)[0];
    const tokens = [ { token: "CURSOR", offset, caret: offset, width: 0, text: "", precog } ];

    if (offset === 0) {
      tokens.push({ token: "ROOT", offset: 0, width: 0, text: "", asyncEnabled });
      return tokens;
    }

    // Inside a comment, string or somewhere with no viable options to continue
    {
      const codeMarked = getSafeCode(code, true);
      const check = safeCode[offset - 1];
      if ((check === " " && codeMarked[offset - 1] !== " ") || !check.match(/^\s|\.|\[|\]|\{|\}|[a-z0-9_$()]$/i)) {
        tokens.push({ token: "INVALID", offset: offset - 1, width: 1 });
        return tokens;
      }
    }

    // Maps a bracket at an index to its mate
    const brackets = { };

    // Tracks where and what of each bracket and currently unmatched brackets
    const matching = [ ];
    const unmatched = { };

    let cursor = offset;
    while (cursor > 0) {
      cursor--;

      const chr = safeCode[cursor];

      if (openers[chr]) {
        // Closing bracket; we're processing backwards, so this
        // opens a bracket context
        matching.push({ cursor, chr });
        unmatched[String(cursor)] = true;

      } else if (closers[chr]) {
        // Opening bracket; we're processing backwards, so this
        // closes a bracket context

        // Hit an opening bracket with no matchin closing context
        if (matching.length === 0) {
          console.log("start of internal expression");
          cursor++;
          break;
        }

        // Verify the opening bracket type matches the closing
        const bracket = matching.pop();
        if (closers[chr] !== bracket.chr) {
          console.log("mismatch");
          cursor++;
          break;
        }

        // Track the bracket pair
        brackets[String(bracket.cursor)] = cursor;
        brackets[String(cursor)] = bracket.cursor;

        delete unmatched[String(bracket.cursor)];

      } else if (matching.length === 0) {
        // Not a valid identifier character at the root
        if (!chr.match(/^\s|\.|[a-z0-9_$]$/i)) {
          cursor++;
          break;
        }
      }
    }

    // Junk bracket was present, so make that's the furthest back to scan
    Object.keys(unmatched).forEach((v) => {
      v = parseInt(v);
      if (v > cursor) { cursor = v + 1; }
    });

    // Create succinct tokens
    for (let i = offset - 1; i >= cursor; i--) {
      const chr = safeCode[i];
      const lastToken = tokens[tokens.length - 1];

      if (chr === ".") {
        tokens.push({ token: "DOT", offset: i, width: 1 });

      } else if (chr.match(/\s/)) {
        // Merge all consecutive whitespace
        if (lastToken.token !== "WHITESPACE") {
          tokens.push({ token: "WHITESPACE", offset: i, width: 1 });
        } else {
          lastToken.offset--;
          lastToken.width++;
        }

      } else if (matchable[chr]) {
        // collapse matching brackets into a single token
        const open = brackets[String(i)];
        tokens.push({ token: matchable[chr], offset: open, width: i - open + 1 });
        i = open;

      } else {
        // Merge all consecutive identifier characters (the cursor is
        // treated as a special identifier)
        if (lastToken.token === "CURSOR") {
          lastToken.offset--;
          lastToken.width++;
        } else if (lastToken.token !== "IDENTIFIER") {
          tokens.push({ token: "IDENTIFIER", offset: i, width: 1 });
        } else {
          lastToken.offset--;
          lastToken.width++;
        }
      }
    }

    // This ended in a safe place to start an identifier chain
    if (cursor === 0 || safeRoot.indexOf(safeCode[cursor - 1]) >= 0) {
      tokens.push({ token: "ROOT", offset: cursor, width: 0, asyncEnabled });
    }

    // Remove whitespace tokens move identifiers to keywords as needed
    return tokens.reduce((accum, token) => {
      token.text = safeCode.substring(token.offset, token.offset + token.width);
      if (token.token === "IDENTIFIER") {
        if (token.text.match(/^([0-9]+|0x[0-9a-f]+)$/i)) {
          token.value = parseInt(token.text);
          token.token = "NUMBER";
        } else if (token.text === "new") {
          token.token = "NEW";
        } else if (token.text === "await") {
          token.token = "AWAIT";
        }
      }

      // Swallow whitespace
      if (token.token !== "WHITESPACE") { accum.push(token); }

      return accum;
    }, [ ]);;
  }

  return { getTokens };
})();

// @TODO: Bundle these up into an IIFE for UI

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

  let showing = [ ];
  let selection = { start: -1, end: -1, caret: -1 };

  const fontSize = (function() {
    const div = document.getElementById("sizer");
    return parseInt(div.clientWidth / div.textContent.length);
  })();

//  let restore = null;

  function set(options) {
    if (options == null) { options = [ ]; }

    showing = options.slice()

    const selStart = input.selectionStart, selEnd = input.selectionEnd;
    const value = input.value;

    {
      const indent = value.substring(0, selStart).replace(/(.*\n)/, "").length;
      let x = 30 + indent * fontSize;
      if (x > output.clientWidth - 270) { x = output.clientWidth - 270; }
      suggestions.style.transform = `translate(${ x }px, -100%)`;
    }

    // Find the reference node for insertBefore
    function findReference(value) {
      const els = Array.prototype.slice.call(suggestions.childNodes);
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (value <= el.dataset.sortName) { return el; }
      }
      return null;
    }

    // Delete any that no longer matter
    const add = options.reduce((accum, option) => (accum[option.name] = option, accum), { });
    Array.prototype.slice.call(suggestions.childNodes).forEach((child) => {
      const content = child.innerText;
      if (add[content]) {
        delete add[content];
      } else {
        child.remove();
      }
    });

    // Insert suggestions, sorted (inefficient O(n^2), but fine for small values of n)
    Object.keys(add).forEach((name) => {
      const option = add[name];
/*
      let display = option.name;
      let insert = option.name;
      if (option.params) {
        display += "()";
        if (option.insert) {
          insert = option.insert;
        } else {
          const params = option.params.filter(p => (p[0] !== "%"));
          insert += "(" + params.map(p => `%${ p }`).join(", ") + ")";
        }
      }
      console.log("ADD", display, insert, option);
*/
      const ref = findReference(option.display.toLowerCase());

      const div = document.createElement("div");
      div.dataset.sortName = option.display.toLowerCase();
      div.dataset.insert = option.insert || option.display;
      div.textContent = option.display;
      suggestions.insertBefore(div, ref);
    });

    updateUI();
  }

  // If the number of components in the identifier chain change,
  // reset the softBlock, which prevents too many suggestions
  let lastDots = -1;
  let hardShow = false;
  let hardBlock = false;

  function isShowing() {
    if (showing.length === 0 || hardBlock) { return false; }
    if (hardShow) { return true; }
    if (showing.length > 10) { return false; }
    return true;
  }

  function updateUI() {
    const on = isShowing();
    settings.setState("hideSuggestions", !on);
  }

  function setTokens(tokens) {
    if (tokens == null) { tokens = [ ]; }

    // Check if the identifier chain has changed the number of components
    const dots = tokens.filter((t) => (t.token === "DOT")).length;
    if (lastDots == dots) { return; }
    lastDots = dots;

    // Re-initialize default forced blocking/showing
    hardBlock = false;
    hardShow = false;

    // Clear out the suggestions
    while (suggestions.lastChild) { suggestions.lastChild.remove(); }
  }

  function escape() {
    if (isShowing()) {
      hardShow = false;
      if (showing.length <= 10) { hardBlock = true; }
    } else if (showing.length > 0) {
      hardBlock = false;
      hardShow = true;
    }
    updateUI();
  }

  function up() {
    let current = suggestions.querySelector(".selected");
    if (current == null) {
      if (suggestions.children.length) {
        current = suggestions.lastChild;
      }
    } else if (current.previousSibling) {
      current.classList.remove("selected");
      current = current.previousSibling;
    } else {
      current = null;
    }

    if (current) {
      current.classList.add("selected");
    }
  }

  function down() {
    let current = suggestions.querySelector(".selected");
    if (current != null) {
      current.classList.remove("selected");
      if (current.nextSibling) {
        current = current.nextSibling;
      } else {
        current = null;
        /*
        input.value = beforeCaret + originalCaret + afterCaret;
        setTimeout(() => {
          input.setSelectionRange(beforeCaret.length, beforeCaret.length + originalCaret.length);
        }, 0);
        */
      }

      if (current) {
        current.classList.add("selected");
      }
    }
  }

  function enter() {
    const current = suggestions.querySelector(".selected");
    if (current == null) { return false; }

    const value = current.dataset.insert;
    //insertValue(value, { start: beforeCursor.length, end: beforeCursor.length + value.length, assist: true });
    insertValue(value, { start: beforeCursor.length, end: input.value.length - afterCursor.length, assist: true });

    set([]);
/*
    const caret = beforeCursor.length + value.length;
    setTimeout(() => {
      input.setSelectionRange(caret, caret);
    }, 0);
*/
    return true;
  }
/*
  function current() {
    const current = suggestions.querySelector(".selected");
    if (current == null) { return null; }
    return current.textContent;
  }
*/
  let beforeCursor = "", afterCursor = "";

  let lastState = { value: null, start: -1, end: -1 };
  function update() {
    const start = input.selectionStart, end = input.selectionEnd;
    const value = input.value;

    // No change; no need to update
    if (start === lastState.start && end === lastState.end && value === lastState.value) {
      updateUI();
      return;
    }
    lastState = { start, end, value };

    // Range is selected or built-in command; skip
    if (start !== end || value.trim()[0] === "%") { return set([ ]); }

    // Track the tokens
    const tokens = getTokens(value, start);
    setTokens(tokens);

    // This is too noisy, to suggest anything at the global scope
    if (tokens.length === 2 && tokens[0].token === "CURSOR" && tokens[0].text === "" && tokens[1].token === "ROOT") {
      return set([ ]);
    }

    worker.send("inspect", { tokens }).then((result) => {
      console.log("INSPECT", result);

      // Race happened and we lost; no updates from this response
      if (value !== input.value || start !== input.selectionStart || end !== input.selectionEnd) {
        return;
      }

      beforeCursor = value.substring(0, result.offset);
      afterCursor = value.substring(result.offset + result.width);

      selection = { start, end };

      // No matches
      if (result.matches == null) { return set([ ]); }

      set(result.matches, start);

    });
  }

  return { escape, isShowing, up, down, enter, update };
})();

function evaluate(code) {
  return worker.send("eval", { code }).then((result) => {
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

//let wasHighlit = false;
function insertValue(value, options) {
  if (options == null) { options = { }; }

  //wasHighlit = highlight;

  let curValue = input.value;
  let curStart = (options.start != null) ? options.start: input.selectionStart;
  let curEnd = (options.end != null) ? options.end: input.selectionEnd;

  const start = value.length, end = value.length;

  input.value = curValue.substring(0, curStart) + value + curValue.substring(curEnd);

  let selStart = curStart + value.length;
  let selEnd = selStart;

  if (options.highlight) {
    selStart = curStart;
    selfEnd = curStart + value.length;
  } else if (options.assist) {
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
//console.log(e);
  //wasHighlit = false;

  if (e.code === "Escape") {
    suggestions.escape();

  } else if (e.keyCode === 13 && !meta) {
    // [enter]; evaluate in keyup
    e.preventDefault();
    e.stopPropagation();

  } else if (e.keyCode === 38 && !meta) {
    // [up]; use previous history entry

    if (suggestions.isShowing()) {
      suggestions.up();
      e.preventDefault();
      e.stopPropagation();
    } else {
      const code = codeHistory.get(-1);
      if (code != null) { setValue(code); }
    }

  } else if (e.keyCode === 40 && !meta) {
    // [down]; use next history entry

    if (suggestions.isShowing()) {
      suggestions.down();
      e.preventDefault();
      e.stopPropagation();
    } else {
      const code = codeHistory.get(1);
      if (code != null) { setValue(code); }
    }

  } else if (e.keyCode === 9 && !(e.altKey || e.ctrlKey)) {
    // [tab] / [shift-tab]; switch between %args
    bounce(e.shiftKey ? -1: 1, e);
  }

  grow();
};

input.oninput = function() {
  suggestions.update();
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
      settings.clear();
      addOutput("result-bold", "PLAYGROUND: Reset settings and history");
      break;
    case "clear":
      Array.prototype.forEach.call(output.querySelectorAll("div.output"), (el) => {
        el.remove();
      });
      addOutput("result-bold", "PLAYGROUND: Clear output buffer");
      break;
    case "async": {
      let code = args.match(/(.*?)(;*)$/);
      code = `(async function() { return (${ code[1] }); })()`;
      console.log("CC", code);
      evaluate(code);
      break;
    }
    case "help":
      addOutput("result-bold", "PLAYGROUND: HELP");
        addOutput("result", "Commands");
        addOutput("result", "  %help            This help screen");
        addOutput("result", "  %reset           Clear command history");
        addOutput("result", "  %clear           Clear output buffer");
        addOutput("result", "  %async EXPR      Experimental! async expression");
        addOutput("result", "Keys");
        addOutput("result", "  up/down          Cycle through command history");
        addOutput("result", "  tab/shift-tab    Cycle between %vars");
        addOutput("result", "Magic Variables");
        addOutput("result", "  _                Last evaluated response");
        addOutput("result", "  _p               Last promise result (if _ is a Promise)");
        addOutput("result", "Cavets");
        addOutput("result", "  - avoid `const` and `let` as each eval is scoped");
        addOutput("result", "    so the variable will not be available afterward");
        break;
      default:
        addOutput("error", `PLAYGROUND: unknown command ${ JSON.stringify(command) } (try "%help")`);
  }
}

let lastInput = null, lastPrefixPath = null;
let suppressAutoComplete = false;
input.onkeyup = function(e) {

  if (e.keyCode === 13 && !(e.altKey || e.ctrlKey || e.shiftKey)) {

    // @TODO: Move this logic into suggestions.enter()
    if (suggestions.isShowing()) {
      if (suggestions.enter()) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
    //suggestions.set([]);

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
  }

  suggestions.update();
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
  const sidebarItems = document.getElementById("sidebar-items");
  Help.forEach((help) => {

    const div = create("div");
    sidebarItems.appendChild(div);

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
      Array.prototype.forEach.call(document.querySelectorAll("#sidebar-items > div"), (el) => {
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

      document.getElementById("sidebar-items").classList[ (anySelected) ? "add": "remove"]("selected");
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
      insertValue(insert, { assist: true });
    };

    div.appendChild(divInfo);
  });

  const search = document.getElementById("search");
  search.oninput = () => {
    const query = search.value.trim().toLowerCase();
    const groups = [ ];
    Array.prototype.forEach.call(sidebarItems.children, (child, index) => {
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

document.getElementById("button-sidebar").onclick = settings.toggleFunc("showSidebar");
document.getElementById("button-darkmode").onclick = settings.toggleFunc("darkMode");
