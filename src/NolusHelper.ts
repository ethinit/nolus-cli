import { ChainConstants, NolusClient, NolusContracts, NolusWallet } from "@nolus/nolusjs";
import { Lpp, Oracle, Treasury } from "@nolus/nolusjs/build/contracts";
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { nolusOfflineSigner } from "@nolus/nolusjs/build/wallet/NolusWalletFactory";
import { fromHex } from '@cosmjs/encoding';
import { Buffer } from "buffer";
import { Hash } from "@keplr-wallet/crypto";
import { prompt } from 'inquirer';

const config = require("../config.json");

NolusClient.setInstance(config.tendermintRpc);

interface Coin {
    denom: string,
    symbol: string,
    decimal_digits: number
}

const NolusHelper = new class {
    public amountFormatter = new Intl.NumberFormat("en-US", {
        style: "decimal",
        useGrouping: true,
        maximumFractionDigits: 8,
        minimumFractionDigits: 2
    });

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

    private treasury: Promise<Treasury>;
    getTreasury(): Promise<Treasury> {
        if (typeof this.treasury === "undefined") {
            this.treasury = this.getCosmWasmClient().then(cosmWasmClient => new Treasury(cosmWasmClient, config.contracts.treasury));
        }

        return this.treasury;
    }

    private lpp: Promise<Lpp>;
    getLpp(): Promise<Lpp> {
        if (typeof this.lpp === "undefined") {
            this.lpp = this.getCosmWasmClient().then(cosmWasmClient => new Lpp(cosmWasmClient, config.contracts.lpp));
        }

        return this.lpp;
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

    private _coins: Coin[];
    getCoins(): Coin[] {
        if (this._coins) {
            return this._coins;
        }

        this._coins = [];
        this.config.coins.forEach(coin => {
            this._coins.push({
                denom: this.makeIBCMinimalDenom(coin.ibc_route, coin.minimal_denom),
                symbol: coin.symbol,
                decimal_digits: coin.decimal_digits
            })
        });

        return this._coins;
    }

    getCoinBySymbol(symbol: string): Coin | undefined {
        const coins: Coin[] = this.getCoins();
        for (let i in coins) {
            const coin = coins[i];

            if (coin.symbol.toUpperCase() === symbol.toUpperCase()) {
                return coin;
            }
        }

    }

    async promptAccount(msg: string = "Select account"): Promise<NolusWallet> {
        let accounts = [];
        for (let accountName in NolusHelper.config.keys) {
            accounts.push({ name: accountName, value: NolusHelper.config.keys[accountName] });
        }

        const { account } = await prompt([
            {
                type: 'list',
                name: 'account',
                message: msg,
                choices: accounts
            }
        ]);

        return await this.getWallet(account);
    }

    async getCoinsAmounts(address: string, coins: Coin[]): Promise<{ coin: Coin, amount: number }[]> {
        let response = [];
        for (let i in coins) {
            const coin: Coin = coins[i];
            const { amount } = await NolusClient.getInstance().getBalance(address, coin.denom);
            response.push({
                coin: coin,
                amount: amount
            })
        }

        return response;
    }
}

export { NolusHelper, Coin }