/*
 * Powerline Prompt Style
 * Styled with powerline separators (requires Unicode support)
 */
import QtQuick 2.15

QtObject {
    id: powerlinePrompt

    readonly property string name: "powerline"
    readonly property string displayName: "Powerline Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var separator = "";
            var endSymbol = "";

            var shortPath = displayPath;
            if (shortPath.length > 20) {
                var parts = shortPath.split('/');
                if (parts.length > 3) {
                    shortPath = "…/" + parts[parts.length - 2] + "/" + parts[parts.length - 1];
                }
            }

            return "[" + kernel.currentUser + "@pegasus]" + separator +
            "[" + shortPath + "]" + endSymbol + " ";
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        var separator = "";
        if (kernel.bootState === kernel.states.LOGIN_USERNAME) {
            return "[login]" + separator + " ";
        } else if (kernel.bootState === kernel.states.LOGIN_PASSWORD) {
            return "[password]" + separator + " ";
        }
        return "[system]" + separator + " ";
    }
}
