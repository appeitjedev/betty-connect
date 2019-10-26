import * as vscode from 'vscode';
import * as request from 'request';

export class Connect {
    bettyapp: String;
    username: String;
    apiKey: String;
    constructor() {
        this.bettyapp = String(vscode.workspace.getConfiguration().get('betty.bettyapp'));
        this.username = String(vscode.workspace.getConfiguration().get('betty.username'));
        this.apiKey = String(vscode.workspace.getConfiguration().get('betty.apikey'));
    }

    public async getRequest(endpoint: string): Promise<string> {
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
    }

    public async putRequest(endpoint: string, body: string): Promise<void> {
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
    }
}