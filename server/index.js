import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import * as timerTask from './tasks/timer.js';
import * as integrationTask from './tasks/integrations.js';
import './util/createFolders.js';
import { loadServers } from './util/loadServers.js';
import errorHandler from './util/errorHandler.js';
import errorMiddleware from './middlewares/error.js';
import configRoutes from './routes/config.js';
import speedtestsRoutes from './routes/speedtests.js';
import systemRoutes from './routes/system.js';
import storageRoutes from './routes/storage.js';
import recommendationsRoutes from './routes/recommendations.js';
import nodesRoutes from './routes/nodes.js';
import integrationsRoutes from './routes/integrations.js';
import prometheusRoutes from './routes/prometheus.js';
import opengraphRoutes from './routes/opengraph.js';
import db from './config/database.js';
import * as config from './controller/config.js';
import { initialize as initializeIntegrations } from './controller/integrations.js';
import { requestInterfaces } from './util/loadInterfaces.js';
import { load as loadCli } from './util/loadCli.js';
import { removeOld } from './tasks/speedtest.js';

const devModeHtml = fs.readFileSync(path.join(process.cwd(), 'server', 'templates', 'env.html'), 'utf-8');

const app = express();

app.disable('x-powered-by');

const clientPublicPath = path.join(process.cwd(), 'client', 'public');

const port = process.env.SERVER_PORT || 5216;
const httpsPort = process.env.HTTPS_PORT || 5217;

const certsDir = path.join(process.cwd(), 'data', 'certs');
const certPath = path.join(certsDir, 'cert.pem');
const keyPath = path.join(certsDir, 'key.pem');

const hasSSLCerts = () => fs.existsSync(certPath) && fs.existsSync(keyPath);

process.on('uncaughtException', err => errorHandler(err));

app.use(express.json({ limit: '50mb' }));
app.use(errorMiddleware);

if (fs.existsSync(clientPublicPath)) {
    app.use(express.static(clientPublicPath));
}

app.use("/api/config", configRoutes);
app.use("/api/speedtests", speedtestsRoutes);
app.use("/api/info", systemRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/nodes", nodesRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/prometheus", prometheusRoutes);
app.use('/api/opengraph', opengraphRoutes);
app.use("/api*all", (req, res) => res.status(404).json({message: "Route not found"}));

let buildPath = path.join(process.cwd(), 'build');
let buildExists = fs.existsSync(buildPath);

if (buildExists) {
    app.use(express.static(buildPath));
    app.get('*all', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
} else {
    app.get("*all", (req, res) => res.status(500).type('html').send(devModeHtml));
}

const run = async () => {
    await db.sync({alter: true, force: false});

    await initializeIntegrations();

    await requestInterfaces();
    setInterval(() => requestInterfaces(), 3600000);

    await loadServers();

    if (process.env.PREVIEW_MODE !== "true") await loadCli();

    await config.insertDefaults();

    timerTask.startTimer(await config.getValue("cron"));
    setInterval(async () => removeOld(), 60000);

    integrationTask.startTimer();
    if (process.env.RUN_TEST_ON_STARTUP === "true") {
        timerTask.runTask().then(undefined);
    }

    app.listen(port, () => console.log(`Server listening on port ${port}`));

    if (hasSSLCerts()) {
        try {
            const sslOptions = {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath)
            };

            https.createServer(sslOptions, app).listen(httpsPort, () =>
                console.log(`HTTPS server listening on port ${httpsPort}`)
            );
        } catch (err) {
            console.error(`Failed to start HTTPS server: ${err.message}`);
        }
    }
}

db.authenticate().then(() => {
    console.log("Successfully connected to the database " + (process.env.DB_TYPE === "mysql" ? "server" : "file"));
    return run().catch(errorHandler);
}).catch(err => {
    console.error("Could not open the database file. Maybe it is damaged?: " + err.message);
    process.exit(111);
});
