const upload2FtpServer = require('./ftp.js');
const fs = require('fs');
const path = require('path');

// 递归查找获取 .vscode 文件夹路径
function getVscodePath(filepath) {
    if (path.basename(filepath) === '.vscode') {
        return filepath;
    }
    let files = fs.readdirSync(filepath);
    for (let i = 0; i < files.length; i++) {
        let filename = filepath + '/' + files[i];
        let stats = fs.statSync(filename);
        if (stats.isDirectory()) {
            if (files[i] === '.vscode') {
                return filename;
            } else {
                getVscodePath(filename);
            }
        }
    }

    return null;
}

// 读取 .vscode 文件夹下的 upload 配置文件
function readUploadConfig(path) {
    let config = {};
    let files = fs.readdirSync(path);
    for (let i = 0; i < files.length; i++) {
        let filename = path + '/' + files[i];
        let stats = fs.statSync(filename);
        if (stats.isFile()) {
            if (files[i] === 'upload.json') {
                const content = fs.readFileSync(filename, 'utf-8');
                if (content) {
                    config = JSON.parse(content);
                    return config;
                } else {
                    return null;
                }
            }
        }
    }

    return null;
}

// 获取所有路径下的文件
function travelFile(uploadfiles, localdir, remotedir)
{
    fs.readdirSync(localdir).forEach((file) => {
        let pathname = path.join(localdir, file);
        if (fs.statSync(pathname).isDirectory()) {
            travelFile(uploadfiles, pathname, path.join(remotedir, file));
            return;
        }

        let uploadFile = {
            localfile:pathname,
            remotefile:path.join(remotedir, file)
        };

        uploadfiles.push(uploadFile);
        console.log('uploadFile:', uploadFile);
    });
}

// 生成所有的待上传文件
function genAllUploadFiles(uploadfiles, dirs)
{
    if (dirs && dirs.length) {
        for (let i = 0; i < dirs.length; i++) {
            travelFile(uploadfiles, dirs[i].localdir, dirs[i].remotedir);
        }
    }
}

// 根据 config 配置文件内容，上传文件到服务器
async function upload(currentPath, callback) {
    const vscodePath = getVscodePath(currentPath);

    if (vscodePath === null) {
        throw('Can not find .vscode directory！');
    }

    const config = readUploadConfig(vscodePath);
    if (config === null) {
        throw('.vscode directory has no upload.json or upload.json content is null！');
    }

    if (!config.server || (!config.files && !config.dirs)) {
        throw('upload.json file has no \'server\' or \'files\' or \'dirs\' node！');
    }

    let files    = config.files;
    const server = config.server;
    const dirs   = config.dirs;

    // 检测 server 配置是否正确
    if (!server.host || !server.port || !server.user || !server.password) {
        throw('FTP server config error');
    }

    if (!server.host || !server.port || !server.user || !server.password) {
        throw('FTP server config error');
    }

    if (!files) {
        files = []
    }
    genAllUploadFiles(files, dirs);
    if (files.length === 0) {
        throw('there is no file need to upload');
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i].localfile === null || files[i].localfile === undefined || files[i].localfile === '') {
            callback(files[i], 'local file error')
            continue;
        }

        if (!files[i].remotefile === null || files[i].remotefile === '') {
            callback(files[i], 'remote file error')
            continue;
        }

        try {
            await upload2FtpServer(server, files[i].localfile, files[i].remotefile);
            callback(files[i])
        } catch(err) {
            callback(files[i], err)
        }
    }
}

module.exports = upload;
