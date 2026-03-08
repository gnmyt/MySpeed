import fs from 'node:fs';

const templatePath = new URL('./env.html', import.meta.url);

Deno.test('dev mode template uses a local logo asset instead of an external imgur URL', () => {
    const template = fs.readFileSync(templatePath, 'utf8');

    if (template.includes('https://i.imgur.com/aCmA6rH.png')) {
        throw new Error('Expected dev mode template to avoid the external Imgur logo URL');
    }

    if (!template.includes('/assets/img/logo.png')) {
        throw new Error('Expected dev mode template to reference /assets/img/logo.png');
    }
});
