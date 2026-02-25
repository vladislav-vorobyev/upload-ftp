const upload2FtpServer = require('./ftp.js');
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const channel = vscode.window.createOutputChannel('Upload Info');

// Locate .vscode/upload-to-ftp.json for the path
function getConfigPath(dirpath) {
    if (!dirpath) return null;

    try {
        let filename = dirpath + '/.vscode/upload-to-ftp.json';
        let stats = fs.statSync(filename);
        if (stats.isFile()) {
            return filename;
        }
    } catch(e) {}

    // try to find in upper folder
    const upperdir = path.dirname(dirpath);
    if (upperdir != dirpath) {
        return getConfigPath(upperdir);
    }

    return null;
}

// Read a config from the file
function readUploadConfig(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    if (content) {
        return JSON.parse(content);
    }

    return null;
}

// Upload the file
async function upload(filename, callback) {
    const configfile = getConfigPath(path.dirname(filename));
    channel.appendLine(`[configPath] ${configfile}\n`);

    if (configfile === null) {
        throw('Can not find .vscode/upload-to-ftp.json file！');
    }

    const config = readUploadConfig(configfile);
    if (config === null) {
        throw('Configuration content is null！');
    }

    if (!config.server || !config.localpath || !config.remotepath) {
        throw('upload-to-ftp.json file has no \'server\' or \'loacalpath\' or \'remotepath\' node！');
    }

    const server = config.server;

    // Check server config
    if (!server.host || !server.port || !server.user || !server.password) {
        throw('FTP server config error');
    }

    const remotefile = filename.replace(config.localpath, config.remotepath).replaceAll('\\', '/');

    try {
        await upload2FtpServer(server, filename, remotefile);
        callback(filename, remotefile)
    } catch(err) {
        callback(filename, remotefile, err)
    }
}

module.exports = {upload, channel};