importScripts("https:/\/cdn.ethers.io/lib/ethers-5.4.umd.min.js");
importScripts("./inspect.js");
importScripts("./help.js");

/**
 *  Communication Packets for two-way communication
 *
 *  Action; sends a request which expects a Response
 *   - { action: string, id: number, params: object }
 *  Notce; sends a one-way notification
 *  - { notice: string, params: object }
 *  Response; the response to an earlier Action
 *  - { id: number, result: any }
 */

let _ = undefined;
let _p = undefined;

// Debug
self.w = ethers.Wallet.createRandom();

const { _onMessage, ethereum } = (function({ Basic, Globals, Help, Returns }, evalFunc) {

    class Eip1193PassThrough {
      constructor() { }

      request(method, params) {
        console.log(method, params);
        //return send("provider", { method, params });
        return new Promise((resolve, reject) => {
          reject(new Error("not implemented yet; coming soon"));
        });
      }

      on() {
        throw new Error("not implemented yet; coming soon");
      }
    }

    const lookupClass = new Map();
    Help.forEach((info) => {
      if (info.cls) { lookupClass.set(info.cls, info); }
      if (info.func) { lookupClass.set(info.func, info); }
    });

    class Follower {
      keys() { return [ ]; }
      descr(key) { return null; }
      follow() { return null; }

      toString() {
        return `<${ this.constructor.name } keys=(${ this.keys().join(", ") })>`;
      }
/*
      static getDescr(value, options) {
        if (options == null) { options = { }; }

        if (value == null) { return null; }

        if (value instanceof Returns) {
          return value.descr();
        }

        // Basic type, like string or number
        if (value === Uint8Array) { return { returns: "Uint8Array" }; }
        if (Basic[value]) { return { returns: value }; }
        if (Basic[typeof(value)]) { return { returns: typeof(value) }; }

        let match = lookupClass.get(value);
        if (match) {

          // A class
          if (match.cls) {
            if (options.allowClass) {
              return {
                descr: match.description,
                params: match.params,
                newable: true,
                returns: "Class"
              };
            }
            //return {
            //  descr: 
            //};
            //return new PropsFollower(match.name, match.properties);
            return null;
          }

          // A function
          if (match.func) {
            return {
              descr: match.descr,
              params: match.params,
              returns: match.returns
            };
          }

          throw new Error("hmm...");
        }

        // An instance
        match = lookupClass.get(value.constructor);
        if (match) {
          return {
            returns: match.name
          };
        }

        return null;
      }
*/
      static from(value, options) {
        if (options == null) { options = { }; }

        if (value == null) { return null; }

        if (value.returns && value.returns instanceof Returns) {
          if (value.params) {
            return new CallFollower(value, Follower.from(value.returns));
          }
          return new PropsFollower(value, value.returns.props());
        }

        {
          const returns = Returns.from(value);
          if (returns) {
            return new PropsFollower({ returns }, returns.props());
          }
        }

        let match = lookupClass.get(value);
        if (match) {
          // A class
          if (match.cls) {
            return new PropsFollower(match, match.staticProperties);
          }

          // A function
          if (match.func) {
            return new CallFollower(match, Follower.from(match));
          }

          throw new Error("hmm...");
        }

        // An instance
        match = lookupClass.get(value.constructor);
        if (match) {
          return new PropsFollower(match, match.properties);
        }

        return new ObjectFollower(value);
      }
    }

    class StateFollower extends Follower {
      constructor(state, follower) {
        super();
        this.state = state;
        this.follower = follower;
      }

      keys() { return [ this.state ]; }

      follow(key) {
        if (key !== this.state) { return null; }
        return this.follower;
      }

      toString() {
        return `<${ this.constructor.name } state=${ JSON.stringify(this.state) } follower=${ this.follower.toString() } keys=(${ this.keys().join(", ") })>`;
      }
    }

    class DotFollower extends StateFollower {
      constructor(follower) { super(".", follower); }
    }

    class CallFollower extends StateFollower {
      constructor(descr, follower) {
        super("()", new DotFollower(follower));
        this._descr = descr;
      }
      descr() { return this._descr; }
    }

    class PropsFollower extends Follower {
      constructor(descr, props) {
        super();
        this._descr = descr;
        this._props = props;
      }

      keys() { return Object.keys(this._props); }
      descr() { return this._descr; }

      follow(key) {
        const prop = this._props[key];
        const follower = Follower.from(prop);
        if (prop.params) {
          return new CallFollower(prop, follower);
        } else if (prop.returns) {
          return new DotFollower(follower);
        }
        throw new Error("hmmm");
      }
    }

    class ObjectFollower extends Follower {
      constructor(object) {
        super();
        this.object = Object.assign({ }, object);
      }

      add(object) {
        Object.keys(object).forEach((key) => {
          this.object[key] = object[key];
        });
      }

      keys() { return Object.keys(this.object); }
      descr() { return { returns: "unknown" }; }

      follow(key) {
        // Allow returning class objects from our help
        //const follower = Follower.from(this.object[key], { allowClass: true });
        const follower = Follower.from(this.object[key]);

        // CallFollower already has a token to separate identifiers
        if (follower instanceof CallFollower) { return follower; }

        // Require a dot before the next identifier
        return new DotFollower(follower);
      }
    }

    function findMatches(tokens) {
      //console.log("FIND");

      let follower = new Follower();
      let allowed = [ "ROOT" ];

      while(follower && tokens.length) {
        const token = tokens.pop();
        //console.log("TOKEN", token.token, token.text, follower.toString());

        if (token.token === "CURSOR") {
          //console.internal(token);
          const prefix = token.text;

          const matches = follower.keys().reduce((accum, key) => {
            if (key === ".") { return accum; }
            if (key.substring(0, prefix.length) === prefix) {
              const props = { name: key, display: key };
              const descr = follower.follow(key).descr();
              if (descr) {
                if (descr.params) {
                  props.display += "()";
                  props.insert = key + "(" + descr.params.reduce((accum, p) => {
                    if (p[0] !== "%") {
                      accum.push(`%${ p }`);
                    } else if (p.indexOf("=") >= 0) {
                      accum.push(p.substring(p.indexOf("=") + 1).trim());
                    }
                    return accum;
                  }, [ ]).join(", ") + ")";
                  //const params = descr.params.filter(p => (p[0] !== "%"));
                  //props.insert = key + "(" + params.map(p => `%${ p }`).join(", ") + ")";
                  // @TODO: Help for assistive
                }
              }
              accum.push(props);
            }
            return accum;
          }, [ ]);

          return { offset: token.offset, width: (token.width + token.precog.length), precog: token.precog, matches};
        }

        if (allowed.indexOf(token.token) === -1) {
          console.internal("Expected:", allowed, "Got:", token);
          follower = null;
          break;
        }

        switch (token.token) {
          case "ROOT":
            allowed = [ "IDENTIFIER", "NEW" ];
            follower = new ObjectFollower(self);
            follower.add(Globals);
            break;

          case "DOT":
            follower = follower.follow(".");
            allowed = [ "IDENTIFIER" ];
            break;

          case "NEW":
            allowed = [ "IDENTIFIER" ];
            break;

          case "IDENTIFIER":
            allowed = [ "DOT", "PAREN", "BRACKET" ];
            follower = follower.follow(token.text);
            break;

          case "PAREN":
            allowed = [ "DOT" ];
            follower = follower.follow("()");
            break;

          case "BRACKET":
            allowed = [ "DOT" ];
            break;
        }
      }

      return null;
    }

    function getInspect(value) {
      if (value == null) { return null };

      for (const name in ethers.providers) {
        const klass = ethers.providers[name];
        if (klass === value) {
          return { type: "Class", name };
        }
      }

      for (const name in ethers.providers) {
        const klass = ethers.providers[name];
        if (klass && klass === value.constructor) { return { type: name }; }
      }

      if (ethers.BigNumber.isBigNumber(value)) {
        return { type: "BigNumber" };
      }

      if (Array.isArray(value)) {
        return { type: "array", length: value.length };
      }

      if (typeof(value) === "object") {
        return { type: "object", keys: Object.keys(value) };
      }

      return typeof(value);
    }

    function _getSigners() {
      return [ ];
    }

    function S(v) { return JSON.stringify(v); }
    function post(v) { postMessage(S(v)); }

    let nextId = 1;
    const resolveMap = { };
    function send(action, params) {
      const id = nextId++;
      post({ action, id, params });
      return new Promise((resolve) => { resolveMap[String(id)] = resolve; });
    }

    async function handleAction(action, params) {

      if (action === "eval") {

        let result = null;
        try {
          result = evalFunc(params.code);
        } catch (error) {
          return { sync: "sync", type: "error", value: JSON.stringify(error.message), error: inspect(error) };
        }

        _ = result;
        _p = undefined;

        if (result instanceof Promise) {
          post({ notice: "async-running", id: id });
          return await result.then((result) => {
            _p = result;
            return { sync: "async", type: "result", value: inspect(result) };
          }, (error) => {
            _p = error;
            return { sync: "async", type: "error", value: JSON.stringify(error.message), error: inspect(error) };
          });

        } else {
          return { sync: "sync", type: "result", value: inspect(result) };
        }

      } else if (action === "inspect") {
        return findMatches(params.tokens);
      }
    }

    function handleNotice(notice, params) {
    }

    function _onMessage(e) {
      const data = JSON.parse(e.data);
      const id = data.id;

      if (data.result) {
        const resolve = resolveMap[String(id)];

        if (resolve) {
          delete resolveMap[String(id)];
          resolve(data.result);
        } else {
          console.log(`result for ${ id } with no resolver`);
        }

      } else if (data.notice) {
        handleNotice(data.notice, data.params || { });

      } else if (data.action) {
        handleAction(data.action, data.params || { }).then((result) => {;
          post({ id, result });
        }, (error) => {
          console.internal(error);
          console.internal(error.stack);
        });
      }
    }

    const ethereum = new Eip1193PassThrough();

    // Set up the console
    ["log", "warn", "error"].forEach((logger) => {
      const log = console[logger].bind(console);
      console[logger] = function(...args) {
        log(...args);
        post({ notice: "log", params: { logger, args: args.map(inspect) } });
      };
    });

    Object.defineProperty(console, "internal", {
      configurable: false,
      enumerable: true,
      value: (function (...args) {
        post({ notice: "internal", params: { args: args.map(inspect) }});
      })
    });


    const globals = [ "getGlobals" ];
    for (const key in self) { globals.push(key); }

    getGlobals = function() {
      const result = [];
      for (const key in self) {
        if (globals.indexOf(key) >= 0) { continue; }
        result.push(key);
      }
      return result;
    }

    // Expose basic ethers library components
    version = ethers.version;

    BigNumber = ethers.BigNumber;
    Contract = ethers.Contract;
    ContractFactory = ethers.ContractFactory;
    FixedNumber = ethers.FixedNumber;
    VoidSigner = ethers.VoidSigner;
    Wallet = ethers.Wallet;

    providers = ethers.providers;
    constants = ethers.constants;
    utils = ethers.utils;

    abiCoder = ethers.utils.defaultAbiCoder;

    BN = function(v) { return ethers.BigNumber.from(v); }

    provider = ethers.getDefaultProvider();

    [
      "getAddress", "getContractAddress",
      "arrayify", "concat", "hexlify", "zeroPad",
      "joinSignature", "splitSignature",
      "id", "keccak256", "namehash", "sha256",
      "parseEther", "parseUnits", "formatEther", "formatUnits",
      "randomBytes",
      "parseTransaction", "serializeTransaction",
      "toUtf8Bytes", "toUtf8String"
    ].forEach((util) => {
        self[util] = ethers.utils[util];
    });

    // Pretty Format some common ethers classes

    ethers.BigNumber.prototype[inspect.custom] = function() {
      return `BigNumber { value: ${ S(this.toString()) } }`;
    };

    ethers.FixedNumber.prototype[inspect.custom] = function() {
      return `FixedNumber { format: ${ S(this.format.name) }, value: ${ S(this.toString()) } }`;
    };

    ethers.Wordlist.prototype[inspect.custom] = function() {
      return `Wordlist { locale: ${ S(this.locale) } }`;
    };

    Uint8Array.prototype[inspect.custom] = function() {
      return `Uint8Array { ${ Array.prototype.map.call(this, (i) => String(i)).join(", ") } }`;
    };

    //ethers.providers.Formatter.prototype[inspect.custom] = function() {
    //  return `Formatter: { }`;
    //};

    ethers.providers.AlchemyProvider.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        network: this._network.name,
        url: this.connection.url,
        apiKey: (this.isCommunityResource() ? "default": this.apiKey)
      });
    };

    ethers.providers.CloudflareProvider.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        network: this._network.name,
        url: this.connection.url
      });
    };

    ethers.providers.EtherscanProvider.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        network: this._network.name,
        baseUrl: this.baseUrl,
        apiKey: this.isCommunityResource() ? "default": this.apiKey
      });
    };

    ethers.providers.FallbackProvider.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        network: this._network.name,
        anyNetwork: this.anyNetwork,
        providerConfigs: this.providerConfigs,
        quorum: this.quorum
      });
    };

    ethers.providers.InfuraProvider.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        network: this._network.name,
        url: this.connection.url,
        projectId: (this.isCommunityResource() ? "default": this.projectId),
        projectSecret: this.projectSecret
      });
    };

    ethers.providers.PocketProvider.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        network: this._network.name,
        url: this.connection.url,
        applicationId: (this.isCommunityResource() ? "default": this.projectId),
        applicationSecretKey: this.applicationSecretKey,
        loadBalancer: this.loadBalancer
      });
    };

    // Set up an alias to self as window
    Object.defineProperty(self, "signers", {
      configurable: false,
      enumerable: true,
      get: _getSigners
    });

    return {
      _onMessage, ethereum
    };


})(Help(ethers), (_code) => eval(_code));
delete Help;
// The above helps us isolate a few extra variables from the
// eval; only the _code should be visible, all other variables
// are hidden

// Set the message handler (read-only)
onmessage = _onMessage
Object.defineProperty(self, "onmessage", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: _onMessage
});

// Set up an alias to self as window (read-only)
Object.defineProperty(self, "window", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: self
});

// Set up an alias to self as window
Object.defineProperty(self, "self", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: self
});

// Set up self.ethereum (also window.ethereum; read-only)
Object.defineProperty(self, "ethereum", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: ethereum
});

// Notify our container we are ready to party on!
postMessage(JSON.stringify("ready"));
