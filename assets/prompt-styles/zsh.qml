/*
 * Zsh Prompt Style
 * Oh-my-zsh style with git-like indicators
 */
import QtQuick 2.15

QtObject {
    id: zshPrompt

    readonly property string name: "zsh"
    readonly property string displayName: "Zsh Prompt"

    function generatePrompt(kernel) {
        if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
            var displayPath = kernel.cwd;
            if (kernel.getUserPath) {
                displayPath = kernel.getUserPath(kernel.cwd);
            }

            var gitBranch = "";
            var gitStatus = "";

            if (Math.random() < 0.3) {
                var branches = ["master", "main", "develop", "feature/login"];
                gitBranch = branches[Math.floor(Math.random() * branches.length)];

                // Simular estado de git (clean/dirty)
                if (Math.random() < 0.5) {
                    gitStatus = " ●"; // Dirty
                } else {
                    gitStatus = ""; // Clean
                }
            }

            var prompt = "%n@%m:";

            var shortPath = displayPath;
            if (shortPath.length > 25) {
                var parts = shortPath.split('/');
                if (parts.length > 2) {
                    shortPath = "…/" + parts[parts.length - 1];
                }
            }

            prompt += shortPath;

            if (gitBranch) {
                prompt += " (" + gitBranch + gitStatus + ")";
            }

            if (kernel.currentUser === "root" || kernel.currentUser === "admin") {
                prompt += " #";
            } else {
                prompt += " %";
            }

            return prompt;
        } else {
            return kernel.prompt;
        }
    }

    function generateStatePrompt(kernel) {
        if (kernel.bootState === kernel.states.LOGIN_USERNAME) {
            return "%n@%m login: ";
        } else if (kernel.bootState === kernel.states.LOGIN_PASSWORD) {
            return "%n@%m password: ";
        } else if (kernel.bootState === kernel.states.USER_CREATION) {
            return "%n@%m setup: ";
        }
        return "%n@%m system: ";
    }
}
