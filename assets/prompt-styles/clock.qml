/*
 * Clock Prompt Style
 * Shows current time in prompt
 */
import QtQuick 2.15

QtObject {
    id: clockPrompt

    readonly property string name: "clock"
    readonly property string displayName: "Clock Prompt"

    function getCurrentTime() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();

        return (hours < 10 ? "0" : "") + hours + ":" +
        (minutes < 10 ? "0" : "") + minutes + ":" +
        (seconds < 10 ? "0" : "") + seconds;
    }

    function getCurrentTimeShort() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();

        return (hours < 10 ? "0" : "") + hours + ":" +
        (minutes < 10 ? "0" : "") + minutes;
    }

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var currentTime = getCurrentTime();

            return "[" + currentTime + "] " +
            kernel.currentUser + "@" + displayPath + " $ ";
        } else {
            var timeShort = getCurrentTimeShort();
            return "[" + timeShort + "] " + kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        var timeShort = getCurrentTimeShort();
        return "[" + timeShort + "] " + kernel.prompt;
    }
}
