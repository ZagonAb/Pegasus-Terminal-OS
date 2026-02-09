/*
 * Minimal Prompt Style
 * Clean and simple
 */
import QtQuick 2.15

QtObject {
    id: minimalPrompt

    readonly property string name: "minimal"
    readonly property string displayName: "Minimal Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var parts = displayPath.split("/");
            var currentDir = parts.length > 0 ? parts[parts.length - 1] : "~";
            if (currentDir === "") currentDir = "/";

            return "[" + currentDir + "] > ";
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        return "> ";
    }
}
