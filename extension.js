const vscode = require('vscode');
const {upload, channel} = require('./src/upload.js');
// const channel = vscode.window.createOutputChannel('Upload Info');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('upload-to-ftp.upload', async function (uri) {
		channel.clear();

		let filePath = uri?.fsPath;
		if (!filePath) {
			// Access the currently active text editor
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				// Get the URI of the document open in the editor
				const documentUri = editor.document.uri;

				// Check if the file is a 'file' scheme (not a virtual document)
				if (documentUri.scheme === 'file') {
					// Get the full file path using fsPath
					filePath = documentUri.fsPath;
					channel.appendLine(`[filePath]: ${filePath}\n`);
					
				} else {
					vscode.window.showInformationMessage('The active document is not a file on disk.');
				}
			} else {
				vscode.window.showInformationMessage('No active text editor found.');
			}
		} 

		upload(filePath, (localfile, remotefile, err) => {
			if (!err) {
				channel.appendLine(`[Success]: ${localfile} >> remote:${remotefile}\t`);
				vscode.window.showInformationMessage('Uploaded');
			} else {
				channel.appendLine(`[Failed]: ${localfile} >> remote:${remotefile}\t`);
				// let msg = JSON.parse( JSON.stringify( err ) );
				let msg = `${err.code}: ${err}`;
				channel.appendLine(`\t\t<Error>: ${msg}\t`);
				vscode.window.showInformationMessage(msg);
			}
		}).then(data => {
			channel.appendLine("\n===================== Upload Finish ===========================");
		}).catch(err => {
			channel.appendLine("\n===================== Upload Error ===========================");
			channel.appendLine(err);
			vscode.window.showInformationMessage(err);
		});

		// channel.show();
	});

	channel.appendLine("push")
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
