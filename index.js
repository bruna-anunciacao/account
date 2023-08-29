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
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Transferir",
          "Deletar conta",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      switch (action) {
        case "Criar conta":
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
        case "Transferir":
          transferAccount();
          break;
        case "Deletar conta":
          deleteAccount();
          break;
        case "Sair":
          console.log(
            chalk.blue.dim("Obrigado por usar o nosso sistema! Volte sempre :D")
          );
          process.exit();
      }
    })
    .catch((err) => console.log(err));
}

// create account
function createAccount() {
  console.log(chalk.cyan("Menu de criação de conta"));
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
        console.log(chalk.red.bold("Esta conta já existe!"));
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
    console.log(chalk.red.bold("Esta conta não existe!"));
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
        return withdraw();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Digite o valor do saque:",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          withdrawAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function withdrawAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.log(chalk.red("Valor inválido!"));
    return withdraw();
  }
  if (accountData.balance > parseFloat(amount)) {
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

// transfer an amount from one account to another
function transferAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite o nome da conta:",
      },
      {
        name: "accountName2",
        message: "Digite o nome da conta que receberá a transferência:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      const transferAccountName = answer["accountName2"];
      if (!checkAccount(accountName) && !checkAccount(transferAccountName)) {
        return transferAccount();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Digite o valor da transferência:",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          transferAmount(accountName, transferAccountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function transferAmount(accountName, transferAccountName, amount) {
  const sourceAccountData = getAccount(accountName);
  const targetAccountData = getAccount(transferAccountName);
  const sourceAccountBalance = sourceAccountData.balance;

  if (!sourceAccountBalance) {
    console.log(chalk.red("Valor inválido, tente novamente!"));
    return transferAccount();
  }
  if (sourceAccountBalance >= parseFloat(amount)) {
    sourceAccountData.balance -= parseFloat(amount);
    targetAccountData.balance += parseFloat(amount);
    fs.writeFileSync(
      `accounts/${accountName}.json`,
      JSON.stringify(sourceAccountData),
      function (err) {
        console.log(err);
      }
    );
    fs.writeFileSync(
      `accounts/${transferAccountName}.json`,
      JSON.stringify(targetAccountData),
      function (err) {
        console.log(err);
      }
    );
  } else {
    console.log(chalk.red.bold(`Saldo insuficiente! Atualmente seu saldo na conta ${sourceAccountData.name} é R$${sourceAccountData.balance}`));
    return transferAccount();
  }
  console.log(chalk.green(`Transferência de R$${amount} para a conta ${targetAccountData.name} realizada com sucesso!`));
  operation();
} 

// delete account
function deleteAccount() {
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
        return deleteAccount();
      }
      fs.unlinkSync(`accounts/${accountName}.json`);
      console.log(
        chalk.red.italic(
          `Sua conta ${accountName} deletada com sucesso! Espero que volte logo :D`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));

}
