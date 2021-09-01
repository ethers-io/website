Help = function (ethers) {
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
      name: "VoidSigner",
      cls: ethers.VoidSigner,
      inherits: "AbstractSigner",
      params: [ "address" ],
      properties: {
        address: { returns: B("string") },
        connect: Func([ "provider" ], H("VoidSigner"), ""),
      },
      //description: "create a read-only Signer",
      //descriptions: [
      //  "the address to mock as the from address"
      //],
      insert: "new VoidSigner(%address)"
    },
    {
      name: "Wallet",
      cls: ethers.Wallet,
      inherits: "AbstractSigner",
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
          //descriptions: [
          //  "a mnemonic backup phrase; 12 - 24 words",
          //  `the HD path to derive (default: ${ JSON.stringify(ethers.utils.defaultPath) })`,
          //  "the Wordlist or locale string to use (default: \"en\")"
          //],
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
      group: "ethers.providers",
      insert: "providers"
    },
    {
      name: "BaseProvider",
      cls: ethers.providers.BaseProvider,
      inherits: "AbstractProvider",
      properties: {
        formatter: { returns: B("_") }, // @TODO
        network: { returns: H("Network") },
        anyNetwork: { returns: B("boolean") },

        polling: { returns: B("boolean") },
        pollingInterval: { returns: B("number") },

        ready: { returns: B("Promise", H("Network")) },
        poll: Func([ ], B("Promise", B("_")), ""),
        perform: Func([ "method", "params" ], B("Promise", B("_")), ""),

        getNetwork: Func([ ], B("Promise", H("Network")), ""),

        getEtherPrice: Func([ ], B("Promise", B("number")), ""),

        getResolver: Func([ "name" ], B("Promise", H("Resolver")), ""),
      },
    },
    {
      name: "AlchemyProvider",
      cls: ethers.providers.AlchemyProvider,
      inherits: "StaticJsonRpcProvider",
      description: "create a Provider connected to the Alchemy service",
      params: [ "%network", "%apiKey" ],
      properties: {
        apiKey: { returns: B("string") },
      },
      staticProperties: {
        getWebSocketProvider: Func([ "%network", "%apiKey" ], H("AlchemyProvider"), ""),
        //description: "create a Provider connected to the Alchemy WebSocket service",
        //descriptions: [
        //  "the netwowk to connect to (default: homestead)",
        //  "the service API key (default: a highly throttled shared key)"
        //]
      },
      descriptions: [
        "the netwowk to connect to (default: homestead)",
        "the service API key (default: a highly throttled shared key)"
      ],
      insert: "new AlchemyProvider(%network)"
    },
    {
      name: "CloudflareProvider",
      cls: ethers.providers.CloudflareProvider,
      inherits: "StaticJsonRpcProvider",
      params: [ ],
      //description: "create a Provider connected to the Cloudflare service",
      //descriptions: [ ],
      insert: "new CloudflareProvider()"
    },
    {
      name: "EtherscanProvider",
      cls: ethers.providers.EtherscanProvider,
      inherits: "StaticJsonRpcProvider",
      properties: {
        apiKey: { returns: B("string") },
      },
      params: [ "%network", "%apiKey" ],
      //description: "create a Provider connected to the Etherscan service",
      //descriptions: [
      //  "the netwowk to connect to (default: homestead)",
      //  "the service API key (default: a highly throttled shared key)"
      //],
      insert: "new EtherscanProvider(%network)"
    },
    {
      name: "FallbackProvider",
      cls: ethers.providers.FallbackProvider,
      inherits: "BaseProvider",
      properties: {
        providerConfigs: { returns: B("Array", B("_")) },
        quorum: { returns: B("number") },
      },
      params: [ "providers", "%quorum" ],
      //description: "create a Fallback Provider for handling multiple providers",
      //descriptions: [
      //  "an array of Providers or ProviderConfigs",
      //  "the total weight that providers must agree (default: totalWeight / 2)"
      //],
      insert: "new FallbackProvider(%providers)"
    },
    {
      name: "getDefaultProvider",
      func: ethers.providers.getDefaultProvider,
      returns: H("BaseProvider"),
      params: [ "%network", "%config" ],
      //description: "creates a Provider with a default configuration",
      descriptions: [
        "the network to connect to or a URL",
        "configuration to use depending on the network"
      ],
      insert: "ethers.getDefaultProvider(%network)"
    },
    {
      name: "getNetwork",
      func: ethers.providers.getNetwork,
      returns: H("Network"),
      params: [ "network" ],
      //description: "normalize and expand a network object or name",
      //descriptions: [
      //  "the netwowk to normalize"
      //]
    },
    {
      name: "InfuraProvider",
      cls: ethers.providers.InfuraProvider,
      inherits: "StaticJsonRpcProvider",
      properties: {
        apiKey: { returns: B("string") },
        projectId: { returns: B("string") },
        projectSecret: { returns: B("string") },
      },
      staticProperties: {
        getWebSocketProvider: Func([ "%network", "%projectId" ], H("InfuraProvider"), ""),
      },
      description: "create a Provider connected to the INFURA service",
      params: [ "%network", "%projectId" ],
      //descriptions: [
      //  "the netwowk to connect to (default: homestead)",
      //  "the service Project ID or ProjectID and Project Secret keys (default: a highly throttled shared key)"
      //],
      insert: "new InfuraProvider(%network)"
    },
    {
      name: "JsonRpcSigner",
      cls: ethers.providers.JsonRpcSigner,
      inherits: "AbstractSigner",
      properties: {
        provider: { returns: H("JsonRpcProvider") },
        unlock: Func([ "password" ], B("Promise", B("boolean")), ""),
      }
    },
    {
      name: "JsonRpcProvider",
      cls: ethers.providers.JsonRpcProvider,
      inherits: "BaseProvider",
      staticProperties: {
        hexlifyTransaction: Func([ "tx", "%extra" ], B("_"), ""),
      },
      properties: {
        send: Func([ "method", "params" ], B("_"), ""),
        prepareRequest: Func([ "method", "params" ], B("_"), ""),

        getSigner: Func([ "index" ], H("JsonRpcSigner"), ""),
        //getUncheckedSigner: 
        listAccounts: Func([], B("Array", B("string")), ""),
      },
      params: [ "%url", "%network" ],
      //description: "create a Provider connected to a JSON-RPC URL",
      //warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
      //descriptions: [
      //  "the URL to connect to (default: http:/\/127.0.0.1:8545)",
      //  "the netwowk to connect to (default: auto-detect via eth_chainId)",
      //],
      insert: "new JsonRpcProvider(%url)"
    },
    {
      name: "JsonRpcBatchProvider",
      cls: ethers.providers.JsonRpcBatchProvider,
      inherits: "JsonRpcProvider",
      params: [ "%url", "%network" ],
      //description: "create a Provider connected to a JSON-RPC URL which batches requests",
      //warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
      //descriptions: [
      //  "the URL to connect to (default: http:/\/127.0.0.1:8545)",
      //  "the netwowk to connect to (default: auto-detect via eth_chainId)",
      //],
      insert: "new JsonRpcBatchProvider(%url)"
    },
    {
      name: "PocketProvider",
      cls: ethers.providers.PocketProvider,
      inherits: "StaticJsonRpcProvider",
      properties: {
        apiKey: { returns: B("string") },
      },
      params: [ "%network", "%apiKey" ],
      //description: "create a Provider connected to the Pocket service",
      //descriptions: [
      //  "the netwowk to connect to (default: homestead)",
      //  "the service API key or configuration (default: a highly throttled shared key)"
      //],
      insert: "new PocketProvider(%network)"
    },
    {
      name: "StaticJsonRpcProvider",
      cls: ethers.providers.StaticJsonRpcProvider,
      inherits: "JsonRpcProvider",
      params: [ "%url", "%network" ],
      //description: "create a Provider connected to a JSON-RPC URL which cannot change its chain ID",
      //warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
      //descriptions: [
      //  "the URL to connect to (default: http:/\/127.0.0.1:8545)",
      //  "the netwowk to connect to (default: auto-detect via eth_chainId)",
      //],
      insert: "new StaticJsonRpcProvider(%url)"
    },
    {
      name: "Web3Provider",
      cls: ethers.providers.Web3Provider,
      inherits: "JsonRpcProvider",
      params: [ "provider", "%network" ],
      //description: "create a Provider backed by an EIP-1193 source or legacy Web3.js provider",
      //descriptions: [
      //  "the existing source to connect via",
      //  "the netwowk to connect to (default: auto-detect via eth_chainId)",
      //],
      insert: "new Web3Provider(%source)"
    },
    {
      name: "WebSocketProvider",
      cls: ethers.providers.WebSocketProvider,
      inherits: "JsonRpcProvider",
      params: [ "url", "%network" ],
      //description: "create a Provider connected to JSON-RPC web socket URL",
      warnings: "Secure Websites (such as this) cannot connect to insecure localhost",
      //descriptions: [
      //  "the web socket URL to connect to",
      //  "the netwowk to connect to (default: auto-detect via eth_chainId)"
      //],
      insert: "new WebSocketProvider(%url)"
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

        if (descr.func && !(descr.returns instanceof Returns)) {
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
      _name: "base58.decode",
      name: "decode",
      func: ethers.utils.base58.decode,
      description: "decodes a Base-58 encoded payload",
      returns: B("Uint8Array"),
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
      name: "ConstructorFragment",
      cls: ethers.utils.ConstructorFragment,
      description: "creates a new Constructor Fragment",
      staticProperties: {
        from: Func([ "signature" ], H("ConstructorFragment"), "returns a new ContracutroFragment"),
      },
      properties: {
        name: { returns: B("string") },
        type: { returns: B("string") },
        stateMutability: { returns: B("string") },
        payable: { returns: B("boolean") },
      },
      returns: H("ConstructorFragment"),
      params: [ "description" ],
      descriptions: [
        "the human-readable or JSON ABI"
      ]
    },
    */
    {
      name: "AbiCoder",
      cls: ethers.utils.AbiCoder,
      description: "",
      properties: {
        decode: Func([ "types", "data" ], B("_"), "decode values"),
        encode: Func([ "types", "values" ], B("string"), "encode values"),
      },
      staticProperties: {
      }
    },
    {
      name: "defaultAbiCoder",
      description: "the default ABI coder",
      returns: H("AbiCoder"),
    },
    /*
    {
      _name: "defaultAbiCoder.decode",
      name: "decode",
      insert: "decode()",
      cls: ethers.utils.defaultAbiCoder,
      description: "decode ABI encoded data",
      returns: B("_"),
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
    {
      name: "defaultPath",
      description: "the default BIP-44 path for Ethereum",
      returns: B("string")
    },
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
    {
      name: "HDNode",
      cls: ethers.utils.HDNode,
      description: "",
      staticProperties: {
        fromExtendedKey: Func([ "extendedKey" ], H("HDNode"), "create a new HDNode from an extended public or private key"),
        //descriptions: [
        //  "the bytes-like extended key"
        //]
        fromMnemonic: Func([ "mnemoinc", "%password", "%wordlist" ], H("HDNode"), "create a new HDNode from a mnemonic"),
        //descriptions: [
        //  "the BIP-44 mnemonic",
        //  'the password to decrypt with (defualt: no password)',
        //  "the Wordlist or locale to use (default: en)"
        //]
        fromSeed: Func([ "seed" ], H("HDNode"), "create a new HDNode from a seed"),
        //descriptions: [
        //  "the bytes-like seed"
        //]
      },
      properties: {
        privateKey: { returns: B("string") },
        publicKey: { returns: B("string") },

        fingerprint: { returns: B("string") },
        parentFingerprint: { returns: B("string") },

        address: { returns: B("string") },

        mnemonic: { returns: B("string") },
        path: { returns: B("string") },

        chainCode: { returns: B("string") },

        index: { returns: B("number") },
        depth: { returns: B("number") },

        extendedKey: { returns: B("string") },

        neuter: Func([], H("HDNode"), ""),
        derivePath: Func([ "path" ], H("HDNode"), ""),
      }
    },
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
    {
      name: "Interface",
      cls: ethers.utils.Interface,
      description: "create a new Interface.",
      staticProperties: {
        isInterface: Func([ "value" ], B("boolean"), ""),
      },
      properties: {
        //fragments: { returns: B("array", B("_")) }, // @TODO: B("Fragment")
        format: Func([ '%format="full"' ], B("string"), ""),
        //getFunction: Func([ "name" ], B("_"), ""), // @TOOD: _ => Fragment

        decodeErrorResult: Func([ "fragment", "data"], B("_"), ""),
        encodeErrorResult: Func([ "fragment", "values" ], B("string"), ""),

        decodeFunctionData: Func([ "fragment", "data"], B("_"), ""),
        encodeFunctionData: Func([ "fragment", "values" ], B("string"), ""),

        decodeFunctionResult: Func([ "fragment", "data"], B("_"), ""),
        encodeFunctionResult: Func([ "fragment", "values" ], B("string"), ""),

        encodeFilterTopics: Func([ "fragment", "values" ], B("Array", B("_")), ""),

        encodeEventLog: Func([ "fragment", "values" ], B("_"), ""),
        decodeEventLog: Func([ "fragment", "data", "topics" ], B("_"), ""),

        parseTransaction: Func([ "tx" ], B("_"), ""),
        parseLog: Func([ "log", "data" ], B("_"), ""),
        parseError: Func([ "data" ], B("_"), ""),
      },
      params: [ "abi" ],
      paramDescr: [
        "the ABI to use"
      ],
      insert: "new Interface(%abi)"
    },
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
    {
      name: "parseTransaction",
      description: "parses an encoded transaction into a transaction.",
      returns: B("_"),
      params: [ "encodedTx" ],
      paramDescr: [
        "the encoded transaction bytes-like"
      ]
    },
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
    {
      name: "SigningKey",
      cls: ethers.utils.SigningKey,
      description: "create a new SigningKey",
      params: [ "privateKey" ],
      staticProperties: {
        isSigningKey: Func([ "value" ], B("boolean"), ""),
      },
      properties: {
        curve: { returns: B("string") },

        privateKey: { returns: B("string") },
        publicKey: { returns: B("string") },
        compressedPublicKey: { returns: B("string") },

        signDigest: Func([ "digest" ], H("Signature"), ""),
        computeSharedSecret: Func([ "otherKey" ], B("string"), ""),
      },
      paramDescr: [
        "the private key to sign with"
      ],
      insert: "new SigningKey(%privateKey)"
    },
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

    {
      group: "hidden"
    },
    {
      name: "AbstractSigner",
      cls: (new DummyClass()),
      staticProperties: {
        isSigner: Func([ "value" ], B("boolean"), "")
      },
      properties: {
        provider: { returns: H("BaseProvider") },

        getAddress: Func([], B("Promise", B("string")), ""),
        signMessage: Func([ "message" ], B("Promise", B("string")), ""),
        signTransaction: Func([ "tx" ], B("Promise", B("string")), ""),

        connect: Func([ "provider" ], H("AbstractSigner"), ""),

        getBalance: Func([ "%blockTag" ], B("Promise", H("BigNumber")), ""),
        getTransactionCount: Func([ "%blockTag" ], B("Promise", B("number")), ""),
        estimateGas: Func([ "tx", "%blockTag" ], B("Promise", H("BigNumber")), ""),
        call: Func([ "tx", "%blockTag" ], B("Promise", B("string")), ""),

        sendTransaction: Func([ "tx" ], B("Promise", B("_")), ""), // @TODO
        getChainId: Func([ ], B("Promise", B("number")), ""),

        getGasPrice: Func([ ], B("Promise", H("BigNumber")), ""),
        getFeeData: Func([ ], B("Promise", H("FeeData")), ""),

        resolveName: Func([ "name" ], B("Promise", B("string")), ""),

        checkTransaction: Func([ "tx" ], B("_"), ""),
        populateTransaction: Func([ "tx" ], B("Promise", B("_")), ""),
      }
    },
    {
      name: "AbstractProvider",
      cls: ethers.providers.BaseProvider,
      descr: "provider",
      params: [ "network" ],
      staticProperties: {
        isProvider: Func([ "value" ], B("boolean"), ""),
      },
      properties: {
        getNetwork: Func([ ], B("Promise", H("Network")), ""),

        getBlockNumber: Func([ ], B("Promise", B("number")), ""),
        getGasPrice: Func([ ], B("Promise", H("BigNumber")), ""),
        getFeeData: Func([ ], B("Promise", H("FeeData")), ""),

        g: Func([ ], B("Promise", H("BigNumber")), ""),

        getBalance: Func([ "address", "%blockTag" ], B("Promise", H("BigNumber")), ""),
        getTransactionCount: Func([ "address", "%blockTag" ], B("Promise", H("number")), ""),
        getCode: Func([ "address", "%blockTag" ], B("Promise", H("string")), ""),
        getStorageAt: Func([ "address", "position", "%blockTag" ], B("Promise", H("string")), ""),

        sendTransaction: Func([ "tx" ], B("Promise", B("_")), ""), //TODO
        call: Func([ "tx", "%blockTag" ], B("Promise", B("string")), ""),
        estimateGas: Func([ "tx" ], B("Promise", H("BigNumber")), ""),

        getBlock: Func([ "blockTag" ], B("Promise", B("_")), ""), // @TODO
        getBlockWithTransactions: Func([ "blockTag" ], B("Promise", B("_")), ""), // @TODO
        getTransaction: Func([ "hash" ], B("Promise", B("_")), ""), // @TODO
        getTransactionReceipt: Func([ "hash" ], B("Promise", B("_")), ""), // @TODO

        getLogs: Func([ "filter" ], B("Promise", B("_")), ""), // @TODO

        resolveName: Func([ "name" ], B("Promise", B("string")), ""),
        lookupAddress: Func([ "address" ], B("Promise", B("string")), ""),

        on: Func([ "eventName", "listener" ], H("BaseProvider"), ""),
        once: Func([ "eventName", "listener" ], H("BaseProvider"), ""),
        emit: Func([ "eventName" ], B("boolean"), ""),
        listenerCount: Func([ "eventName" ], B("number"), ""),
        listeners: Func([ "eventName" ], B("Array", B("_")), ""),
        off: Func([ "eventName", "listener" ], H("BaseProvider"), ""),
        removedAllListeners: Func([ "eventName" ], H("BaseProvider"), ""),

        addListener: Func([ "eventName", "listener" ], H("BaseProvider"), ""),
        removeListener: Func([ "eventName", "listener" ], H("BaseProvider"), ""),

        waitForTransaction: Func([ "hash", "%confirms", "%timeout" ], B("Promise", B("_")), ""), // @TODO
      }
    },
    {
      name: "Network",
      cls: (new DummyClass()),
      properties: {
        name: { returns: B("string") },
        chainId: { returns: B("number") },
        ensAddress: { returns: B("string") },
      }
    },
    {
      name: "Signature",
      cls: (new DummyClass()),
      properties: {
        r: { returns: B("string") },
        s: { returns: B("string") },
        _vs: { returns: B("string") },
        recoveryParam: { returns: B("number") },
        v: { returns: B("number") },
      }
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
  ];

  function getClass(name) {
    if (name == null) { return null; }
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
        //const names = [ descr.name ];
        const props = [ Object.assign({ }, descr.properties) ];
        const staticProps = [ Object.assign({ }, descr.staticProperties) ];

        let current = descr.inherits;
        while (current) {
          current = getClass(current);
          if (!current) { throw new Error(`missing super: ${ descr.name }`); }

          //names.unshift(current.name);
          props.unshift(current.properties || { });
          staticProps.unshift(current.staticProperties || { });

          current = current.inherits;
        }

        Object.assign(descr.properties, ...props);
        Object.assign(descr.staticProperties, ...staticProps);
      }
    }

    if (lastGroup && lastGroup.populate) {
      //console.log("populating", descr);
      lastGroup.populate(descr);
    }
  });

self._Help = Help;

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
*/
