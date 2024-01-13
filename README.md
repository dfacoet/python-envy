# Python Envy

Automatically activate Python virtual environments as you navigate the source code.

This is useful if you are working with a monorepo that contains sub-projects, modules, libraries or deployments with different Python dependencies. Or perhaps you want to automatically activate a development environment when you click on a test file.

## Features

As you can see in the following demo, the active Python environment changes as soon as a file is loaded into the editor.

![demo](images/https://raw.githubusercontent.com/teticio/python-envy/main/images/screenshot.gif)

## Requirements

The [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) must be enabled for this to work.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `pythonEnvy.enable`: Enable/disable automatic Python environment activation for this Workspace or globally. Set to `false` by default.
* `pythonEnvy.venv`: Location of the virtual environments. Set to `.venv` by default.

## Known Issues

N/A

## Release Notes

## [0.0.1]

- Initial release

## [0.1.0]

- Added settings to enable / disable and to specify `.venv` directory.
- Fixed for Windows.
- Now activates whenever Python extension activates and not just on loading a Python file.
- Made dependency on Python extension explicit.
- Updated README and include screenshot.
