const { PythonExtension } = require("@vscode/python-extension");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    let pythonApi = await PythonExtension.api();
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        await setupPythonEnvironment(activeEditor, pythonApi);
    }

    let disposable = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor) {
            await setupPythonEnvironment(editor, pythonApi);
        }
    });

    context.subscriptions.push(disposable);
}

async function setupPythonEnvironment(editor, pythonApi) {
    let currentDir = path.dirname(editor.document.uri.fsPath);
    const root = path.parse(currentDir).root;
    const currentWorkspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(editor.document.uri.path)).uri.path;
    const venvName = vscode.workspace.getConfiguration().get('pythonEnvy.venvName');

    while (currentDir !== root) {
        const venvPath = path.join(currentDir, venvName);

        if (fs.existsSync(venvPath) && fs.lstatSync(venvPath).isDirectory()) {
            const currentPythonPath =
                pythonApi.environments.getActiveEnvironmentPath();
            let pythonPath = path.join(venvPath, "bin", "python");
            if (!fs.existsSync(pythonPath)) {
                pythonPath = path.join(venvPath, "Scripts", "python.exe");
            }

            if (currentPythonPath.path !== pythonPath) {
                try {
                    await pythonApi.environments.updateActiveEnvironmentPath(pythonPath);
                    vscode.window.showInformationMessage(
                        `Python Envy: interpreter set to: ${pythonPath}`
                    );

                    // Handle kernel selection for notebooks
                    if (editor.document.fileName.endsWith('.ipynb')) {
                        await selectKernelForNotebook(editor, pythonPath);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(
                        `Python Envy: error setting Python interpreter: ${error.message}`
                    );
                }
            }
            return;
        }

        if (currentDir === currentWorkspaceFolder) {
            break;
        }

        currentDir = path.dirname(currentDir);
        if (currentDir === ".") {
            currentDir = "";
        }
    }
}

async function selectKernelForNotebook(editor, pythonPath) {
    try {
        // Get the Jupyter extension
        const jupyterExtension = vscode.extensions.getExtension('ms-toolsai.jupyter');
        if (!jupyterExtension) {
            vscode.window.showWarningMessage('Jupyter extension not found. Please install it to enable kernel selection.');
            return;
        }

        // Get the kernel manager
        const kernelManager = await jupyterExtension.exports.getKernelManager();
        
        // Get available kernels
        const kernels = await kernelManager.getKernels();
        
        // Find a kernel that matches our Python environment
        const matchingKernel = kernels.find(kernel => 
            kernel.interpreter?.path === pythonPath
        );

        if (matchingKernel) {
            // Select the matching kernel
            await kernelManager.selectKernel(matchingKernel, editor.document);
            vscode.window.showInformationMessage(
                `Python Envy: selected kernel for notebook: ${matchingKernel.display_name}`
            );
        } else {
            // If no matching kernel exists, create one
            const newKernel = await kernelManager.createKernel({
                interpreter: { path: pythonPath },
                display_name: `Python (${path.basename(path.dirname(pythonPath))})`
            });
            
            await kernelManager.selectKernel(newKernel, editor.document);
            vscode.window.showInformationMessage(
                `Python Envy: created and selected new kernel for notebook: ${newKernel.display_name}`
            );
        }
    } catch (error) {
        vscode.window.showErrorMessage(
            `Python Envy: error selecting kernel: ${error.message}`
        );
    }
}

function deactivate() { }

module.exports = {
    activate,
    deactivate,
};
