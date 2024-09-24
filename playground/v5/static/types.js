const Types = {
  ethers: {
    type: "object",
    values: {
      constants: ethers.constants,
      getDefaultProvider: find("getDefaultProvider"),
      providers: {
        AlchemyProvider: find("AlchemyProvider", [
          
        ]);
      }
    }
  }
};
