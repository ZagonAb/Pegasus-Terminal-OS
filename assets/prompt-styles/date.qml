/*
 * Date Prompt Style
 * Shows current date in prompt
 */
import QtQuick 2.15

QtObject {
    id: datePrompt

    readonly property string name: "date"
    readonly property string displayName: "Date Prompt"

    function getCurrentDate() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        return year + "-" +
        (month < 10 ? "0" : "") + month + "-" +
        (day < 10 ? "0" : "") + day;
    }

    function getCurrentDateShort() {
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        return (month < 10 ? "0" : "") + month + "-" +
        (day < 10 ? "0" : "") + day;
    }

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var currentDate = getCurrentDate();
            var weekday = getWeekday();

            return "[" + currentDate + " " + weekday + "] " +
            kernel.currentUser + ":" + displayPath + "> ";
        } else {
            var dateShort = getCurrentDateShort();
            return "[" + dateShort + "] " + kernel.prompt;
        }
    }

    function getWeekday() {
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var now = new Date();
        return days[now.getDay()];
    }

    function generateStatePrompt(kernel) {
        var dateShort = getCurrentDateShort();
        return "[" + dateShort + "] " + kernel.prompt;
    }
}
