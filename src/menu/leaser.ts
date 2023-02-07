import { NolusWallet } from "@nolus/nolusjs";
import { Leaser, LeaserConfig } from "@nolus/nolusjs/build/contracts";
import { Coin, NolusHelper } from "../NolusHelper";
import { MenuUtil } from "./util";
const inquirer = require('inquirer');

class MenuLeaser {

    constructor(private leaserAddr: string) {

    }

    private leaser: Promise<Leaser>;
    public getLeaser(): Promise<Leaser> {
        if (typeof this.leaser === "undefined") {
            this.leaser = NolusHelper.getCosmWasmClient().then(cosmWasmClient => new Leaser(cosmWasmClient, this.leaserAddr));
        }
        return this.leaser
    }

    async show() {
        const leaser: Leaser = await this.getLeaser();
        while (true) {
            console.log();
            const { menuChoice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: `[Leaser]`,
                    choices: [
                        { name: 'Config', value: 'config' },
                        { name: 'Open Lease', value: 'openLease' },
                        { name: 'Show Open Leases', value: 'showOpenLeases' },
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
            else if (menuChoice === 'openLease') {
                const wallet: NolusWallet = await NolusHelper.promptAccount();

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
                let { downpayment } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'coinChoice',
                        message: 'Select conin for the Down Payment',
                        choices: [...choices, new inquirer.Separator(), 'Back']
                    }
                ]);
                if (downpayment === 'Back') {
                    return;
                }

                const { amount } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'amount',
                        message: `Enter the amount of ${downpayment.coin.symbol} for the Down Payment (max ${NolusHelper.amountFormatter.format(downpayment.amount / Math.pow(10, downpayment.coin.decimal_digits))})`,
                    }
                ]);

                leaser.openLease(wallet, "WBTC", "auto", [{
                    denom: downpayment.coin.denom,
                    amount: (parseInt(amount) * Math.pow(10, downpayment.coin.decimal_digits)).toFixed(0)
                }])
            }
            else if (menuChoice === 'showOpenLeases') {
                let addresses = [];
                for (let accountName in NolusHelper.config.keys) {
                    let accAddress = (await NolusHelper.getWallet(NolusHelper.config.keys[accountName])).address;
                    addresses.push({ name: accountName, value: accAddress });
                }

                console.log();

                let { address } = await inquirer.prompt([
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

                console.log(await leaser.getCurrentOpenLeasesByOwner(address));
            }
        }
    }

    async showConfig() {
        const leaser: Leaser = await this.getLeaser();


        while (true) {
            console.log();
            const { menuChoice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Leaser -> Config]',
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
                console.log(await leaser.getLeaserConfig());
            }
            else if (menuChoice === 'update') {
                const contractsOwnerWallet: NolusWallet = await NolusHelper.getWallet(NolusHelper.config.keys.contracts_owner);
                let leaserConfig: LeaserConfig;

                while (true) {
                    let config: string = await MenuUtil.askString("Enter JSON config or type \"back\"");
                    if (config.toLowerCase() === "back") {
                        break;
                    }
                    try {
                        leaserConfig = JSON.parse(config);
                        await leaser.setLeaserConfig(contractsOwnerWallet, leaserConfig, "auto")
                            .then(() => console.log(`Config is updated successfully`))
                            .catch(console.error);
                        break;
                    }
                    catch (error) {
                        console.error("Invalid JSON: " + error)
                    }
                }
            }
        }
    }
}

export { MenuLeaser }