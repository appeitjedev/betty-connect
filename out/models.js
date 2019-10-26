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
const vscode = require("vscode");
const connect_1 = require("./connect");
class Models {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.sync = true;
        this.connect = new connect_1.Connect();
        // context.subscriptions.push(vscode.commands.registerCommand('extension.??????', (doctype: string, id: string) => {
        //     this.openTemplateFrom(id, doctype);
        // }));
        // context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((e) => {
        //     let basename = path.basename(e.uri.path, '.tmp');
        //     var html = fs.readFileSync(e.uri.path, 'UTF-8');
        //     var postdata = {
        //         record: {
        //             html: html
        //         }
        //     };
        //     this.connect.putRequest("api/templates/" + basename, JSON.stringify(postdata));
        // }));
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sync) {
                yield this.getItems();
                this.sync = false;
            }
            const models = this.models;
            return new Promise(function (resolve, reject) {
                if (element) {
                    var properties = [];
                    const modelProperties = models.map(function (val) {
                        if (val["id"] === element.id) {
                            for (let index = 0; index < val["properties"].length; index++) {
                                const item = {
                                    type: val["properties"][index]["kind"],
                                    name: val["properties"][index]["name"],
                                    id: val["properties"][index]["id"],
                                    parent: val["id"]
                                };
                                properties.push(item);
                            }
                            console.log(val["properties"]);
                        }
                        return properties;
                    });
                    resolve(properties.sort((a, b) => String(a.name).localeCompare(String(b.name))));
                }
                if (models) {
                    var modelsList = models.map(function (val) {
                        const item = {
                            type: "model",
                            name: val["name"],
                            id: val["id"]
                        };
                        return item;
                    });
                    resolve(modelsList);
                }
            });
        });
    }
    getTreeItem(element) {
        let treeItem = new vscode.TreeItem(element.name, element.type === "model" ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        if (element.type !== "model") {
            treeItem.iconPath = vscode.ThemeIcon.File;
            treeItem.tooltip = element.type;
            treeItem.description = element.type;
            //treeItem.command = { command: 'extension.opentemplate', title: "Open File", arguments: [element.doctype, element.id], };
        }
        return treeItem;
    }
    getItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.connect.getRequest("api/models");
            var models = [];
            const modelsList = JSON.parse(String(json));
            for (let index = 0; index < modelsList.length; index++) {
                models.push(modelsList[index]);
            }
            this.models = models;
        });
    }
    refresh() {
        this.sync = true;
        this._onDidChangeTreeData.fire();
        console.log("refresh");
    }
}
exports.Models = Models;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
class ModelsView {
    constructor(context) {
        this.context = context;
        this.models = new Models(this.context);
        this.modelsView = vscode.window.createTreeView('models-view', { treeDataProvider: this.models });
    }
    reloadTemplates() {
        this.models.refresh();
    }
}
exports.ModelsView = ModelsView;
//# sourceMappingURL=models.js.map