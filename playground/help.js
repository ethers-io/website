Help = function (ethers) {

  class Returns {
    props() { return null; }

    static from(value) {
      if (value instanceof Uint8Array) { return B("Uint8Array"); }
      if (value instanceof Promise) { return B("Promise"); }
      if (Array.isArray(value)) { return B("Array"); }

      const type = typeof(value);
      if (type in Basic) { return B(type); }

      return null;
    }
  }

  class HelpReturns extends Returns {
    constructor(name) {
      super();
      this.name = name;
    }

    props() {
      const help = Help.filter(h => (h.name === this.name));
      if (help.length !== 1) { throw new Error(`Bad HelpReturns: ${ this.name }`); }
      return help[0].properties;
    }
  }

  class BasicReturns extends Returns {
    constructor(type, subtype) {
      super();

      this.type = type;
      this.subtype = subtype || null;

      this.text = type;
      if (subtype) { this.text += `<${ subtype.text }>`; }
    }

    props() {
      const props = Basic[this.type];
      if (props == null) { throw new Error(`unknown basic type: ${ JSON.stringify(this.type) }`); }
      return props;
    }
  };

  function B(type, subtype) { return new BasicReturns(type, subtype); }
  function H(name) { return new HelpReturns(name); }

  function Func(params, returns, descr) {
    return { descr, params, returns };
  }

  const Basic = {
    "_": { },
    "Uint8Array": {
      length: { returns: B("number") },

      slice: Func([ "start", "%end" ], B("Uint8Array")),
    },
    "Array": {
      length: { returns: B("number") },

      slice: Func([ "start", "%end" ], B("Array")),
      join: Func([ "separator" ], B("string")),
    },
    "Promise": {
      then: Func([ "%resolve=(res) => { %actions }" ], B("Promise")),
      "catch": Func([ "%rejected=(err) => { %actions }" ], B("Promise")),
    },
    "boolean": {
      toString: Func([ ], B("string")),
    },
    "string": {
      length: { returns: B("number") },

      normalize: Func([ "form" ], B("string")),
      split: Func([ "delimiter", "%limit" ], B("Array", B("string"))),
      substring: Func([ "start", "%end" ], B("string")),
      toLowerCase: Func([], B("string")),
      toUpperCase: Func([], B("string")),
      trim: Func([], B("string")),
      trimStart: Func([], B("string")),
      trimEnd: Func([], B("string")),
    },
    "null": { },
    "number": {
      toString: Func([ "radix" ], B("string")),
    },
  };

  const Globals = {
    "Infinity": { returns: B("number") },
    "NaN": { returns: B("number") },
    "undefined": { returns: B("number") },
    "null": { returns: B("null") },
    JSON: {
      parse: Func([ "string" ], B("_")),
      stringify: Func([ "object" ], B("string")),
    },
    setTimeout: Func([ "%cb=() => { %actions }", "interval" ], B("_")),
    clearTimeout: Func([ "id" ], B("_")),
    setInterval: Func([ "%cb=() => { %actions }", "interval" ], B("_")),
    clearInterval: Func([ "id" ], B("_")),
    parseInt: Func([ "value" ], B("number")),
    parseFloat: Func([ "value" ], B("number")),
    console: {
      log: Func([ "args" ], B("_")),
    }
  };

  const Help = [
    {
      name: "BigNumber",
      cls: ethers.BigNumber,
      descr: "a BigNumber",
      staticProperties: {
        from: Func([ "value" ], H("BigNumber"), "returns a new BigNumber from value"),
        isBigNumber: Func([ "value" ], "boolean", "returns true if value is a BigNumber"),
      },
      properties: {
        add: Func([ "other" ], H("BigNumber"), "return a BigNumber with other added to this"),
        mul: Func([ "other" ], H("BigNumber"), ""),
        sub: Func([ "other" ], H("BigNumber"), ""),
        div: Func([ "other" ], H("BigNumber"), ""),
      }
    },
    {
      name: "FixedNumber",
      cls: ethers.FixedNumber,
      descr: "",
      staticProperties: {
        from: Func([ "value", '%format="fixed128x18"' ], H("FixedNumber"), "")
      },
      properties: {
        addUnsafe: Func([ "other" ], H("FixedNumber"), ""),
        subUnsafe: Func([ "other" ], H("FixedNumber"), ""),
        mulUnsafe: Func([ "other" ], H("FixedNumber"), ""),
        divUnsafe: Func([ "other" ], H("FixedNumber"), ""),
        floor: Func([ ], H("FixedNumber"), ""),
        ceiling: Func([ ], H("FixedNumber"), ""),
        round: Func([ "decimals" ], H("FixedNumber"), ""),
        isZero: Func([], B("boolean"), ""),
        isNegative: Func([], B("boolean"), ""),
        toString: Func([], B("string"), ""),
        toHexString: Func([], B("string"), ""),
        toUnsafeFloat: Func([], B("number"), ""),
        toFormat: Func([ "format" ], B("FixedNumber"), ""),
      }
    },
    {
      name: "BaseProvider",
      cls: ethers.providers.BaseProvider,
      descr: "provider",
      params: [ "network" ],
      staticProperties: {
      },
      properties: {
        getBalanceOf: Func([ "address", "%blockTag" ], B("Promise", H("BigNumber")), ""),
        getBlockNumber: Func([ ], B("Promise", B("number")), ""),
      }
    },
    {
      name: "Resolver",
      cls: ethers.providers.Resolver,
      descr: "",
      properties: {
        name: { returns: B("string") },
        address: { returns: B("string") },
        provider: { returns: H("BaseProvider") },
        getAddress: Func([ "%coinType" ], B("Promise", B("string")), ""),
        getContentHash: Func([], B("Promise", B("string")), ""),
        getText: Func([ "key" ], B("Promise", B("string")), ""),
      }
    },
    {
      name: "Wallet",
      cls: ethers.Wallet,
      descr: "A Wallet instance",
      params: [ "privateKey", "%provider" ],
      staticProperties: {
        createRandom: {
          descr: "creates a new random wallet",
          params: [ ],
          returns: H("Wallet")
        },
        fromMnemonic: {
          descr: "from a mnemonic",
          params: [ "mnemonic", "%locale" ],
          returns: H("Wallet")
        }
      },
      properties: {
        address: {
          descr: "the wallet address",
          returns: B("string")
        },
        connect: Func([ "provider" ], H("Wallet"), "returns a new Wallet connected to provider"),
        privateKey: {
          descr: "the wallet private key",
          returns: B("string")
        },
        getAddress: {
          descr: "Get the wallet address",
          params: [ ],
          returns: B("Promise", B("string"))
        },
        getBalance: Func([ ], B("Promise", H("BigNumber")), "gets the account balance"),
        getTransactionCount: Func([ ], B("Promise", B("number")), "gets the next account nonce"),
        sendTransaction: {
          descr: "Sends a transaction",
          params: [ "tx" ],
          returns: B("Promise", H("TransactionResponse"))
        }
      },
    },
    {
      name: "hexlify",
      func: ethers.utils.hexlify,
      descr: "convert a data-like to a hexdatastring",
      params: [ "datalike" ],
      returns: B("string")
    },
    {
      name: "randomBytes",
      func: ethers.utils.randomBytes,
      descr: "returns cryptographic random bytes",
      params: [ "length" ],
      returns: B("Uint8Array")
    },
  ];

  return { Basic, Globals, Help, Returns };
};
