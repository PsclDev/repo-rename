const { camelCase, constantCase, dotCase, headerCase, paramCase, pascalCase, snakeCase } = require('change-case')
const { Octokit } = require('@octokit/rest');
const chalk = require('chalk');
const { Table } = require('console-table-printer');
const axios = require('axios');

function printTitle() {
    console.log(chalk.blue('888d888 .d88b.  88888b.   .d88b.         888d888 .d88b.  88888b.   8888b.  88888b.d88b.   .d88b.  '));
    console.log(chalk.blue('888P"  d8P  Y8b 888 "88b d88""88b        888P"  d8P  Y8b 888 "88b     "88b 888 "888 "88b d8P  Y8b '));
    console.log(chalk.blue('888    88888888 888  888 888  888 888888 888    88888888 888  888 .d888888 888  888  888 88888888 '));
    console.log(chalk.blue('888    Y8b.     888 d88P Y88..88P        888    Y8b.     888  888 888  888 888  888  888 Y8b.     '));
    console.log(chalk.blue('888     "Y8888  88888P"   "Y88P"         888     "Y8888  888  888 "Y888888 888  888  888  "Y8888  '));
    console.log(chalk.blue('                888                                                                               '));
    console.log(chalk.blue('                888                                                                               '));
    console.log(chalk.blue('                888                                                                               '));
    printSpacer(3);
}

function printSpacer(space = 2) {
    for (let idx = 0; idx < space; idx++) {
        console.log();
    }
}

const CaseStyle = [
    'camelCase',
    'constantCase',
    'dotCase',
    'headerCase',
    'paramCase',
    'pascalCase',
    'snakeCase'
]
Object.freeze(CaseStyle);

function valdiateCaseStyle(style) {
    const validStyle = CaseStyle.includes(style);
    if (!validStyle) throw new Error(`Unsupported case style (available: ${CaseStyle.join(', ')})`)

    console.log(chalk.blue(`Using ${style}, style: ${changeCase(style, 'exampleText')}`));

    return style;
}

function changeCase(style, input) {
    switch (style) {
        case 'camelCase':
            return camelCase(input);
        case 'constantCase':
            return constantCase(input);
        case 'dotCase':
            return dotCase(input);
        case 'headerCase':
            return headerCase(input);
        case 'paramCase':
            return paramCase(input);
        case 'pascalCase':
            return pascalCase(input);
        case 'snakeCase':
            return snakeCase(input);
    }
}

let octokit;
let username;

async function authenticateToGithub(token) {
    octokit = new Octokit({
        auth: token
    });

    const { data } = await octokit.rest.users.getAuthenticated();
    username = data.login;
    console.log(chalk.green(`Authenticated to github as ${username}`))
}

async function getAllRepositories() {
    const { data } = await octokit.search.repos({ q: `user:${username}` });
    return data.items.map(repo => ({ id: repo.id, name: repo.name, fullName: repo.full_name })).sort((a, b) => a.name.localeCompare(b.name));
}

async function generateRenames(style, repos) {
    return repos.forEach(repo => {
        repo.newName = changeCase(style, repo.name);
        repo.needsRename = repo.name !== repo.newName;
    });
}

async function printRenames(repos) {
    const table = new Table({
        columns: [
            { name: 'name', title: 'Old Name' },
            { name: 'newName', title: 'New Name', alignment: 'left' },
        ]
    });

    repos.forEach(repo => table.addRow({ name: repo.name, newName: repo.needsRename ? repo.newName : 'no rename needed' }, repo.needsRename ? { color: 'green' } : { color: 'white' }));

    table.printTable();
}

async function renameRepository(token, repo) {
    await axios.patch(`https://api.github.com/repos/${repo.fullName}`,
        { name: repo.newName },
        {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        }
    ).catch((ex) => { console.error(chalk.red('Internal programm error occurred: ' + ex)); });

    console.log(`${chalk.green('✔')} Successfully renamed ${chalk.red(repo.name)} to ${chalk.green(repo.newName)}`);
}

module.exports = {
    authenticateToGithub,
    CaseStyle,
    changeCase,
    generateRenames,
    getAllRepositories,
    printRenames,
    printSpacer,
    printTitle,
    renameRepository,
    valdiateCaseStyle,
}