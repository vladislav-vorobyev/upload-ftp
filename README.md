# upload-to-ftp

This is a vscode extension called "upload-to-ftp". It helps to upload files to FTP Server Simply. 

---
## Features
This tool has these features now:
- support create directories automatically;
- support upload current file from editor;
- support one config file for one server.
---
## Usage

First, you need to create a upload-to-ftp.json file in .vscode folder.

The upload.json file format is easy like this:
```json
{
    "server": {
        "host": "10.9.3.200",
        "port": 21,
        "user": "root",
        "password": "root"
    },
    "localpath": "/home/user/Project/www/",
    "remotepath": "/www/"
}
```

After that, you can simply use `alt + d` to upload current openned file.


---
## Known Issues

---

## Release Notes


### 0.0.1

- support create directories automatically;
- support upload more than one file at a time;
- support 'workspace' mode in vscode.

### 0.0.2

- Add icon.

### 0.0.3

- Support upload directories.

### 0.1.0

- multiple upload has been removed;
- support upload current file from editor;
- support one config file for one server.



---


**Enjoy!**
