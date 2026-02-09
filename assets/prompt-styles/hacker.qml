/*
 * Hacker/Matrix Prompt Style
 * Matrix-style green text
 */
import QtQuick 2.15

QtObject {
    id: hackerPrompt

    readonly property string name: "hacker"
    readonly property string displayName: "Hacker Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var matrixChars = "01";
            var path = "";
            for (var i = 0; i < 8; i++) {
                path += matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
            }

            return "root@" + kernel.currentUser + " ::/" + path + "/>>> ";
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        if (kernel.bootState === kernel.states.LOGIN_USERNAME) {
            return "login: ";
        } else if (kernel.bootState === kernel.states.LOGIN_PASSWORD) {
            return "password: ";
        }
        return "[ACCESS] > ";
    }
}
