# Nolus CLI

Welcome to the Nolus CLI project! This is a command-line interface tool that allows you to interact with the Nolus ecosystem.

## Installation

To get started, you will first need to clone the repository from GitHub. You can do this by running the following command in your terminal:
```
git clone https://github.com/ethinit/nolus-cli.git
```
Next, navigate to the project's root directory and install the dependencies by running:
```
npm install
```
To generate the TypeScript code, you can use the following command:
```
tsc
```
Before you can start the project, you will need to copy the config.example.json file to config.json and fill in the necessary fields.
You can do this by running the following command:
```
cp config.example.json config.json
```
You should fill in the following fields:
- tendermintRpc
- contracts_owner

You can also add more private keys under the contracts_owner field.

Finally, you can start the project by running:
```
npm start
```
This will start the command-line interface and you will be able to interact with the Nolus ecosystem.

Please note that you will need to have Node.js and npm (Node Package Manager) installed on your machine in order to run this project.