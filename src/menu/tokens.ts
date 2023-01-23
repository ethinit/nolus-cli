import { NolusWallet } from '@nolus/nolusjs';
import { prompt } from 'inquirer';
const inquirer = require('inquirer');
import { config, NolusHelper } from '../stub';


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
        for (let accountName in config.keys) {
            choices.push({ name: accountName, value: config.keys[accountName] },);
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
            console.log(`Showing balances of ${wallet.address}`);
            console.log("USDC: 22");
            console.log("WBTC: 22");
            console.log("WETH: 22");
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