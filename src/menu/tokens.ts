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
                await this.showBalances(await this.selectAddress(true));
            }
            else if (menuChoice === 'transfer') {
                await this.showTransfer();
            }

        }
    }

    async selectAddress(showOther: boolean = false): Promise<string> {
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

        if (showOther && menuChoice === 'Other') {
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
        const amounts = await NolusHelper.getCoinsAmounts(address, coins);

        for (let i in amounts) {
            const el = amounts[i];

            if (el.amount > 0) {
                console.log(
                    NolusHelper.amountFormatter.format(el.amount / Math.pow(10, el.coin.decimal_digits))
                    + " " + el.coin.symbol
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