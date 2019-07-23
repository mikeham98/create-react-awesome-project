import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import {promisify} from 'util';
import execa from 'execa';
import Listr from 'listr';
import {projectInstall} from 'pkg-install';
import {reactDirectory, reduxDirectory, routingDirectory, templatesDirectory, testsDirectory} from './config';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyFiles(source, target) {
    return copy(source, target, {
        clobber: true,
        stopOnErr: true
    })
}

async function initGit(target) {
    const result = await execa('git', ['init'], {
        cwd: target
    });
    if (result.failed) {
        return Promise.reject(new Error('Failed to initialize Git'));
    }
    return;
}

function addTestToPackageJson(packageJson) {
    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "enzyme": "^3.10.0",
        "enzyme-adapter-react-16": "^1.14.0",
        "enzyme-to-json": "^3.3.5",
        "jest": "^24.8.0",
        "jest-cli": "^24.8.0",
    };
    packageJson.jest = {
        "collectCoverage": true,
        "coverageReporters": [
            "json",
            "html"
        ],
        "verbose": true,
        "transform": {
            "^.+\\.jsx?$": "babel-jest"
        },
        "snapshotSerializers": [
            "enzyme-to-json/serializer"
        ],
        "setupFiles": [
            "./enzymeSetup.js"
        ],
        "moduleNameMapper": {
            "^.+\\.(css|less|scss)$": "babel-jest"
        }
    };
}

function addReduxToPackageJson(packageJson) {
    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "redux-devtools-extension": "^2.13.8",
    };
    packageJson.dependencies = {
        ...packageJson.dependencies,
        "redux": "^4.0.4",
        "react-redux": "^7.1.0",
        "redux-thunk": "^2.3.0",
        "reselect": "^4.0.0",
    };
}

function addRoutingToPackageJson(packageJson) {
    packageJson.dependencies = {
        ...packageJson.dependencies,
        "react-router-dom": "^5.0.1",
    };
}

async function createPackageJson(options) {
    const testingSelected = options.reactOptions.find(e => e === 'testing');
    const reduxSelected = options.reactOptions.find(e => e === 'redux');
    const routingSelected = options.reactOptions.find(e => e === 'routing');

    fs.readFile(templatesDirectory + '/package.json', (err, data) => {
        // console.log('err',err);
        // console.log('data',data);
        if (err) {
            throw err;
        }
        const packageJson = JSON.parse(data);
        if (testingSelected) {
            addTestToPackageJson(packageJson);
        }
        if (reduxSelected) {
            addReduxToPackageJson(packageJson);
        }
        if (routingSelected) {
            addRoutingToPackageJson(packageJson);
        }
        if (options.packageName) {
            packageJson.name = options.packageName;
        }
        if (options.packageVersion) {
            packageJson.version = options.packageVersion;
        }
        if (options.packageDescription) {
            packageJson.description = options.packageDescription;
        }
        fs.writeFile(options.targetDirectory + '/package.json', JSON.stringify(packageJson, null, 4), (err) => {
            if (err) return console.log(err);
        });
    });
}

function addTestFiles(target) {
    copyFiles(testsDirectory, target);
}

function addReduxFiles(target) {
    copyFiles(reduxDirectory, target);
}

function addRoutingFiles(target) {
    copyFiles(routingDirectory, target);
}

export async function createReactAwesomeApp(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd()
    };

    options.templateDirectory = reactDirectory;

    try {
        await access(reactDirectory, fs.constants.R_OK);
    } catch (err) {
        console.log('%s Invalid template name', chalk.red.bold('ERROR'));
        process.exit(1);
    }

    const testingSelected = options.reactOptions.find(e => e === 'testing');
    const reduxSelected = options.reactOptions.find(e => e === 'redux');
    const routingSelected = options.reactOptions.find(e => e === 'routing');

    const tasks = new Listr([
        {
            title: 'Copy project files',
            task: () => {
                copyFiles(options.templateDirectory, options.targetDirectory);
            }
        },
        {
            title: 'Initialize git',
            task: () => initGit(options.targetDirectory),
            enabled: () => options.git
        },
        {
            title: 'Create package.json',
            task: () => {
                createPackageJson(options);
            },
        },
        {
            title: 'Adding testing files',
            task: () => {
                addTestFiles(options.targetDirectory);
            },
            enabled: () => testingSelected,
        },
        {
            title: 'Adding redux files',
            task: () => {
                addReduxFiles(options.targetDirectory);
            },
            enabled: () => reduxSelected,
        },
        {
            title: 'Adding routing files',
            task: () => {
                addRoutingFiles(options.targetDirectory);
            },
            enabled: () => routingSelected,
        },
        {
            title: 'Initialize dependencies',
            task: () => {
                projectInstall({
                    cwd: options.targetDirectory
                })
            },
            skip: () => !options.runInstall ? 'Pass --install to automatically install dependencies' : undefined
        }
    ]);

    await tasks.run();

    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
}