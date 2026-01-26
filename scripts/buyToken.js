const { ethers } = require("ethers");
const TokenFactoryAbi = require("../constant/TokenFactory.json");

const mint = "0xc8b12db859e5b701d4aa12610924ec8caa011818";
const amount = "0.01";
const rpcUrl = "https://delicate-old-breeze.bsc-testnet.quiknode.pro/4e8edc72f64856f8e8fa3377a81c9f3a1f6b5dee/";
const privateKey = "b215e5d9a6a70cc091495c8e4d1aad8afae4927d3db48f50f4457600eb90849e";
const tokenFactoryAddress = "0x17de68f0b56896C604B042daeecF22e1Ea022fe2";

if (!rpcUrl || !privateKey || !tokenFactoryAddress) {
  console.error("Missing script config. Please set rpcUrl, privateKey, tokenFactoryAddress.");
  process.exit(1);
}

const now = () => new Date().toLocaleString();

const run = async () => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(tokenFactoryAddress, TokenFactoryAbi.abi ?? TokenFactoryAbi, wallet);

  console.log(`[${now()}] Estimating gas...`);
  const amountWei = ethers.parseUnits(amount, 18);
  const minAmountOut = 0n;
  const gasPrice = ethers.parseUnits("3", "gwei");
  const estimatedGas = await contract.buyToken.estimateGas(mint, amountWei, minAmountOut, {
    value: amountWei,
    ...(gasPrice ? { gasPrice } : {}),
  });
  const gasLimit = (estimatedGas * 12n) / 10n;

  console.log(`[${now()}] Submitting tx...`);
  const tx = await contract.buyToken(mint, amountWei, minAmountOut, {
    value: amountWei,
    gasLimit,
    ...(gasPrice ? { gasPrice } : {}),
  });
  console.log(`[${now()}] buyToken submitted:`, tx.hash);
  console.log(`[${now()}] Waiting for confirmation...`);
  const receipt = await tx.wait();
  console.log(`[${now()}] buyToken confirmed:`, receipt?.transactionHash ?? tx.hash);
  if (receipt?.gasUsed) {
    const gasPriceUsed = receipt.effectiveGasPrice ?? receipt.gasPrice ?? tx.gasPrice;
    if (gasPriceUsed) {
      const feeWei = receipt.gasUsed * gasPriceUsed;
      const feeBnb = ethers.formatEther(feeWei);
      console.log(`[${now()}] Gas fee (BNB):`, feeBnb);
    } else {
      console.log(`[${now()}] Gas fee: unavailable (missing gas price)`);
    }
  }
};

run().catch((error) => {
  console.error("buyToken failed:", error);
  process.exit(1);
});
