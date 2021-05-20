#!/usr/bin/env node

console.log('hello world')
const pkg = require('./package.json')
console.log(pkg)
console.log(process.env.PWD)


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