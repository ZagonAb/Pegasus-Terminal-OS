/*
 * Unix Traditional Prompt Style
 * Classic Unix/BSD style prompt
 */
import QtQuick 2.15

QtObject {
    id: unixPrompt

    readonly property string name: "unix"
    readonly property string displayName: "Unix Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var hostname = "pegasus";
            var promptChar = "%";
            if (kernel.currentUser === "root" || kernel.currentUser === "admin") {
                promptChar = "#";
            }

            return hostname + ":" + displayPath + " " + promptChar + " ";
        } else {
            return "pegasus:" + kernel.prompt + " ";
        }
    }

    function generateStatePrompt(kernel) {
        return "pegasus:" + kernel.prompt + " ";
    }
}
