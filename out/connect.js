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
class Connect {
    constructor() {
        this.bettyapp = String(vscode.workspace.getConfiguration().get('betty.bettyapp'));
        this.username = String(vscode.workspace.getConfiguration().get('betty.username'));
        this.apiKey = String(vscode.workspace.getConfiguration().get('betty.apikey'));
    }
    getRequest(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = this.username;
            const apiKey = this.apiKey;
            const url = "https://" + this.bettyapp + ".bettyblocks.com/" + endpoint;
            return new Promise(function (resolve, reject) {
                request.get({
                    url: url,
                    method: "GET",
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': 'Basic ' + Buffer.from(username + ':' + apiKey).toString('Base64')
                    }
                }, (err, res, body) => {
                    if (err) {
                        reject(err);
                    }
                    if (res.statusCode === 200) {
                        resolve(body);
                    }
                });
            });
        });
    }
    putRequest(endpoint, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, apiKey } = this;
            //  = this.username;
            // const apiKey = this.apiKey;
            const url = "https://" + this.bettyapp + ".bettyblocks.com/" + endpoint;
            return new Promise(function (resolve, reject) {
                request.put({
                    url,
                    method: "PUT",
                    body,
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': `Basic ${Buffer.from(username + ':' + apiKey).toString('Base64')}`
                    }
                }, (err, res, body) => {
                    if (err) {
                        vscode.window.showInformationMessage(err);
                        return err;
                    }
                    if (res.statusCode === 200) {
                        let obj = JSON.parse(body);
                        vscode.window.setStatusBarMessage('Saved ' + obj["description"]);
                    }
                });
            });
        });
    }
}
exports.Connect = Connect;
//# sourceMappingURL=connect.js.map