#!/usr/bin/env node

const { execSync } = require('child_process')
const os = require('os')
const platform = os.platform()

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

let ls;
if (platform.startsWith('win')) {
    ls = execSync("dir /S /B")
} else {
    ls = execSync("ls -R ./dist |awk '{print i$0}' i=`pwd`'/'")
}

console.log(ab2str(ls.buffer).split(/[\r\n]/))


/**
 * 1. read dist, and push to xiaobai-backend.
 * 2. on pushed to xiaobai-backend, save file to rand directory.
 * 3. vite project must have "store" field,example:
 * ```
 * store: {
 *    name: "xxx",
 *    id: "xxx",
 *    icon: "xxx",
 *    git: "git registry, optional"
 * }
 * ```
 */