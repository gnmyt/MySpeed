import { ooklaList } from './binaries.js';

Deno.test('ooklaList uses the universal macOS archive for x64 and arm64', () => {
    const macEntries = ooklaList
        .filter((entry) => entry.os === 'darwin' && (entry.arch === 'x64' || entry.arch === 'arm64'))
        .sort((a, b) => a.arch.localeCompare(b.arch));

    const expected = [
        {os: 'darwin', arch: 'arm64', suffix: 'macosx-universal.tgz'},
        {os: 'darwin', arch: 'x64', suffix: 'macosx-universal.tgz'}
    ];

    if (JSON.stringify(macEntries) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(macEntries)}`);
    }
});
