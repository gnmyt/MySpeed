import fs from 'node:fs';

const ooklaPath = 'data/servers/ookla.json';
const librePath = 'data/servers/librespeed.json';

const providerConfigs = {
    ookla: {
        cachePath: ooklaPath,
        errorName: 'Ookla',
        url: 'https://www.speedtest.net/api/js/servers?limit=20',
        mapRow: (row) => [row.id, `${row.name} (${row.distance}km)`]
    },
    librespeed: {
        cachePath: librePath,
        errorName: 'LibreSpeed',
        url: 'https://librespeed.org/backend-servers/servers.php',
        mapRow: (row) => [row.id, row.name]
    }
};

const buildServersMap = (rows, mapRow) => {
    const servers = {};

    rows?.forEach((row) => {
        const [id, value] = mapRow(row);
        servers[id] = value;
    });

    return servers;
};

const buildResponseError = (response) => {
    const statusText = response.statusText ? ` ${response.statusText}` : '';

    return new Error(`Request failed with status ${response.status}${statusText}`);
};

const loadProviderServers = async ({cachePath, errorName, fetchFn, fsModule, mapRow, url}) => {
    if (fsModule.existsSync(cachePath)) {
        return false;
    }

    try {
        const response = await fetchFn(url);

        if (!response.ok) {
            throw buildResponseError(response);
        }

        const servers = buildServersMap(await response.json(), mapRow);

        fsModule.writeFileSync(cachePath, JSON.stringify(servers, null, 4));

        return true;
    } catch (error) {
        throw new Error(`Could not load ${errorName} servers: ${error.message}`, {cause: error});
    }
};

export const loadOoklaServers = async ({fetchFn = globalThis.fetch, fsModule = fs} = {}) => loadProviderServers({
    ...providerConfigs.ookla,
    fsModule,
    fetchFn
});

export const loadLibreServers = async ({fetchFn = globalThis.fetch, fsModule = fs} = {}) => loadProviderServers({
    ...providerConfigs.librespeed,
    fsModule,
    fetchFn
});

export const loadServers = async ({fetchFn = globalThis.fetch, fsModule = fs} = {}) => {
    await loadOoklaServers({fetchFn, fsModule});
    await loadLibreServers({fetchFn, fsModule});
};
