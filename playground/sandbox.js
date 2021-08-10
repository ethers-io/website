importScripts("https://cdn.ethers.io/lib/ethers-5.4.umd.min.js");
importScripts("./inspect.js");

let _ = undefined;
let _p = undefined;

const { _onMessage, ethereum } = (function() {
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

    function internal(error) {
      post({ notice: "internal", params: { error: inspect(error) }});
    }

    let nextId = 1;
    const resolveMap = { };
    function send(action, params) {
      const id = nextId++;
      post({ action, id, params });
      return new Promise((resolve) => { resolveMap[String(id)] = resolve; });
    }

    function handleAction(action, id, params) {
      function reply(result) { post({ id, result }); }

      if (action === "eval") {

        let result = null;
        try {
          result = eval(params.code);
        } catch (error) {
          return reply({ sync: "sync", type: "error", value: JSON.stringify(error.message), error: inspect(error) });
        }

        _ = result;
        _p = undefined;

        if (result instanceof Promise) {
          post({ notice: "async-running", id: id });
          result.then((result) => {
            _p = result;
            reply({ sync: "async", type: "result", value: inspect(result) });
          }, (error) => {
            _p = error;
            reply({ sync: "async", type: "error", value: JSON.stringify(error.message), error: inspect(error) });
          });
        } else {
          reply({ sync: "sync", type: "result", value: inspect(result) });
        }
/*
      } else if (data.action === "inspect") {
        const action = "inspect";
        const path = data.path.split(".");
        //console.log("Search", path);

        let result = null;
        let possible = { };
        let prefix = null;
        let likely = null;

        let searchNew = false;
        let current = self;
        while (current != null && path.length) {
          let comp = path.shift();

          if (comp === "%new") {
            searchNew = true;
            continue;
          }

          if (current === self && (comp === "self" || comp === "window")) { continue; }

          if (path.length === 0) {
              prefix = comp;
              possible = Object.keys(current);
              if (prefix) {
                possible = possible.filter((k) => (k.substring(0, prefix.length) === prefix));
              }
              break;
          }

          const propDescr = Object.getOwnPropertyDescriptor(current, comp);
          //console.log(propDescr);
          / *
          if (propDescr) {
            if (propDescr.get) {
              console.log("do not execute getters");
              break;
            }
          }
          * /
          current = current[comp];
        }
        //console.log(possible);

        reply({ action, id, result, likely, possible, prefix });
*/
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
        handleAction(data.action, id, data.params || { });
      }
/*
        const comps = expression.split(".");
        console.log(comps);

        let current = self;
        let possible = { };
        let likely = null;
        while (comps.length) {
          const comp = comps.shift();
          if (current === self && comp === "self") { continue; }

          if (comps.length === 0) {
            for (const key in current) {
              if (key.substring(0, comp.length) === comp) {
                possible[key] = getInspect(current[key]);
                if (comp === key) { likely = key; }
              }
            }
            console.log("POSSY", possible, likely);
          }

          const desc = Object.getOwnPropertyDescriptor(comp, current);
          if (desc) {
            current = current[comp];
          } else if (comp in current) {
            current = current[comp];
          } else {
            current = undefined;
          }
        }
        //console.log(current);

        const result = null;
      }
      */
    }


    const ethereum = new Eip1193PassThrough();

    // Set up the console
    ["log", "warn", "error"].forEach((logger) => {
      const notice = "log";
      const log = console[logger].bind(console);
      console[logger] = function(...args) {
        log(...args);
        post({ notice: "log", params: { logger, args: args.map(inspect) } });
      };
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

    /*
    const tempFixed = ethers.FixedNumber.from("1.0");
    tempFixed.format.constructor.prototype[inspect.custom] = function() {
      return new inspect.NamedObject(this.constructor.name, {
        name: this.name,
        signed: this.signed,
        decimals: this.decimals,
        width: this.width
      });
    }
    */

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


})();

// Set the message handler
onmessage = _onMessage
Object.defineProperty(self, "onmessage", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: _onMessage
});

// Set up an alias to self as window
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

// Set up self.ethereum (also window.ethereum)
Object.defineProperty(self, "ethereum", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: ethereum
});

postMessage(JSON.stringify("ready"));
