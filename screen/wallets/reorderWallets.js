import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, ActivityIndicator, Image, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { BluePrivateBalance } from '../../BlueComponents';
import SortableList from 'react-native-sortable-list';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useTheme } from '@react-navigation/native';

import navigationStyle from '../../components/navigationStyle';
import { 
  LightningCustodianWallet, 
  MultisigHDWallet, 
  PlaceholderWallet, 
  HDLegacyP2PKHWallet, 
  HDSegwitBech32Wallet, 
  HDSegwitP2SHWallet,
  LegacyWallet,
  SegwitBech32Wallet,
  SegwitP2SHWallet,  
} from '../../class';
import WalletGradient from '../../class/wallet-gradient';
import loc, { formatBalance, transactionTimeToReadable } from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    paddingTop: 20,
  },
  root: {
    flex: 1,
  },
  itemRoot: {
    backgroundColor: 'transparent',
    padding: 10,
    marginVertical: 17,
  },
  gradient: {
    padding: 15,
    borderRadius: 10,
    minHeight: 164,
    elevation: 5,
  },
  image: {
    width: 99,
    height: 94,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
image_top_corner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
  },
  transparentText: {
    backgroundColor: 'transparent',
  },
  label: {
    backgroundColor: 'transparent',
    fontSize: 19,
    color: '#fff',
  },
  balance: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    fontSize: 36,
    color: '#fff',
  },
  latestTxLabel: {
    backgroundColor: 'transparent',
    fontSize: 13,
    color: '#fff',
  },
  latestTxValue: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});

const ReorderWallets = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [hasMovedARow, setHasMovedARow] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const sortableList = useRef();
  const { setParams, goBack } = useNavigation();
  const { colors } = useTheme();
  const { wallets, setWalletsWithNewOrder } = useContext(BlueStorageContext);
  const stylesHook = {
    root: {
      backgroundColor: 'transparent',
    },
    loading: {
      backgroundColor: colors.elevated,
    },
  };

  useEffect(() => {
    setParams(
      {
        customCloseButtonFunction: async () => {
          if (sortableList.current.state.data.length === data.length && hasMovedARow) {
            const newWalletsOrderArray = [];
            sortableList.current.state.order.forEach(element => {
              newWalletsOrderArray.push(data[element]);
            });
            setWalletsWithNewOrder(newWalletsOrderArray);
            goBack();
          } else {
            goBack();
          }
        },
      },
      [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goBack, hasMovedARow, setParams]);

  useEffect(() => {
    const loadWallets = wallets.filter(wallet => wallet.type !== PlaceholderWallet.type);
    setData(loadWallets);
    setIsLoading(false);
  }, [wallets]);

  const renderItem = (item, _active) => {
    if (!item.data) {
      return;
    }
    item = item.data;

    return (
      <View shadowOpacity={40 / 100} shadowOffset={{ width: 0, height: 0 }} shadowRadius={5} style={styles.itemRoot}>
        <LinearGradient shadowColor="#000000" start={{x: 2, y: 0}} colors={WalletGradient.gradientsFor(item.type)} style={styles.gradient}>
          <Image
            source={(() => {
              switch (item.type) {
                case HDLegacyP2PKHWallet.type:
                  return require('../../img/card_sun.png');
                case HDSegwitP2SHWallet.type:
                  return require('../../img/card_sun2.png');
                case HDSegwitBech32Wallet.type:
                  return require('../../img/card_sun3.png');
                case LegacyWallet.type:
                  return require('../../img/card_sun4.png');
                case SegwitP2SHWallet.type:
                  return require('../../img/card_sun5.png');
                case SegwitBech32Wallet.type:
                  return require('../../img/card_sun6.png');
              }
            })()}
            style={styles.image_top_corner}
          />
          <Image
            source={(() => {
              switch (item.type) {
                case LightningCustodianWallet.type:
                  return require('../../img/lnd-shape.png');
                case MultisigHDWallet.type:
                  return require('../../img/vault-shape.png');
                default:
                  return require('../../img/btc-shape.png');
              }
            })()}
            style={styles.image}
          />

          <Text style={styles.transparentText} />
          <Text numberOfLines={1} style={styles.label}>
            {item.getLabel()}
          </Text>
          {item.hideBalance ? (
            <BluePrivateBalance />
          ) : (
            <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balance}>
              {formatBalance(Number(item.getBalance()), item.getPreferredBalanceUnit(), true)}
            </Text>
          )}
          <Text style={styles.transparentText} />
          <Text numberOfLines={1} style={styles.latestTxLabel}>
            {loc.wallets.list_latest_transaction}
          </Text>
          <Text numberOfLines={1} style={styles.latestTxValue}>
            {transactionTimeToReadable(item.getLatestTransactionTime())}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const onChangeOrder = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', { ignoreAndroidSystemSettings: false });
    setHasMovedARow(true);
  };

  const onActivateRow = () => {
    ReactNativeHapticFeedback.trigger('selection', { ignoreAndroidSystemSettings: false });
    setScrollEnabled(false);
  };

  const onReleaseRow = () => {
    ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
    setScrollEnabled(true);
  };

  return isLoading ? (
    <View style={[styles.loading, stylesHook.loading]}>
      <ActivityIndicator />
    </View>
  ) : (
    <LinearGradient colors={['rgba(95, 88, 84, .18)', '#ffffff']} style={{flex:1}}>
    <View style={[styles.root, stylesHook.root]}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="rgba(95, 88, 84, .18)"
      />
      <ScrollView scrollEnabled={scrollEnabled}>
        <SortableList
          ref={sortableList}
          data={data}
          renderRow={renderItem}
          scrollEnabled={false}
          onChangeOrder={onChangeOrder}
          onActivateRow={onActivateRow}
          onReleaseRow={onReleaseRow}
        />
      </ScrollView>
    </View>
    </LinearGradient>
  );
};

ReorderWallets.navigationOptions = navigationStyle({
  title: loc.wallets.reorder_title,
  closeButton: true,
  closeButtonFunc: ({ navigation, route }) => {
    if (route.params && route.params.customCloseButtonFunction) {
      route.params.customCloseButtonFunction();
    }
  },
  headerLeft: null,
});

export default ReorderWallets;
