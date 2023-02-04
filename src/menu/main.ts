import { Leaser } from '@nolus/nolusjs/build/contracts';
import { prompt } from 'inquirer';
import { NolusHelper } from '../NolusHelper';
import { MenuLeaser } from './leaser';
import { MenuLpp } from './lpp';
import { MenuOracle } from './oracle';
import { MenuTokens } from './tokens';
const inquirer = require('inquirer');

class MenuMain {

    private menuTokens = new MenuTokens;
    private menuLeaser = new MenuLeaser(NolusHelper?.config?.contracts?.leaser)

    async show() {
        while (true) {
            const leaser: Leaser = await this.menuLeaser.getLeaser();
            const leaserConfig = (await leaser.getLeaserConfig()).config;
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Home]',
                    choices: [
                        { name: 'Tokens', value: 'tokens' },
                        { name: 'Oracle', value: 'oracle' },
                        { name: 'LPP', value: 'lpp' },
                        { name: 'Leases', value: 'leases' },
                        new inquirer.Separator(),
                        { name: 'Exit', value: 'exit' }
                    ]
                }
            ]);

            if (menuChoice === 'exit') {
                console.log('Exiting program');
                process.exit();
            }

            if (menuChoice === 'tokens') {
                await this.menuTokens.show();
            }

            else if (menuChoice === 'oracle') {
                await (new MenuOracle(leaserConfig.market_price_oracle)).show();
            }

            else if (menuChoice === 'lpp') {
                /**
                 * @todo invalid type of lpp_addr
                 */
                const lpp = new MenuLpp(leaserConfig.lpp_addr.toString());
                await lpp.show();
            }

            else if (menuChoice === 'leases') {
                await (new MenuLeaser(NolusHelper?.config?.contracts?.leaser)).show();
            }
        }
    }

}


export { MenuMain }