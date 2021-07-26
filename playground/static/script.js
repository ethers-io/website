const input = document.getElementById("input");
const output = document.getElementById("output");

let historyCursor = null;
let historyCode = [ ];
try {
  historyCode = JSON.parse(localStorage.getItem("history")) || [ ];
  if (!Array.isArray(historyCode) || historyCode.filter((c) => (typeof(c) !== "string")).length) {
    historyCode = [ ];
  }
} catch (error) { console.log("JJ", error); }

function addOutput(type, content) {
  const div = document.createElement("div");
  div.classList.add(type);
  div.innerText = content;
  output.insertBefore(div, input);
  window.scrollTo(0, document.body.scrollHeight);
  /*
  window.scrollTo({
    top: document.body.scrollHeight,
    left: 0,
    behavior: 'smooth'
  });
  */
}

let ready = false;
const worker = new Worker("sandbox.js");
worker.onmessage = function(e) {
  const data = e.data;
  console.log("<<<", data);
  if (!ready && data === "ready") {
    ready = true;
    input.focus();
    addOutput("entry", "version");
    evaluate("version");
    //addOutput("entry", "provider.network.name");
    //evaluate("provider.network.name");
  } else {
    if (data.action === "log") {
      const content = data.args.map((c) => ((c === undefined) ? "undefined": c.toString())).join(", ");
      addOutput("log-" + data.logger, content);
    } else if (data.action === "async-running") {
      addOutput("pending", "pending");
    } else if (data.action === "sync-result") {
      addOutput("result", data.result);
    } else if (data.action === "async-result") {
      addOutput("result", data.result);
    } else if (data.action === "sync-error") {
      addOutput("error", data.message);
    } else if (data.action === "async-error") {
      addOutput("error", data.message);
    }
  }
}

function addHistory(code) {
  historyCursor = null;
  if (code !== historyCode[historyCode.length - 1]) {
    historyCode.push(code);
  }

  if (code === "%reset") {
    historyCode = [ ];
    localStorage.removeItem("is-darkMode");
    localStorage.removeItem("is-showOptions");
  }

  localStorage.setItem("history", JSON.stringify(historyCode));
}

function evaluate(code) {
  worker.postMessage(JSON.stringify(code));
}

function grow() {
  if (input.scrollHeight > input.clientHeight) {
    input.style.height = input.scrollHeight + "px";
  }
}

const req = [ ];

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

function insertValue(value) {
  let curValue = input.value;
  let curStart = input.selectionStart, curEnd = input.selectionEnd;

  const start = value.length, end = value.length;

  input.value = curValue.substring(0, curStart) + value + curValue.substring(curEnd);

  let selStart = curStart + value.length;
  let selEnd = selStart;

  const assist = getAssist(value, 1, 0, 0);
  if (assist) {
    selStart = curStart + assist.start;
    selEnd = curStart + assist.end;
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

  if (e.keyCode === 13 && !meta) {
    // [enter]; evaluate

    let value = input.value;
    input.style.height = null;
    if (value.trim()) {
      addHistory(value);
    } else {
      value = " ";
    }
    addOutput("entry", value);
    if (value[0] === "%") {
      switch (value.trim().split(/\s+/g)[0]) {
        case "%reset":
          addOutput("result-bold", "PLAYGROUND: Reset history");
          break;
        case "%help":
          addOutput("result-bold", "PLAYGROUND: HELP");
          addOutput("result", "Commands");
          addOutput("result", "  %help            This help screen");
          addOutput("result", "  %reset           Clear command history");
          addOutput("result", "");
          addOutput("result", "Keys");
          addOutput("result", "  up/down          Cycle through command history");
          addOutput("result", "  tab/shift-tab    Cycle between %vars");
          addOutput("result", "");
          addOutput("result", "Cavets");
          addOutput("result", "  - avoid `const` and `let` as each eval is scoped");
          addOutput("result", "    so the variable will not be available afterward");
          break;
        default:
          addOutput("error", `PLAYGROUND: unknown command ${ JSON.stringify(value) } (try "%help")`);
      }
    } else {
      evaluate(value);
    }
    setValue("");

  } else if (e.keyCode === 38 && !meta) {
    // [up]; use previous history entry

    if (historyCursor == null) {
      historyCursor = historyCode.length - 1;
    } else {
      historyCursor--;
    }
    if (historyCursor < 0) { historyCursor = 0; }
    if (historyCursor < historyCode.length) {
      setValue(historyCode[historyCursor]);
    }

  } else if (e.keyCode === 40 && !meta) {
    // [down]; use next history entry

    if (historyCursor != null) {
      historyCursor++;
      if (historyCursor < historyCode.length) {
        setValue(historyCode[historyCursor]);
      } else {
        historyCursor = null
        setValue("");
      }
    }

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

input.onkeyup = function(e) {
  if (e.keyCode === 13 && !(e.altKey || e.ctrlKey || e.shiftKey)) {
    setValue("");
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
      insertValue(insert, true);
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

output.onclick = function() { input.focus(); }

// Enable animations
setTimeout(() => { document.body.classList.remove("disableAnimations"); }, 0);
