// Help Items
// name: The string to show as the title and will be called with params
// params: Each parameter name; prefix optional parameter with a %
// defaults: The default to use when "use"-ing (may use a value other
//           than the default). Prefix a value with a $ to use verbatim
// descriptions: The description of each parameter
const Help = [
/*
  {
    name: "",
    description: "",
    params: [ "" ],
    descriptions: [
      ""
    ]
  },
*/
  {
    group: "ethers"
  },
  {
    name: "BigNumber.from",
    description: "creates a new BigNumber",
    returns: "BigNumber",
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
    returns: "string",
  },
  {
    name: "EtherSymbol",
    description: "The ether symbol as a string",
    returns: "string",
  },
  {
    name: "HashZero",
    description: "The zero hash",
    returns: "string",
  },
  {
    name: "MaxInt256",
    description: "BigNumber for maximum int256",
    returns: "BigNumber"
  },
  {
    name: "MinInt256",
    description: "BigNumber for minimum int256",
    returns: "BigNumber"
  },
  {
    name: "MaxUint256",
    description: "BigNumber for maximum uint256",
    returns: "BigNumber"
  },
  {
    name: "NegativeOne",
    description: "BigNumber for -1",
    returns: "BigNumber"
  },
  {
    name: "One",
    description: "BigNumber for 1",
    returns: "BigNumber"
  },
  {
    name: "Two",
    description: "BigNumber for 2",
    returns: "BigNumber"
  },
  {
    name: "WeiPerEther",
    description: "BigNumber for 10 ** 18",
    returns: "BigNumber"
  },
  {
    name: "Zero",
    description: "BigNumber for 0",
    returns: "BigNumber"
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
  /*
  {
    name: "AlchemyProvider.getWebSocketProvider",
    description: "create a Provider connected to the Alchemy WebSocket service",
    params: [ "%network", "%apiKey" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service API key (default: a highly throttled shared key)"
    ]
  },
  */
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
  /*
  {
    name: "InfuraProvider.getWebSocketProvider",
    description: "create a Provider connected to the INFURA WebSocket service",
    params: [ "%network", "%projectId" ],
    descriptions: [
      "the netwowk to connect to (default: homestead)",
      "the service Project ID or ProjectID and Project Secret keys (default: a highly throttled shared key)"
    ]
  },
  */
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
  {
    name: "arrayify",
    description: "converts bytes-like values to Uint8Array.",
    returns: "Uint8Array",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like value to convert"
    ]
  },
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
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "the data to encode"
    ]
  },
  {
    name: "base64.decode",
    description: "decodes a Base-64 encoded payload",
    returns: "Uint8Array",
    params: [ "data" ],
    descriptions: [
      "the encoded data to decode"
    ]
  },
  {
    name: "base64.encode",
    description: "encodes a bytes-like using the Base-64 encoding",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "the data to encode"
    ]
  },
  {
    name: "computeAddress",
    description: "compute the address of a public or private key",
    returns: "string<Address>",
    params: [ "key" ],
    descriptions: [
      "the key to compute the address of"
    ]
  },
  {
    name: "computeHmac",
    description: "compute the HMAC of a bytes-like",
    returns: "Uint8Array",
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
    returns: "string<Bytes>",
    params: [ "key", "%compressed" ],
    descriptions: [
      "the key to compute the public key of",
      "whether to use the compressed form"
    ]
  },
  {
    name: "concat",
    description: "concatenates multiple bytes-like",
    returns: "Uint8Array",
    params: [ "datas" ],
    descriptions: [
      "the array of bytes-like objects"
    ]
  },
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
    returns: "string<Bytes>",
    params: [ "types", "value" ],
    descriptions: [
      "the array of types",
      "the value to encode"
    ]
  },
  {
    name: "defaultPath",
    description: "the default BIP-44 path for Ethereum",
    returns: "string"
  },
  {
    name: "entropyToMnemonic",
    description: "converts BIP-39 entropy to its mnemonic",
    returns: "string",
    params: [ "entropy", "%wordlist" ],
    descriptions: [
      "the BIP-39 entropy",
      "the wordlist to use"
    ]
  },
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
  {
    name: "fetchJson",
    description: "fetch a JSON payload.",
    returns: "object",
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
    returns: "string<Bytes32>",
    params: [ "text" ],
    descriptions: [
      "the text to convert"
    ]
  },
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
    returns: "string",
  },
  {
    name: "FormatTypes.minimal",
    description: "constant for formatting Fragments as a human-readable ABI with minimal details",
    returns: "string",
  },
  {
    name: "FormatTypes.json",
    description: "constant for formatting Fragments as a JSON string",
    returns: "string",
  },
  {
    name: "FormatTypes.sighash",
    description: "constant for formatting Fragments as a normalized string to compute selectors",
    returns: "string",
  },
  {
    name: "formatEther",
    description: "formats a value as an ether decimal string.",
    returns: "string",
    params: [ "value" ],
    descriptions: [
      "the value to format"
    ]
  },
  {
    name: "formatUnits",
    description: "formats a value as a decimal string.",
    returns: "string",
    params: [ "value", "%decimals" ],
    descriptions: [
      "the value to format",
      "the number of decimal places"
    ],
    insert: "formatUnits(%value, 18)"
  },
  {
    name: "FunctionFragment.from",
    description: "creates a new Function Fragment",
    returns: "FunctionFragment",
    params: [ "description" ],
    descriptions: [
      "the human-readable or JSON ABI"
    ]
  },
  {
    name: "getAccountPath",
    description: "computes the BIP-44 HD path for an account",
    returns: "string",
    params: [ "index" ],
    descriptions: [
      "the account index to derive for"
    ],
  },
  {
    name: "getAddress",
    description: "verifies and normalizes an address to a check-sum address",
    returns: "string",
    params: [ "address" ],
    descriptions: [
      "the address to examine"
    ],
  },
  {
    name: "getContractAddress",
    description: "computes a contract address",
    returns: "string",
    params: [ "txData" ],
    descriptions: [
      "an object with a .from address and .nonce"
    ],
  },
  {
    name: "getCreate2Address",
    description: "computes a CREATE2 contract address",
    returns: "string",
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
    returns: "string",
    params: [ "address" ],
    descriptions: [
      "the address to examine"
    ],
  },
  {
    name: "hashMessage",
    description: "computes the EIP-191 prefixed personal message hash",
    returns: "string<Bytes32>",
    params: [ "message" ],
    descriptions: [
      "the message to hash"
    ]
  },
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
  {
    name: "hexConcat",
    description: "concatenates multiple bytes-likes",
    returns: "string<Bytes>",
    params: [ "datas" ],
    descriptions: [
      "the array of bytes-like objects"
    ]
  },
  {
    name: "hexDataLength",
    description: "computes the length (in bytes) of bytes-like",
    returns: "number",
    params: [ "data" ],
    descriptions: [
      "the data to examine"
    ]
  },
  {
    name: "hexDataSlice",
    description: "slices a bytes-like",
    returns: "string<Bytes>",
    params: [ "bytesLike", "start", "%end" ],
    descriptions: [
      "the data to slice",
      "the start index, in bytes",
      "the end index, in bytes (default: end of data)",
    ]
  },
  {
    name: "hexlify",
    description: "converts bytes-like values to hexdataString.",
    returns: "string<Bytes>",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like value to convert"
    ]
  },
  {
    name: "hexStripZeros",
    description: "removes all leading zeros from a bytes-like",
    returns: "string<Bytes>",
    params: [ "data" ],
    descriptions: [
      "the bytes-like object to strip"
    ]
  },
  {
    name: "hexValue",
    description: "encodes a value as a JSON-RPC quantity",
    returns: "string",
    params: [ "value" ],
    descriptions: [
      "the value to encode"
    ]
  },
  {
    name: "hexZeroPad",
    description: "pad a bytes-like with leading zeros",
    returns: "string<Bytes>",
    params: [ "bytesLike" ],
    descriptions: [
      "the data to pad"
    ]
  },
  {
    name: "id",
    description: "compute the keccak256 hash of a the UTF-8 data of a string.",
    returns: "string<Bytes32>",
    params: [ "text" ],
    descriptions: [
      "the string to hash to UTF-8 data of"
    ]
  },
  {
    name: "Interface",
    description: "create a new Interface.",
    returns: "Interface",
    params: [ "abi" ],
    descriptions: [
      "the ABI to use"
    ],
    insert: "new Interface(%abi)"
  },
  {
    name: "isBytes",
    description: "returns true if data is a valid Bytes",
    returns: "boolean",
    params: [ "bytesLike" ],
    descriptions: [
      "the data to examine"
    ]
  },
  {
    name: "isBytesLike",
    description: "returns true if data is a valid BytesLike",
    returns: "boolean",
    params: [ "bytesLike" ],
    descriptions: [
      "the data to examine"
    ]
  },
  {
    name: "isHexString",
    description: "returns true if text is a valid hex string, optionally of some length",
    returns: "boolean",
    params: [ "text", "%length" ],
    descriptions: [
      "the data to examine",
      "the length (in bytes) the string must be"
    ]
  },
  {
    name: "isValidMnemonic",
    description: "determines if a string is a valid BIP-39 mnemonic",
    returns: "boolean",
    params: [ "text", "%wordlist" ],
    descriptions: [
      "the string to check",
      "the wordlist to use"
    ]
  },
  {
    name: "isValidName",
    description: "returns true if name is a valid ENS name",
    returns: "boolean",
    params: [ "name" ],
    descriptions: [
      "the ENS name to examine"
    ]
  },
  {
    name: "joinSignature",
    description: "flattend a Signature",
    returns: "string<65>",
    params: [ "signature" ],
    descriptions: [
      "any compatible signature data or bytes-like"
    ]
  },
  {
    name: "keccak256",
    description: "compute the keccak256 hash of a bytes-like.",
    returns: "string<Bytes32>",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "mnemonicToEntropy",
    description: "convert a BIP-39 mnemonic to its entropy",
    returns: "string",
    params: [ "mnemonic", "%wordlist" ],
    descriptions: [
      "the BIP-39 mnemonic phrase",
      "the wordlist to use"
    ]
  },
  {
    name: "mnemonicToSeed",
    description: "compute the BIP-39 seed from a mnemonic",
    returns: "string<Bytes>",
    params: [ "mnemonic", "%password" ],
    descriptions: [
      "the BIP-39 mnemonic phrase",
      'the password to use (default: "")'
    ]
  },
  {
    name: "namehash",
    description: "computes the namehash of an ENS name",
    returns: "string<Bytes32>",
    params: [ "name" ],
    descriptions: [
      "the ENS name to hash"
    ]
  },
  {
    name: "ParamType.from",
    description: "creates a new ParamType",
    returns: "ParamType",
    params: [ "description" ],
    descriptions: [
      "the human-readable or JSON ABI"
    ]
  },
  {
    name: "parseBytes32String",
    description: "parses a Bytes32 string into a normal string.",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "the Bytes32 data to convert"
    ]
  },
  {
    name: "parseEther",
    description: "parses a decimal ether string into a BigNumber.",
    returns: "BigNumber",
    params: [ "text" ],
    descriptions: [
      "the ether string to parse"
    ]
  },
  {
    name: "parseUnits",
    description: "parses a decimal string into a BigNumber.",
    returns: "BigNumber",
    params: [ "text", "%decimals" ],
    descriptions: [
      "the text to parse as a decimal",
      "the number of decimal places (default: 18)"
    ],
    insert: "parseUnits(%text, 18)"
  },
  {
    name: "parseTransaction",
    description: "parses an encoded transaction into a transaction.",
    returns: "object<Transaction>",
    params: [ "encodedTx" ],
    descriptions: [
      "the encoded transaction bytes-like"
    ]
  },
  {
    name: "randomBytes",
    description: "creates an array of cryptographically secure random bytes.",
    returns: "Uint8Array",
    params: [ "length" ],
    descriptions: [
      "the length of bytes to return"
    ]
  },
  {
    name: "recoverAddress",
    description: "computes the address of a signed message digest",
    params: [ "digest", "signature" ],
    descriptions: [
      "the digest of a signed message",
      "the signature of signed message"
    ]
  },
  {
    name: "recoverPublicKey",
    description: "computes the public key of a signed message digest",
    params: [ "digest", "signature" ],
    descriptions: [
      "the digest of a signed message",
      "the signature of signed message"
    ]
  },
  {
    name: "resolveProperties",
    description: "resolves all properties on an object.",
    params: [ "object" ],
    descriptions: [
      "the object whose properties to resolve"
    ]
  },
  {
    name: "ripemd160",
    description: "compute the RIPEMD-160 hash of a bytes-like.",
    returns: "string<Bytes20>",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "RLP.decode",
    description: "decodes an RLP encoded payload",
    returns: "object",
    params: [ "data" ],
    descriptions: [
      "the encoded data to decode"
    ]
  },
  {
    name: "RLP.encode",
    description: "encodes a (possibly nested) object using RLP encoding",
    returns: "string<Bytes>",
    params: [ "object" ],
    descriptions: [
      "the object to encode"
    ]
  },
  {
    name: "serializeTransaction",
    description: "serialize a transaction.",
    returns: "string<Bytes>",
    params: [ "transaction", "%signature" ],
    descriptions: [
      "the transaction properties",
      "the transaction signature; if omitted an unsigned transaction pre-image is returned"
    ]
  },
  {
    name: "sha256",
    description: "compute the SHA2-256 hash of a bytes-like.",
    returns: "string<Bytes32>",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "sha512",
    description: "compute the SHA2-512 hash of a bytes-like.",
    returns: "string<Bytes64>",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "SigningKey",
    description: "create a new SigningKey",
    returns: "SigningKey",
    params: [ "privateKey" ],
    descriptions: [
      "the private key to sign with"
    ],
    insert: "new SigningKey(%privateKey)"
  },
  {
    name: "solidityKeccak256",
    description: "compute the Solidity keccak256 hash of the non-standard packed bytes for values of given types.",
    returns: "string<Bytes32>",
    params: [ "types", "values" ],
    descriptions: [
      "an array of types (as strings)",
      "an array of values, each compatible with its corresponding type",
    ]
  },
  {
    name: "solidityPack",
    description: "compute the Solidity non-standard packed bytes for values of given types.",
    returns: "string<Bytes>",
    params: [ "types", "values" ],
    descriptions: [
      "an array of types (as strings)",
      "an array of values, each compatible with its corresponding type",
    ]
  },
  {
    name: "soliditySha256",
    description: "compute the Solidity SHA2-256 hash of the non-standard packed bytes for values of given types.",
    returns: "string<Bytes32>",
    params: [ "types", "values" ],
    descriptions: [
      "an array of types (as strings)",
      "an array of values, each compatible with its corresponding type",
    ]
  },
  {
    name: "splitSignature",
    description: "expands a Signature into all its components",
    returns: "object<Signature>",
    params: [ "signature" ],
    descriptions: [
      "any compatible signature data or bytes-like"
    ]
  },
  {
    name: "stripZeros",
    description: "removes all leading zeros from a bytes-like",
    returns: "Uint8Array",
    params: [ "data" ],
    descriptions: [
      "the bytes-like object to strip"
    ]
  },
  {
    name: "SupportedAlgorithm.sha256",
    description: "the HMAC constant for SHA2-256",
    returns: "string",
  },
  {
    name: "SupportedAlgorithm.sha512",
    description: "the HMAC constant for SHA2-512",
    returns: "string",
  },
  {
    name: "toUtf8Bytes",
    description: "converts a string to its UTF-8 bytes.",
    returns: "Uint8Array",
    params: [ "text" ],
    descriptions: [
      "the string to convert"
    ]
  },
  {
    name: "toUtf8CodePoints",
    description: "converts a string to its UTF-8 code-points; each code-point is a single visible character.",
    returns: "Array<number>",
    params: [ "text" ],
    descriptions: [
      "the string to convert"
    ]
  },
  {
    name: "toUtf8String",
    description: "converts UTF-8 bytes to a string.",
    returns: "string",
    params: [ "utf8Data" ],
    descriptions: [
      "the UTF-8 data to convert"
    ]
  },
  {
    name: "verifyMessage",
    description: "computes the address of a signed message",
    returns: "string<Address>",
    params: [ "message", "signature" ],
    descriptions: [
      "the message that was signed",
      "the signature of the signed message"
    ]
  },
  {
    name: "zeroPad",
    description: "pad a bytes-like with leading zeros",
    returns: "Uint8Array",
    params: [ "bytesLike" ],
    descriptions: [
      "the data to pad"
    ]
  },
];
