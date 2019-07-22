import arg from 'arg';
import inquirer from 'inquirer';
import {createReactAwesomeApp} from './main';

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({
        '--git': Boolean,
        '--install': Boolean,
        '-g': '--git',
        '-i': '--install',
    }, {
        argv: rawArgs.slice(2)
    });
    return {
        git: args['--git'] || false,
        runInstall: args['--install'] || false
    }
}

async function promptForMissingOptions(options) {
    const questions = [];

    questions.push({
        type: 'input',
        name: 'packageName',
        message: 'Please enter a package name (react-project)',
    });

    questions.push({
        type: 'input',
        name: 'packageVersion',
        message: 'Please enter a version (1.0.0)',
    });
    questions.push({
        type: 'input',
        name: 'packageDescription',
        message: 'Please enter a description',
    });

    questions.push({
        type: 'checkbox',
        name: 'reactOptions',
        message: 'Please select what options you would like enabled',
        choices: ['redux', 'routing', 'testing'],
    });

    if(!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false
        })
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        packageName: answers.packageName,
        packageVersion: answers.packageVersion,
        packageDescription: answers.packageDescription,
        reactOptions: answers.reactOptions,
        template: options.template || answers.template,
        git: options.git || answers.git
    }
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await createReactAwesomeApp(options);
}