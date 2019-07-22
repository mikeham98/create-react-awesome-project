import path from 'path';

const currentFileUrl = import.meta.url;
export const reactDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates/react'
);
export const templatesDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates'
);

export const testsDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates/tests'
);
export const reduxDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates/redux'
);
export const routingDirectory = path.resolve(
    new URL(currentFileUrl).pathname,
    '../../templates/routing'
);