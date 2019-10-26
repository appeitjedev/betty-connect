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
const request = require("request");
class TemplateEndpoint {
    constructor(context, tempType, username, password, bettyapp) {
        this.context = context;
        this.tempType = tempType;
        this.username = username;
        this.password = password;
        this.bettyapp = bettyapp;
    }
    getChildren(temp) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://" + this.bettyapp + ".bettyblocks.com/api/templates?f[name]=" + this.tempType;
            function getData(url, username, password, tempType) {
                var templates = [];
                return new Promise(function (resolve, reject) {
                    request.get({
                        url: url,
                        method: "GET",
                        headers: {
                            'Content-type': 'application/json',
                            'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('Base64')
                        }
                    }, (err, res, body) => {
                        if (err) {
                            vscode.window.showInformationMessage(err);
                            reject(err);
                        }
                        if (res.statusCode === 200) {
                            let items = JSON.parse(body);
                            var docType = tempType;
                            for (let index = 0; index < items.length; index++) {
                                if (items[index]["generated_html"] === null) {
                                    const item = new Template(items[index]["description"], items[index]["id"], items[index]["description"], vscode.TreeItemCollapsibleState.None, { command: 'extension.opentemplate', title: "Execute", arguments: [docType, items[index]["description"], items[index]["id"]] });
                                    templates.push(item);
                                }
                            }
                            console.log("loaded readdy");
                            resolve(templates.sort((a, b) => String(a.label).localeCompare(String(b.label))));
                        }
                    });
                });
            }
            let templates = yield getData(url, this.username, this.password, this.tempType);
            console.log("get data");
            console.log(templates);
            return templates;
        });
    }
    getTreeItem(temp) {
        return temp;
    }
}
exports.TemplateEndpoint = TemplateEndpoint;
class Template extends vscode.TreeItem {
    constructor(type, id, label, collapsibleState, command) {
        super(label, collapsibleState);
        this.type = type;
        this.command = command;
        this.id = id;
    }
}
//# sourceMappingURL=endpoints.js.map