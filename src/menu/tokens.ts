import { NolusClient, NolusWallet } from '@nolus/nolusjs';
import { prompt } from 'inquirer';
import { Coin, NolusHelper } from '../NolusHelper';
import { MenuUtil } from './util';
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
                await this.showBalances(await this.selectAddress());
            }
            else if (menuChoice === 'transfer') {
                await this.showTransfer();
            }

        }
    }

    async selectAddress(): Promise<string> {
        console.log();

        let choices = [];
        for (let accountName in NolusHelper.config.keys) {
            choices.push({ name: accountName, value: NolusHelper.config.keys[accountName] },);
        }

        choices.push(new inquirer.Separator());
        choices.push("Other");

        let { menuChoice } = await prompt([
            {
                type: 'list',
                name: 'menuChoice',
                message: 'Select Account',
                choices: choices
            }
        ]);

        if (menuChoice === 'Other') {
            menuChoice = await MenuUtil.askString("Enter address");
        }
        else {
            menuChoice = (await NolusHelper.getWallet(menuChoice)).address;
        }

        return menuChoice;

    }

    async showBalances(address: string) {
        console.log();
        console.log(`Showing balances of ${address}`);
        const coins: Coin[] = NolusHelper.getCoins();
        for (let i in coins) {
            const coin: Coin = coins[i];
            const { amount } = await NolusClient.getInstance().getBalance(address, coin.denom);
            if (parseInt(amount) > 0) {
                console.log(
                    NolusHelper.amountFormatter.format(parseInt(amount) / Math.pow(10, coin.decimal_digits))
                    + " " + coin.symbol
                );
            }
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