/*
 * Retro DOS Prompt Style
 * Classic C:\> style
 */
import QtQuick 2.15

QtObject {
    id: retroPrompt

    readonly property string name: "retro"
    readonly property string displayName: "Retro Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var dosPath = displayPath
            .replace(/^\/$/, "C:\\")
            .replace(/\//g, "\\")
            .replace(/^~/, "C:\\Users\\" + kernel.currentUser);

            return dosPath + ">";
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        return "C:\\>";
    }
}
