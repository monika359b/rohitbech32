/* eslint-disable no-await-in-loop */
const DigiByte = require('digibyte');
const ltc = require('bitcore-lib-ltc');
const Doge = require('bitcore-lib-doge');
const LTC = require('bitcore-lib-ltc');
const { default: axios } = require('axios');
const { getRequestHeaders } = require('./get-request-headers');
const getApiKey = '9f66cdb9-742b-402c-8b72-f99c9b02cdc2'
class DigiByteService {
  UTXO_ENDPOINT_3= 'https://doge.nownodes.io/api/v2/utxo';

  ADDRESS_ENDPOINT_3 = 'https://doge.nownodes.io/api/v2/address';

  JSON_RPC_ENDPOINT_3 = 'https://doge.nownodes.io';

  TRANSACTION_ENDPOINT_3 = 'https://doge.nownodes.io/api/v2/tx';
  
  MINER_2 = 7200000

  SAT_IN_DOGE = 100000000;

  FEE_TO_SEND_DOGE = 0.0000553 * this.SAT_IN_DOGE;

  MINER_FEE_3 = 4000;

  UTXO_ENDPOINT_2 = 'https://ltc.nownodes.io/api/v2/utxo';

  ADDRESS_ENDPOINT_2 = 'https://ltc.nownodes.io/api/v2/address';

  JSON_RPC_ENDPOINT_2 = 'https://ltc.nownodes.io';

  TRANSACTION_ENDPOINT_2 = 'https://ltc.nownodes.io/api/v2/tx';
  
  MINER = 7200000

  SAT_IN_LTC = 100000000;

  FEE_TO_SEND_LTC = 0.0000073 * this.SAT_IN_LTC;

  MINER_FEE_2 = 2500;

  UTXO_ENDPOINT = 'https://dgb.nownodes.io/api/v2/utxo';

  ADDRESS_ENDPOINT = 'https://dgb.nownodes.io/api/v2/address';

  JSON_RPC_ENDPOINT = 'https://dgb.nownodes.io';

  TRANSACTION_ENDPOINT = 'https://dgb.nownodes.io/api/v2/tx';

  SAT_IN_DGB = 100000000;

  FEE_TO_SEND_DGB = 0.0000553 * this.SAT_IN_DGB;

  MINER_FEE = 2000;

  TRANSACTIONS_RECEIVE_INTERVAL = 20;

  TRANSACTIONS_RECEIVE_TIMEOUT = 1000;

 async sendDogee(serializedTransaction) {
    const payload = {
      API_key: getApiKey,
      jsonrpc: '2.0',
      id: 'test',
      method: 'sendrawtransaction',
      params: [
        serializedTransaction,
      ],
    };
    const response = await axios.post(this.JSON_RPC_ENDPOINT_3, payload);
    const resultData = await response.data;
    return resultData;
  }
  async createTxDoge(privateKey, origin, destination, manualAmount = 0) {
    const pk = new Doge.PrivateKey(privateKey);
    let utxos = await this.getUtxos3(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount += +utxo.value;
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_DOGE);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: Doge.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_DOGE,
    }));

    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_DOGE;
    }

    return new Doge.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE_3)
      .change(origin)
      .sign(pk);
  }
  async depositDoge(address, my_address, privateKey,amount) {
    const transaction = await this.createTxDoge(privateKey, my_address, address, amount);
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendDogee(serializedTransaction,my_address, privateKey);
    return transactionResult;
  }
  async getWalletBalanceLTC(address) {
    const balanceResponse = await axios.get(
      `${this.ADDRESS_ENDPOINT_2}/${address}`,
      getRequestHeaders(),
    );
    const { data: balanceData } = await balanceResponse;
    const balanceInSatoshi = balanceData?.balance;
    return balanceInSatoshi ? (balanceInSatoshi / this.SAT) : 0;
  }
  async getWalletBalanceDoge(address) {
    const balanceResponse = await axios.get(
      `${this.ADDRESS_ENDPOINT_3}/${address}`,
      getRequestHeaders(),
    );
    const { data: balanceData } = await balanceResponse;
    const balanceInSatoshi = balanceData?.balance;
    return balanceInSatoshi ? (balanceInSatoshi / this.SAT) : 0;
  }
  async createTxLTC(privateKey, origin, destination, manualAmount = 0) {
    const pk = new ltc.PrivateKey(privateKey);
    let utxos = await this.getUtxos2(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount += +utxo.value;
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_LTC);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: ltc.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_LTC,
    }));

    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_LTC;
    }

    return new ltc.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE_2)
      .change(origin)
      .sign(pk);
  }
  async depositLTC(address, my_address, privateKey,amount) {
    const transaction = await this.createTxLTC(privateKey, my_address, address, amount);
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendLTCC(serializedTransaction,my_address, privateKey);
    return transactionResult;
  }
  static getNewWallet() {
    const wallet = DigiByte.PrivateKey();
    return {
      address: wallet.toAddress().toString(),
      privateKey: wallet.toWIF(),
    };
  }
  
  static getWalletDoge() {
    const wallet = Doge.PrivateKey();
    return {
      address: wallet.toAddress().toString(),
      privateKey: wallet.toWIF(),
};
  }
  static getWallet() {
    const wallet = ltc.PrivateKey();
    var publiy = wallet.toPublicKey();
    return {
      address: wallet.toAddress().toString(),
      privateKey: wallet.toWIF(),
};
  }
  async getUtxos2(address) {
   const utxoResponse = await axios.get(
    'https://litecoinblockexplorer.net/api/v2/utxo/'+address 
    );
    const { data: utxos } = await utxoResponse;
    return utxos;
  }
  async getUtxos3(address) {
    const utxoResponse = await axios.get(
      `${this.UTXO_ENDPOINT_3}/${address}?confirmed=true`,
      getRequestHeaders(),
    );
    const { data: utxos } = await utxoResponse;
    return utxos;
  }
  async getUtxos(address) {
    const utxoResponse = await axios.get(
    'https://digiexplorer.info/api/v2/utxo/'+address 
    );
    const { data: utxos } = await utxoResponse;
    return utxos;
  }
  async getbalance(address) {
    var address = DigiByte.PrivateKey(address).toAddress().toString();
    return address
}
async sendLTCC(serializedTransaction) {
  const payload = {
    API_key: getApiKey,
    jsonrpc: '2.0',
    id: 'test',
    method: 'sendrawtransaction',
    params: [
      serializedTransaction,
    ],
  };
  const response = await axios.post(this.JSON_RPC_ENDPOINT_2, payload);
  const resultData = await response.data;
  return resultData;
}

static getac() {
    var value = new Buffer('correct horse battery staple');
    var hash = litecore.crypto.Hash.sha256(value);
    var bn = litecore.crypto.BN.fromBuffer(hash);
    var addres = new litecore.PrivateKey(bn)   
    return {
      address: addres.toAddress().toString(),
      privateKey: addres.toWIF(),
    };
}
  async getseed(phrase) {
    var address = phrase
    var value = new Buffer(address);
    var litecore = DigiByte 
    var hash = litecore.crypto.Hash.sha256(value);
    var bn = litecore.crypto.BN.fromBuffer(hash);
    var addres = new litecore.PrivateKey(bn)   
    return {
      address: addres.toAddress().toString() ,
      privateKey: addres.toWIF(),
    };
}
  async getkey(address) {
    var wif = address
    var address = new DigiByte.PrivateKey(wif).toAddress().toString();
    var imported = DigiByte.PrivateKey.fromWIF(  wif  );
    console.log("WIF = " + wif);
    console.log("Address = " + imported.toAddress().toString());
    console.log('Priv = ' + imported.toString());
    return {Address:address,WIF:imported.toString()};
}
  async createTx(privateKey, origin, destination, manualAmount = 0) {
    const pk = new DigiByte.PrivateKey(privateKey);
    let utxos = await this.getUtxos(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount += +utxo.value;
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_DGB);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: DigiByte.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_DGB,
    }));

    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no manual amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_DGB;
    }

    return new DigiByte.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE)
      .change(origin)
      .sign(pk);
  }
  async deposit(address, my_address, privateKey,amount) {
    const transaction = await this.createTx(privateKey, my_address, address, amount);
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendRawTx(serializedTransaction,my_address, privateKey);
    return transactionResult;
  }
  
  async sendLTC(address, my_address, privateKey, amount) {
    const transaction = await this.createLTC(privateKey, my_address, address, amount);
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendRx22(serializedTransaction);
    return transactionResult;
  }
  async sendDoge(address, my_address, privateKey, amount) {
    const transaction = await this.createDoge(privateKey, my_address, address, amount);
    const serializedTransaction = transaction.serialize(true);
    const transactionResult = await this.sendDogee(serializedTransaction);
    return transactionResult;
  }
  async createTransaction(privateKey, origin, destination, manualAmount = amount) {
    const pk = new DigiByte.PrivateKey(privateKey);
    const amount = manualAmount
    let utxos = await this.getUtxos(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount = amount
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_DGB);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: DigiByte.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_DGB,
    }));
    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no manual amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_DGB;
    }

    return new DigiByte.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE)
      .change(origin)
      .sign(pk);
  }
  async createLTC(privateKey, origin, destination, manualAmount = amount) {
    const pk = new ltc.PrivateKey(privateKey);
    const amount = manualAmount
    let utxos = await this.getUtxos2(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount = amount
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_LTC);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: LTC.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_LTC,
    }));
    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no manual amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_LTC;
    }

    return new LTC.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE_2)
      .change(origin)
      .sign(pk);
  }
  async createDoge(privateKey, origin, destination, manualAmount = amount) {
    const pk = new Doge.PrivateKey(privateKey);
    const amount = manualAmount
    let utxos = await this.getUtxos3(origin);
    let transactionAmount = 0;

    if (!manualAmount) {
      utxos.forEach((utxo) => {
        transactionAmount = amount
      });
    } else {
      transactionAmount = +(manualAmount * this.SAT_IN_DOGE);
    }

    utxos = utxos.map((utxo) => ({
      txId: utxo.txid,
      vout: +utxo.vout,
      address: origin,
      scriptPubKey: Doge.Script.fromAddress(origin),
      amount: parseFloat(utxo.value) / this.SAT_IN_DOGE,
    }));
    if (!transactionAmount) {
      throw new Error('Not enough balance');
    }
    transactionAmount = transactionAmount.toFixed(0);
    transactionAmount = +transactionAmount;

    // if there's no amount we're passing all utxos, so we subtract the fee ourselves
    if (!manualAmount) {
      transactionAmount -= this.FEE_TO_SEND_DOGE;
    }

    return new Doge.Transaction()
      .from(utxos)
      .to(destination, transactionAmount)
      .fee(this.MINER_FEE_3)
      .change(origin)
      .sign(pk);
  }
  async getWalletBalance(address) {
    const balanceResponse = await axios.get(
      `${this.ADDRESS_ENDPOINT}/${address}`,
      getRequestHeaders(),
    );
    const { data: balanceData } = await balanceResponse;
    const balanceInSatoshi = balanceData?.balance;
    return balanceInSatoshi ? (balanceInSatoshi / this.SAT_IN_DGB) : 0;
  }
   async sendRx22(serializedTransaction) {
    const response = await axios.get('https://litecoinblockexplorer.net/api/sendtx/'+serializedTransaction);
    const resultData = await response;
    return resultData;
  }
  async sendRx(serializedTransaction) {
    const response = await axios.get('https://digiexplorer.info/api/sendtx/'+serializedTransaction);
    const resultData = await response;
    return resultData;
  }
  async sendTransaction(address, my_address, privateKey, amount) {
    const transaction = await this.createTransaction(privateKey, my_address, address, amount);
    console.log(transaction)
const serializedTransaction = transaction.serialize(true);
console.log(serializedTransaction)
    return serializedTransaction;
  }

  async sendRawTx(serializedTransaction) {
    const payload = {
      API_key: getApiKey,
      jsonrpc: '2.0',
      id: 'test',
      method: 'sendrawtransaction',
      params: [
        serializedTransaction,
      ],
    };
    const response = await axios.post(this.JSON_RPC_ENDPOINT, payload);
    const resultData = await response.data;
    return resultData;
  }

  async getIncommingTransactions(address, itemsCount = 50) {
    // eslint-disable-next-line no-promise-executor-return
    const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const response = await axios.get(
      `${this.ADDRESS_ENDPOINT}/${address}`,
      getRequestHeaders(),
    );

    const { data: addressResult } = await response;
    const { txids: transactionIds } = addressResult;

    if (!transactionIds) {
      return [];
    }

    const lastTransactionIds = transactionIds.slice(0, itemsCount);
    const transactionResult = [];
    const transactionsObservables = lastTransactionIds.map((transactionId) => axios.get(`${this.TRANSACTION_ENDPOINT}/${transactionId}`, getRequestHeaders()));

    for (let i = 0; i < transactionsObservables.length; i += 1) {
      if (i % this.TRANSACTIONS_RECEIVE_INTERVAL === 0) {
        await snooze(this.TRANSACTIONS_RECEIVE_TIMEOUT);
      }
      const transactionResulItem = await transactionsObservables[i];
      transactionResult.push(transactionResulItem);
    }

    const transactionResultData = await Promise.all(
      transactionResult.map((t) => t.data),
    );

    const result = transactionResultData.filter((transaction) => {
      const vin = transaction.vin.find(
        (vInItem) => vInItem.addresses.some((inAddress) => inAddress === address),
      );
      return !vin;
    });
    return result;
  }
}

module.exports = { DigiByteService };
