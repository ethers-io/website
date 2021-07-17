// Help Items
// name: The string to show as the title and will be called with params
// params: Each parameter name; prefix optional parameter with a %
// defaults: The default to use when "use"-ing (may use a value other
//           than the default). Prefix a value with a $ to use verbatim
// descriptions: The description of each parameter
const Help = [
  {
    name: "new utils.Interface",
    description: "create a new Interface.",
    params: [ "abi" ],
    descriptions: [
      "the ABI to use"
    ]
  },
  {
    name: "utils.arrayify",
    description: "converts bytes-like values to Uint8Array.",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like value to convert"
    ]
  },
  {
    name: "utils.formatBytes32String",
    description: "formats a string as a Bytes32 hexdataString.",
    params: [ "text" ],
    descriptions: [
      "the text to convert"
    ]
  },
  {
    name: "utils.formatUnits",
    description: "formats a value as a decimal string.",
    params: [ "value", "%decimals" ],
    defaults: [ null, 18 ],
    descriptions: [
      "the value to format",
      "the number of decimal places"
    ]
  },
  {
    name: "utils.hexlify",
    description: "converts bytes-like values to hexdataString.",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like value to convert"
    ]
  },
  {
    name: "utils.id",
    description: "compute the keccak256 hash of a the UTF-8 data of a string.",
    params: [ "text" ],
    descriptions: [
      "the string to hash to UTF-8 data of"
    ]
  },
  {
    name: "utils.keccak256",
    description: "compute the keccak256 hash of a bytes-like.",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "utils.parseBytes32String",
    description: "parses a Bytes32 string into a normal string.",
    params: [ "data" ],
    descriptions: [
      "the Bytes32 data to convert"
    ]
  },
  {
    name: "utils.parseUnits",
    description: "parses a decimal string into a BigNumber.",
    params: [ "text", "%decimals" ],
    defaults: [ null, 18 ],
    descriptions: [
      "the text to parse as a decimal",
      "the number of decimal places"
    ]
  },
  {
    name: "utils.parseTransaction",
    description: "parses an encoded transaction into a transaction.",
    params: [ "encodedTx" ],
    descriptions: [
      "the encoded transaction bytes-like"
    ]
  },
  {
    name: "utils.randomBytes",
    description: "creates an array of cryptographically secure random bytes.",
    params: [ "length" ],
    defaults: [ 32 ],
    descriptions: [
      "the length of bytes to return"
    ]
  },
  {
    name: "utils.ripemd160",
    description: "compute the RIPEMD-160 hash of a bytes-like.",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "utils.sha256",
    description: "compute the SHA2-256 hash of a bytes-like.",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "utils.serializeTransaction",
    description: "serialize a transaction.",
    params: [ "transaction", "%signature" ],
    descriptions: [
      "the transaction properties",
      "the transaction signature; if omitted an unsigned transaction pre-image is returned"
    ]
  },
  {
    name: "utils.sha512",
    description: "compute the SHA2-512 hash of a bytes-like.",
    params: [ "bytesLike" ],
    descriptions: [
      "the bytes-like to hash"
    ]
  },
  {
    name: "utils.solidityKeccak256",
    description: "compute the Solidity keccak256 hash of the non-standard packed bytes for values of given types.",
    params: [ "types", "values" ],
    descriptions: [
      "an array of types (as strings)",
      "an array of values, each compatible with its corresponding type",
    ]
  },
  {
    name: "utils.solidityPack",
    description: "compute the Solidity non-standard packed bytes for values of given types.",
    params: [ "types", "values" ],
    descriptions: [
      "an array of types (as strings)",
      "an array of values, each compatible with its corresponding type",
    ]
  },
  {
    name: "utils.soliditySha256",
    description: "compute the Solidity SHA2-256 hash of the non-standard packed bytes for values of given types.",
    params: [ "types", "values" ],
    descriptions: [
      "an array of types (as strings)",
      "an array of values, each compatible with its corresponding type",
    ]
  },
  {
    name: "utils.toUtf8Bytes",
    description: "converts a string to its UTF-8 bytes.",
    params: [ "text" ],
    descriptions: [
      "the string to convert"
    ]
  },
  {
    name: "utils.toUtf8CodePoints",
    description: "converts a string to its UTF-8 code-points; each code-point is a single visible character.",
    params: [ "text" ],
    descriptions: [
      "the string to convert"
    ]
  },
  {
    name: "utils.toUtf8String",
    description: "converts UTF-8 bytes to a string.",
    params: [ "utf8Data" ],
    descriptions: [
      "the UTF-8 data to convert"
    ]
  },
  {
    name: "new Wallet",
    description: "creates an new Wallet from a private key.",
    params: [ "privateKey", "%provider" ],
    defaults: [ null, "$provider" ],
    descriptions: [
      "a 32 byte private key",
      "a provider to connect to"
    ]
  },
  {
    name: "Wallet.createRandom",
    description: "creates an new random Wallet.",
  },
  {
    name: "Wallet.fromMnemonic",
    description: "creates an new Wallet from a mnemonic.",
    params: [ "mnemonic", "%path", "%wordlist" ],
    defaults: [ null, ethers.utils.defaultPath, "en" ],
    descriptions: [
      "a mnemonic backup phrase; 12 - 24 words",
      `the HD path to derive (default: ${ JSON.stringify(ethers.utils.defaultPath) })`,
      "the Wordlist or locale string to use (default: \"en\")"
    ],
  },
];
