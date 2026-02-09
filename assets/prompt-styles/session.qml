/*
 * Session Console Prompt Style
 * Interactive console with session info
 */
import QtQuick 2.15

QtObject {
    id: sessionPrompt

    readonly property string name: "session"
    readonly property string displayName: "Session Prompt"

    property var sessionStartTime: new Date()

    function formatSessionDuration() {
        var now = new Date();
        var diffMs = now - sessionStartTime;
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMins / 60);
        var mins = diffMins % 60;

        if (diffHours > 0) {
            return diffHours + "h" + (mins < 10 ? "0" : "") + mins + "m";
        }
        return diffMins + "m";
    }

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var sessionDuration = formatSessionDuration();

            return "[SESSION:" + kernel.currentUser + "@T" + sessionDuration +
            "][PATH:" + displayPath + "]> ";
        } else {
            var stateName = getStateName(kernel.bootState);
            return "[SESSION:system][STATE:" + stateName + "]> ";
        }
    }

    function getStateName(state) {
        switch(state) {
            case kernel.states.BOOTING: return "BOOTING";
            case kernel.states.LOGIN_USERNAME: return "LOGIN";
            case kernel.states.LOGIN_PASSWORD: return "AUTH";
            case kernel.states.USER_CREATION: return "SETUP";
            default: return "SYSTEM";
        }
    }

    function generateStatePrompt(kernel) {
        var stateName = getStateName(kernel.bootState);
        return "[SESSION:guest][STATE:" + stateName + "]> ";
    }
}
