#!/usr/bin/env node

console.log('@xiaobai-world/uplaod version:', require('./package.json').version)

const { default: axios } = require("axios");
const FormData = require("form-data");
const path = require('path')
const package = require(path.join(process.env.PWD, 'package.json'));


const fs = require('fs')
const { execSync } = require('child_process')
const distPath = process.env.PWD + '/dist'

function readDir(dir, arr) {
    const files = fs.readdirSync(dir);
    files.forEach((item) => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        const file = {
            fullPath,
            baseName: path.basename(fullPath),
            relativePath: fullPath.replace(distPath, ''),
            size: stat.size
        }
        file.type = stat.isDirectory() ? 'directory' : 'file'
        if (file.type === 'directory') {
            readDir(path.join(dir, item), arr);
        } else {
            file.type = 'file'
        }
        arr.push(file)
    });
    return arr;
}

async function upload(file) {
    let form = new FormData()
    form.append('appVersion', package.version)
    form.append('packageName', package.name)
    form.append('appName', package.appName)
    form.append('baseName', file.baseName)
    form.append('relativePath', file.relativePath)
    form.append('description', package.description ? package.description : 'the description field of package.json has not been set')
    form.append('type', file.type)
    form.append('size', file.size)
    if (file.type === 'file') {
        form.append('file', fs.createReadStream(file.fullPath))
    }
    const res = await axios.post('http://localhost:3001/store/upload', form, {
        headers: form.getHeaders()
    })
    console.log(`upload success: ${file.relativePath}`)
}

async function start() {

    // clear the file list of the test enviroment
    await axios.post('http://localhost:3001/store/cleanTestApp', {
        appVersion: package.version,
        appName: package.appName
    })

    // get upload path
    const pathRes = await axios.post('http://localhost:3001/store/getBasePath', {
        appVersion: package.version,
        appName: package.appName
    })

    // npm run build
    const cmd = `npm run build -- --logLevel=all --manifest --base=${pathRes.data}/`
    const execRes = execSync(cmd, {
        cwd: process.env.PWD
    }).toString()

    console.log('done', execRes)

    const fileList = readDir(distPath, []);

    for (let file of fileList) {
        await upload(file)
    }

    const faviconIdx = fileList.findIndex(file => /favicon.*(svg|png|gif|ico)$/.test(file.baseName))

    if (faviconIdx < 0) {
        throw new Error('favicon icon not found. please ensure favicon.svg(also can be png,gif) in src and index.html included it.')
    }

    // check entry
    const mainifest = require(path.join(distPath, 'manifest.json'))
    await axios.post('http://localhost:3001/store/setTestAppEntry', {
        // report favicon.path, will be used as the icon of the application
        favicon: path.join(pathRes.data, fileList[faviconIdx].relativePath),
        // js entry
        jsEntry: path.join(pathRes.data, mainifest['index.html'].file),
        css: mainifest['index.html'].css.map(p => path.join(pathRes.data, p)),
        appVersion: package.version,
        appName: package.appName
    })

}

start()