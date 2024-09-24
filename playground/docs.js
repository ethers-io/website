/**
 *  This is used by the sidebar docs.
 */

// Help Items
// name: The string to show as the title and will be called with params
// params: Each parameter name; prefix optional parameter with a %
// defaults: The default to use when "use"-ing (may use a value other
//           than the default). Prefix a value with a $ to use verbatim
// descriptions: The description of each parameter
const Docs = [
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
    name: "version",
    description: "Ethers version",
    returns: "string",
  },
  {
    group: "ABI"
  },
  {
    name: "abiCoder.decode",
    description: "Decode ABI data",
    returns: "Result",
    params: [ "types", "data", "loose" ],
    descriptions: [
      "type of each value",
      "data to decode",
      "whether to recoverable errors"
    ],
    insert: "abiCoder.decode([ %types ], %data, false)"
  },
  {
    name: "abiCoder.encode",
    description: "ABI encode data",
    returns: "string",
    params: [ "types", "values" ],
    descriptions: [
      "type of each value",
      "values to encode"
    ],
    insert: "abiCoder.encode([ %types ], [ %values ])"
  },
  {
    name: "decodeBytes32String",
    description: "decode a Bytes32 string",
    returns: "string",
    params: [ "value" ],
    descriptions: [
      "Bytes32-encoded string"
    ],
  },
  {
    name: "encodeBytes32String",
    description: "encode a Bytes32 string",
    returns: "string",
    params: [ "value" ],
    descriptions: [
      "string to encode"
    ],
  },
  // @TODO: Interface; Result? Others?
  {
    group: "Address"
  },
  {
    name: "getAddress",
    description: "verify and normalize to a check-sum address",
    returns: "string",
    params: [ "address" ],
    descriptions: [
      "address to check and normalize"
    ],
  },
  {
    name: "getCreateAddress",
    description: "compute the CREATE address",
    returns: "string",
    params: [ "tx" ],
    descriptions: [
      "partial tx to compute created address for"
    ],
    insert: "getCreateAddress({ from: %sender, nonce: %nonce })"
  },
  {
    name: "getCreate2Address",
    description: "compute the CREATE2 address",
    returns: "string",
    params: [ "from", "salt", "initCode" ],
    descriptions: [
      "sender address",
      "CREATE2 salt",
      "tx initCode"
    ],
  },
  {
    name: "getIcapAddress",
    description: "verify and convert to an ICAP (IBAN) address",
    returns: "string",
    params: [ "address" ],
    descriptions: [
      "address to check and convert"
    ],
  },
  {
    name: "isAddress",
    description: "returns whether the value is an address",
    returns: "boolean",
    params: [ "value" ],
    descriptions: [
      "value to check"
    ],
  },
  {
    name: "isAddressable",
    description: "returns whether the value implements Addressable",
    returns: "boolean",
    params: [ "value" ],
    descriptions: [
      "value to check"
    ],
  },
  {
    name: "resolveAddress",
    description: "resolves target to an address",
    returns: "string",
    params: [ "target", "resolver" ],
    descriptions: [
      "address, ENS name or Addressable to resolve",
      "resolver to query, if necessary"
    ],
    insert: "resolveAddress(%target, provider)"
  },
  {
    group: "Constants"
  },
  {
    name: "EtherSymbol",
    description: "ether symbol (uppercase Xi)",
    returns: "string",
  },
  {
    name: "MaxInt256",
    description: "maximum int256 value",
    returns: "bigint"
  },
  {
    name: "MaxUint256",
    description: "maximum uint256 value",
    returns: "bigint"
  },
  {
    name: "MessagePrefix",
    description: "EIP-191 personal prefix",
    returns: "string"
  },
  {
    name: "MinInt256",
    description: "minimum int256 value",
    returns: "bigint"
  },
  {
    name: "N",
    description: "secp256k1 field n",
    returns: "bigint"
  },
  {
    name: "WeiPerEther",
    description: "Wei per Ether (10 ^ 18)",
    returns: "bigint"
  },
  {
    name: "ZeroAddress",
    description: "The zero address",
    returns: "string",
  },
  {
    name: "ZeroHash",
    description: "The zero hash",
    returns: "string",
  },


  {
    group: "Contracts"
  },
  {
    name: "Contract",
    description: "connects to a deployed Contract",
    returns: "Contract",
    params: [ "address", "abi", "%providerOrSigner" ],
    descriptions: [
      "the address to onnect to",
      "the ABI of the deployed contract",
      "the Signer or Provider to connect with"
    ],
    insert: "new Contract(%address, %abi, provider)"
  },
  {
    name: "ContractFactory",
    description: "creates a ContractFactory for deploying contracts",
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
    group: "Crypto"
  },
  {
    name: "computeHmac",
    description: "Compute the HMAC",
    returns: "string",
    params: [ "algorithm", "key", "data" ],
    descriptions: [
      "hash algorithm; e.g. 'sha256'",
      "HMAC key",
      "data to hash"
    ],
    insert: "computeHmac('sha256', %key, %data)"
  },
  {
    name: "keccak256",
    description: "Compute the keccak256 hash",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to hash"
    ]
  },
  {
    name: "pbkdf2",
    description: "Compute the PBKDF2 key",
    returns: "string",
    params: [ "password", "salt", "iterations", "keyLength", "algo" ],
    descriptions: [
      "password to derive key for",
      "salt to use",
      "number of iterations",
      "the length of the key to generate",
      "algorith to use; e.g. 'sha256'"
    ],
    insert: "pbkdf2(%password, %salt, 1024, 32, 'sha256')"
  },
  {
    name: "randomBytes",
    description: "Generate cryptogtaphic-secure random data",
    returns: "Uint8Array",
    params: [ "length" ],
    descriptions: [
      "number of bytes to generate"
    ]
  },
  {
    name: "ripemd160",
    description: "Compute the ripemd160 hash",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to hash"
    ]
  },
  {
    name: "scrypt",
    description: "Compute the scrypt PBKDF key",
    returns: "string",
    params: [ "password", "salt", "N", "r", "p", "keyLength", "%progress" ],
    descriptions: [
      "password to derive key for",
      "salt to use",
      "scrypt cost factor",
      "scrypt block size factor",
      "scrypt parallelization factor",
      "the length of the key to generate",
      "progress function callback"
    ],
    insert: "scrypt(%password, %salt, 1024, 8, 1, 32, console.log)"
  },
  {
    name: "scryptScrypt",
    description: "Compute the scrypt PBKDF key synchronously",
    returns: "string",
    params: [ "password", "salt", "N", "r", "p", "keyLength" ],
    descriptions: [
      "password to derive key for",
      "salt to use",
      "scrypt cost factor",
      "scrypt block size factor",
      "scrypt parallelization factor",
      "the length of the key to generate"
    ],
    insert: "scryptSync(%password, %salt, 1024, 8, 1, 32)"
  },
  {
    name: "sha256",
    description: "Compute the SHA2-256 hash",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to hash"
    ]
  },
  {
    name: "sha512",
    description: "Compute the SHA2-512 hash",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to hash"
    ]
  },
  {
    name: "Signature.from",
    description: "creates a new Signature from serialized data",
    returns: "Signature",
    params: [ "data" ],
    descriptions: [
      "serialized signature data"
    ],
    insert: "Signature.from(%data)"
  },
  {
    name: "Signature.from",
    description: "creates a new Signature from tx data",
    returns: "Signature",
    params: [ "tx" ],
    descriptions: [
      "serialized signature data"
    ],
    insert: "Signature.from({ r: %r, %s: s, v: %v })"
  },
  {
    name: "SigningKey",
    description: "creates a SigningKey for a private key",
    returns: "SigningKey",
    params: [ "privateKey" ],
    descriptions: [
      "secp256k1 private key"
    ],
    insert: "new SigningKey(%privateKey)"
  },

  {
    group: "Hash Utilities"
  },
  {
    name: "dnsEncode",
    description: "Compute the DNS-encoded data",
    returns: "string",
    params: [ "name" ],
    descriptions: [
      "DNS name to encode"
    ]
  },
  {
    name: "ensNormalize",
    description: "Normalize an ENS name, folding Unicode and special characters",
    returns: "string",
    params: [ "name" ],
    descriptions: [
      "ENS name to normalize"
    ]
  },
  {
    name: "hashMessage",
    description: "Compute the EIP-191 personal sign prefixed message hash",
    returns: "string",
    params: [ "message" ],
    descriptions: [
      "message to hash"
    ]
  },
  {
    name: "id",
    description: "Compute the keccak256 hash of the UTF-8 string bytes",
    returns: "string",
    params: [ "text" ],
    descriptions: [
      "string to hash UTF-8 bytes of"
    ]
  },
  {
    name: "isValidName",
    description: "Returns if a string is a valid ENS name",
    returns: "boolean",
    params: [ "value" ],
    descriptions: [
      "string to check ENS name validity"
    ]
  },
  {
    name: "namehash",
    description: "Compute the namehash of an ENS name",
    returns: "string",
    params: [ "name" ],
    descriptions: [
      "ENS name"
    ]
  },
  {
    name: "solidityPacked",
    description: "Compute the Solidity packed encoding values",
    returns: "string",
    params: [ "types", "values" ],
    descriptions: [
      "type of each value",
      "values to encode"
    ]
  },
  {
    name: "solidityPackedKeccak256",
    description: "Compute the keccak256 hash of the Solidity packed encoding values",
    returns: "string",
    params: [ "types", "values" ],
    descriptions: [
      "type of each value",
      "values to encode"
    ]
  },
  {
    name: "solidityPackedSha256",
    description: "Compute the SHA2-256 hash of the Solidity packed encoding values",
    returns: "string",
    params: [ "types", "values" ],
    descriptions: [
      "type of each value",
      "values to encode"
    ]
  },
  {
    name: "verifyMessage",
    description: "Compute the address of a signed message",
    returns: "string",
    params: [ "message", "signature" ],
    descriptions: [
      "message that was signed",
      "signature of signed message"
    ]
  },
  {
    name: "verifyTypedData",
    description: "Compute the address of EIP-712 signed typed-data",
    returns: "string",
    params: [ "domain", "types", "value", "signature" ],
    descriptions: [
      "EIP-712 domain of signed value",
      "EIP-712 type structure",
      "value that was signed",
      "signature of signed typed data"
    ]
  },

  {
    group: "Providers"
  },
  {
    name: "getDefaultProvider",
    description: "Connect to a network ",
    returns: "Provider",
    params: [ "network", "%options" ],
    descriptions: [
      "Network to connect to",
      "API keys an other options to use"
    ]
  },
  {
    name: "InfuraProvider",
    description: "Create a Provider backed by Infura",
    returns: "InfuraProvider",
    params: [ "%network", "%projectId", "%projectSecret" ],
    descriptions: [
      "Network to connect to",
      "API ProjectID to use",
      "API Project Secret to use",
    ],
    insert: "new InfuraProvider(%url)"
  },
  {
    name: "Network.from",
    description: "Create a Network object",
    returns: "Network",
    params: [ "nameOrChainId" ],
    descriptions: [
      "Network name or Chain ID"
    ],
    insert: "Network.from(%nameorChainId)"
  },
  {
    name: "NonceManager",
    description: "Create a NonceManager to wrap a Signer and manage nonces",
    returns: "NonceManager",
    params: [ "signer" ],
    descriptions: [
      "signer to manage"
    ],
    insert: "new NonceManager(%signer)"
  },
  {
    name: "QuickNodeProvider",
    description: "Create a Provider backed by QuickNode",
    returns: "QuickNodeProvider",
    params: [ "%network", "%token" ],
    descriptions: [
      "Network to connect to",
      "API token to use"
    ],
    insert: "new QuickNodeProvider(%url)"
  },
  {
    name: "VoidSigner",
    description: "Create a read-only Signer",
    returns: "VoidSigner",
    params: [ "address", "%provider" ],
    descriptions: [
      "signer address",
      "provider to connect to"
    ],
    insert: "new VoidSigner(%address, provider)"
  },
  {
    name: "WebSocketProvider",
    description: "Create a Provider connected to a WebSocket",
    returns: "WebSocketProvider",
    params: [ "url", "%network", "%options" ],
    descriptions: [
      "URL to connect to",
      "network to expect",
      "additional options"
    ],
    insert: "new WebSocketProvider(%url)"
  },

  {
    group: "Transactions"
  },
  {
    name: "accessListify",
    description: "normalize various access list formats",
    returns: "AccessList",
    params: [ "value" ],
    descriptions: [
      "access list structure"
    ]
  },
  {
    name: "computeAddress",
    description: "compute the address for a public or private key",
    returns: "string",
    params: [ "key" ],
    descriptions: [
      "public or private key to compute address for"
    ]
  },
  {
    name: "recoverAddress",
    description: "recover the address for signed data",
    returns: "string",
    params: [ "digest", "signature" ],
    descriptions: [
      "digest the signature was computed for",
      "signature computed for signed digest"
    ]
  },
  {
    name: "Transaction.from",
    description: "Create a Transaction from serialized data",
    returns: "Transaction",
    params: [ "data" ],
    descriptions: [
      "serialized tx data"
    ],
    insert: "Transaction.from(%data)"
  },
  {
    name: "Transaction.from",
    description: "Create a Transaction from transaction details",
    returns: "Transaction",
    params: [ "tx" ],
    descriptions: [
      "tx details"
    ],
    insert: "Transaction.from({ to: %to, data: %data })"
  },

  {
    group: "Utilities - Data"
  },
  {
    name: "concat",
    description: "Concatentate array of datas",
    returns: "string",
    params: [ "values" ],
    descriptions: [
      "array of data to concatenate"
    ]
  },
  {
    name: "dataLength",
    description: "Compute the length in bytes",
    returns: "number",
    params: [ "data" ],
    descriptions: [
      "data to compute length of"
    ]
  },
  {
    name: "dataSlice",
    description: "Slice a region in bytes",
    returns: "number",
    params: [ "data", "%start", "%end" ],
    descriptions: [
      "data to slice",
      "start offset (default: 0)",
      "end offset (default: end of string)",
    ]
  },
  {
    name: "decodeBase58",
    description: "Decode Base58-encoded data",
    returns: "bigint",
    params: [ "value" ],
    descriptions: [
      "Base58-encoded data to decode"
    ]
  },
  {
    name: "decodeBase64",
    description: "Decode Base64-encoded data",
    returns: "Uint8Array",
    params: [ "value" ],
    descriptions: [
      "Base64-encoded data to decode"
    ]
  },
  {
    name: "decodeRlp",
    description: "Decode RLP-encoded data",
    returns: "RlpStructuredData",
    params: [ "data" ],
    descriptions: [
      "RLP-encoded datato decode"
    ]
  },
  {
    name: "encodeBase58",
    description: "Encode data using Base58-encoding",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to Base58-encode"
    ]
  },
  {
    name: "encodeBase64",
    description: "Encode data using Base64-encoding",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to Base64-encode"
    ]
  },
  {
    name: "encodeRlp",
    description: "Encode value data using RLP-encoding",
    returns: "string",
    params: [ "value" ],
    descriptions: [
      "value to RLP-encode"
    ]
  },
  {
    name: "getBytes",
    description: "Convert a value to a Uint8Array",
    returns: "Uint8Array",
    params: [ "value", "%name" ],
    descriptions: [
      "value to convert",
      "name to include in any error messages",
    ]
  },
  {
    name: "getBytesCopy",
    description: "Convert a value to an unshared-memory Uint8Array",
    returns: "Uint8Array",
    params: [ "value", "%name" ],
    descriptions: [
      "value to convert",
      "name to include in any error messages",
    ]
  },
  {
    name: "hexlify",
    description: "Convert data to a hex string",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "value to represent as a hex"
    ]
  },
  {
    name: "isBytesLike",
    description: "Whether a value can represent valid binary data",
    returns: "boolean",
    params: [ "value" ],
    descriptions: [
      "value to check"
    ]
  },
  {
    name: "isHexString",
    description: "Whether a value is a hexstring",
    returns: "boolean",
    params: [ "value", "%length" ],
    descriptions: [
      "value to check",
      "length to expect; or true to check even-length"
    ]
  },
  {
    name: "stripZerosLeft",
    description: "Remove leading-zero bytes",
    returns: "string",
    params: [ "data" ],
    descriptions: [
      "data to manipulate"
    ]
  },
  {
    name: "zeroPadBytes",
    description: "Pad data on the right, as in bytesXX",
    returns: "string",
    params: [ "data", "length" ],
    descriptions: [
      "data to pad",
      "target length to pad to"
    ]
  },
  {
    name: "zeroPadValue",
    description: "Pad data on the left, as in uintXX",
    returns: "string",
    params: [ "data", "length" ],
    descriptions: [
      "data to pad",
      "target length to pad to"
    ]
  },

  {
    group: "Utilities - Maths"
  },
  {
    name: "fromTwos",
    description: "Convert a value from twos-compliment",
    returns: "bigint",
    params: [ "value", "width" ],
    descriptions: [
      "value to convert",
      "width in bits to convert from"
    ]
  },
  {
    name: "getBigInt",
    description: "Convert a value to bigint",
    returns: "bigint",
    params: [ "value", "%name" ],
    descriptions: [
      "value to convert",
      "name to include in any error messages",
    ]
  },
  {
    name: "getNumber",
    description: "Convert a value to number",
    returns: "bigint",
    params: [ "value", "%name" ],
    descriptions: [
      "value to convert",
      "name to include in any error messages",
    ]
  },
  {
    name: "getUint",
    description: "Convert a value to bigint, capped to uint256",
    returns: "bigint",
    params: [ "value", "%name" ],
    descriptions: [
      "value to convert",
      "name to include in any error messages",
    ]
  },
  {
    name: "mask",
    description: "Mask the bottom bits of a value",
    returns: "bigint",
    params: [ "value", "bits" ],
    descriptions: [
      "value to mask",
      "number of lower bits to keep",
    ]
  },
  {
    name: "toBeArray",
    description: "Convert a value to big-endian bytes",
    returns: "Uint8Array",
    params: [ "value" ],
    descriptions: [
      "value to convert"
    ]
  },
  {
    name: "toBeHex",
    description: "Convert a value to a big-endian hex string",
    returns: "string",
    params: [ "value", "%width" ],
    descriptions: [
      "value to convert",
      "width in bytes to pad to"
    ]
  },
  {
    name: "toBigInt",
    description: "Convert a value to a bigint",
    returns: "bigint",
    params: [ "value" ],
    descriptions: [
      "value to convert"
    ]
  },
  {
    name: "toNumber",
    description: "Convert a value to a number",
    returns: "number",
    params: [ "value" ],
    descriptions: [
      "value to convert"
    ]
  },
  {
    name: "toQuantity",
    description: "Convert a value to a JSON-RPC-safe hexstring",
    returns: "string",
    params: [ "value" ],
    descriptions: [
      "value to convert"
    ]
  },
  {
    name: "toTwos",
    description: "Convert a value to twos-compliment",
    returns: "bigint",
    params: [ "value", "width" ],
    descriptions: [
      "value to convert",
      "width in bits to convert to"
    ]
  },

  {
    group: "Utilities - Strings"
  },
  {
    name: "toUtf8Bytes",
    description: "Convert text to UTF-8 data",
    returns: "Uint8Array",
    params: [ "value", "%form" ],
    descriptions: [
      "text to convert",
      "unicode normal form to use"
    ]
  },
  {
    name: "toUtf8CodePoints",
    description: "Convert text to UTF-8 Code Points",
    returns: "Array<number>",
    params: [ "value", "%form" ],
    descriptions: [
      "text to convert",
      "unicode normal form to use"
    ]
  },
  {
    name: "toUtf8String",
    description: "Convert UTF-8 data to a string",
    returns: "string",
    params: [ "data", "%onError" ],
    descriptions: [
      "UTF-8 data to convert",
      "error handler for conversion errors"
    ]
  },

  {
    group: "Utilities - Units"
  },
  {
    name: "formatEther",
    description: "Convert numeric values to a decimal string with 18 decimals",
    returns: "string",
    params: [ "wei" ],
    descriptions: [
      "value to convert"
    ]
  },
  {
    name: "formatUnits",
    description: "Convert numeric values to a decimal string",
    returns: "string",
    params: [ "value", "%unit" ],
    descriptions: [
      "value to convert",
      "number of decimals"
    ]
  },
  {
    name: "parseEther",
    description: "Parse a decimal string into an 18 decimal value",
    returns: "bigint",
    params: [ "ether" ],
    descriptions: [
      "value to convert"
    ]
  },
  {
    name: "parseUnits",
    description: "Parse a decimal string into a decimal value",
    returns: "bigint",
    params: [ "value", "%unit" ],
    descriptions: [
      "value to convert",
      "number of decimals"
    ]
  },

  {
    group: "Wallet"
  },
  {
    name: "decryptCrowdsaleJson",
    description: "Decrypt a crowdsale JSON wallet",
    returns: "CrowdsaleAccount",
    params: [ "json", "password" ],
    descriptions: [
      "JSON wallet payload",
      "password used to encrypt the wallet"
    ]
  },
  {
    name: "decryptKeystoreJson",
    description: "Decrypt a keystore JSON wallet",
    returns: "KeystoreAccount",
    params: [ "json", "password", "%proress" ],
    descriptions: [
      "JSON wallet payload",
      "password used to encrypt the wallet",
      "progress function callback"
    ]
  },
  {
    name: "decryptKeystoreJsonSync",
    description: "Decrypt a keystore JSON wallet sychronously",
    returns: "KeystoreAccount",
    params: [ "json", "password" ],
    descriptions: [
      "JSON wallet payload",
      "password used to encrypt the wallet"
    ]
  },
  {
    name: "defaultPath",
    description: "Default HD Node path",
    returns: "string"
  },
  {
    name: "encryptKeystoreJson",
    description: "Encrypt a wallet as a keystore JSON wallet",
    returns: "string",
    params: [ "account", "password", "%options" ],
    descriptions: [
      "account details",
      "password to encrypt the wallet with",
      "additional options"
    ]
  },
  {
    name: "encryptKeystoreJsonSync",
    description: "Encrypt a wallet as a keystore JSON wallet synchronously",
    returns: "string",
    params: [ "account", "password", "%options" ],
    descriptions: [
      "account details",
      "password to encrypt the wallet with",
      "additional options"
    ]
  },
  {
    name: "getAccountPath",
    description: "Compute the HD account path",
    returns: "string",
    params: [ "account" ],
    descriptions: [
      "account index to compute the path for"
    ]
  },
  {
    name: "getIndexedAccountPath",
    description: "Compute the HD account path",
    returns: "string",
    params: [ "account" ],
    descriptions: [
      "account index to compute the path for"
    ]
  },
  {
    name: "isCrowdsaleJson",
    description: "Whether the JSON is a valid crowdsale wallet",
    returns: "boolean",
    params: [ "json" ],
    descriptions: [
      "JSON wallet payload"
    ]
  },
  {
    name: "isKeystoreJson",
    description: "Whether the JSON is a valid keystore wallet",
    returns: "boolean",
    params: [ "json" ],
    descriptions: [
      "JSON wallet payload"
    ]
  },
  {
    name: "Wallet",
    description: "Create a new Wallet",
    returns: "Wallet",
    params: [ "privateKey", "%provider" ],
    descriptions: [
      "secp256k1 private key",
      "provider to connect to"
    ],
    insert: "new Wallet(%privateKey, provider)"
  },
];
/*
for (const { name, returns, params } of Docs) {
  if (name == null) { continue; }
  if (name.indexOf(".") >= 0 || !params) { continue; }

  console.log(`{`);
  console.log(`  func: ethers.${ name },`)
  console.log(`  returns: B("${ returns }"),`)
  console.log(`  params: [ ${ params.map(JSON.stringify).join(", ") } ]`);
  console.log(`},`);

}

*/
