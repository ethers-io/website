importScripts("./ethers.umd.min.js");
importScripts("./inspect.js");

// Hijack the logging a bit, so we can show logs in our REPL
(function() {
    ["log", "warn", "error"].forEach((logger) => {
        const log = console[logger].bind(console);
        console[logger] = function(...args) {
            log(...args);
            postMessage({ action: "log", logger, args: args.map(inspect) });
       };
    });

    version = ethers.version;

    Contract = ethers.Contract;
    ContractFactory = ethers.ContractFactory;
    Wallet = ethers.Wallet;

    providers = ethers.providers;
    constants = ethers.constants;
    utils = ethers.utils;

    abiCoder = ethers.utils.defaultAbiCoder;

    BN = ethers.BigNumber;
    BigNumber = ethers.BigNumber;
    FixedNumber = ethers.FixedNumber;

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

    ethers.BigNumber.prototype[inspect.custom] = function() {
      return `[BigNumber: "${ this.toString() }"]`;
    };

    ethers.Wordlist.prototype[inspect.custom] = function() {
      return `[Wordlist: ${ this.locale }]`;
    };

    Uint8Array.prototype[inspect.custom] = function() {
      return `[Uint8Array: { ${ Array.prototype.map.call(this, (i) => String(i)).join(", ") } } ]`;
    };

})();

let _ = undefined;
let _p = undefined;

onmessage = function(e) {
  const data = JSON.parse(e.data);

  let result = null;
  try {
    result = eval(data);
  } catch (error) {
    postMessage({ action: "sync-error", message: error.message, error: inspect(error) });
    return;
  }

  _ = result;

  if (result instanceof Promise) {
    _p = undefined;
    postMessage({ action: "async-running" });
    result.then((result) => {
      _p = result;
      postMessage({ action: "async-result", result: inspect(result) });
    }, (error) => {
      _p = error;
      postMessage({ action: "async-error", message: error.message, error: inspect(error) });
    });
  } else {
    _p = undefined;
    postMessage({ action: "sync-result", result: inspect(result) });
  }
}

Object.defineProperty(self, "onmessage", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: onmessage
});

postMessage("ready");
