import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import os from 'os';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import decompress from 'decompress';
import decompressTargz from 'decompress-targz';
import chalk from 'chalk';

// portico-ui build
const BUILD  = "build/index.html";
const BUILD_ASSET = "https://github.com/portico-deployment/portico-ui/releases/download/v0.0.1/build.zip";

const BINS_LINUX = "https://github.com/portico-deployment/portico-api/releases/download/v0.0.1/bins_linux.tar.gz";
const BINS_MAC = "https://github.com/portico-deployment/portico-api/releases/download/v0.0.1/bins_mac.tar.gz";

const SUPPORTED = [
    "linux/x64",
    "darwin/arm64"
];

const bins = [
    // polkadot bins
    "bin/poladot", "bin/poladot-execute-worker", "bin/poladot-prepare-worker",
    // templates
    "templates/bin/parity-extended-node", "templates/bin/frontier-parachain-node"
];

export async function init(rootPath) {
    console.log(chalk.magenta('🏛  Portico setup initialization...'));
    console.log(chalk.magenta('🔎 Checking assets UI/BINS'));
    let needsBins = false;
    // check if the needed files are in place
    for( const bin of bins ) {
        const exist =  await fileExist(`${rootPath}/${bin}`);
        // change IFF not exist
        needsBins = exist ? needsBins : true;
    }

    const needsBuild = !await fileExist(`${rootPath}/${BUILD}`);

    const tmp = `${rootPath}/tmp`;
    if(needsBins || needsBuild) {
        await fs.mkdir(tmp, {recursive: true});
    }

    // Download needed files
    if(needsBuild) {
        console.log(chalk.magenta('\t Initializing UI...'));
        const dstFile = `${tmp}/build.zip`;
        await getAsset(BUILD_ASSET, dstFile);
        // decompress
        await decompress(dstFile, tmp);
        // mv
        await fs.rename(`${tmp}/build`, `${rootPath}/build`);
        console.log(chalk.green('✅ UI Done'));
    }

    if(needsBins) {
        console.log(chalk.magenta('\t Initializing BINS...'));
        // if something is needed check the arch and platform
        // currently we support linux x64/ darwin arm64
        const platform = os.platform();
        const arch = os.arch();
        if( !SUPPORTED.includes(`${platform}/${arch}`)) {
            console.log(chalk.red(`[ERR]: os/arch not supported ${platform}/${arch}`));
            console.log(`Supported: ${SUPPORTED}`);
            return;
        }

        // create dirs bin / templates/bin
        await Promise.all([
            fs.mkdir(`${rootPath}/bin`, {recursive: true}),
            //fs.mkdir(`${rootPath}/templates/bin`, {recursive: true})
        ]);

        // download file
        const url = platform === 'linux' ? BINS_LINUX : BINS_MAC;
        const dstFile = `${tmp}/bins.tar.gz`;
        await getAsset(url, dstFile);
        // decompress
        await decompress(dstFile, `${tmp}/bin`, { plugins: [ decompressTargz() ] });

        // mv
        await fs.rename(`${tmp}/bin`, `${rootPath}/bin`);
        console.log(chalk.green('✅ BINS Done'));
    }

    console.log(chalk.green.bold('🏛  Portico ready!'));
}

async function getAsset(url, dstFile, rootPath) {
    // download build
    const response = await fetch(url);

    const stream = createWriteStream(dstFile);
    await finished(Readable.fromWeb(response.body).pipe(stream));
}

async function fileExist(path, isDir = false) {
    try {
        const stats = await fs.stat(path);

        if(isDir) {
            if(stats.isDirectory()) return true;
            else {
                console.log(`[WARN]: ${path} exist but is not a directory`);
                return false;
            }
        }

        // is file a exist
        return true;
    } catch (err) {
        return false;
    }
}

// ( async () => {
//     await init(".")
// })();