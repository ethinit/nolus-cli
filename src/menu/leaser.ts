import { NolusWallet } from "@nolus/nolusjs";
import { Leaser, LeaserConfig } from "@nolus/nolusjs/build/contracts";
import { NolusHelper } from "../NolusHelper";
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
        while (true) {
            console.log();
            const { menuChoice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: `[Leaser]`,
                    choices: [
                        { name: 'Config', value: 'config' },
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