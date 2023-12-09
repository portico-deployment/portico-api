import Fastify from 'fastify';
import fs from 'fs/promises';
import fastifyCors from '@fastify/cors';
import { start } from '@zombienet/orchestrator';
import { sanitizeNetwork, generateConfig, pidIsRunning } from './zombieHelpers.js';
import { init } from './setup.js';

import { URL } from 'url';

// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;
console.log(__dirname);




// replace with template registry!
const registry = {
    "parity-extended-template": {
        "spec": "./spec/parity-extended-chainspec.json",
        "bin": "./bin/parity-extended-node"
    },
    "parity-frontier-template": {
        "spec": "./spec/parity-frontier-chainspec.json",
        "bin": "./bin/frontier-parachain-node"
    }
};

// use args to trigger the setup
const cmd = (process.argv[2] && process.argv[2].trim());
switch( cmd ) {
    case 'setup':
        init(__dirname).catch(console.log);
        break;
    case 'clean':
        break;
}

// replace with fastify decorated
let globalNetwork;

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
    // Configure your CORS policy here
    origin: true // Or specify domains, e.g., 'http://localhost:3000'
});

fastify.post('/network/stop', async (_request, reply) => {
    if(! globalNetwork) {
        reply.send({ result: 'OK', running: false, msg: "Network not initialized!" });
        return;
    }
    globalNetwork.stop();
    // clean network instance
    globalNetwork = undefined;

    reply.send({ result: 'OK' });
});


fastify.post('/network', async (request, reply) => {
    const template = registry[request.body.template];
    if (!template) return reply.status(400).send({ code: 400, msg: "invalid template" });

    const requestTS = new Date().toISOString().split(".")[0].replaceAll(/[:-]/g, "");
    const networkTopology = await generateConfig(request.body, template, requestTS);
    await fs.writeFile(`./zombienet-config/config_${requestTS}_generated.json`, JSON.stringify(networkTopology, null, 4));
    // needs some validation here
    const network = await start("", networkTopology, {
        spawnConcurrency: 5,
    });

    globalNetwork = network;
    reply.send({ result: 'OK', network: await sanitizeNetwork(network) });
});

fastify.get('/network', async (request, reply) => {
    // At the moment we run one network
    if(! globalNetwork) {
        reply.send({ result: 'OK', running: false, msg: "Network not initialized!" });
        return;
    }

    const pids = Object.keys(globalNetwork.nodesByName).reduce((memo, name) => {
        memo.push(globalNetwork.client.processMap[name].pid);
        return memo;
    }, []);

    // only return ok if all the nodes are running
    const running = pids.every(pidIsRunning);
    const msg = running ? "OK" : "One or more node/s are down";
    reply.send({ result: 'OK', running, msg });

});

if( !cmd ) {
    fastify.listen({ port: 4000 }, err => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('Server listening on port 4000');
    });
}