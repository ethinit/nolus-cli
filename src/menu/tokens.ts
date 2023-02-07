import { NolusWallet } from '@nolus/nolusjs';
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
                await this.showBalances();
            }
            else if (menuChoice === 'transfer') {
                await this.showTransfer();
            }

        }
    }


    async showBalances() {
        let addresses = [];
        for (let accountName in NolusHelper.config.keys) {
            let accAddress = (await NolusHelper.getWallet(NolusHelper.config.keys[accountName])).address;
            addresses.push({ name: accountName, value: accAddress });
        }

        console.log();

        let { address } = await prompt([
            {
                type: 'list',
                name: 'address',
                message: 'Select Account',
                choices: [...addresses, new inquirer.Separator(), "Other"]
            }
        ]);

        if (address === 'Other') {
            address = await MenuUtil.askString("Enter address");
        }

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
        const wallet: NolusWallet = await NolusHelper.promptAccount("Select account to send from");


        const coins: Coin[] = NolusHelper.getCoins();
        const amounts = await NolusHelper.getCoinsAmounts(wallet.address, coins);
        let choices = [];
        for (let i in amounts) {
            const el = amounts[i];

            if (el.amount > 0) {
                choices.push({ name: el.coin.symbol + ` (max ${NolusHelper.amountFormatter.format(el.amount / Math.pow(10, el.coin.decimal_digits))})`, value: el });
            }

        }
        console.log();
        let { coinChoice } = await prompt([
            {
                type: 'list',
                name: 'coinChoice',
                message: 'Select coin to send',
                choices: [...choices, new inquirer.Separator(), 'Back']
            }
        ]);
        if (coinChoice === 'Back') {
            return;
        }

        const { amount } = await prompt([
            {
                type: 'input',
                name: 'amount',
                message: `Enter the amount of ${coinChoice.coin.symbol} you would like to send (max ${NolusHelper.amountFormatter.format(coinChoice.amount / Math.pow(10, coinChoice.coin.decimal_digits))})`,
            }
        ]);

        const recipientAddress = await MenuUtil.askString("Enter recipient address");


        await wallet.sendTokens(wallet.address, recipientAddress, [{
            denom: coinChoice.coin.denom,
            amount: (parseInt(amount) * Math.pow(10, coinChoice.coin.decimal_digits)).toFixed(0)
        }], 500)
            .then((obj) => console.log(`Successfully transferred ${amount} ${coinChoice.coin.symbol} to address ${recipientAddress}.`))
            .catch(console.error);
    }


}

export { MenuTokens }