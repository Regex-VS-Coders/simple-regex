// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below



const vscode = require('vscode');
const regexFunction = require('./processor/regexFunction');



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	
	// need to define this and other regex of other languages elsewhere?
	const defaultregex = /(^|\s|[()={},:?;])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy]*))(\s|[()={},:?;]|$)/g;
	// const pythonRegex = 
	// const javascriptRegex = 
	// const typescriptRegex = 

	const regexHighlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(100,100,100,.35)' });
    const matchHighlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(255,255,0,.35)' });

	const languages = ['JavaScript', 'Python', 'Golang', 'C'];
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "simple-regex" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('simple-regex.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Simple Regex!');
	});

	context.subscriptions.push(disposable);
}




function getRegex(languageId) {
    switch (languageId) {
        case 'golang':
            return golangRegex;
        case 'javascript':
            return javascriptRegex;
        case 'python':
            return pythonRegex;
		case 'typescript':
			return typescriptRegex;
        default:
            return defaultregex; 
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
