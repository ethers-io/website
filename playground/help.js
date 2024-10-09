/**
 *  Auto-complete data for functions, classes and methods.
 *
 *  This is used by sandbox.js when computing auto-complete
 *  recommendations.
 */

Help = function (ethers) {
  function S(v) { return JSON.stringify(v); }

  class DummyClass { }

  class Returns {
    props() { return null; }

    static fromBasic(value) {
      if (value instanceof Uint8Array) { return B("Uint8Array"); }
      if (value instanceof Promise) { return B("Promise"); }
      if (Array.isArray(value)) { return B("Array"); }

      const type = typeof(value);
      if (type in Basic) { return B(type); }

      return null;
    }

    static from(value) {
      if (value === "_") { return B("_"); }

      const basic = Returns.fromBasic(value);
      if (basic) { return basic; }

      const clsNameMatch = Help.filter((h) => (h.cls && h.name === value));
      if (clsNameMatch.length) { return H(clsNameMatch.pop().name); }

      const clsMatch = Help.filter((h) => (h.cls === value));
      if (clsMatch) { return B("class", H(clsMatch.name)); }

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
      if (props == null) { throw new Error(`unknown basic type: ${ S(this.type) }`); }
      return props;
    }
  };

  class DescrReturns extends Returns {
    constructor(name) {
      super();
      this.name = name;
    }

    props() {
      return null;
    }
  }

  function B(type, subtype) { return new BasicReturns(type, subtype); }
  function H(name) { return new HelpReturns(name); }
  function D(name) { return new DescrReturns(name); }

  function Func(params, returns, descr) {
    return { descr, params, returns };
  }

  const Basic = {
    "_": { },
//    "object": { },
    "Uint8Array": {
      length: { returns: B("number") },

      slice: Func([ "%start", "%end" ], B("Uint8Array")),
    },
    "Array": {
      length: { returns: B("number") },

      slice: Func([ "start", "%end" ], B("Array")),
      join: Func([ "separator" ], B("string")),
    },
    "Date": {
      getDate: Func([], B("number")),
      getDay: Func([], B("number")),
      getFullYear: Func([], B("number")),
      getHours: Func([], B("number")),
      getMilliseconds: Func([], B("number")),
      getMinutes: Func([], B("number")),
      getMonths: Func([], B("number")),
      getSeconds: Func([], B("number")),
      getTime: Func([], B("number")),
      getTimezoneOffset: Func([], B("number")),
      getUTCDate: Func([], B("number")),
      getUTCDay: Func([], B("number")),
      getUTCFullYear: Func([], B("number")),
      getUTCHours: Func([], B("number")),
      getUTCMilliseconds: Func([], B("number")),
      getUTCMinutes: Func([], B("number")),
      getUTCMonths: Func([], B("number")),
      getUTCSeconds: Func([], B("number")),
      getUTCYead: Func([], B("number")),
      getYear: Func([], B("number")),
      toDateString: Func([], B("string")),
      toISOString: Func([], B("string")),
      toJSON: Func([], B("_")),
      toLocaleString: Func([], B("string")),
      toLocaleDateString: Func([], B("string")),
      toString: Func([], B("string")),
      toTimeString: Func([], B("string")),
      toUTCString: Func([], B("string")),
    },
    "Promise": {
      then: Func([ "%resolve=(res) => { %actions }" ], B("Promise")),
      "catch": Func([ "%rejected=(err) => { %actions }" ], B("Promise")),
    },
    "bigint": {
      toString: Func([ "radix" ], B("string")),
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
      toExponential: Func([ "%digits" ], B("string")),
      toFixed: Func([ "%digits" ], B("string")),
      toPrecision: Func([ "%precision" ], B("string")),
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
    },
    Math: {
      atan2: Func([ "y", "x" ], B("number")),
      random: Func([ ], B("number")),
    },
    Number: {
      isFinite: Func([ "value" ], B("boolean")),
      isInteger: Func([ "value" ], B("boolean")),
      isNaN: Func([ "value" ], B("boolean")),
      isSafeInteger: Func([ "value" ], B("boolean")),
      parseFloat: Func([ "value" ], B("number")),
      parseInt: Func([ "value" ], B("number")),

      EPSILON: { returns: B("number") },
      MAX_SAFE_INTEGER: { returns: B("number") },
      MAX_VALUE: { returns: B("number") },
      MIN_SAFE_INTEGER: { returns: B("number") },
      MIN_VALUE: { returns: B("number") },
      NaN: { returns: B("number") },
      NEGATIVE_INFINITY: { returns: B("number") },
      POSITIVE_INFINITY: { returns: B("number") },
    },
    Object: {
      assign: { params: [ "target={ }", "source" ], returns: B("_") },
      keys: Func([ "object" ], B("Array")),
    },
    String: {
      fromCharCode: Func([ "values" ], B("string")),
      fromCodePoint: Func([ "values" ], B("string")),
    },
    Uint8Array: {
      from: Func([ "value" ], B("Uint8Array")),
      of: Func([ "value" ], B("Uint8Array"))
    }
  };

  // Math constants
  "E LN2 LN10 LOG2E LOG10E PI SQRT1_2 SQRT2".split(" ").forEach((name) => {
    Globals.Math[name] = { returns: B("number") };
  });

  // Math Funcs
  "abs acos acosh asin asinh atan atanh cbrt ceil clz32 cos cosh exp expm1 floor fround log log1p log10 log2 round sign sin sinh sqrt tan tanh trunc".split(" ").forEach((name) => {
    Globals.Math[name] = { params: [ "x" ], returns: B("number") };
  });
  "hypot imul max min pow".split(" ").forEach((name) => {
    Globals.Math[name] = { params: [ "x", "y" ], returns: B("number") };
  });

  // Object
  "freeze getOwnPropertyDescriptors getOwnPropertyNames getOwnPropertySymbols getPrototypeOf is isExtensible isFrozen isPrototypeOf isSealed keys preventExtensions seal values".split(" ").forEach((name) => {
    Globals.Object[name] = { params: [ "object" ], returns: B("_") }
  });

// @TODO: Fetch*

  const Help = [
    {
      name: "Result", // @TODO: this isn't getting picked up; Array is taking precedence. Why?
      cls: ethers.Result,
      properties: {
        length: { returns: B("number") },
        slice: Func([ "start", "%end" ], B("Array")),
        join: Func([ "separator" ], B("string")),

        getValue: Func([ "names" ], B("_")),
        toArray: Func([ ], B("Array")),
        toObject: Func([ ], B("_")),
      }
    },
    {
      name: "FixedNumber",
      cls: ethers.FixedNumber,
      staticProperties: {
        fromBytes: Func([ "value", "%format" ], H("FixedNumber")),
        fromString: Func([ "value", "%format" ], H("FixedNumber")),
        fromValue: Func([ "value", "%decimals", "%format" ], H("FixedNumber")),
      },
      properties: {
        decimals: { returns: B("number") },
        format: { returns: B("string") },
        signed: { returns: B("boolean") },
        value: { returns: B("bigint") },
        width: { returns: B("number") },

        add: Func([ "other" ], H("FixedNumber")),
        addUnsafe: Func([ "other" ], H("FixedNumber")),
        ceiling: Func([ ], H("FixedNumber")),
        cmp: Func([ "other" ], B("number")),
        div: Func([ "other" ], H("FixedNumber")),
        divSignal: Func([ "other" ], H("FixedNumber")),
        eq: Func([ "other" ], B("boolean")),
        floor: Func([ ], H("FixedNumber")),
        gt: Func([ "other" ], B("boolean")),
        gte: Func([ "other" ], B("boolean")),
        isNegative: Func([ "other" ], B("boolean")),
        isZero: Func([ "other" ], B("boolean")),
        lt: Func([ "other" ], B("boolean")),
        lte: Func([ "other" ], B("boolean")),
        mul: Func([ "other" ], H("FixedNumber")),
        mulSignal: Func([ "other" ], H("FixedNumber")),
        mulUnsafe: Func([ "other" ], H("FixedNumber")),
        round: Func([ "decimals" ], H("FixedNumber")),
        sub: Func([ "other" ], H("FixedNumber")),
        subUnsafe: Func([ "other" ], H("FixedNumber")),
        toFoxmat: Func([ "format" ], H("FixedNumber")),
        toString: Func([ ], B("string")),
        toUnsafeFloat: Func([ ], B("number")),
      },
      inspect: function() {
        class FixedNumber { }
        const obj = new FixedNumber();
        obj.format = this.format;
        obj.value = this.toString();
        return obj;
      }
    },
    {
      name: "AbiCoder",
      cls: ethers.AbiCoder,
      staticProperties: {
        defaultAbiCoder: Func([], H("AbiCoder"))
      },
      properties: {
        decode: Func([ "types", "data", "%loose" ], H("Result")),
        encode: Func([ "types", "values" ], B("string")),
        getDefaultValue: Func([ "types" ], H("Result")),
      }
    },
    {
      name: "Interface",
      cls: ethers.Interface,
      params: [ "abi" ],
      staticProperties: {
        from: Func([ "abi" ], H("Interface"))
      },
      properties: {
        deploy: { returns: B("_") }, // ConstructorFragment
        fallback: { returns: B("_") }, // FallbackFragment
        fragments: { returns: B("Array") },
        receive: { returns: B("boolean") },

        decodeErrorResult: Func([ "fragment", "data" ], H("Result")),
        decodeErrorLog: Func([ "fragment", "data", "%topics" ], H("Result")),
        decodeFunctionData: Func([ "fragment", "data" ], H("Result")),
        decodeFunctionResult: Func([ "fragment", "data" ], H("Result")),

        encodeDeploy: Func([ "%values" ], B("string")),

        encodeErrorResult: Func([ "fragment", "%values" ], B("string")),
        encodeEventLog: Func([ "fragment", "values", "%topics" ], B("_")), // { data: string, topics: Array<string>}
        encodeFilterTopics: Func([ "fragment", "values" ], B("Array")),
        encodeFunctionData: Func([ "fragment", "%values" ], B("string")),
        encodeFunctionResult: Func([ "fragment", "%values" ], B("string")),
        forEachError: Func([ "callback" ], B("_")),
        forEachEvent: Func([ "callback" ], B("_")),
        forEachFunction: Func([ "callback" ], B("_")),
        format: Func([ "%minimal" ], B("Array")),
        formatJson: Func([ ], B("string")),
        getAbiCoder: Func([ ], H("AbiCoder")),
        getError: Func([ "key", "%values" ], B("_")),
        getEvent: Func([ "key", "%values" ], B("_")),
        getEventName: Func([ "key" ], B("string")),
        getFunction: Func([ "key", "%values" ], B("_")),
        getFunctionName: Func([ "key" ], B("string")),
        hasEvent: Func([ "key" ], B("boolean")),
        hasFunction: Func([ "key" ], B("boolean")),
        makeError: Func([ "data", "tx" ], B("_")), // Error
        parseCallResult: Func([ "data" ], H("Result")),
        parseError: Func([ "data" ], B("_")),
        parseLog: Func([ "log" ], B("_")),
        parseTransaction: Func([ "tx" ], B("_")),
      }
    },

    {
      name: "Mnemonic",
      cls: ethers.Mnemonic,
      staticProperties: {
        fromEntropy: Func([ "entropy", "%password", "%wordlist" ], H("Mnemonic")),
        fromPhrase: Func([ "phrase", "%password", "%wordlist" ], H("Mnemonic")),

        entropyToPhrase: Func([ "entropy", "%wordlist" ], B("string")),
        isValidMnemonic: Func([ "phrase", "%wordlist" ], B("boolean")),
        phraseToEntropy: Func([ "phrase", "%wordlist" ], B("string")),
      },
      properties: {
        entropy: { returns: B("string") },
        password: { returns: B("string") },
        phrase: { returns: B("string") },
        wordlist: { returns: H("Wordlist") },

        computeSeed: Func([], B("string")),
      }
    },

    {
      name: "Network",
      cls: ethers.Network,
      staticProperties: {
        from: Func([ "name", "chainId" ], H("Network")),
      },
      params: [ "name", "chainId" ],
      properties: {
        name: { returns: B("string") },
        chainId: { returns: B("number") },
        ensAddress: { returns: B("string") },

        clone: Func([], H("Network")),

        computeIntrinsicGas: Func([ "tx" ], B("number")),
        matches: Func([ "other" ], B("boolean")),
      },
      inspect: function() {
        class Network { }
        const obj = new Network();
        obj.name = this.name;
        obj.chainId = this.chainId;
        return obj;
      }
    },

    {
      name: "Signature",
      cls: ethers.Signature,
      staticProperties: {
        from: Func([ "%sig" ], H("Signature")),
        getChainId: Func([ "v" ], B("bigint")),
        getChainIdV: Func([ "chainId", "v" ], B("bigint")),
        getNormalizedV: Func([ "v" ], B("number")),
      },
      properties: {
        r: { returns: B("string") },
        s: { returns: B("string") },
        v: { returns: B("number") },
        yParity: { returns: B("number") },

        yParityAndS: { returns: B("string") },

        compactSerialized: { returns: B("string") },
        serialized: { returns: B("string") },

        legacyChainId: { returns: B("bigint") },
        networkV: { returns: B("bigint") },

        clone: Func([], H("Signature")),
        toJSON: Func([], B("_")),
      },
      inspect: function() {
        class Signature { }
        const obj = new Signature();
        obj.r = this.r;
        obj.s = this.s;
        obj.v = this.v;
        return obj;
      }
    },

    {
      name: "SigningKey",
      cls: ethers.SigningKey,
      params: [ "privateKey" ],
      staticProperties: {
        addPoints: Func([ "p0", "p1", "%compressed" ], B("string")),
        computePublicKey: Func([ "key", "%compressed" ], B("string")),
        recoverPublicKey: Func([ "digest", "signature" ], B("string")),
      },
      properties: {
        compressedPublicKey: { returns: B("string") },
        privateKey: { returns: B("string") },
        publicKey: { returns: B("string") },

        computeSharedSecret: Func([ "other" ], B("string")),
        sign: Func([ "digest" ], B("string")),
      },
      inspect: function() {
        class SigningKey { }
        const obj = new SigningKey();
        obj.privateKey = "[REDACTED]";
        obj.publicKey = this.publicKey;
        return obj;
      }
    },

    {
      name: "Signer",
      cls: (new DummyClass()),
      properties: {
        provider: { returns: H("Provider") },

        call: Func([ "tx" ], B("Promise")),
        connect: Func([ "provider" ], H("Signer")),
        estimateGas: Func([ "tx" ], B("Promise")),
        getAddress: Func([], B("Promise")),
        getNonce: Func([ "%blockTag" ], B("Promise")),
        populateCall: Func([ "tx" ], B("Promise")),
        populateTransaction: Func([ "tx" ], B("Promise")),
        resolveName: Func([ "name" ], B("Promise")),
        signMessage: Func([ "message" ], B("Promise")),
        signTransaction: Func([ "tx" ], B("Promise")),
        signTypedData: Func([ "domain", "types", "value" ], B("Promise")),
      }
    },

    {
      name: "Transaction",
      cls: ethers.Transaction,
      params: [],
      staticProperties: {
        from: Func([ "%tx" ], H("Transaction")),
      },
      properties: {
        accessList: { returns: B("_") },
        blobs: { returns: B("_") },
        blobVersionedHashes: { returns: B("_") },
        chainId: { returns: B("bigint") },
        data: { returns: B("string") },
        from: { returns: B("_") },
        gasLimit: { returns: B("bigint") },
        gasPrice: { returns: B("_") },
        hash: { returns: B("string") },
        kzg: { returns: B("_") },
        maxFeePerBlobGas: { returns: B("_") },
        maxFeePerGas: { returns: B("_") },
        maxPriorityFeePerGas: { returns: B("_") },
        nonce: { returns: B("number") },
        serialized: { returns: B("string") },
        signature: { returns: B("_") },
        to: { returns: B("_") },
        type: { returns: B("_") },
        typeName: { returns: B("_") },
        unsignedHash: { returns: B("string") },
        unsignedSerialized: { returns: B("string") },
        value: { returns: B("bigint") },

        clone: Func([], H("Transaction")),
        inferType: Func([], B("number")),
        inferTypes: Func([], B("Array", B("number"))),
        isBerlin: Func([], B("boolean")),
        isCancun: Func([], B("boolean")),
        isLegacy: Func([], B("boolean")),
        isLondon: Func([], B("boolean")),
        isSigned: Func([], B("boolean")),
        toJSON: Func([], B("_")),
      },
      inspect: function() {
        class Transaction { }
        const obj = new Transaction();
        obj.chainId = this.chainId;
        obj.data = this.data;
        obj.from = this.from;
        obj.gasLimit = this.gasLimit;
        obj.hash = this.hash;
        obj.nonce = this.nonce;
        obj.signature = this.signature;
        obj.to = this.to;
        obj.type = this.type;
        obj.value = this.value;
        return obj;
      }
    },

    {
      name: "Block",
      cls: ethers.Block,
      properties: {
        difficulty: { returns: B("bigint") },
        extraData: { returns: B("string") },
        gasLimit: { returns: B("bigint") },
        gasUsed: { returns: B("bigint") },
        miner: { returns: B("string") },
        nonce: { returns: B("string") },
        number: { returns: B("number") },
        parentHash: { returns: B("string") },
        provider: { returns: H("Provider") },
        timestamp: { returns: B("number") },

        date: { returns: B("Date") },
        length: { returns: B("number") },
        prefetchedTransactions: { returns: B("Array", H("TransactionResponse")) },
        transactions: { returns: B("Array", B("string")) },

        getPrefetchedTransaction: Func([ "indexOfHash" ], H("TransactionResponse")),
        getTransaction: Func([ "indexOfHash" ], H("TransactionResponse")),
        isLondon: Func([ ], B("boolean")),
        isMined: Func([ ], B("boolean")),
        toJSON: Func([], B("_")),
      },
      inspect: function() {
        class Block { }
        const obj = new Block();
        Object.keys(this).forEach((k) => obj[k] = this[k]);
        obj.transactions = this.transactions;
        delete obj.provider;
        return obj;
      }
    },
    {
      name: "Log",
      cls: ethers.Log,
      properties: {
        address: { returns: B("string") },
        blockHash: { returns: B("string") },
        blockNumber: { returns: B("number") },
        data: { returns: B("string") },
        index: { returns: B("number") },
        provider: { returns: H("Provider") },
        removed: { returns: B("boolean") },
        transactionHash: { returns: B("string") },
        transactionIndex: { returns: B("number") },
        topics: { returns: B("Array", B("string")) },

        getBlock: Func([], B("Promise", H("Block"))),
        getTransaction: Func([], B("Promise", H("TransactionResponse"))),
        getTransactionReceipt: Func([], B("Promise", H("TransactionReceipt"))),
        toJSON: Func([], B("_")),
      },
      inspect: function() {
        class Log { }
        const obj = new Log();
        Object.keys(this).forEach((k) => obj[k] = this[k]);
        delete obj.provider;
        return obj;
      }
    },
    {
      name: "TransactionReceipt",
      cls: ethers.TransactionReceipt,
      properties: {
        blockHash: { returns: B("string") },
        blockNumber: { returns: B("number") },
        cumulativeGasUsed: { returns: B("bigint") },
        from: { returns: B("string") },
        gasPrice: { returns: B("bigint") },
        gasUsed: { returns: B("bigint") },
        hash: { returns: B("string") },
        index: { returns: B("number") },
        provider: { returns: H("Provider") },
        type: { returns: B("number") },

        fee: { returns: B("bigint") },
        logs: { returns: B("Array", H("Log")) },
        length: { returns: B("number") },

        confirmations: Func([], B("Promise", B("number"))),
        getBlock: Func([], B("Promise", H("Block"))),
        getTransaction: Func([], B("Promise", H("TransactionResponse"))),
        getResult: Func([], B("Promise", B("string"))),

        toJSON: Func([], B("_")),
      },
      inspect: function() {
        class TransactionReceipt { }
        const obj = new TransactionReceipt();
        Object.keys(this).forEach((k) => obj[k] = this[k]);
        obj.logs = this.logs;
        delete obj.provider;
        return obj;
      }
    },
    {
      name: "TransactionResponse",
      cls: ethers.TransactionResponse,
      properties: {
        chainId: { returns: B("bigint") },
        data: { returns: B("string") },
        gasLimit: { returns: B("bigint") },
        gasPrice: { returns: B("bigint") },
        hash: { returns: B("string") },
        index: { returns: B("number") },
        provider: { returns: H("Provider") },
        signature: { returns: H("Signature") },
        type: { returns: B("number") },

        confirmations: Func([], B("number")),
        getBlock: Func([], B("Promise", H("Block"))),
        getTransaction: Func([], B("Promise", H("TransactionResponse"))),
        isMined: Func([], B("boolean")),
        isLegacy: Func([], B("boolean")),
        isBerlin: Func([], B("boolean")),
        isLondon: Func([], B("boolean")),
        isCancun: Func([], B("boolean")),
        toJSON: Func([], B("_")),
        wait: Func([ "%confirms", "%timeout" ], B("Promise", H("TransactionResponse"))),
      },
      inspect: function() {
        class TransactionResponse { }
        const obj = new TransactionResponse();
        Object.keys(this).forEach((k) => obj[k] = this[k]);
        delete obj.provider;
        return obj;
      }
    },

    {
      name: "Provider",
      cls: (new DummyClass()),
      properties: {
        provider: { returns: H("Provider") },
        broadcastTransaction: Func([ "signedTx" ], B("Promise")),
        call: Func([ "tx" ], B("Promise")),
        destroy: Func([ ], B("Promise")),
        estimateGas: Func([ "tx" ], B("Promise")),
        getBalance: Func([ "address", "%blockTag" ], B("Promise")),
        getBlock: Func([ "blockHashOrBlockTag" ], B("Promise")),
        getBlockNumber: Func([ ], B("Promise")),
        getCode: Func([ "address", "%blockTag" ], B("Promise")),
        getFeeData: Func([ ], B("Promise")),
        getLogs: Func([ "filter" ], B("Promise")),
        getNetwork: Func([ ], B("Promise")),
        getStorage: Func([ "address", "position", "%blockTag" ], B("Promise")),
        getTransaction: Func([ "hash" ], B("Promise")),
        getTransactionCount: Func([ "address", "%blockTag" ], B("Promise")),
        getTransactionReceipt: Func([ "hash" ], B("Promise")),
        getTransactionResult: Func([ "hash" ], B("Promise")),
        lookupAddress: Func([ "name" ], B("Promise")),
        resolveName: Func([ "name" ], B("Promise")),
        waitForBlock: Func([ "%blockTag" ], B("Promise")),
        waitForTransaction: Func([ "hash", "%confirms", "%timeout" ], B("Promise")),
      }
    },

    {
      name: "AbstractProvider",
      cls: ethers.AbstractProvider,
      inherits: "Provider"
    },
    {
      name: "FallbackProvider",
      cls: ethers.FallbackProvider,
      inherits: "AbstractProvider"
    },
    {
      name: "JsonRpcApiProvider",
      cls: ethers.JsonRpcApiProvider,
      inherits: "AbstractProvider",
      properties: {
        ready: { returns: B("boolean") },
        getSigner: Func([ "%address" ], B("Promise")),
        listAccounts: Func([ ], B("Promise")),
        send: Func([ "method", "params" ], B("Promise")),
      }
    },
    {
      name: "JsonRpcProvider",
      cls: ethers.JsonRpcProvider,
      inherits: "JsonRpcApiProvider"
    },
    {
      name: "WebSocketProvider",
      cls: ethers.WebSocketProvider,
      inherits: "JsonRpcProvider"
    },
    {
      name: "AlchemyProvider",
      cls: ethers.AlchemyProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network", "%apiKey" ]
    },
    {
      name: "AnkrProvider",
      cls: ethers.AnkrProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network", "%apiKey" ]
    },
    {
      name: "ChainstackProvider",
      cls: ethers.ChainstackProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network", "%apiKey" ]
    },
    {
      name: "CloudflareProvider",
      cls: ethers.CloudflareProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network" ]
    },
    {
      name: "EtherscanProvider",
      cls: ethers.EtherscanProvider,
      inherits: "AbstractProvider",
      params: [ "%network", "%apiKey" ],
      properties: {
        apiKey: { returns: B("_") },
        network: { returns: H("Network") },

        getBaseUrl: Func([], B("string")),
        getPostUrl: Func([ ], B("string")),
        getPostData: Func([ "module", "params" ], B("_")),
        getUrl: Func([ "module", "param" ], B("string")),

        fetch: Func([ "module", "params", "%post" ], B("Promise")),

        getEtherPrice: Func([], B("Promise")),
        getContract: Func([ "address" ], B("Promise")),
      }
    },
    {
      name: "InfuraProvider",
      cls: ethers.InfuraProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network", "%projectId", "%projectSecret" ],
      properties: {
        projectId: { returns: B("string") },
        projectSecret: { returns: B("_") },
      }
    },
    {
      name: "InfuraWebSocketProvider",
      cls: ethers.InfuraWebSocketProvider,
      inherits: "WebSocketProvider",
      params: [ "%network", "%projectId", "%projectSEcret" ],
      properties: {
        projectId: { returns: B("string") },
        projectSecret: { returns: B("_") },
      }
    },
    {
      name: "PocketProvider",
      cls: ethers.PocketProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network", "%appId", "%appSecret" ],
      properties: {
        applicationId: { returns: B("string") },
        applicationSecret: { returns: B("_") }
      }
    },
    {
      name: "QuickNodeProvider",
      cls: ethers.QuickNodeProvider,
      inherits: "JsonRpcProvider",
      params: [ "%network", "%token" ],
      properties: {
        token: { returns: B("string") }
      }
    },


    {
      name: "AbstractSigner",
      cls: ethers.AbstractSigner,
      inherits: "Signer",
      properties: {
        connect: Func([ "provider" ], H("AbstractSigner")),
      }
    },
    {
      name: "BaseWallet",
      cls: ethers.BaseWallet,
      inherits: "AbstractSigner",
      params: [ "privateKey", "%provider" ],
      properties: {
        address: { returns: B("string") },
        privateKey: { returns: B("string") },
        signingKey: { returns: H("SigningKey") },

        connect: Func([ "provider" ], H("BaseWallet")),

        signMessageSync: Func([ "message" ], B("string")),
      }
    },
    {
      name: "HDNodeWallet",
      cls: ethers.HDNodeWallet,
      inherits: "BaseWallet",
      staticProperties: {
        createRandom: Func([ "%password", "%path", "%wordlist" ], H("HDNodeWallet")),
        fromMnemonic: Func([ "mnemonic", "%path" ], H("HDNodeWallet")),
        fromPhrase: Func([ "phrase", "%password", "%path", "%wordlist" ], H("HDNodeWallet")),
        fromSeed: Func([ "seed" ], H("HDNodeWallet")),
        fromExtendedKey: Func([ "extendedKey" ], B("_")),
      },
      properties: {
        chainCode: { returns: B("string") },
        depth: { returns: B("number") },
        extendedKey: { returns: B("string") },
        fingerprint: { returns: B("string") },
        index: { returns: B("number") },
        mnemonic: { returns: H("Mnemonic") },
        parentFingerprint: { returns: B("string") },
        path: { returns: B("string") },
        publicKey: { returns: B("string") },

        deriveChild: Func([ "index" ], H("HDNodeWallet")),
        derivePath: Func([ "path" ], H("HDNodeWallet")),

        hasPath: Func([ ], B("boolean")),
        neuter: Func([ ], H("HDNodeVoidWallet")),

        encrypt: Func([ "password", "%progress" ], B("Promise")),
        encryptSync: Func([ "password" ], B("string")),
      }
    },
    {
      name: "HDNodeVoidWallet",
      cls: ethers.HDNodeVoidWallet,
      inherits: "BaseWallet",
      properties: {
        chainCode: { returns: B("string") },
        depth: { returns: B("number") },
        extendedKey: { returns: B("string") },
        fingerprint: { returns: B("string") },
        index: { returns: B("number") },
        parentFingerprint: { returns: B("string") },
        path: { returns: B("_") },
        publicKey: { returns: B("string") },

        deriveChild: Func([ "index" ], H("HDNodeVoidWallet")),
        derivePath: Func([ "path" ], H("HDNodeVoidWallet")),

        hasPath: Func([ ], B("boolean")),
      }
    },
    {
      name: "JsonRpcSigner",
      cls: ethers.JsonRpcSigner,
      inherits: "Signer",
      properties: {
        sendUncheckedTransaction: Func([ "tx" ], B("Promise")),
        unlock: Func([ "password" ], B("Promise"))
      }
    },
    {
      name: "VoidSigner",
      cls: ethers.VoidSigner,
      inherits: "Signer",
      params: [ "address", "%provider" ],
    },
    {
      name: "Wallet",
      cls: ethers.Wallet,
      inherits: "BaseWallet",
      params: [ "privateKey", "%provider" ],
      staticProperties: {
        createRandom: Func([], H("Wallet")),
        fromEncryptedJson: Func([ "json", "password", "%progress" ], B("Promise")),
        fromEncryptedJsonSync: Func([ "json", "password" ], H("Wallet")),
        fromPhrase: Func([ "phrase", "%provider" ], H("Wallet")),
      },
      properties: {
        encrypt: Func([ "password", "%progress" ], B("Promise")),
        encryptSync: Func([ "password" ], B("string")),
      }
    },

    {
      name: "Wordlist",
      cls: ethers.Wordlist,
      properties: {
        locale: { returns: B("string") },

        getWord: Func([ "index" ], B("string")),
        getWordIndex: Func([ "word" ], B("number")),
        join: Func([ "words" ], B("string")),
        split: Func([ "phrase" ], B("Array", B("string"))),
      }
    },
    {
      name: "LangEn",
      cls: ethers.LangEn,
      inherits: "Wordlist"
    },


    {
      func: ethers.decodeBytes32String,
      returns: B("string"),
      params: [ "value" ]
    },
    {
      func: ethers.encodeBytes32String,
      returns: B("string"),
      params: [ "value" ]
    },
    {
      func: ethers.getAddress,
      returns: B("string"),
      params: [ "address" ]
    },
    {
      func: ethers.getCreateAddress,
      returns: B("string"),
      params: [ "tx" ]
    },
    {
      func: ethers.getCreate2Address,
      returns: B("string"),
      params: [ "from", "salt", "initCode" ]
    },
    {
      func: ethers.getIcapAddress,
      returns: B("string"),
      params: [ "address" ]
    },
    {
      func: ethers.isAddress,
      returns: B("boolean"),
      params: [ "value" ]
    },
    {
      func: ethers.isAddressable,
      returns: B("boolean"),
      params: [ "value" ]
    },
    {
      func: ethers.resolveAddress,
      returns: B("string"),
      params: [ "target", "resolver" ]
    },
    {
      func: ethers.computeHmac,
      returns: B("string"),
      params: [ "algorithm", "key", "data" ]
    },
    {
      func: ethers.keccak256,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.pbkdf2,
      returns: B("string"),
      params: [ "password", "salt", "iterations", "keyLength", "algo" ]
    },
    {
      func: ethers.randomBytes,
      returns: B("Uint8Array"),
      params: [ "length" ]
    },
    {
      func: ethers.ripemd160,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.scrypt,
      returns: B("string"),
      params: [ "password", "salt", "N", "r", "p", "keyLength", "%progress" ]
    },
    {
      func: ethers.scryptSync,
      returns: B("string"),
      params: [ "password", "salt", "N", "r", "p", "keyLength" ]
    },
    {
      func: ethers.sha256,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.sha512,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.dnsEncode,
      returns: B("string"),
      params: [ "name" ]
    },
    {
      func: ethers.ensNormalize,
      returns: B("string"),
      params: [ "name" ]
    },
    {
      func: ethers.hashMessage,
      returns: B("string"),
      params: [ "message" ]
    },
    {
      func: ethers.id,
      returns: B("string"),
      params: [ "text" ]
    },
    {
      func: ethers.isValidName,
      returns: B("boolean"),
      params: [ "value" ]
    },
    {
      func: ethers.namehash,
      returns: B("string"),
      params: [ "name" ]
    },
    {
      func: ethers.solidityPacked,
      returns: B("string"),
      params: [ "types", "values" ]
    },
    {
      func: ethers.solidityPackedKeccak256,
      returns: B("string"),
      params: [ "types", "values" ]
    },
    {
      func: ethers.solidityPackedSha256,
      returns: B("string"),
      params: [ "types", "values" ]
    },
    {
      func: ethers.verifyMessage,
      returns: B("string"),
      params: [ "message", "signature" ]
    },
    {
      func: ethers.verifyTypedData,
      returns: B("string"),
      params: [ "domain", "types", "value", "signature" ]
    },
    {
      func: ethers.getDefaultProvider,
      returns: B("_"),
      params: [ "network", "%options" ]
    },
    {
      func: ethers.computeAddress,
      returns: B("string"),
      params: [ "key" ]
    },
    {
      func: ethers.recoverAddress,
      returns: B("string"),
      params: [ "digest", "signature" ]
    },
    {
      func: ethers.concat,
      returns: B("string"),
      params: [ "values" ]
    },
    {
      func: ethers.dataLength,
      returns: B("number"),
      params: [ "data" ]
    },
    {
      func: ethers.dataSlice,
      returns: B("number"),
      params: [ "data", "%start", "%end" ]
    },
    {
      func: ethers.decodeBase58,
      returns: B("bigint"),
      params: [ "value" ]
    },
    {
      func: ethers.decodeBase64,
      returns: B("Uint8Array"),
      params: [ "value" ]
    },
    {
      func: ethers.decodeRlp,
      returns: B("_"),
      params: [ "data" ]
    },
    {
      func: ethers.encodeBase58,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.encodeBase64,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.encodeRlp,
      returns: B("string"),
      params: [ "value" ]
    },
    {
      func: ethers.getBytes,
      returns: B("Uint8Array"),
      params: [ "value", "%name" ]
    },
    {
      func: ethers.getBytesCopy,
      returns: B("Uint8Array"),
      params: [ "value", "%name" ]
    },
    {
      func: ethers.hexlify,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.isBytesLike,
      returns: B("boolean"),
      params: [ "value" ]
    },
    {
      func: ethers.isHexString,
      returns: B("boolean"),
      params: [ "value", "%length" ]
    },
    {
      func: ethers.stripZerosLeft,
      returns: B("string"),
      params: [ "data" ]
    },
    {
      func: ethers.zeroPadBytes,
      returns: B("string"),
      params: [ "data", "length" ]
    },
    {
      func: ethers.zeroPadValue,
      returns: B("string"),
      params: [ "data", "length" ]
    },
    {
      func: ethers.fromTwos,
      returns: B("bigint"),
      params: [ "value", "width" ]
    },
    {
      func: ethers.getBigInt,
      returns: B("bigint"),
      params: [ "value", "%name" ]
    },
    {
      func: ethers.getNumber,
      returns: B("bigint"),
      params: [ "value", "%name" ]
    },
    {
      func: ethers.getUint,
      returns: B("bigint"),
      params: [ "value", "%name" ]
    },
    {
      func: ethers.mask,
      returns: B("bigint"),
      params: [ "value", "bits" ]
    },
    {
      func: ethers.toBeArray,
      returns: B("Uint8Array"),
      params: [ "value" ]
    },
    {
      func: ethers.toBeHex,
      returns: B("string"),
      params: [ "value", "%width" ]
    },
    {
      func: ethers.toBigInt,
      returns: B("bigint"),
      params: [ "value" ]
    },
    {
      func: ethers.toNumber,
      returns: B("number"),
      params: [ "value" ]
    },
    {
      func: ethers.toQuantity,
      returns: B("string"),
      params: [ "value" ]
    },
    {
      func: ethers.toTwos,
      returns: B("bigint"),
      params: [ "value", "width" ]
    },
    {
      func: ethers.toUtf8Bytes,
      returns: B("Uint8Array"),
      params: [ "value", "%form" ]
    },
    {
      func: ethers.toUtf8CodePoints,
      returns: B("Array", B("number")),
      params: [ "value", "%form" ]
    },
    {
      func: ethers.toUtf8String,
      returns: B("string"),
      params: [ "data", "%onError" ]
    },
    {
      func: ethers.formatEther,
      returns: B("string"),
      params: [ "wei" ]
    },
    {
      func: ethers.formatUnits,
      returns: B("string"),
      params: [ "value", "%unit" ]
    },
    {
      func: ethers.parseEther,
      returns: B("bigint"),
      params: [ "ether" ]
    },
    {
      func: ethers.parseUnits,
      returns: B("bigint"),
      params: [ "value", "%unit" ]
    },

    {
      func: ethers.decryptCrowdsaleJson,
      returns: B("_"),
      params: [ "json", "password" ]
    },
    {
      func: ethers.decryptKeystoreJson,
      returns: B("_"),
      params: [ "json", "password", "%proress" ]
    },
    {
      func: ethers.decryptKeystoreJsonSync,
      returns: B("_"),
      params: [ "json", "password" ]
    },
    {
      func: ethers.encryptKeystoreJson,
      returns: B("string"),
      params: [ "account", "password", "%options" ]
    },
    {
      func: ethers.encryptKeystoreJsonSync,
      returns: B("string"),
      params: [ "account", "password", "%options" ]
    },
    {
      func: ethers.getAccountPath,
      returns: B("string"),
      params: [ "account" ]
    },
    {
      func: ethers.getIndexedAccountPath,
      returns: B("string"),
      params: [ "account" ]
    },
    {
      func: ethers.isCrowdsaleJson,
      returns: B("boolean"),
      params: [ "json" ]
    },
    {
      func: ethers.isKeystoreJson,
      returns: B("boolean"),
      params: [ "json" ]
    },
    {
      func: ethers.uuidV4,
      returns: B("string"),
      params: [ "randomBytes" ]
    },

    /*
    {
      name: "Contract",
      cls: ethers.Contract,
      params: [ "address", "abi", "providerOrSigner" ],
      //description: "creates a new Contract meta-class instance",
      //descriptions: [
      //  "the address to onnect to",
      //  "the ABI of the deployed contract",
      //  "the Signer or Provider to connect with"
      //],
      insert: "new Contract(%address, %abi, provider)"
    },
    {
      name: "ContractFactory",
      cls: ethers.ContractFactory,
      params: [ "abi", "bytecode", "signer" ],
      staticProperties: {
        fromSolidity: Func([ "compilerOutput", "signer" ], H("ContractFactory"), ""),
        getInterface: Func([ "interface" ], H("Interface"), ""),
        getContractAddress: Func([ "tx" ], B("string"), ""),
        getContract: Func([ "address", "interface", "signer" ], H("Contract"), ""),
      },
      properties: {
        interface: { returns: H("Interface") },
        bytecode: { returns: B("string") },
        signer: { returns: H("AbstractSigner") },

        getDeployTransaction: Func([], B("_"), ""), // TODO
        deploy: Func([ ], B("Promise", H("Contract")), ""),

        attach: Func([ "address" ], H("Contract"), ""),
        connect: Func([ "signer" ], H("Contract"), ""),
      },
      //description: "creates a new ContractFactory for deploying contracts",
      //returns: "ContractFactory",
      //descriptions: [
      //  "the ABI of the deployed contract",
      //  "the contract initcode",
      //  "the Signer to deploy with"
      //],
      insert: "new ContractFactory(%abi, %bytecode, %signer)"
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
      name: "fetchJson",
      description: "fetch a JSON payload.",
      returns: B("_"),
      params: [ "url", "%body", "%processFunc" ],
      descriptions: [
        "the url to fetch",
        "the payload body to send (default: none)",
        "a function to post-process the result"
      ]
    },
    {
      name: "resolveProperties",
      description: "resolves all properties on an object.",
      returns: B("_"),
      params: [ "object" ],
      paramDescr: [
        "the object whose properties to resolve"
      ]
    },
    {
      name: "FeeData",
      cls: (new DummyClass()),
      properties: {
        gasPrice: { returns: H("BigNumber") },
        maxFeePerGas: { returns: H("BigNumber") },
        maxPriorityFeePerGas: { returns: H("BigNumber") },
      }
    }
    */
  ];

  function getClass(name) {
    if (name == null) { return null; }
    return Help.filter((h) => (h.name === name))[0];
  }

  Help.forEach((descr) => {

    if (descr.cls) {
      if (descr.properties == null) { descr.properties = { }; }
      if (descr.staticProperties == null) { descr.staticProperties = { }; }

      if (descr.inherits) {
        const props = [ Object.assign({ }, descr.properties) ];
        const staticProps = [ Object.assign({ }, descr.staticProperties) ];

        let current = descr.inherits;
        while (current) {
          current = getClass(current);
          if (!current) { throw new Error(`missing super: ${ descr.name }`); }

          props.unshift(current.properties || { });
          staticProps.unshift(current.staticProperties || { });

          current = current.inherits;
        }

        Object.assign(descr.properties, ...props);
        Object.assign(descr.staticProperties, ...staticProps);
      }
    }
  });

  //self._Help = Help;

  return { Basic, Globals, Help, Returns };
};
