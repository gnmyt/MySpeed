import os from 'node:os';
import * as config from '../controller/config.js';

export let interfaces = {};

export const requestInterfaces = async () => {
    let interfacesNode = os.networkInterfaces();
    let interfacesResult = {};

    console.log("Looking for network interfaces...");
    for (let i in interfacesNode) {
        for (let j in interfacesNode[i]) {
            let address = interfacesNode[i][j];

            if (address.internal) continue;

            if (!interfacesResult[i]) interfacesResult[i] = [];
            interfacesResult[i].push(address.address);
        }
    }

    interfaces = {};
    for (let i in interfacesResult) {
        interfaces[i] = interfacesResult[i].find((address) => address.includes(".")) || interfacesResult[i][0];
    }

    for (let i in interfaces) {
        console.log(`Found interface ${i} with IP ${interfaces[i]}`);
    }

    const currentInterface = await config.getValue("interface");

    if (currentInterface && interfaces[currentInterface]) return;

    if (!currentInterface) {
        console.warn("No interface set. Falling back to default.");
    } else {
        console.warn(`Interface ${currentInterface} not found. Falling back to default.`);
    }

    await config.updateValue("interface", Object.keys(interfaces)[0] || "none");
};