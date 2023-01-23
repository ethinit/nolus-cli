import { prompt } from 'inquirer';

class MenuUtil {
    static async askString(question: string, isRequired: boolean = true): Promise<string> {
        let options = [
            {
                type: 'input',
                name: 'answer',
                message: question
            }
        ]

        if (isRequired) {
            options[0]["validate"] = function (input: string) {
                if (input.length === 0) {
                    return 'This field is required, please enter a value.';
                }
                return true;
            }
        }

        const { answer } = await prompt(options);

        return answer;
    }
}

export { MenuUtil }