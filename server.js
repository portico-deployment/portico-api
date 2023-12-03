import Fastify from 'fastify';
import fs from 'fs/promises';
import fastifyCors from '@fastify/cors';
import { start } from '@zombienet/orchestrator';
import { sanitizeNetwork, generateConfig } from './zombieHelpers.js';

// replace with template registry!
const registry = {
    "parity-extended-template": {
        "spec": "./spec/parity-extended-chainspec.json",
        "bin": "./bin/parity-extended-node"
    }
};

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors, {
    // Configure your CORS policy here
    origin: true // Or specify domains, e.g., 'http://localhost:3000'
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

    reply.send({ result: 'OK', network: sanitizeNetwork(network) });
});

fastify.listen({ port: 4000 }, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('Server listening on port 4000');
});