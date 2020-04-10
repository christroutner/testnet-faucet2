/*
  Mocks for the wallet library unit tests.
*/

'use strict'

const utxos = [
  {
    txid: '5e74ef15bc2a1a04b958a816caa08be6fade1e1f93c046dfafcfcb43f38876ff',
    vout: 0,
    value: '60000',
    height: 1371612,
    confirmations: 407,
    satoshis: 60000
  },
  {
    txid: 'b7b9dc934920f4cd3ac89c926c170d6048c45045780c0c623d460da694972fc9',
    vout: 0,
    value: '51717788985',
    height: 1369918,
    confirmations: 2101,
    satoshis: 51717788985
  },
  {
    txid: 'd46dd0ec9eb60548566a1cc0029f20c0009c57fa9fb809ddbb697278551612fa',
    vout: 0,
    value: '11586776',
    height: 1369894,
    confirmations: 2125,
    satoshis: 11586776
  },
  {
    txid: '715c9d7232dfec13af29db0940f0e20cbd5aca6fd0fa4a8e07f20b030bc1cf21',
    vout: 1,
    value: '13000',
    height: 1369890,
    confirmations: 2129,
    satoshis: 13000
  }
]

const biggestUtxo = {
  txid: 'b7b9dc934920f4cd3ac89c926c170d6048c45045780c0c623d460da694972fc9',
  vout: 0,
  value: '51717788985',
  height: 1369918,
  confirmations: 2101,
  satoshis: 51717788985
}

const testWallet = {
  mnemonic: 'fish fish fish fish fish fish fish fish fish fish fish fish',
  cashAddress: 'bchtest:qqmd9unmhkpx4pkmr6fkrr8rm6y77vckjvqe8aey35',
  legacyAddress: 'mkWqVHGbfpznuu3JpPoXfCnHrhoekJLUGu'
}

module.exports = {
  utxos,
  biggestUtxo,
  testWallet
}
