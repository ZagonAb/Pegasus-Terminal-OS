/*
 * Default Prompt Style
 * Standard Bash-like prompt
 */
import QtQuick 2.15

QtObject {
    id: defaultPrompt

    readonly property string name: "default"
    readonly property string displayName: "Default Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var promptSymbol = "$";
            if (kernel.currentUser === "root" || kernel.currentUser === "admin") {
                promptSymbol = "#";
            }

            return kernel.currentUser + "@pegasus:" + displayPath + promptSymbol + " ";
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        return kernel.prompt;
    }
}
