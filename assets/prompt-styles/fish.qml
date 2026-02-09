/*
 * Fish Shell Prompt Style
 * Fish shell style with colored indicators
 */
import QtQuick 2.15

QtObject {
    id: fishPrompt

    readonly property string name: "fish"
    readonly property string displayName: "Fish Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var userHost = kernel.currentUser + "@pegasus";
            var inHome = displayPath === "~" || displayPath.startsWith("~/");
            var isRoot = kernel.currentUser === "root" || kernel.currentUser === "admin";
            var prompt = userHost + " ";

            if (inHome) {
                prompt += "~" + displayPath.substring(1);
            } else {
                prompt += displayPath;
            }

            prompt += " > ";

            return prompt;
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        if (kernel.bootState === kernel.states.LOGIN_USERNAME) {
            return "login > ";
        } else if (kernel.bootState === kernel.states.LOGIN_PASSWORD) {
            return "password > ";
        } else if (kernel.bootState === kernel.states.USER_CREATION) {
            return "setup > ";
        }
        return "system > ";
    }
}
