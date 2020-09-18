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
exports.TemplatesView = exports.Templates = void 0;
const vscode = require("vscode");
const connect_1 = require("./connect");
const fs = require("fs");
const path = require("path");
class Templates {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this
            ._onDidChangeTreeData.event;
        this.sync = true;
        this.connect = new connect_1.Connect();
        this.items = [];
        this.context.subscriptions.push(vscode.commands.registerCommand("extension.open-bb-template", (doctype, id) => {
            this.openTemplateFrom(id, doctype);
        }));
        this.context.subscriptions.push(vscode.commands.registerCommand("extension.insert-template", temp => {
            if (vscode.window.activeTextEditor) {
                const editor = vscode.window.activeTextEditor;
                // check if there is no selection
                if (editor.selection.isEmpty) {
                    // the Position object gives you the line and character where the cursor is
                    const position = editor.selection.active;
                    if (temp.doctype === "partial") {
                        const snippet = new vscode.SnippetString(`{% include '${temp.name}' %}`);
                        editor.insertSnippet(snippet, position);
                    }
                    if (temp.doctype === "stylesheet") {
                        const snippet = new vscode.SnippetString(`<link rel="stylesheet" href="{% stylesheet_url '${temp.name}' %}">`);
                        editor.insertSnippet(snippet, position);
                    }
                    if (temp.doctype === "javascript") {
                        const snippet = new vscode.SnippetString(`<script src="{% javascript_url '${temp.name}' %}"></script>`);
                        editor.insertSnippet(snippet, position);
                    }
                }
            }
        }));
        this.context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(e => {
            let basename = path
                .basename(e.uri.path)
                .split(".")
                .slice(0, -1)
                .join(".");
            var html = fs.readFileSync(e.uri.path, "UTF-8");
            var postdata = {
                record: {
                    html: html
                }
            };
            this.connect.putRequest("api/templates/" + basename, JSON.stringify(postdata));
        }));
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sync) {
                yield this.getItems();
                this.sync = false;
            }
            const templates = this.templates;
            return new Promise(function (resolve, reject) {
                if (element) {
                    const items = templates.map(function (val) {
                        if (val["kind"] === element.name) {
                            const temp = {
                                name: val["description"],
                                id: val["id"],
                                parent: val["kind"],
                                type: "template",
                                doctype: val["kind"]
                            };
                            return temp;
                        }
                    });
                    resolve(items.sort((a, b) => String(a.name).localeCompare(String(b.name))));
                }
                if (templates) {
                    var kindslist = templates.map(function (val) {
                        return val["kind"];
                    });
                    var kindslistUnique = kindslist.filter(onlyUnique);
                    const folders = kindslistUnique.map(function (val) {
                        const item = {
                            type: "folder",
                            name: val
                        };
                        return item;
                    });
                    resolve(folders);
                }
            });
        });
    }
    getTreeItem(element) {
        let treeItem = new vscode.TreeItem(element.name, element.type === "folder"
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None);
        if (element.type === "folder") {
        }
        if (element.type === "template") {
            treeItem.iconPath = vscode.ThemeIcon.File;
            treeItem.id = element.id;
            treeItem.command = {
                command: "extension.open-bb-template",
                title: "Open File",
                arguments: [element.doctype, element.id]
            };
            if (element.parent === "partial" ||
                element.parent === "javascript" ||
                element.parent === "stylesheet") {
                treeItem.contextValue = "insert";
            }
        }
        this.items.push(treeItem);
        return treeItem;
    }
    getItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.connect.getRequest("api/templates");
            var templates = [];
            const templatesList = JSON.parse(String(json));
            for (let index = 0; index < templatesList.length; index++) {
                if (templatesList[index]["generated_html"] === null) {
                    templates.push(templatesList[index]);
                }
            }
            this.templates = templates;
        });
    }
    refresh() {
        this.sync = true;
        this._onDidChangeTreeData.fire();
        console.log("refresh");
    }
    openTemplateFrom(id, doctype) {
        return __awaiter(this, void 0, void 0, function* () {
            let json = yield this.connect.getRequest("api/templates/" + id);
            let data = JSON.parse(String(json));
            // The code you place here will be executed every time your command is executed
            let dir_path = String(vscode.workspace.workspaceFolders[0].uri.path + "/" + doctype);
            if (fs.existsSync(dir_path)) {
            }
            else {
                fs.mkdirSync(dir_path);
            }
            var fextension = doctype;
            switch (doctype) {
                case "stylesheet":
                    fextension = "css";
                    break;
                case "partial":
                    fextension = "html";
                    break;
                case "endpoint":
                    fextension = "html";
                    break;
                case "javascript":
                    fextension = "js";
                    break;
                case "mail":
                    fextension = "html";
                    break;
                case "pdf":
                    fextension = "html";
                    break;
                case "soap":
                    fextension = "tmp";
                    break;
                default:
                    break;
            }
            let file_path = String(vscode.workspace.workspaceFolders[0].uri.path +
                "/" +
                doctype +
                "/" +
                id +
                "." +
                fextension);
            try {
                fs.writeFileSync(file_path, data.html, { mode: 0o755 });
            }
            catch (err) {
                // An error occurred
                console.error(err);
            }
            let fpath = vscode.Uri.file(file_path);
            vscode.workspace.openTextDocument(fpath).then(document => {
                vscode.window.showTextDocument(document, { preview: false });
            });
        });
    }
}
exports.Templates = Templates;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
class TemplatesView {
    constructor(context) {
        this.context = context;
        this.templates = new Templates(this.context);
        // vscode.window.registerTreeDataProvider('templates-view', templates);
        this.templatesView = vscode.window.createTreeView("templates-view", {
            treeDataProvider: this.templates
        });
        this.context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => {
            let basename = path
                .basename(e.document.uri.path)
                .split(".")
                .slice(0, -1)
                .join(".");
        }));
    }
    reloadTemplates() {
        this.templates.refresh();
    }
}
exports.TemplatesView = TemplatesView;
//# sourceMappingURL=templates.js.map