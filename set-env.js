const fs = require('fs');

const envVariables = {
    version: process.env.version,
};

const targetPath = './src/environments/';

const looseJsonParse = (obj) => {
    return Function('"use strict";return (' + obj + ')')();
};

const environmentFilePath = process.env.PRODUCTION && process.env.PRODUCTION == 'true' ?
    `${targetPath}environment.prod.ts`  :
    `${targetPath}environment.local.ts`
;

const readFile = (fileUrl) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileUrl, 'utf8', (error, data) => {
            error ? reject(error) : resolve(data);
        });
    });
};

const writeFile = (fileUrl, fileData) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileUrl, fileData, (error) => {
            if (error) {
                reject(error);
            }

            resolve();
        })
    });
};

const parseFile = (data) => {
    return new Promise((resolve) => {
        const regEx = new RegExp('\{([^}]+)\}', 'gm');
        const matchedData = looseJsonParse(data.match(regEx)[0]);

        const envObject = Object.keys(matchedData).reduce((result, objectKey) => {
            return {
                [objectKey]: envVariables[objectKey] || matchedData[objectKey],
                ...result,
            };
        }, {});

        const fileData = `export const environment = ${JSON.stringify(envObject, null, 2)};`;

        resolve(fileData);
    });

};

readFile(environmentFilePath)
    .then((data) => parseFile(data))
    .then((fileData) => writeFile(environmentFilePath, fileData))
    .catch((error) => { console.error(error); });
