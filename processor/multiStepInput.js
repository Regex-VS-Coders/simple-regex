const vscode = require('vscode');

import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri } from 'vscode';

// Creates an instance of MyButton to be used as a custom quick input button
// Allows users to add new flavors
async function multiStepInput(context) {

    // Defines the mybutton class 
    class MyButton {
        constructor(iconPath, tooltip) {
            // Ensures the iconPath object contains 'light' and 'dark' properties
            this.iconPath = {
                light: vscode.Uri.file(iconPath.light),
                dark: vscode.Uri.file(iconPath.dark)
            };
            this.tooltip = tooltip;
        }
    }
    
    const addFlavorButton = new MyButton({
        dark: vscode.Uri.file(context.asAbsolutePath('resources/dark/add.svg')),
        light: vscode.Uri.file(context.asAbsolutePath('resources/light/add.svg')),
    }, 'Input Supported Programming Language');

    async function selectFlavor(input, state) {
        // Maps each string in the flavors array to a QuickPickItem object.
        // so that each object shows a selectable item with its label set to the flavor name
        const flavors = [{
            language: 'JavaScript', 
            flavor: 'ecma'
        }, {
            language: 'TypeScript', 
            flavor: 'ecma'
        }, {
            language: 'Golang', 
            flavor: 're2'
        }, {
            language:'C',
            flavor: 'basic'
        }];
        const pick = await input.showQuickPick({
            title: 'Pick a Flavor',
            step: 1,
            totalSteps: 3,
            items: flavors,
            placeholder: 'Pick your flavor',
            buttons: [addFlavorButton]
        });
        state.flavor = pick.label;
        return (input) => inputRegexPattern(input, state); // Proceed to regex pattern input
    }

    // Defines a unction for collection of inputs   
    async function collectInputs() {
        // Initialize state
        const state = {};
        await MultiStepInput.run(input => selectFlavor(input, state));
        return state;
    }

    const state = await collectInputs();
    console.log(`You selected the flavor: ${state.flavor}`);

    console.log(`Regex pattern: ${state.regexPattern}`);
    console.log(`Test string: ${state.testString}`);

    // Regex testing
    const regex = new RegExp(state.regexPattern);
    const testResult = regex.test(state.testString);
    vscode.window.showInformationMessage(`Test result: ${testResult}`);

    async function inputRegexPattern(input, state) {
        const regexPattern = await input.showInputBox({
            title: 'Enter Regex Pattern',
            step: 2,
            totalSteps: 3,
            value: '',
            prompt: 'Enter your regex pattern',
            validate: (text) => text.length > 0 
            
        });
        state.regexPattern = regexPattern;
        return (input) => inputTestString(input, state); // can now Proceed to test string input
    }

    async function inputTestString(input, state) {
        const testString = await input.showInputBox({
            title: 'Enter Test String',
            step: 3,
            totalSteps: 3,
            value: '',
            prompt: 'Enter a string to test against the regex',
            validate: (text) => text.length > 0
        });
        state.testString = testString;
    }
}

class MultiStepInput {

	static async run(start) {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	current;
	steps = [];

	async stepThrough(start) {
		let step = start;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				if (err === InputFlowAction.back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err === InputFlowAction.resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.cancel) {
					step = undefined;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
	}

	async showQuickPick({ title, step, totalSteps, items, activeItem, ignoreFocusOut, placeholder, buttons, shouldResume }) {
		const disposables = [];
		try {
			return await new Promise((resolve, reject) => {
				const input = window.createQuickPick();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.ignoreFocusOut = ignoreFocusOut ?? false;
				input.placeholder = placeholder;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(item);
						}
					}),
					input.onDidChangeSelection(items => resolve(items[0])),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}

	async showInputBox({ title, step, totalSteps, value, prompt, validate, buttons, ignoreFocusOut, placeholder, shouldResume }: P) {
		const disposables = [];
		try {
			return await new Promise((resolve, reject) => {
				const input = window.createInputBox();
				input.title = title;
				input.step = step;
				input.totalSteps = totalSteps;
				input.value = value || '';
				input.prompt = prompt;
				input.ignoreFocusOut = ignoreFocusOut ?? false;
				input.placeholder = placeholder;
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || [])
				];
				let validating = validate('');
				disposables.push(
					input.onDidTriggerButton(item => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.back);
						} else {
							resolve(item);
						}
					}),
					input.onDidAccept(async () => {
						const value = input.value;
						input.enabled = false;
						input.busy = true;
						if (!(await validate(value))) {
							resolve(value);
						}
						input.enabled = true;
						input.busy = false;
					}),
					input.onDidChangeValue(async text => {
						const current = validate(text);
						validating = current;
						const validationMessage = await current;
						if (current === validating) {
							input.validationMessage = validationMessage;
						}
					}),
					input.onDidHide(() => {
						(async () => {
							reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
						})()
							.catch(reject);
					})
				);
				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				this.current.show();
			});
		} finally {
			disposables.forEach(d => d.dispose());
		}
	}
}
