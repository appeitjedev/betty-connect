// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TemplatesView } from './templates';
import { ModelsView } from './models';

// this method is called when your extension is activated.
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	var templatesView: TemplatesView;
	var modelsView: ModelsView;

	if (vscode.workspace.workspaceFolders) {
		var bettyapp = String(vscode.workspace.getConfiguration().get('betty.bettyapp'));
		var username = String(vscode.workspace.getConfiguration().get('betty.username'));
		var apiKey = String(vscode.workspace.getConfiguration().get('betty.apikey'));
		function loadTemplates() {
			if (apiKey && username && bettyapp) {
				templatesView = new TemplatesView(context);
				modelsView = new ModelsView(context);
			} else {
				vscode.window.showErrorMessage("Connection failed!! try betty connect or betty reload templates");
			}
		}

		loadTemplates();

		vscode.window.setStatusBarMessage('Betty started');
		// Use the console to output diagnostic information (console.log) and errors (console.error)
		// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "betty" is now active!');

		// The command has been defined in the package.json file
		// Now provide the implementation of the command with registerCommand
		// The commandId parameter must match the command field in package.json
		vscode.commands.registerCommand('extension.reload-templates', async () => {
			templatesView.reloadTemplates();
		});

		//
		vscode.commands.registerCommand('extension.connect', async () => {
			// The code you place here will be executed every time your command is executed
			bettyapp = String(await vscode.window.showInputBox({
				placeHolder: 'name-of-your-app',
				ignoreFocusOut: true,
				prompt: 'Type in your app identiefier'
			}));
			if (bettyapp !== "") {
				await vscode.workspace.getConfiguration().update('betty.bettyapp', bettyapp);
			}
			username = String(await vscode.window.showInputBox({
				placeHolder: 'username@email.com',
				ignoreFocusOut: true,
				prompt: 'Type in your betty user account: name@email.com'
			}));
			if (username !== "") {
				await vscode.workspace.getConfiguration().update('betty.username', username);
			}

			apiKey = String(await vscode.window.showInputBox({
				placeHolder: 'api key',
				ignoreFocusOut: true,
				prompt: 'Type in your api key for the user account from the previous input. You can get this if you can get the the user management in my.bettyblocks.com'
			}));
			if (apiKey !== "") {
				await vscode.workspace.getConfiguration().update('betty.apikey', apiKey);
			}
			loadTemplates();
			// templatesView.reloadTemplates();
		});

	}
}

// this method is called when your extension is deactivated
export function deactivate() {

}

