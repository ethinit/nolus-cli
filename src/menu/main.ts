import { prompt } from 'inquirer';
import { NolusHelper } from '../NolusHelper';
import { MenuLpp } from './lpp';
import { MenuOracle } from './oracle';
import { MenuTokens } from './tokens';
const inquirer = require('inquirer');

class MenuMain {
    private menuOracle = new MenuOracle;
    private menuTokens = new MenuTokens;
    async show() {
        while (true) {
            console.log();
            const { menuChoice } = await prompt([
                {
                    type: 'list',
                    name: 'menuChoice',
                    message: '[Home]',
                    choices: [
                        { name: 'Tokens', value: 'tokens' },
                        { name: 'Oracle Contract', value: 'oracleContract' },
                        { name: 'Liquidity Providers Pools', value: 'lpps' },
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

            else if (menuChoice === 'oracleContract') {
                await this.menuOracle.show();
            }

            else if (menuChoice === 'lpps') {
                console.log();

                let options = [];
                for (let ticker in NolusHelper?.config?.contracts?.lpps) {
                    options.push({ name: ticker, value: NolusHelper.config.contracts.lpps[ticker] })
                }

                const { lppAddress } = await prompt([
                    {
                        type: 'list',
                        name: 'lppAddress',
                        message: 'Select LPP',
                        choices: [...options, new inquirer.Separator(), "Back"]
                    }
                ]);

                if (lppAddress === "Back") {
                    continue;
                }
                const lpp = new MenuLpp(lppAddress);
                await lpp.show();
            }
        }
    }

}


export { MenuMain }