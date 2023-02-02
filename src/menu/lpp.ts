import { NolusWallet } from '@nolus/nolusjs';
import { Lpp } from '@nolus/nolusjs/build/contracts';
import { prompt } from 'inquirer';
import { NolusHelper } from '../NolusHelper';
import { MenuUtil } from './util';
const inquirer = require('inquirer');


class MenuLpp {
    private lpp: Lpp;

    constructor(private lppAddress: string) {

    }

    private getLpp(): Promise<Lpp> {
        return NolusHelper.getCosmWasmClient().then(cosmWasmClient => new Lpp(cosmWasmClient, this.lppAddress));
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


        }
    }


}

export { MenuLpp }