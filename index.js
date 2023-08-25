// modulos externos
const inquirer = require("inquirer");
const chalk = require("chalk");

// modulos internos
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar uma conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      switch (action) {
        case "Criar uma conta":
          createAccount();
      }
    })
    .catch((err) => console.log(err));
}

// create account
function createAccount() {
  console.log(chalk.blue("Defina as opções da sua conta:"));
  buildAccount();
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta:',
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];
        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.red('Esta conta já existe!'))
            buildAccount()
            return
        }
        fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify({name: accountName, balance: 0}), function (err) {
            console.log(err)
        })
        console.log(chalk.green('Conta criada com sucesso!'))
        operation()
    }).catch((err) => console.log(err))
}

