importScripts("https://cdn.ethers.io/lib/ethers-5.4.umd.min.js");
importScripts("./inspect.js");

let _ = undefined;
let _p = undefined;

const { _getSigners, ethereum, _onMessage } = (function() {
    class Eip1193PassThrough {
      constructor() { }

      request(method, params) {
        console.log(method, params);
        return new Promise((resolve, reject) => {
          reject(new Error("not implemented yet; coming soon"));
        });
      }

      on() {
        throw new Error("not implemented yet; coming soon");
      }
    }

    function _getSigners() {
      return [ ];
    }

    function _onMessage(e) {
      const data = JSON.parse(e.data);

      let result = null;
      try {
        result = eval(data);
      } catch (error) {
        postMessage({ action: "sync-error", message: error.message, error: inspect(error) });
        return;
      }

      _ = result;
      _p = undefined;

      if (result instanceof Promise) {
        postMessage({ action: "async-running" });
        result.then((result) => {
          _p = result;
          postMessage({ action: "async-result", result: inspect(result) });
        }, (error) => {
          _p = error;
          postMessage({ action: "async-error", message: error.message, error: inspect(error) });
        });
      } else {
        postMessage({ action: "sync-result", result: inspect(result) });
      }
    }

    function S(v) { return JSON.stringify(v); }

    const ethereum = new Eip1193PassThrough();

    // Set up the console
    ["log", "warn", "error"].forEach((logger) => {
      const log = console[logger].bind(console);
      console[logger] = function(...args) {
        log(...args);
        postMessage({ action: "log", logger, args: args.map(inspect) });
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

    //provider.formatter.constructor.prototype[inspect.custom] = function() {
    //  return `Formatter: { }]`;
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

    return {
      _getSigners, ethereum, _onMessage
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
Object.defineProperty(self, "signers", {
  configurable: false,
  enumerable: true,
  get: _getSigners
});

postMessage("ready");
