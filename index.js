import {
  restoreWallet,
  getSigningCosmWasmClient,
  getQueryClient,
} from "@sei-js/core";
import { calculateFee } from "@cosmjs/stargate";

export const RPC_URL = "https://sei-rpc.polkachu.com/";
export const REST_URL = "https://sei-api.polkachu.com/";
export const NETWORK = "pacific-1";

const mnemonic = "" // 这里填写助记词

const generateWalletFromMnemonic = async (m) => {
  const wallet = await restoreWallet(m, 0);
  return wallet;
};

const querySeiBalance = async (address) => {
  const queryClient = await getQueryClient(REST_URL);
  const result = await queryClient.cosmos.bank.v1beta1.balance({
    address: address,
    denom: "usei",
  });
  return result.balance;
};

async function main() {
  const wallet = await generateWalletFromMnemonic(mnemonic);
  const accounts = await wallet.getAccounts();
  const balance = await querySeiBalance(accounts[0].address);
  console.log(balance);
  const msg = {
    p: "sei-20",
    op: "mint",
    tick: "seis",
    amt: "1000",
  };
  const msg_base64 = btoa(`data:,${JSON.stringify(msg)}`);
  const fee = calculateFee(100000, "0.1usei");

  const signingCosmWasmClient = await getSigningCosmWasmClient(RPC_URL, wallet);

  for (let i = 0; i < 1000; i++) {
    try{
      const response = await signingCosmWasmClient.sendTokens(
        accounts[0].address,
        accounts[0].address,
        [{ amount: "1", denom: "usei" }],
        fee,
        msg_base64
      );
      console.log(response.transactionHash);
    }catch(err){
		  console.log('发生错误，第' + i + '次失败，继续下一次mint，错误信息: ' + err)
	  }	
  }
}

main();
