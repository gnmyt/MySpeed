import os from 'node:os';
import https from 'node:https';
import dgram from 'node:dgram';
import * as config from '../controller/config.js';

export let interfaces = {};

// Virtual interfaces (docker bridges, VPNs, ...) that should never be used for speed tests
const VIRTUAL_INTERFACE_REGEX = /^(veth|br-|docker|virbr|tailscale|wg|tun|tap|zt)/;

// Finds the interface used by the default route (no packets are sent by connecting a UDP socket)
const getDefaultRouteInterface = () => new Promise((resolve) => {
    const socket = dgram.createSocket("udp4");
    socket.on('error', () => {
        socket.close();
        resolve(null);
    });

    socket.connect(53, "1.1.1.1", () => {
        const localAddress = socket.address().address;
        socket.close();

        for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
            if (addresses.some(address => address.address === localAddress)) return resolve(name);
        }

        resolve(null);
    });
});

export const requestInterfaces = async () => {
    let interfacesNode = os.networkInterfaces();
    let interfacesResult = {};
    let found = {};

    console.log("Looking for network interfaces...");
    for (let i in interfacesNode) {
        if (VIRTUAL_INTERFACE_REGEX.test(i)) continue;

        for (let j in interfacesNode[i]) {
            let address = interfacesNode[i][j];

            if (address.internal) continue;

            let options = {hostname: "speed.cloudflare.com", path: "/__down?bytes=1", method: "GET",
                family: address.family === "IPv4" ? 4 : 6, timeout: 5000};

            options.agent = new https.Agent(options);
            options.localAddress = address.address;

            await new Promise((resolve) => {

                const req = https.request(options, () => {
                    if (!interfacesResult[i]) interfacesResult[i] = [];
                    interfacesResult[i].push(address.address);
                    req.destroy();
                    resolve();
                });

                req.on('error', () => resolve());
                req.on('timeout', () => req.destroy());

                req.end();
            });
        }

        if (!interfacesResult[i]) delete interfacesResult[i];
    }

    for (let i in interfacesResult) {
        for (let j in interfacesResult[i]) {
            if (interfacesResult[i][j].includes(".")) {
                found[i] = interfacesResult[i][j];
                break;
            }
        }

        if (!found[i]) found[i] = interfacesResult[i][0];
    }

    for (let i in interfaces) if (!found[i]) delete interfaces[i];
    Object.assign(interfaces, found);

    for (let i in interfaces) {
        console.log(`Found interface ${i} with IP ${interfaces[i]}`);
    }

    const currentInterface = await config.getValue("interface");

    if (!interfaces[currentInterface]) {
        if (!currentInterface) {
            console.warn("No interface set. Falling back to default.");
        } else {
            console.warn(`Interface ${currentInterface} not found. Falling back to default.`);
        }

        const defaultInterface = await getDefaultRouteInterface();
        await config.updateValue("interface", interfaces[defaultInterface] ? defaultInterface : Object.keys(interfaces)[0]);
    }
};
