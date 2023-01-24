import { ChainConstants, NolusClient, NolusWallet } from "@nolus/nolusjs";
import { Oracle } from "@nolus/nolusjs/build/contracts";
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { nolusOfflineSigner } from "@nolus/nolusjs/build/wallet/NolusWalletFactory";
import { fromHex } from '@cosmjs/encoding';
import { Buffer } from "buffer";
import { Hash } from "@keplr-wallet/crypto";

const config = require("../config.json");

NolusClient.setInstance(config.tendermintRpc);

interface Coin {
    denom: string,
    symbol: string,
    decimal_digits: number
}

const NolusHelper = new class {
    async getWallet(privateKey: string): Promise<NolusWallet> {
        const offlineSigner = await DirectSecp256k1Wallet.fromKey(
            fromHex(privateKey),
            ChainConstants.BECH32_PREFIX_ACC_ADDR,
        );
        const nolusWallet = await nolusOfflineSigner(offlineSigner);
        nolusWallet.useAccount();
        return nolusWallet;
    }

    get config() {
        return config;
    }

    private oracle: Promise<Oracle>;
    getOracle(): Promise<Oracle> {
        if (typeof this.oracle === "undefined") {
            this.oracle = this.getCosmWasmClient().then(cosmWasmClient => new Oracle(cosmWasmClient, config.contracts.oracle));
        }

        return this.oracle;
    }


    getCosmWasmClient(): Promise<CosmWasmClient> {
        return NolusClient.getInstance().getCosmWasmClient();
    }

    makeIBCMinimalDenom(sourceChannelId: string[], coinMinimalDenom: string): string {
        if (sourceChannelId.length == 0) {
            return coinMinimalDenom;
        }

        return (
            "ibc/" +
            Buffer.from(Hash.sha256(Buffer.from(sourceChannelId.reduce((a, b) => a += `transfer/${b}/`, "") + coinMinimalDenom)))
                .toString("hex")
                .toUpperCase()
        );
    }

    getCoins(): Coin[] {

        let coins: Coin[] = [];
        this.config.coins.forEach(coin => {
            coins.push({
                denom: this.makeIBCMinimalDenom(coin.ibc_route, coin.minimal_denom),
                symbol: coin.symbol,
                decimal_digits: coin.decimal_digits
            })
        });

        return coins;
    }
    /*
        get currencies () {
    
        }
    
    
        for (const key in CURRENCIES.currencies) {
            const currency =
              CURRENCIES.currencies[key as keyof typeof CURRENCIES.currencies];
            const ibcDenom = AssetUtils.makeIBCMinimalDenom(
              currency.ibc_route,
              currency.symbol
            );
            ibcBalances.push(
              NolusClient.getInstance()
                .getBalance(walletAddress, ibcDenom)
                .then((item) => {
                  const data = {
                    ticker: key,
                    name: currency.name,
                    symbol: currency.symbol,
                    decimal_digits: currency.decimal_digits,
                    groups: currency.groups,
                    swap_routes: currency.swap_routes,
                  };
                  this.currencies[ibcDenom] = data;
                  return {
                    balance: CurrencyUtils.convertCosmosCoinToKeplCoin(item),
                  };
                })
            );
          }
          this.balances = await Promise.all(ibcBalances);
          */
}

export { NolusHelper, Coin }