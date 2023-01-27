import { NolusWallet } from '@nolus/nolusjs';
import { OraclePriceConfig } from '@nolus/nolusjs/build/contracts';
import { prompt } from 'inquirer';
import { Coin, NolusHelper } from '../NolusHelper';
import { MenuUtil } from './util';
const inquirer = require('inquirer');


class MenuOracle {
    private displayOracleError(error: string) {
        let match = error.toString().match(/(\[Oracle\]|oracle::msg::ExecuteMsg:) (.*?): execute wasm contract failed/);
        if (match) {
            console.error("Oracle Contract Error: " + match[2]);
        } else {
            console.error(error);
        }
    }

    async show() {
        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Oracle Contract]',
                    choices: [
                        { name: 'Config', value: 'config' },
                        { name: 'Feeders', value: 'feeders' },
                        { name: 'Prices', value: 'prices' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }

            if (menuChoice === 'config') {
                await this.showConfig();
            }
            else if (menuChoice === 'feeders') {
                await this.showFeeders();
            }
            else if (menuChoice === 'prices') {
                await this.showPrices();
            }
        }
    }

    async showConfig() {
        const oracle = await NolusHelper.getOracle();
        const contractsOwnerWallet: NolusWallet = await NolusHelper.getWallet(NolusHelper.config.keys.contracts_owner);

        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Oracle Contract -> Config]',
                    choices: [
                        { name: 'Show', value: 'show' },
                        { name: 'Update', value: 'update' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }

            if (menuChoice === 'show') {
                console.log(await NolusHelper.getOracle().then(oracle => oracle.getConfig()));
            }
            else if (menuChoice === 'update') {
                let priceConfig: OraclePriceConfig;

                while (true) {
                    let config: string = await MenuUtil.askString("Enter JSON config or type \"back\"");
                    if (config.toLowerCase() === "back") {
                        break;
                    }
                    try {
                        priceConfig = JSON.parse(config);
                        await oracle.updateConfig(contractsOwnerWallet, priceConfig, "auto")
                            .then(() => console.log(`Config is updated successfully`))
                            .catch(this.displayOracleError);
                        break;
                    }
                    catch (error) {
                        console.error("Invalid JSON: " + error)
                    }
                }

            }
        }
    }

    async showFeeders() {
        const oracle = await NolusHelper.getOracle();
        const contractsOwnerWallet: NolusWallet = await NolusHelper.getWallet(NolusHelper.config.keys.contracts_owner);

        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Oracle Contract -> Feeders]',
                    choices: [
                        { name: 'List', value: 'list' },
                        { name: 'Add', value: 'add' },
                        { name: 'Remove', value: 'remove' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }

            if (menuChoice === 'list') {
                const feeders = await NolusHelper.getOracle().then(oracle => oracle.getFeeders());
                console.log();
                feeders.forEach(address => console.log(address));

            }
            else if (menuChoice === 'add') {
                const feederAddress: string = await MenuUtil.askString("Enter feeder address");

                await oracle.addFeeder(contractsOwnerWallet, feederAddress, "auto")
                    .then(() => console.log(`Feeder ${feederAddress} added successfully`))
                    .catch(this.displayOracleError);

            }
            else if (menuChoice === 'remove') {
                const feeders: string[] = await oracle.getFeeders();
                console.log();
                let { feederAddress } = await prompt([
                    {
                        type: 'list',
                        name: 'feederAddress',
                        message: 'Select feeder to remove',
                        choices: [...feeders, new inquirer.Separator(), 'Other', 'Back']
                    }
                ]);
                if (feederAddress === 'Back') {
                    continue;
                }
                else if (feederAddress === 'Other') {
                    feederAddress = await MenuUtil.askString("Enter feeder address to remove");
                }

                await oracle.removeFeeder(contractsOwnerWallet, feederAddress, "auto")
                    .then(() => console.log(`Feeder ${feederAddress} removed successfully`))
                    .catch(this.displayOracleError);
            }

        }
    }


    async showPrices() {
        const oracle = await NolusHelper.getOracle();
        //const contractsOwnerWallet: NolusWallet = await NolusHelper.getWallet(NolusHelper.config.keys.contracts_owner);

        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Oracle Contract -> Prices]',
                    choices: [
                        { name: 'Show', value: 'show' },
                        { name: 'Update', value: 'update' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }

            if (menuChoice === 'show') {
                let symbols = [];
                let coins: Coin[] = NolusHelper.getCoins();

                for (let i in coins) {
                    let symbol: string = coins[i].symbol;
                    if (["NLS"].indexOf(symbol) > -1) {
                        continue; // not supported token
                    }
                    symbols.push(symbol);
                }

                /**
                 * @todo oracle.getPricesFor return is not corrent
                 */
                const prices = (await oracle.getPricesFor(symbols))["prices"];
                for (let i in prices) {
                    const price = prices[i];
                    const baseCoin: Coin | undefined = NolusHelper.getCoinBySymbol(price.amount.ticker);
                    if (!baseCoin) {
                        throw `Unexpected Error! Coin ${price.amount.ticker} was not found.`
                    }
                    const quoteToken: Coin | undefined = NolusHelper.getCoinBySymbol(price.amount_quote.ticker);
                    if (!quoteToken) {
                        throw `Unexpected Error! Coin ${price.amount_quote.ticker} was not found.`
                    }

                    console.log(
                        price.amount.ticker + " - " +
                        (price.amount_quote.amount / price.amount.amount * Math.pow(10, baseCoin.decimal_digits - quoteToken.decimal_digits)).toFixed(4) +
                        price.amount_quote.ticker);

                }


            }
            else if (menuChoice === 'update') {
                console.log("not inmplemented");
            }
        }
    }
}

export { MenuOracle }