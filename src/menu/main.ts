import { prompt } from 'inquirer';
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
        }
    }

}


export { MenuMain }