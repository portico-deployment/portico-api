import fs from "fs/promises";
import path from "path";

export function sanitizeNetwork(network) {
    const relay = network.relay.map(sanitizeNode)

    const paras = Object.keys(network.paras).reduce((memo, paraId) => {
        const nodes = network.paras[paraId].nodes.map(sanitizeNode);
        memo[paraId] = nodes;
        return memo;
    }, {});

    return {
        ns: network.namespaces,
        relay,
        paras,
    }
}

export async function generateConfig(config, template, ts) {
    const customSpecPath = `./zombienet-config/spec_${ts}_generated.json`;
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
            "command": path.join("./templates", template.bin)
        }]
    };

    let networkDef = baseNetwork();
    networkDef.parachains.push(para);
    return networkDef;
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

function sanitizeNode({ name, wsUri, prometheusUri, multiAddress }) {
    const parts = multiAddress.split("/");
    return {
        name,
        wsUri,
        prometheusUri,
        p2pId: parts[parts.length - 1]
    }
}
