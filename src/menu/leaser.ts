import { Leaser } from "@nolus/nolusjs/build/contracts";
import { NolusHelper } from "../NolusHelper";
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
        let leaser: Leaser = await this.getLeaser();
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

            console.log("not implemented");
        }
    }
}

export { MenuLeaser }