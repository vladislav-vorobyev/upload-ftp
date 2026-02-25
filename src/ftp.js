const ftp = require('ftp');
const path = require('path');
const fs = require('fs');

// upload a local file to the server
function upload2FtpServer(Server, localFile, Remotefile) {
    return new Promise((resolve, reject) => {

        const client = new ftp();

        client.on('ready', () => {
            // create a dir for remote file
            client.mkdir(path.dirname(Remotefile), true, reject);

            // check access to local file
            fs.access(localFile, fs.F_OK, reject);

            // upload the file
            client.put(localFile, Remotefile, reject);

            // close connection
            client.end();

            resolve();
        });

        client.on('error', reject);

        client.connect({
            host: Server.host,
            user: Server.user,
            password: Server.password,
            port: Server.port
        });
    });
}

module.exports = upload2FtpServer;
