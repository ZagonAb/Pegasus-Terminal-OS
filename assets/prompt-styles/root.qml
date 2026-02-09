/*
 * Root Prompt Style
 * Superuser/admin style prompt
 */
import QtQuick 2.15

QtObject {
    id: rootPrompt

    readonly property string name: "root"
    readonly property string displayName: "Root Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var username = kernel.currentUser === "root" ? "root" : kernel.currentUser + "(sudo)";

            return "[" + username + "]# " + displayPath + " # ";
        } else {
            return "[SYSTEM]# " + kernel.prompt + " #";
        }
    }

    function generateStatePrompt(kernel) {
        if (kernel.bootState === kernel.states.LOGIN_USERNAME) {
            return "[AUTH]# login: ";
        } else if (kernel.bootState === kernel.states.LOGIN_PASSWORD) {
            return "[AUTH]# password: ";
        }
        return "[SYSTEM]# " + kernel.prompt + " #";
    }
}
