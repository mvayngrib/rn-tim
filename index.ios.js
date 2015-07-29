/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

require('./shim')

var React = require('react-native');
var Tim = require('tim')
var Identity = require('midentity').Identity
var tedPub = require('./test/fixtures/ted-pub.json')
var tedPriv = require('./test/fixtures/ted-priv.json')
var leveldown = require('asyncstorage-down')
// var Keeper = require('bitkeeper-js')
var Wallet = require('simple-wallet')
var help = require('tradle-test-helpers')
var fakeKeeper = help.fakeKeeper
var fakeWallet = help.fakeWallet
var DHT = require('bittorrent-dht')

var networkName = 'testnet'
var tedIdent = Identity.fromJSON(tedPub)
var tedWallet = walletFor(tedPriv, null, 'messaging')
var dht = dhtFor(tedIdent)
var ted = new Tim({
  pathPrefix: 'ted',
  leveldown: leveldown,
  // syncInterval: 1000,
  networkName: networkName,
  blockchain: tedWallet.blockchain,
  dht: dht,
  // keeper: new Keeper({
  //   dht: dht
  // }),
  keeper: fakeKeeper.empty(),
  wallet: tedWallet,
  identity: tedIdent,
  identityKeys: tedPriv,
  port: 12345
})

ted.once('ready', console.log.bind(console, 'ready'))

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var rnnode = React.createClass({
  // componentWillMount: function () {
  // }
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('rnnode', () => rnnode);

function dhtFor (identity) {
  return new DHT({
    nodeId: nodeIdFor(identity),
    bootstrap: false
    // ,
    // bootstrap: ['tradle.io:25778']
  })
}

function nodeIdFor (identity) {
  var buf = new Buffer(identity.keys({ type: 'dsa' })[0].fingerprint(), 'base64')
  return buf.slice(0, 20)
  // return crypto.createHash('sha256')
  //   .update(identity.keys({ type: 'dsa' })[0].fingerprint())
  //   .digest()
  //   .slice(0, 20)
}

function walletFor (keys, blockchain, purpose) {
  return fakeWallet({
    blockchain: blockchain,
    unspents: [100000, 100000, 100000, 100000],
    priv: find(keys, function (k) {
      return k.type === 'bitcoin' &&
        k.networkName === networkName &&
        k.purpose === purpose
    }).priv
  })
}

function rethrow (err) {
  if (err) throw err
}
