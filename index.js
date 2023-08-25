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
          break;
        case "Consultar saldo":
          getAccountBalance();
          break;
        case "Depositar":
          deposit();
          break;
        case "Sacar":
            withdraw();
          break;
        case "Sair":
          console.log(chalk.blue("Obrigado por usar o nosso sistema!"));
          process.exit();
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
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.red("Esta conta já existe!"));
        buildAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify({ name: accountName, balance: 0 }),
        function (err) {
          console.log(err);
        }
      );
      console.log(chalk.green("Conta criada com sucesso!"));
      operation();
    })
    .catch((err) => console.log(err));
}

// add an amount to the account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!checkAccount(accountName)) {
        return deposit();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Digite o valor do depósito:",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          addAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccount(account) {
  if (!fs.existsSync(`accounts/${account}.json`)) {
    console.log(chalk.red("Esta conta não existe!"));
    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(chalk.red("Valor inválido!"));
    return deposit();
  }
  accountData.balance += parseFloat(amount);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );
  console.log(chalk.green(`Depósito de R$${amount} realizado com sucesso!`));
  operation();
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}

// get account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta:",
      },
    ])
    .then((answer) => {
      const account = answer["accountName"];
      if (!checkAccount(account)) {
        return getAccountBalance();
      }
      const accountData = getAccount(account);
      console.log(
        chalk.green(`O saldo da conta ${account} é R$${accountData.balance}`)
      );
      operation();
    })
    .catch((err) => console.log(err));
}

// withdwraw an amount from the account
function withdraw() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Digite o nome da conta:"
        }
    ]).then((answer) => {
        const accountName = answer["accountName"];
        if (!checkAccount(accountName)) {
            return withdraw();
        }
        inquirer.prompt([
            {
                name: "amount",
                message: "Digite o valor do saque:"
            }
        ]).then((answer) => {
            const amount = answer["amount"];
            withdrawAmount(accountName, amount);
        }).catch((err) => console.log(err));
    }).catch((err) => console.log(err));
}

function withdrawAmount(accountName, amount) {
    const accountData = getAccount(accountName);
    if (!amount) {
      console.log(chalk.red("Valor inválido!"));
      return withdraw();
    }
    if (accountData.balance > 0) {
        accountData.balance -= parseFloat(amount);
        fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        }
        );
    } else {
        console.log(chalk.red("Saldo insuficiente!"));
        return withdraw();
    }
    console.log(chalk.green(`Saque de R$${amount} realizado com sucesso!`));
    operation();
}