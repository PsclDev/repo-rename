#!/usr/bin/env node
console.clear();

const chalk = require('chalk');
const program = require('commander');
const { MultiSelect, Toggle } = require('enquirer');

const { version } = require('../package.json');
const { CaseStyle, valdiateCaseStyle, changeCase, getAllRepositories, authenticateToGithub, printTitle, printRenames, printSpacer, filterReposByPromptResult, generateRenames, renameRepository } = require('./repository-renamer');

program.version(version)
    .requiredOption('-T, --token <token>', 'Your github personal access token (pat)')
    .option('-C, --case <case-style>', `The case style to which the repositories should be renamed (available: ${CaseStyle.join(', ')})`, 'paramCase');

program.parse(process.argv);
const options = program.opts();

async function main() {
    printTitle();

    valdiateCaseStyle(options.case);
    printSpacer();

    var successful = await authenticateToGithub(options.token);
    if (!successful) {
        throw new Error("Bad credentials")
    }

    const includeOrgsPrompt = new Toggle({
        message: 'Include organisation repositories?',
        enabled: 'Yes',
        disabled: 'No'
    })
    const includeOrgs = await includeOrgsPrompt.run().catch(console.error);

    printSpacer();
    console.log(chalk.blue(`Trying to load all your repositories, including organisations? ${includeOrgs}`));
    let repos = await getAllRepositories(includeOrgs);

    const choices = [{ id: 'all', name: 'All repositories', original: { id: 'all', name: 'All repositories' } }, ...repos.map(repo => ({ ...repo, original: repo }))]
    const repoSelectPrompt = new MultiSelect({
        message: `Choose which repos should be renamed (found ${repos.length})`,
        hint: 'Press space to select/deselect items',
        choices,
        required: true,
        result() {
            return this.selected.map(repo => repo.original);
        }
    });
    const selectedRepos = await repoSelectPrompt.run().catch(console.error);
    printSpacer();

    const renamesList = selectedRepos[0].id === 'all' ? repos : selectedRepos;
    generateRenames(options.case, renamesList);
    printRenames(renamesList);
    printSpacer();

    const confirmPrompt = new Toggle({
        message: 'Rename to new names?',
        enabled: 'Yes',
        disabled: 'Cancel'
    })
    const confirmed = await confirmPrompt.run().catch(console.error);
    if (!confirmed) {
        process.exit(1);
    }
    printSpacer();

    renamesList.filter(repo => repo.needsRename).forEach(async (repo) => await renameRepository(repo));
}

main().catch((ex) => { console.error(chalk.red('Internal programm error occurred: ' + ex)); process.exit(1); });