Help = function (ethers) {

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
      if (props == null) { throw new Error(`unknown basic type: ${ JSON.stringify(this.type) }`); }
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
    },
    Math: {
      atan2: Func([ "y", "x" ], B("number")),
      random: Func([ ], B("number")),
    },
    Object: {
      assign: { params: [ "target={ }", "source" ], returns: B("_") },
      keys: Func([ "object" ], B("Array")),
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
        toString: Func([ ], B("string"), ""),
        toHexString: Func([ ], B("string"), ""),
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
        getBalance: Func([ "address", "%blockTag" ], B("Promise", H("BigNumber")), ""),
        getBlockNumber: Func([ ], B("Promise", B("number")), ""),
      }
    },
    {
      name: "FallbackProvider",
      cls: ethers.providers.FallbackProvider,
      inherits: "BaseProvider",
      descr: "",
      params: [ "providers", "%options" ],
      staticProperties: {
      },
      properties: {
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
      params: [ "privateKey", "%provider=provider" ],
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
      group: "ethers.utils",
      insert: "utils.",
      populate: (descr) => {
        if (descr.cls == null && !descr.func) {
          const func = ethers.utils[descr.name];
          if (!func) { throw new Error("missing func"); }
          descr.func = func;
        }

        if (!(descr.returns instanceof Returns)) {
          throw new Error(`Bad help: ${ descr.name }`);
        }
      }
    },
    {
      name: "arrayify",
      description: "converts bytes-like values to Uint8Array.",
      returns: B("Uint8Array"),
      params: [ "bytesLike" ],
      descriptions: [
        "the bytes-like value to convert"
      ]
    },
    /*
    {
      name: "base58.decode",
      description: "decodes a Base-58 encoded payload",
      returns: "Uint8Array",
      params: [ "data" ],
      descriptions: [
        "the encoded data to decode"
      ]
    },
    {
      name: "base58.encode",
      description: "encodes a bytes-like using the Base-58 encoding",
      returns: B("string"),
      params: [ "data" ],
      descriptions: [
        "the data to encode"
      ]
    },
    {
      name: "base64.decode",
      description: "decodes a Base-64 encoded payload",
      returns: B("Uint8Array"),
      params: [ "data" ],
      descriptions: [
        "the encoded data to decode"
      ]
    },
    {
      name: "base64.encode",
      description: "encodes a bytes-like using the Base-64 encoding",
      returns: B("string"),
      params: [ "data" ],
      descriptions: [
        "the data to encode"
      ]
    },
    */
    {
      name: "computeAddress",
      description: "compute the address of a public or private key",
      returns: B("string", D("Address")),
      params: [ "key" ],
      descriptions: [
        "the key to compute the address of"
      ]
    },
    {
      name: "computeHmac",
      description: "compute the HMAC of a bytes-like",
      returns: B("Uint8Array"),
      params: [ "algorithm", "key", "data" ],
      descriptions: [
        "the SHA2 algoritm to use",
        "the HMAC key to process with",
        "the data to process"
      ]
    },
    {
      name: "computePublicKey",
      description: "compute the public key of a public or private key",
      returns: B("string", D("Bytes")),
      params: [ "key", "%compressed" ],
      descriptions: [
        "the key to compute the public key of",
        "whether to use the compressed form"
      ]
    },
    {
      name: "concat",
      description: "concatenates multiple bytes-like",
      returns: B("Uint8Array"),
      params: [ "datas" ],
      descriptions: [
        "the array of bytes-like objects"
      ]
    },
    /*
    {
      name: "ConstructorFragment.from",
      description: "creates a new Constructor Fragment",
      returns: "ConstructorFragment",
      params: [ "description" ],
      descriptions: [
        "the human-readable or JSON ABI"
      ]
    },
    {
      name: "defaultAbiCoder",
      description: "the default ABI coder",
      returns: "AbiCoder"
    },
    {
      name: "defaultAbiCoder.decode",
      description: "decode ABI encoded data",
      returns: "Result",
      params: [ "types", "data" ],
      descriptions: [
        "the array of types",
        "the encoded data"
      ]
    },
    {
      name: "defaultAbiCoder.encode",
      description: "encode objects as ABI data",
      returns: B("string", D("Bytes")),
      params: [ "types", "value" ],
      descriptions: [
        "the array of types",
        "the value to encode"
      ]
    },
    */
    /*
    {
      name: "defaultPath",
      description: "the default BIP-44 path for Ethereum",
      returns: B("string")
    },
    */
    {
      name: "entropyToMnemonic",
      description: "converts BIP-39 entropy to its mnemonic",
      returns: B("string"),
      params: [ "entropy", "%wordlist" ],
      descriptions: [
        "the BIP-39 entropy",
        "the wordlist to use"
      ]
    },
    /*
    {
      name: "ErrorFragment.from",
      description: "creates a new Error Fragment",
      returns: "ErrorFragment",
      params: [ "description" ],
      descriptions: [
        "the human-readable or JSON ABI"
      ]
    },
    {
      name: "EventFragment.from",
      description: "creates a new Event Fragment",
      returns: "EventFragment",
      params: [ "description" ],
      descriptions: [
        "the human-readable or JSON ABI"
      ]
    },
    */
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
      name: "formatBytes32String",
      description: "formats a string as a Bytes32 hexdataString.",
      returns: B("string", D("Bytes32")),
      params: [ "text" ],
      descriptions: [
        "the text to convert"
      ]
    },
    /*
    {
      name: "Fragment.from",
      description: "creates a new Fragment",
      returns: "Fragment",
      params: [ "description" ],
      example: 'Fragment.from("function foo(string bar) view returns (uint256)")',
      descriptions: [
        "the human-readable or JSON ABI"
      ]
    },
    {
      name: "FormatTypes.full",
      description: "constant for formatting Fragments as a human-readable ABI",
      returns: B("string"),
    },
    {
      name: "FormatTypes.minimal",
      description: "constant for formatting Fragments as a human-readable ABI with minimal details",
      returns: B("string"),
    },
    {
      name: "FormatTypes.json",
      description: "constant for formatting Fragments as a JSON string",
      returns: B("string"),
    },
    {
      name: "FormatTypes.sighash",
      description: "constant for formatting Fragments as a normalized string to compute selectors",
      returns: B("string"),
    },
    */
    {
      name: "formatEther",
      description: "formats a value as an ether decimal string.",
      returns: B("string"),
      params: [ "value" ],
      descriptions: [
        "the value to format"
      ]
    },
    {
      name: "formatUnits",
      description: "formats a value as a decimal string.",
      returns: B("string"),
      params: [ "value", "%decimals" ],
      descriptions: [
        "the value to format",
        "the number of decimal places"
      ],
      insert: "formatUnits(%value, 18)"
    },
    /*
    {
      name: "FunctionFragment.from",
      description: "creates a new Function Fragment",
      returns: "FunctionFragment",
      params: [ "description" ],
      descriptions: [
        "the human-readable or JSON ABI"
      ]
    },
    */
    {
      name: "getAccountPath",
      description: "computes the BIP-44 HD path for an account",
      returns: B("string"),
      params: [ "index" ],
      descriptions: [
        "the account index to derive for"
      ],
    },
    {
      name: "getAddress",
      description: "verifies and normalizes an address to a check-sum address",
      returns: B("string"),
      params: [ "address" ],
      descriptions: [
        "the address to examine"
      ],
    },
    {
      name: "getContractAddress",
      description: "computes a contract address",
      returns: B("string"),
      params: [ "txData" ],
      descriptions: [
        "an object with a .from address and .nonce"
      ],
    },
    {
      name: "getCreate2Address",
      description: "computes a CREATE2 contract address",
      returns: B("string"),
      params: [ "from", "salt", "initcode" ],
      descriptions: [
        "the from address",
        "the CREATE2 salt",
        "the initcode used to deploy the contract"
      ],
    },
    {
      name: "getIcapAddress",
      description: "verifies and normalizes an address to an ICAP address",
      returns: B("string"),
      params: [ "address" ],
      descriptions: [
        "the address to examine"
      ],
    },
    {
      name: "hashMessage",
      description: "computes the EIP-191 prefixed personal message hash",
      returns: B("string", D("Bytes32")),
      params: [ "message" ],
      descriptions: [
        "the message to hash"
      ]
    },
    /*
    {
      name: "HDNode.fromExtendedKey",
      description: "create a new HDNode from an extended public or private key",
      returns: "HDNode",
      params: [ "extendedKey" ],
      descriptions: [
        "the bytes-like extended key"
      ]
    },
    {
      name: "HDNode.fromMnemonic",
      description: "create a new HDNode from a mnemonic",
      returns: "HDNode",
      params: [ "mnemoinc", "%password", "%wordlist" ],
      descriptions: [
        "the BIP-44 mnemonic",
        'the password to decrypt with (defualt: no password)',
        "the Wordlist or locale to use (default: en)"
      ]
    },
    {
      name: "HDNode.fromSeed",
      description: "create a new HDNode from a seed",
      returns: "HDNode",
      params: [ "seed" ],
      descriptions: [
        "the bytes-like seed"
      ]
    },
    */

    {
      name: "hexConcat",
      description: "concatenates multiple bytes-likes",
      returns: B("string", D("Bytes")),
      params: [ "datas" ],
      paramDescr: [
        "the array of bytes-like objects"
      ]
    },
    {
      name: "hexDataLength",
      description: "computes the length (in bytes) of bytes-like",
      returns: B("number"),
      params: [ "data" ],
      paramDescr: [
        "the data to examine"
      ]
    },
    {
      name: "hexDataSlice",
      description: "slices a bytes-like",
      //func: ethers.utils.hexDataSlice,
      returns: B("string", D("Bytes")),
      params: [ "bytesLike", "start", "%end" ],
      paramDescr: [
        "the data to slice",
        "the start index, in bytes",
        "the end index, in bytes (default: end of data)",
      ]
    },
    {
      name: "hexlify",
      //func: ethers.utils.hexlify,
      descr: "convert a data-like to a hexdatastring",
      returns: B("string", D("Bytes")),
      params: [ "datalike" ],
      paramDescr: [
        "the bytes-like value to convert"
      ]
    },
    {
      name: "hexStripZeros",
      description: "removes all leading zeros from a bytes-like",
      returns: B("string", D("Bytes")),
      params: [ "data" ],
      paramDescr: [
        "the bytes-like object to strip"
      ]
    },
    {
      name: "hexValue",
      description: "encodes a value as a JSON-RPC quantity",
      returns: B("string"),
      params: [ "value" ],
      paramDescr: [
        "the value to encode"
      ]
    },
    {
      name: "hexZeroPad",
      description: "pad a bytes-like with leading zeros",
      returns: B("string", D("Bytes")),
      params: [ "bytesLike", "length" ],
      paramDescr: [
        "the data to pad"
      ]
    },
    {
      name: "id",
      description: "compute the keccak256 hash of a the UTF-8 data of a string.",
      returns: B("string", D("Bytes32")),
      params: [ "text" ],
      paramDescr: [
        "the string to hash to UTF-8 data of"
      ]
    },
    /*
    {
      name: "Interface",
      cls: 
      description: "create a new Interface.",
      returns: H("Interface"),
      params: [ "abi" ],
      paramDescr: [
        "the ABI to use"
      ],
      insert: "new Interface(%abi)"
    },
    */
    {
      name: "isBytes",
      description: "returns true if data is a valid Bytes",
      returns: B("boolean"),
      params: [ "bytesLike" ],
      paramDescr: [
        "the data to examine"
      ]
    },
    {
      name: "isBytesLike",
      description: "returns true if data is a valid BytesLike",
      returns: B("boolean"),
      params: [ "bytesLike" ],
      paramDescr: [
        "the data to examine"
      ]
    },
    {
      name: "isHexString",
      description: "returns true if text is a valid hex string, optionally of some length",
      returns: B("boolean"),
      params: [ "text", "%length" ],
      paramDescr: [
        "the data to examine",
        "the length (in bytes) the string must be"
      ]
    },
    {
      name: "isValidMnemonic",
      description: "determines if a string is a valid BIP-39 mnemonic",
      returns: B("boolean"),
      params: [ "text", "%wordlist" ],
      paramDescr: [
        "the string to check",
        "the wordlist to use"
      ]
    },
    {
      name: "isValidName",
      description: "returns true if name is a valid ENS name",
      returns: B("boolean"),
      params: [ "name" ],
      paramDescr: [
        "the ENS name to examine"
      ]
    },
    {
      name: "joinSignature",
      description: "flattend a Signature",
      returns: B("string", D("65")),
      params: [ "signature" ],
      paramDescr: [
        "any compatible signature data or bytes-like"
      ]
    },
    {
      name: "keccak256",
      description: "compute the keccak256 hash of a bytes-like.",
      returns: B("string", D("Bytes32")),
      params: [ "bytesLike" ],
      paramDescr: [
        "the bytes-like to hash"
      ]
    },
    {
      name: "mnemonicToEntropy",
      description: "convert a BIP-39 mnemonic to its entropy",
      returns: B("string"),
      params: [ "mnemonic", "%wordlist" ],
      paramDescr: [
        "the BIP-39 mnemonic phrase",
        "the wordlist to use"
      ]
    },
    {
      name: "mnemonicToSeed",
      description: "compute the BIP-39 seed from a mnemonic",
      returns: B("string", D("Bytes")),
      params: [ "mnemonic", "%password" ],
      paramDescr: [
        "the BIP-39 mnemonic phrase",
        'the password to use (default: "")'
      ]
    },
    {
      name: "namehash",
      description: "computes the namehash of an ENS name",
      returns: B("string", D("Bytes32")),
      params: [ "name" ],
      paramDescr: [
        "the ENS name to hash"
      ]
    },
    /*
    {
      name: "ParamType.from",
      description: "creates a new ParamType",
      returns: "ParamType",
      params: [ "description" ],
      paramDescr: [
        "the human-readable or JSON ABI"
      ]
    },
    */
    {
      name: "parseBytes32String",
      description: "parses a Bytes32 string into a normal string.",
      returns: B("string"),
      params: [ "data" ],
      paramDescr: [
        "the Bytes32 data to convert"
      ]
    },
    {
      name: "parseEther",
      description: "parses a decimal ether string into a BigNumber.",
      returns: H("BigNumber"),
      params: [ "text" ],
      paramDescr: [
        "the ether string to parse"
      ]
    },
    {
      name: "parseUnits",
      description: "parses a decimal string into a BigNumber.",
      returns: H("BigNumber"),
      params: [ "text", "%decimals" ],
      paramDescr: [
        "the text to parse as a decimal",
        "the number of decimal places (default: 18)"
      ],
      insert: "parseUnits(%text, 18)"
    },
    /*
    {
      name: "parseTransaction",
      description: "parses an encoded transaction into a transaction.",
      returns: "object<Transaction>",
      params: [ "encodedTx" ],
      paramDescr: [
        "the encoded transaction bytes-like"
      ]
    },
    */
    {
      name: "randomBytes",
      description: "creates an array of cryptographically secure random bytes.",
      returns: B("Uint8Array"),
      params: [ "length" ],
      paramDescr: [
        "the length of bytes to return"
      ]
    },
    {
      name: "recoverAddress",
      description: "computes the address of a signed message digest",
      returns: B("string", D("Address")),
      params: [ "digest", "signature" ],
      paramDescr: [
        "the digest of a signed message",
        "the signature of signed message"
      ]
    },
    {
      name: "recoverPublicKey",
      description: "computes the public key of a signed message digest",
      returns: B("string", D("65")),
      params: [ "digest", "signature" ],
      paramDescr: [
        "the digest of a signed message",
        "the signature of signed message"
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
      name: "ripemd160",
      description: "compute the RIPEMD-160 hash of a bytes-like.",
      returns: B("string", D("Bytes20")),
      params: [ "bytesLike" ],
      paramDescr: [
        "the bytes-like to hash"
      ]
    },
    /*
    {
      name: "RLP.decode",
      description: "decodes an RLP encoded payload",
      returns: B("object"),
      params: [ "data" ],
      paramDescr: [
        "the encoded data to decode"
      ]
    },
    {
      name: "RLP.encode",
      description: "encodes a (possibly nested) object using RLP encoding",
      returns: B("string", D("Bytes")),
      params: [ "object" ],
      paramDescr: [
        "the object to encode"
      ]
    },
    */
    {
      name: "serializeTransaction",
      description: "serialize a transaction.",
      returns: B("string", D("Bytes")),
      params: [ "transaction", "%signature" ],
      paramDescr: [
        "the transaction properties",
        "the transaction signature; if omitted an unsigned transaction pre-image is returned"
      ]
    },
    {
      name: "sha256",
      description: "compute the SHA2-256 hash of a bytes-like.",
      returns: B("string", D("Bytes32")),
      params: [ "bytesLike" ],
      paramDescr: [
        "the bytes-like to hash"
      ]
    },
    {
      name: "sha512",
      description: "compute the SHA2-512 hash of a bytes-like.",
      returns: B("string", D("Bytes64")),
      params: [ "bytesLike" ],
      paramDescr: [
        "the bytes-like to hash"
      ]
    },
    /*
    {
      name: "SigningKey",
      description: "create a new SigningKey",
      returns: "SigningKey",
      params: [ "privateKey" ],
      paramDescr: [
        "the private key to sign with"
      ],
      insert: "new SigningKey(%privateKey)"
    },
    */
    {
      name: "solidityKeccak256",
      description: "compute the Solidity keccak256 hash of the non-standard packed bytes for values of given types.",
      returns: B("string", D("Bytes32")),
      params: [ "types", "values" ],
      paramDescr: [
        "an array of types (as strings)",
        "an array of values, each compatible with its corresponding type",
      ]
    },
    {
      name: "solidityPack",
      description: "compute the Solidity non-standard packed bytes for values of given types.",
      returns: B("string", D("Bytes")),
      params: [ "types", "values" ],
      paramDescr: [
        "an array of types (as strings)",
        "an array of values, each compatible with its corresponding type",
      ]
    },
    {
      name: "soliditySha256",
      description: "compute the Solidity SHA2-256 hash of the non-standard packed bytes for values of given types.",
      returns: B("string", D("Bytes32")),
      params: [ "types", "values" ],
      paramDescr: [
        "an array of types (as strings)",
        "an array of values, each compatible with its corresponding type",
      ]
    },
    {
      name: "splitSignature",
      description: "expands a Signature into all its components",
      returns: B("_", D("Signature>")),
      params: [ "signature" ],
      paramDescr: [
        "any compatible signature data or bytes-like"
      ]
    },
    {
      name: "stripZeros",
      description: "removes all leading zeros from a bytes-like",
      returns: B("Uint8Array"),
      params: [ "data" ],
      paramDescr: [
        "the bytes-like object to strip"
      ]
    },
    /*
    {
      name: "SupportedAlgorithm.sha256",
      description: "the HMAC constant for SHA2-256",
      returns: B("string"),
    },
    {
      name: "SupportedAlgorithm.sha512",
      description: "the HMAC constant for SHA2-512",
      returns: B("string"),
    },
    */
    {
      name: "toUtf8Bytes",
      description: "converts a string to its UTF-8 bytes.",
      returns: B("Uint8Array"),
      params: [ "text" ],
      paramDescr: [
        "the string to convert"
      ]
    },
    {
      name: "toUtf8CodePoints",
      description: "converts a string to its UTF-8 code-points; each code-point is a single visible character.",
      returns: B("Array", D("number")),
      params: [ "text" ],
      paramDescr: [
        "the string to convert"
      ]
    },
    {
      name: "toUtf8String",
      description: "converts UTF-8 bytes to a string.",
      returns: B("string"),
      params: [ "utf8Data" ],
      paramDescr: [
        "the UTF-8 data to convert"
      ]
    },
    {
      name: "verifyMessage",
      description: "computes the address of a signed message",
      returns: B("string", D("Address")),
      params: [ "message", "signature" ],
      paramDescr: [
        "the message that was signed",
        "the signature of the signed message"
      ]
    },
    {
      name: "zeroPad",
      description: "pad a bytes-like with leading zeros",
      returns: B("Uint8Array"),
      params: [ "bytesLike", "length" ],
      paramDescr: [
        "the data to pad"
      ]
    },

  ];

  function getClass(name) {
    return Help.filter((h) => (h.name === name))[0];
  }

  let lastGroup = null;
  Help.forEach((descr) => {
    if (descr.group) {
      lastGroup = descr;
      return;
    }

    if (descr.cls) {
      if (descr.properties == null) { descr.properties = { }; }
      if (descr.staticProperties == null) { descr.staticProperties = { }; }

      if (descr.inherits) {
        let current = getClass(descr.inherits);
        while (current) {
          Object.assign(descr.properties, current.properties || { });
          current = current.inherits;
        }
      }
    }

    if (lastGroup && lastGroup.populate) {
      console.log("populating", descr);
      lastGroup.populate(descr);
    }
  });

  return { Basic, Globals, Help, Returns };
};


/*
  {
    group: "ethers"
  },
  {
    name: "BigNumber.from",
    description: "creates a new BigNumber",
    returns: H("BigNumber"),
    params: [ "value" ],
    descriptions: [
      "the value of the BigNumber as any compatible type"
    ]
  },
  {
    name: "Contract",
    description: "creates a new Contract meta-class instance",
    returns: "Contract",
    params: [ "address", "abi", "providerOrSigner" ],
    descriptions: [
      "the address to onnect to",
      "the ABI of the deployed contract",
      "the Signer or Provider to connect with"
    ],
    insert: "new Contract(%address, %abi, provider)"
  },
  {
    name: "ContractFactory",
    description: "creates a new ContractFactory for deploying contracts",
    returns: "ContractFactory",
    params: [ "abi", "bytecode", "signer" ],
    descriptions: [
      "the ABI of the deployed contract",
      "the contract initcode",
      "the Signer to deploy with"
    ],
    insert: "new ContractFactory(%abi, %bytecode, %signer)"
  },
  {
    name: "FixedNumber.from",
    description: "creates a new FixedNumber for decimal maths",
    returns: "FixedNumber",
    params: [ "value", "%format" ],
    descriptions: [
      "the value as any compatible type",
      "the internal format to enforce (default: fixed128x18)"
    ],
    insert: 'FixedNumber.from(%value, "fixed128x18")'
  },
  {
    name: "getDefaultProvider",
    description: "creates a Provider with a default configuration",
    returns: "Provider",
    params: [ "%network", "%config" ],
    descriptions: [
      "the network to connect to or a URL",
      "configuration to use depending on the network"
    ],
    insert: "ethers.getDefaultProvider(%network)"
  },
  {
    name: "VoidSigner",
    description: "create a read-only Signer",
    returns: "VoidSigner",
    params: [ "address" ],
    descriptions: [
      "the address to mock as the from address"
    ],
    insert: "new VoidSigner(%address)"
  },
  {
    name: "Wallet",
    description: "creates an new Wallet from a private key.",
    returns: "Wallet",
    params: [ "privateKey", "%provider" ],
    descriptions: [
      "a 32 byte private key",
      "a provider to connect to"
    ],
    insert: "new Wallet(%privateKey, provider)"
  },
  {
    name: "Wallet.createRandom",
    description: "creates an new random Wallet.",
    returns: "Wallet",
    params: [ ]
  },
  {
    name: "Wallet.fromMnemonic",
    description: "creates an new Wallet from a mnemonic.",
    returns: "Wallet",
    params: [ "mnemonic", "%path", "%wordlist" ],
    descriptions: [
      "a mnemonic backup phrase; 12 - 24 words",
      `the HD path to derive (default: ${ JSON.stringify(ethers.utils.defaultPath) })`,
      "the Wordlist or locale string to use (default: \"en\")"
    ],
    insert: `Wallet.fromMnemonic(%mnemonic, "${ ethers.utils.defaultPath }", "en")`
  },
  {
    group: "ethers.constants",
    insert: "constants"
  },
  {
    name: "AddressZero",
    description: "The zero address",
    returns: B("string"),
  },
  {
    name: "EtherSymbol",
    description: "The ether symbol as a string",
    returns: B("string"),
  },
  {
    name: "HashZero",
    description: "The zero hash",
    returns: B("string"),
  },
  {
    name: "MaxInt256",
    description: "BigNumber for maximum int256",
    returns: H("BigNumber")
  },
  {
    name: "MinInt256",
    description: "BigNumber for minimum int256",
    returns: H("BigNumber")
  },
  {
    name: "MaxUint256",
    description: "BigNumber for maximum uint256",
    returns: H("BigNumber")
  },
  {
    name: "NegativeOne",
    description: "BigNumber for -1",
    returns: H("BigNumber")
  },
  {
    name: "One",
    description: "BigNumber for 1",
    returns: H("BigNumber")
  },
  {
    name: "Two",
    description: "BigNumber for 2",
    returns: H("BigNumber")
  },
  {
    name: "WeiPerEther",
    description: "BigNumber for 10 ** 18",
    returns: H("BigNumber")
  },
  {
    name: "Zero",
    description: "BigNumber for 0",
    returns: H("BigNumber")
  },

  {
    group: "ethers.providers",
    insert: "providers"
  },
  {
    name: "AlchemyProvider",
    description: "create a Provider connected to the Alchemy service",
    returns: "AlchemyProvider",
    params: [ "%network", "%apiKey" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service API key (default: a highly throttled shared key)"
    ],
    insert: "new AlchemyProvider(%network)"
  },
  {
    name: "AlchemyProvider.getWebSocketProvider",
    description: "create a Provider connected to the Alchemy WebSocket service",
    params: [ "%network", "%apiKey" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service API key (default: a highly throttled shared key)"
    ]
  },
  {
    name: "CloudflareProvider",
    description: "create a Provider connected to the Cloudflare service",
    returns: "CloudflareProvider",
    params: [ ],
    descriptions: [ ],
    insert: "new CloudflareProvider()"
  },
  {
    name: "EtherscanProvider",
    description: "create a Provider connected to the Etherscan service",
    returns: "EtherscanProvider",
    params: [ "%network", "%apiKey" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service API key (default: a highly throttled shared key)"
    ],
    insert: "new EtherscanProvider(%network)"
  },
  {
    name: "FallbackProvider",
    description: "create a Fallback Provider for handling multiple providers",
    returns: "FallbackProvider",
    params: [ "providers", "%quorum" ],
    descriptions: [
      "an array of Providers or ProviderConfigs",
      "the total weight that providers must agree (default: totalWeight / 2)"
    ],
    insert: "new FallbackProvider(%providers)"
  },
  {
    name: "getNetwork",
    description: "normalize and expand a network object or name",
    returns: "object<Network>",
    params: [ "network" ],
    descriptions: [
      "the netwowk to normalize"
    ]
  },
  {
    name: "InfuraProvider",
    description: "create a Provider connected to the INFURA service",
    returns: "InfuraProvider",
    params: [ "%network", "%projectId" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service Project ID or ProjectID and Project Secret keys (default: a highly throttled shared key)"
    ],
    insert: "new InfuraProvider(%network)"
  },
  {
    name: "InfuraProvider.getWebSocketProvider",
    description: "create a Provider connected to the INFURA WebSocket service",
    params: [ "%network", "%projectId" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service Project ID or ProjectID and Project Secret keys (default: a highly throttled shared key)"
    ]
  },
  {
    name: "JsonRpcProvider",
    description: "create a Provider connected to a JSON-RPC URL",
    returns: "JsonRpcProvider",
    params: [ "%url", "%network" ],
    warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
    descriptions: [
      "the URL to connect to (default: http:/\/127.0.0.1:8545)",
      "the netwowk to connect to (default: auto-detect via eth_chainId)",
    ],
    insert: "new JsonRpcProvider(%url)"
  },
  {
    name: "JsonRpcBatchProvider",
    description: "create a Provider connected to a JSON-RPC URL which batches requests",
    returns: "JsonRpcBatchProvider",
    params: [ "%url", "%network" ],
    warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
    descriptions: [
      "the URL to connect to (default: http:/\/127.0.0.1:8545)",
      "the netwowk to connect to (default: auto-detect via eth_chainId)",
    ],
    insert: "new JsonRpcBatchProvider(%url)"
  },
  {
    name: "PocketProvider",
    description: "create a Provider connected to the Pocket service",
    returns: "PocketProvider",
    params: [ "%network", "%apiKey" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service API key or configuration (default: a highly throttled shared key)"
    ],
    insert: "new PocketProvider(%network)"
  },
  {
    name: "StaticJsonRpcProvider",
    description: "create a Provider connected to a JSON-RPC URL which cannot change its chain ID",
    returns: "StaticJsonRpcProvider",
    params: [ "%url", "%network" ],
    warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
    descriptions: [
      "the URL to connect to (default: http:/\/127.0.0.1:8545)",
      "the netwowk to connect to (default: auto-detect via eth_chainId)",
    ],
    insert: "new StaticJsonRpcProvider(%url)"
  },
  {
    name: "Web3Provider",
    description: "create a Provider backed by an EIP-1193 source or legacy Web3.js provider",
    returns: "Web3Provider",
    params: [ "provider", "%network" ],
    descriptions: [
      "the existing source to connect via",
      "the netwowk to connect to (default: auto-detect via eth_chainId)",
    ],
    insert: "new Web3Provider(%source)"
  },
  {
    name: "WebSocketProvider",
    description: "create a Provider connected to JSON-RPC web socket URL",
    returns: "WebSocketProvider",
    params: [ "url", "%network" ],
    warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
    descriptions: [
      "the web socket URL to connect to",
      "the netwowk to connect to (default: auto-detect via eth_chainId)"
    ],
    insert: "new WebSocketProvider(%url)"
  },

  {
    group: "ethers.utils",
    insert: "utils"
  },
*/
