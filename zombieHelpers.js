import fs from "fs/promises";
import path from "path";
import { generateKeyFromSeed } from './keyHelper.js';

export async function sanitizeNetwork(network) {
    const relay = await Promise.all(network.relay.map( async (node) => {
        return await sanitizeNode(node);
    }));

    let paras = {};
    for(const paraId of Object.keys(network.paras)) {
        const nodes = await Promise.all(network.paras[paraId].nodes.map(async (node) => {
            return await sanitizeNode(node)
        }));
        paras[paraId] = nodes;
    }

    return {
        ns: network.namespaces,
        relay,
        paras,
    }
}

export async function generateConfig(config, template, ts, zombienetConfigs) {
    const customSpecPath = `${zombienetConfigs}/spec_${ts}_generated.json`;
    const customSpec = await customizeSpec(config, path.join("./templates", template.spec), customSpecPath);
    const para = {
        "id": config.para_id,
        // always local?
        "chain": "local",
        "add_to_genesis": false,
        "onboard_as_parachain": false,
        "chain_spec_path": customSpecPath,
        "collators": [],
        "collator_groups": [{
            "name": "para-collator",
            "count": config.collators_count,
            "command": template.bin //TODO: resolve templates paths path.join("./templates", template.bin)
        }]
    };

    let networkDef = baseNetwork();
    networkDef.parachains.push(para);
    return networkDef;
}

export function pidIsRunning(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch(e) {
      return false;
    }
  }

// internals
async function customizeSpec(config, specPath, dstPath) {
    // read and customize the properties
    const content = (await fs.readFile(specPath)).toString();
    let spec = JSON.parse(content);
    const {ss58, decimals, symbol} = config.properties;

    spec.properties = {
        "ss58Format": ss58,
        "tokenDecimals": decimals,
        "tokenSymbol": symbol,
    };

    // write the custom spec
    await fs.writeFile(dstPath, JSON.stringify(spec, null, 4));
}

function baseNetwork() {
    return {
        // ensure native provider
        "settings": {
            "provider": "native"
        },
        "relaychain": {
            "chain": "rococo-local",
            // we should use server path as ref
            "default_command": "./bin/polkadot",
            "nodes": [
                {
                    "name": "alice",
                },
                {
                    "name": "bob",
                }
            ]
        },
        "parachains": []
    };
};

async function sanitizeNode({ name, wsUri, prometheusUri, multiAddress }) {
    const account = await generateKeyFromSeed(name);
    const parts = multiAddress.split("/");
    return {
        name,
        wsUri,
        prometheusUri,
        p2pId: parts[parts.length - 1],
        account
    }
}
