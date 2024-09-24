
function repeat(c, length) {
  if (c.length === 0) { throw new RangeError("too short"); }
  while (c.length < length) { c += c; }
  return c.substring(0, length);
}

const openers = { "}": "{", ")": "(", "]": "[" };
const closers = Object.keys(openers).reduce((accum, closer) => {
  accum[openers[closer]] = closer;
  return accum;
}, { });


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

    this.comps = this.comps.map((comp, index) => {
      comp = comp.trim();
      const comps = comp.split(/\s+/);
      if (index === 0 && (comps.length === 2 && comps[0] === "new")) {
        comp = comps.join(" ");
      } else if (comps.length !== 1) {
        throw new Error("bad whitespace");
      }
      return comp;
    });
  }

  matchingBracket(offset) {
    offset = String(offset);
    if (this.brackets[offset]) {
      return this.brackets[offset];
    }
  }
}

[
  "hello.world('test').foo",
  "test(hello.world('test').foo",
  "4 + hello.world('test', 4 + 5).foo",
  "console.log(new ethers.Wallet(\"(1234\", randomBytes, provider)/* foobar */.pri"
].forEach((test) => {
  console.log("=======");
  console.log(test);
  const result = new ParsedResult(test);
  console.log(">", result);
});
