"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const templates_1 = require("./templates");
const models_1 = require("./models");
// this method is called when your extension is activated.
// your extension is activated the very first time the command is executed
function activate(context) {
    var templatesView;
    var modelsView;
    if (vscode.workspace.workspaceFolders) {
        var bettyapp = String(vscode.workspace.getConfiguration().get("betty.bettyapp"));
        var username = String(vscode.workspace.getConfiguration().get("betty.username"));
        var apiKey = String(vscode.workspace.getConfiguration().get("betty.apikey"));
        function loadTemplates() {
            if (apiKey && username && bettyapp) {
                templatesView = new templates_1.TemplatesView(context);
                modelsView = new models_1.ModelsView(context);
            }
            else {
                vscode.window.showErrorMessage("Connection failed!! try betty connect or betty reload templates");
            }
        }
        loadTemplates();
        vscode.window.setStatusBarMessage("Betty started");
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Congratulations, your extension "betty" is now active!');
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        vscode.commands.registerCommand("extension.reload-templates", () => __awaiter(this, void 0, void 0, function* () {
            templatesView.reloadTemplates();
        }));
        //
        vscode.commands.registerCommand("extension.connect", () => __awaiter(this, void 0, void 0, function* () {
            // The code you place here will be executed every time your command is executed
            bettyapp = String(yield vscode.window.showInputBox({
                placeHolder: "name-of-your-app",
                ignoreFocusOut: true,
                prompt: "Type in your app identiefier",
            }));
            if (bettyapp !== "") {
                yield vscode.workspace
                    .getConfiguration()
                    .update("betty.bettyapp", bettyapp);
            }
            username = String(yield vscode.window.showInputBox({
                placeHolder: "username@email.com",
                ignoreFocusOut: true,
                prompt: "Type in your betty user account: name@email.com",
            }));
            if (username !== "") {
                yield vscode.workspace
                    .getConfiguration()
                    .update("betty.username", username);
            }
            apiKey = String(yield vscode.window.showInputBox({
                placeHolder: "api key",
                ignoreFocusOut: true,
                prompt: "Type in your api key for the user account from the previous input. You can get this if you can get the the user management in my.bettyblocks.com",
            }));
            if (apiKey !== "") {
                yield vscode.workspace
                    .getConfiguration()
                    .update("betty.apikey", apiKey);
            }
            loadTemplates();
            // templatesView.reloadTemplates();
        }));
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map