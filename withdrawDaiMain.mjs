import Web3 from "web3";
import EthTx from "ethereumjs-tx";
import cDaiContract from './cDaiContract';

// set up Web3 to use Infura as your web3 provider
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/[PROJECT_ID]"
  )
);

// declare const variables for your address and private key
const addressFrom = "[YOUR_ADDRESS]";
const privKey = "[YOUR_PRIVATE_KEY]";

// instantiate the cDai contract
const cDaiContractInstance = new web3.eth.Contract(
  JSON.parse(cDaiContract.cDaiContractAbi),
  cDaiContract.cDaiContractAddress
);

// declare a const variable to pass to the redeemUnderlying function of the cDai contract
const REDEEM_AMOUNT =  web3.utils.toHex(1 * 10 ** 18);

// create the encoded abi of the redeemUnderlying function
const redeemUnderlyingEncodedABI = cDaiContractInstance.methods
  .redeemUnderlying(REDEEM_AMOUNT)
  .encodeABI();

// declare the function to sign a transaction object and send it to the Ethereum network.
function sendSignedTx(transactionObject, cb) {
  let transaction = new EthTx(transactionObject);
  const privateKey = new Buffer.from(privKey, "hex");
  transaction.sign(privateKey);
  const serializedEthTx = transaction.serialize().toString("hex");
  web3.eth.sendSignedTransaction(`0x${serializedEthTx}`, cb);
}

// construct a transaction object and invoke the sendSignedTx function
web3.eth.getTransactionCount(addressFrom).then(transactionNonce => {
  const transactionObject = {
    chainId: 1,
    nonce: web3.utils.toHex(transactionNonce),
    gasLimit: web3.utils.toHex(400000),
    gasPrice: web3.utils.toHex(5000000000),
    to: cDaiContract.cDaiContractAddress,
    from: addressFrom,
    data: redeemUnderlyingEncodedABI
  };

  sendSignedTx(transactionObject, function(error, result){
    if(error) return console.log("error ===>", error);
    console.log("sent ===>", result);
  })
}
);
