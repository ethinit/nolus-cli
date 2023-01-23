import { ChainConstants, NolusClient, NolusWallet } from "@nolus/nolusjs";
import { Oracle } from "@nolus/nolusjs/build/contracts";
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { nolusOfflineSigner } from "@nolus/nolusjs/build/wallet/NolusWalletFactory";
import { fromHex } from '@cosmjs/encoding';

const config = require("../config.json");

NolusClient.setInstance(config.tendermintRpc);

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

    private oracle: Promise<Oracle>;
    getOracle(): Promise<Oracle> {
        if (typeof this.oracle === "undefined") {
            this.oracle = this.getCosmWasmClient().then(cosmWasmClient => new Oracle(cosmWasmClient, config.contracts.oracle));
        }

        return this.oracle;
    }

    getNolusClient() {
        return NolusClient.getInstance();
    }

    getCosmWasmClient(): Promise<CosmWasmClient> {
        return this.getNolusClient().getCosmWasmClient();
    }
}






export { NolusHelper, config };
