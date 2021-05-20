#!/usr/bin/env node

console.log('hello world')
const pkg = require('./package.json')
console.log(pkg)
console.log(process.env.PWD)