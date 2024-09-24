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

// @TODO: FixedNumber, Fetch*, Provider*

  const Help = [
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
        toJSON: Func([], B("any")),
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
      }
    },

    {
      name: "Signer",
      cls: (new DummyClass()),
      properties: {
        //provider: { returns: H("BaseProvider") },

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
        inferTypes: Func([], B("Array")),
        isBerlin: Func([], B("boolean")),
        isCancun: Func([], B("boolean")),
        isLegacy: Func([], B("boolean")),
        isLondon: Func([], B("boolean")),
        isSigned: Func([], B("boolean")),
        toJSON: Func([], B("_")),
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
      //descr: "BaseWallet",
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
        split: Func([ "phrase" ], B("Array")),
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
      func: ethers.scryptScrypt,
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
      returns: B("Array"),
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
      name: "resolveProperties",
      description: "resolves all properties on an object.",
      returns: B("_"),
      params: [ "object" ],
      paramDescr: [
        "the object whose properties to resolve"
      ]
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

  self._Help = Help;

  return { Basic, Globals, Help, Returns };
};
