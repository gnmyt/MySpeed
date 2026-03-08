import { loadLibreServers, loadOoklaServers } from './loadServers.js';

Deno.test('loadOoklaServers skips fetch when cache file already exists', async () => {
    let fetchCalls = 0;
    let writeCalls = 0;

    await loadOoklaServers({
        fetchFn: async () => {
            fetchCalls += 1;
            return {
                ok: true,
                json: async () => []
            };
        },
        fsModule: {
            existsSync: (filePath) => {
                if (filePath !== 'data/servers/ookla.json') {
                    throw new Error(`Unexpected cache path: ${filePath}`);
                }

                return true;
            },
            writeFileSync: () => {
                writeCalls += 1;
            }
        }
    });

    if (fetchCalls !== 0) {
        throw new Error(`Expected no fetch when cache exists, got ${fetchCalls} calls`);
    }

    if (writeCalls !== 0) {
        throw new Error(`Expected no writes when cache exists, got ${writeCalls} calls`);
    }
});

Deno.test('loadOoklaServers fetches and writes the expected cache file', async () => {
    let requestedUrl;
    let writtenPath;
    let writtenContent;

    await loadOoklaServers({
        fetchFn: async (url) => {
            requestedUrl = url;

            return {
                ok: true,
                json: async () => [
                    {id: '123', name: 'Example Ookla', distance: 27}
                ]
            };
        },
        fsModule: {
            existsSync: () => false,
            writeFileSync: (filePath, content) => {
                writtenPath = filePath;
                writtenContent = content;
            }
        }
    });

    if (requestedUrl !== 'https://www.speedtest.net/api/js/servers?limit=20') {
        throw new Error(`Unexpected Ookla URL: ${requestedUrl}`);
    }

    if (writtenPath !== 'data/servers/ookla.json') {
        throw new Error(`Unexpected Ookla cache path: ${writtenPath}`);
    }

    const expected = JSON.stringify({'123': 'Example Ookla (27km)'}, null, 4);

    if (writtenContent !== expected) {
        throw new Error(`Expected ${expected}, got ${writtenContent}`);
    }
});

Deno.test('loadLibreServers fetches and writes the expected cache file', async () => {
    let requestedUrl;
    let writtenPath;
    let writtenContent;

    await loadLibreServers({
        fetchFn: async (url) => {
            requestedUrl = url;

            return {
                ok: true,
                json: async () => [
                    {id: '456', name: 'Example Libre'}
                ]
            };
        },
        fsModule: {
            existsSync: () => false,
            writeFileSync: (filePath, content) => {
                writtenPath = filePath;
                writtenContent = content;
            }
        }
    });

    if (requestedUrl !== 'https://librespeed.org/backend-servers/servers.php') {
        throw new Error(`Unexpected LibreSpeed URL: ${requestedUrl}`);
    }

    if (writtenPath !== 'data/servers/librespeed.json') {
        throw new Error(`Unexpected LibreSpeed cache path: ${writtenPath}`);
    }

    const expected = JSON.stringify({'456': 'Example Libre'}, null, 4);

    if (writtenContent !== expected) {
        throw new Error(`Expected ${expected}, got ${writtenContent}`);
    }
});

Deno.test('loadOoklaServers throws a provider-specific error when the request fails', async () => {
    const requestError = new Error('network down');
    let thrownError;

    try {
        await loadOoklaServers({
            fetchFn: async () => {
                throw requestError;
            },
            fsModule: {
                existsSync: () => false,
                writeFileSync: () => {
                    throw new Error('writeFileSync should not be called when fetch fails');
                }
            }
        });
    } catch (error) {
        thrownError = error;
    }

    if (!thrownError) {
        throw new Error('Expected loadOoklaServers to throw');
    }

    if (thrownError.message !== 'Could not load Ookla servers: network down') {
        throw new Error(`Unexpected error message: ${thrownError.message}`);
    }

    if (thrownError.cause !== requestError) {
        throw new Error('Expected the original request error to be preserved as cause');
    }
});

Deno.test('loadLibreServers throws a provider-specific error when the response is not ok', async () => {
    let thrownError;

    try {
        await loadLibreServers({
            fetchFn: async () => ({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable'
            }),
            fsModule: {
                existsSync: () => false,
                writeFileSync: () => {
                    throw new Error('writeFileSync should not be called when the response is not ok');
                }
            }
        });
    } catch (error) {
        thrownError = error;
    }

    if (!thrownError) {
        throw new Error('Expected loadLibreServers to throw');
    }

    if (thrownError.message !== 'Could not load LibreSpeed servers: Request failed with status 503 Service Unavailable') {
        throw new Error(`Unexpected error message: ${thrownError.message}`);
    }

    if (!(thrownError.cause instanceof Error) || thrownError.cause.message !== 'Request failed with status 503 Service Unavailable') {
        throw new Error('Expected the response failure to be preserved as the error cause');
    }
});
