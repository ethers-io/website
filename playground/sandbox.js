importScripts("./ethers.umd.js");

// Hijack the logging a bit, so we can show logs in our REPL
(function() {
    ["log", "warn", "error"].forEach((logger) => {
        const log = console[logger].bind(console);
        console[logger] = function(...args) {
            log(...args);
            postMessage({ action: "log", logger, args });
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

})();

onmessage = function(e) {
  const data = JSON.parse(e.data);

  let result = null;
  try {
    result = eval(data);
  } catch (error) {
    postMessage({ action: "sync-error", message: error.message, error: JSON.stringify(error) });
    return;
  }

  if (result instanceof Promise) {
    postMessage({ action: "async-running" });
    result.then((result) => {
      postMessage({ action: "async-result", result: JSON.stringify(result) });
    }, (error) => {
      postMessage({ action: "async-error", message: error.message, error: JSON.stringify(error) });
    });
  } else {
    postMessage({ action: "sync-result", result: JSON.stringify(result) });
  }
}

Object.defineProperty(self, "onmessage", {
  configurable: false,
  enumerable: true,
  writable: false,
  value: onmessage
});

postMessage("ready");
