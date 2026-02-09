/*
 * Arrow Prompt Style
 * Simple arrow indicator
 */
import QtQuick 2.15

QtObject {
    id: arrowPrompt

    readonly property string name: "arrow"
    readonly property string displayName: "Arrow Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            return "→ ";
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        return "→ ";
    }
}
