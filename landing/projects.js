const Projects = [{
/* Wait for a GitHub project?
  image: "holdberg.jpg",
  name: "Holdbeg Financial",
  url: "https://github.com/hodlberg",
  score: 1
},{
  image: "unknown_whalestats.svg",
  name: "Whalestats",
  url: "",
  score: 0
},{
  image: "",
  name: "",
  url: "",
  score: 
}, {
*/
  image: "mdtanrikulu_use-metamask.svg",
  name: "useMetamask",
  url: "https://github.com/mdtanrikulu/use-metamask",
  score: 47
},{
  image: "rkalis_allbastards-com.png",
  name: "AllBastards",
  url: "https://github.com/rkalis/allbastards.com",
  score: 7
},{
  image: "alphawallet_.jpg",
  name: "AlphaWallet",
  url: "https://github.com/AlphaWallet/",
  score: 204
},{
  image: "bokkypoobah_BestBastardGANPunks.png",
  name: "BestBastardGANPunks",
  url: "https://github.com/bokkypoobah/BestBastardGANPunks",
  score: 1
},{
  image: "compound-finance_compound-js.svg",
  name: "Compound.js",
  url: "https://github.com/compound-finance/compound-js",
  score: 91
},{
  image: "ensdomains_ens-app.svg",
  name: "ENS App",
  url: "https://github.com/ensdomains/ens-app",
  score: 79
},{
  image: "ethereum-optimism_optimism.svg",
  name: "Optimism",
  url: "https://github.com/ethereum-optimism/optimism",
  score: 507
},{
  image: "forta-protocol_forta-agent-sdk.jpg",
  name: "Forta",
  url: "https://github.com/forta-protocol/forta-agent-sdk",
  score: 25
},{
  image: "mycryptohq_mycrypto.png",
  name: "MyCrypto",
  url: "https://github.com/MyCryptoHQ/MyCrypto",
  score: 968
},{
  image: "nachomazzara_web3playground.jpg",
  name: "Web3 Playground",
  url: "https://github.com/nachomazzara/web3playground",
  score: 20
},{
  image: "nanexcool_daistats.png",
  name: "Daistats",
  url: "https://github.com/nanexcool/daistats",
  score: 57
},{
  image: "rkalis_revoke-cash.png",
  name: "Revoke",
  url: "https://github.com/rkalis/revoke.cash",
  score: 73
},{
  image: "austintgriffith_scaffold-eth.png",
  name: "Scaffold-ETH",
  url: "https://github.com/austintgriffith/scaffold-eth",
  score: 2200
},{
  image: "statechannels_statechannels.svg",
  name: "State Channels",
  url: "https://github.com/statechannels/statechannels",
  score: 101
},{
  image: "wallet3_wallet3.png",
  name: "Wallet3",
  url: "https://github.com/Wallet3/Wallet3",
  score: 0
},{
  image: "scopelift_umbra-protocol.png",
  name: "Umbra",
  url: "https://github.com/ScopeLift/umbra-protocol",
  score: 87
},{
  image: "tallycash_extension.jpg",
  name: "Tally.cash",
  url: "https://github.com/tallycash/extension",
  score: 315
},{
  image: "unlock-protocol_unlock.png",
  name: "Unlock",
  url: "https://github.com/unlock-protocol/unlock/",
  score: 434
},{
  image: "wighawag_mandalas.png",
  name: "Mandalas",
  url: "https://github.com/wighawag/mandalas",
  score: 2
},{
  image: "wmitsuda_otterscan.png",
  name: "Otterscan",
  url: "https://github.com/wmitsuda/otterscan",
  score: 118
}].sort((a, b) => (b.score - a.score)).map((p) => {
  p.image = "projects/" + p.image;
  return p;
});
