import { NolusClient, NolusWallet } from '@nolus/nolusjs';
import { prompt } from 'inquirer';
import { Coin, NolusHelper } from '../NolusHelper';
const inquirer = require('inquirer');


class MenuTokens {

    async show() {
        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Tokens Transfer]',
                    choices: [
                        { name: 'Balances', value: 'balances' },
                        { name: 'Transfer', value: 'transfer' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }

            if (menuChoice === 'balances') {
                await this.showBalances(await this.selectAccount());
            }
            else if (menuChoice === 'transfer') {
                await this.showTransfer();
            }

        }
    }

    async selectAccount(): Promise<string> {
        console.log();

        let choices = [];
        for (let accountName in NolusHelper.config.keys) {
            choices.push({ name: accountName, value: NolusHelper.config.keys[accountName] },);
        }

        const { menuChoice } = await prompt([
            {
                type: 'list',
                name: 'menuChoice',
                message: 'Select Account',
                choices: choices
            }
        ]);

        return menuChoice;

    }

    async showBalances(privateKey: string) {
        try {
            const wallet: NolusWallet = await NolusHelper.getWallet(privateKey);
            console.log();
            console.log(`Showing balances of ${wallet.address}`);
            const coins: Coin[] = NolusHelper.getCoins();
            for (let i in coins) {
                const coin: Coin = coins[i];
                const { amount } = await NolusClient.getInstance().getBalance(wallet.address, coin.denom);
                if (parseInt(amount) > 0) {
                    console.log(
                        NolusHelper.amountFormatter.format(parseInt(amount) / Math.pow(10, coin.decimal_digits))
                        + " " + coin.symbol
                    );
                }
            }
        }
        catch (ex) {
            console.log(ex);
        }

    }

    async showTransfer() {
        console.log("Not implemented");
        return;
        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Tokens -> Transfer]',
                    choices: [
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }
        }
    }


}

export { MenuTokens }