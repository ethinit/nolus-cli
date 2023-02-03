import { NolusWallet } from '@nolus/nolusjs';
import { Lpp } from '@nolus/nolusjs/build/contracts';
import bigInt from 'big-integer';
import { prompt } from 'inquirer';
import { Coin, NolusHelper } from '../NolusHelper';
const inquirer = require('inquirer');


class MenuLpp {
    constructor(private lppAddress: string) {

    }

    private lpp: Promise<Lpp>;
    private getLpp(): Promise<Lpp> {
        if (typeof this.lpp === "undefined") {
            this.lpp = NolusHelper.getCosmWasmClient().then(cosmWasmClient => new Lpp(cosmWasmClient, this.lppAddress));
        }
        return this.lpp
    }

    async show() {
        const lpp: Lpp = await this.getLpp();
        let config = await lpp.getLppConfig();
        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: `[Liquidity Providers Pool - ${config.lpn_ticker}]`,
                    choices: [
                        { name: 'Config', value: 'config' },
                        { name: 'Balance', value: 'balance' },
                        { name: 'Price', value: 'price' },
                        { name: 'Lending', value: 'lending' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }

            if (menuChoice == "config") {
                console.log();
                console.log(await lpp.getLppConfig());
            }
            else if (menuChoice == "balance") {
                console.log();
                console.log(await lpp.getLppBalance());
            }
            else if (menuChoice == "price") {
                console.log();
                console.log(await lpp.getPrice());
            }
            else if (menuChoice == "lending") {
                await this.showLending();
            }



        }
    }


    async showLending() {
        const lpp: Lpp = await this.getLpp();
        let config = await lpp.getLppConfig();
        let lppCoin: Coin = await NolusHelper.getCoinBySymbol(config.lpn_ticker);

        async function normalizeLenderAmount(amount: string): Promise<number> {
            let price = await lpp.getPrice();
            return parseInt((BigInt(amount) * BigInt(price.amount_quote.amount) / BigInt(price.amount.amount)).toString()) / Math.pow(10, lppCoin.decimal_digits);
        }

        async function deNormalizeLenderAmount(amount: number): Promise<string> {
            let price = await lpp.getPrice();
            return (BigInt(Math.pow(10, lppCoin.decimal_digits)) * BigInt(amount) * BigInt(price.amount.amount) / BigInt(price.amount_quote.amount)).toString();
        }

        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: `[Liquidity Providers Pool - ${config.lpn_ticker}  -> Lender]]`,
                    choices: [
                        { name: 'Deposit', value: 'deposit' },
                        { name: 'Show Deposit', value: 'showDeposit' },
                        { name: 'Withdraw', value: 'withdraw' },
                        new inquirer.Separator(),
                        { name: 'Back', value: 'back' }
                    ]
                }
            ]);

            if (menuChoice === 'back') {
                return;
            }
            else if (menuChoice === 'deposit') {
                let wallet: NolusWallet = await NolusHelper.promptAccount("Select an account to make a deposit from.");

                let coinAmount = (await NolusHelper.getCoinsAmounts(wallet.address, [lppCoin]))[0];

                const { amount } = await prompt([
                    {
                        type: 'input',
                        name: 'amount',
                        message: `Enter the amount of ${lppCoin.symbol} you would like to deposit (max ${NolusHelper.amountFormatter.format(coinAmount.amount / Math.pow(10, lppCoin.decimal_digits))})`,
                    }
                ]);

                await lpp.deposit(wallet, "auto", [
                    { denom: lppCoin.denom, amount: (parseInt(amount) * Math.pow(10, lppCoin.decimal_digits)).toFixed(0) },
                ]).then(() => console.log(`Successfully deposited ${amount} ${lppCoin.symbol}`))
                    .catch(console.error);
            }
            else if (menuChoice === 'showDeposit') {
                let wallet = await NolusHelper.promptAccount();
                let deposit = await lpp.getLenderDeposit(wallet.address);

                console.log(NolusHelper.amountFormatter.format(await normalizeLenderAmount(deposit.balance)) + " " + lppCoin.symbol);
            }
            else if (menuChoice === 'withdraw') {
                let wallet: NolusWallet = await NolusHelper.promptAccount();
                let deposit = await lpp.getLenderDeposit(wallet.address);

                const { amount } = await prompt([
                    {
                        type: 'input',
                        name: 'amount',
                        message: `Enter the amount of ${lppCoin.symbol} you would like to withdraw (max ${NolusHelper.amountFormatter.format(await normalizeLenderAmount(deposit.balance))})`,
                    }
                ]);

                await lpp.burnDeposit(wallet, await deNormalizeLenderAmount(amount), "auto")
                    .then(() => console.log(`Withdraw is successful`))
                    .catch(console.error);
            }
        }
    }

}

export { MenuLpp }