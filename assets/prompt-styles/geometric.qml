/*
 * Geometric Prompt Style
 * Styled with geometric symbols ◢◤◥◣
 */
import QtQuick 2.15

QtObject {
    id: geometricPrompt

    readonly property string name: "geometric"
    readonly property string displayName: "Geometric Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var shortPath = displayPath;
            if (shortPath.length > 20) {
                var parts = shortPath.split('/');
                if (parts.length > 2) {
                    shortPath = "…/" + parts[parts.length - 1];
                }
            }

            var leftTop = "◤";
            var leftBottom = "◢";
            var rightTop = "◥";
            var rightBottom = "◣";
            var arrow = "❯";

            var endSymbol = arrow;
            if (kernel.currentUser === "root" || kernel.currentUser === "admin") {
                endSymbol = "⬢";
            }

            return leftBottom + leftTop + " " +
            kernel.currentUser + "@pegasus " +
            rightTop + rightBottom + " " +
            shortPath + endSymbol + " ";
        } else {
            return "◢◤ system ◥◣ " + kernel.prompt + " ❯";
        }
    }

    function generateStatePrompt(kernel) {
        var stateSymbol = "⏻";

        if (kernel.bootState === kernel.states.LOGIN_USERNAME) {
            stateSymbol = "👤";
        } else if (kernel.bootState === kernel.states.LOGIN_PASSWORD) {
            stateSymbol = "🔒";
        } else if (kernel.bootState === kernel.states.USER_CREATION) {
            stateSymbol = "✨";
        }

        return "◢◤ " + stateSymbol + " ◥◣ " + kernel.prompt + " ❯";
    }
}
