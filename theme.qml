/*
 * Pegasus Terminal OS v1.0
 * Created by: Gonzalo Abbate
 *
 */
import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtGraphicalEffects 1.15
import QtMultimedia 5.15
import QtQml.Models 2.15
import SortFilterProxyModel 0.2
import "utils.js" as Utils

FocusScope {
    id: root
    visible: true
    width: parent.width
    height: parent.height
    focus: true

    property string activeColorSchemeName: {
        var saved = api.memory.get("terminal_color_scheme");
        return saved || "default";
    }

    property string activePromptStyleName: {
        var saved = api.memory.get("terminal_prompt_style");
        return saved || "default";
    }

    function reloadPromptStyle() {
        var newStyle = api.memory.get("terminal_prompt_style") || "default";
        console.log("[THEME] Reloading prompt style: " + newStyle);
        activePromptStyleName = newStyle;
        promptStyleLoader.source = "assets/prompt-styles/" + newStyle + ".qml";
    }

    property var promptStyleLoader: Qt.createQmlObject('
    import QtQuick 2.15;
    import "assets/prompt-styles" as PromptStyles;
    Loader {
        id: promptStyleLoader
        source: "assets/prompt-styles/" + activePromptStyleName + ".qml"

        onStatusChanged: {
            if (status === Loader.Error) {
                console.log("[THEME] Error loading prompt style: " + activePromptStyleName);
                console.log("[THEME] Falling back to default style");
                source = "assets/prompt-styles/default.qml";
            }
        }
    }
    ', root, "promptStyleLoader");

    property var currentPromptStyle: promptStyleLoader.item || defaultPromptStyle
    property var defaultPromptStyle: QtObject {
        readonly property string name: "default"
        readonly property string displayName: "Default Prompt"

        function generatePrompt(kernel) {
            if (kernel.bootState === kernel.states.SHELL && kernel.currentUser) {
                var displayPath = kernel.cwd;
                if (kernel.getUserPath) {
                    displayPath = kernel.getUserPath(kernel.cwd);
                }
                return kernel.currentUser + "@pegasus:" + displayPath + "$ ";
            } else {
                return kernel.prompt;
            }
        }

        function generateStatePrompt(kernel) {
            return kernel.prompt;
        }
    }

    property var colorSchemeLoader: Qt.createQmlObject('
    import QtQuick 2.15;
    import "assets/color-schemes" as ColorSchemes;

    Loader {
        id: schemeLoader
        source: "assets/color-schemes/" + activeColorSchemeName + ".qml"

        onStatusChanged: {
            if (status === Loader.Error) {
                console.log("[THEME] Error loading color scheme: " + activeColorSchemeName);
                console.log("[THEME] Falling back to default scheme");
                source = "assets/color-schemes/default.qml";
            }
        }
    }
    ', root, "colorSchemeLoader");

    property var currentColorScheme: colorSchemeLoader.item || defaultColorScheme
    property var defaultColorScheme: QtObject {
        readonly property string name: "default"
        readonly property string displayName: "Default Terminal"
        readonly property string backgroundColor: "#0c0d0d"
        readonly property string textColor: "#ffffff"
        readonly property string promptColor: "#00ff00"
        readonly property string promptErrorColor: "#ff5555"
        readonly property string cursorColor: "#00ff00"
        readonly property string cursorTextColor: "#000000"
        readonly property string errorColor: "#ff5555"
        readonly property string systemColor: "#ffff00"
        readonly property string directoryColor: "#33a4e4"
        readonly property string normalTextColor: "#aaaaaa"
        readonly property string statusBarBackground: "#111111"
        readonly property string statusUserColor: "#00ff00"
        readonly property string statusPathColor: "#55ffff"
        readonly property string statusStateColor: "#ffff55"
    }

    function reloadColorScheme() {
        var newScheme = api.memory.get("terminal_color_scheme") || "default";
        console.log("[THEME] Reloading color scheme: " + newScheme);
        activeColorSchemeName = newScheme;
        colorSchemeLoader.source = "assets/color-schemes/" + newScheme + ".qml";
    }

    Connections {
        target: api.memory

        function onMemoryChanged() {
            var saved = api.memory.get("terminal_color_scheme");
            if (saved && saved !== activeColorSchemeName) {
                reloadColorScheme();
            }
        }
    }

    Scanlines {
        id: scanlines
        anchors.fill: parent
        z: 1000
    }

    QtObject {
        id: terminalKernel

        readonly property var states: ({
            BOOTING: 0,
            USER_CREATION: 1,
            USER_CREATION_PASSWORD: 2,
            USER_CREATION_CONFIRM: 3,
            LOGIN: 4,
            LOGIN_USERNAME: 5,
            LOGIN_PASSWORD: 6,
            SHELL: 7,
            LOCKED: 8,
            GAME_RUNNING: 9
        })

        property int bootState: states.BOOTING
        property bool acceptingInput: false

        property string currentUser: ""
        property bool authenticated: false
        property var userData: ({})

        property string tempUsername: ""
        property string tempPassword: ""
        property bool passwordMode: false

        property string cwd: "/"
        property var vfsContext: null

        property var activeCollection: null
        property var activeGame: null
        property var lastGameListing: []

        property var environment: ({})
        property var commandHistory: []
        property int lastExitCode: 0
        property int historyIndex: -1
        property var pendingStateChange: null

        property var outputBuffer: []
        property int bufferMaxSize: 500

        property string prompt: "> "

        property var commandRegistry: ({})

        property var currentLine: null

        Component.onCompleted: {
            console.log("[KERNEL] Inicializando Pegasus Terminal OS...");
            initializeKernel();
        }

        function getCommandCompletions(partial) {
            if (!partial || partial.trim() === "") return [];

            var matches = [];
            var partialLower = partial.toLowerCase();

            for (var cmdName in commandRegistry) {
                if (commandRegistry.hasOwnProperty(cmdName)) {
                    var cmd = commandRegistry[cmdName];
                    if (!cmd.aliasOf && cmdName.toLowerCase().indexOf(partialLower) === 0) {
                        matches.push(cmdName);
                    }
                }
            }

            matches.sort();
            return matches;
        }

        function completeCommand(currentText) {
            var parts = currentText.split(" ");
            var lastPart = parts[parts.length - 1];

            if (parts.length !== 1) return currentText;

            var matches = getCommandCompletions(lastPart);

            if (matches.length === 0) {
                return currentText;
            } else if (matches.length === 1) {
                return matches[0] + " ";
            } else {
                var output = "Available commands: " + matches.join(", ");

                if (typeof terminalModel !== 'undefined') {
                    terminalModel.append({
                        prompt: "",
                        command: "",
                        result: output,
                        isSystem: true,
                        isError: false
                    });
                    terminalModel.append({
                        prompt: prompt,
                        command: currentText,
                        result: "",
                        isSystem: false,
                        isError: false
                    });
                }

                var commonPrefix = findCommonPrefix(matches);
                if (commonPrefix.length > lastPart.length) {
                    return commonPrefix;
                }

                return currentText;
            }
        }

        function findCommonPrefix(strings) {
            if (strings.length === 0) return "";
            if (strings.length === 1) return strings[0];

            var prefix = strings[0];
            for (var i = 1; i < strings.length; i++) {
                while (strings[i].indexOf(prefix) !== 0) {
                    prefix = prefix.substring(0, prefix.length - 1);
                    if (prefix === "") return "";
                }
            }
            return prefix;
        }

        function initializeKernel() {
            outputBuffer = [];

            if (typeof terminalModel !== 'undefined') {
                terminalModel.clear();
            }

            var savedState = api.memory.get("terminal_kernel_state");
            if (savedState) {
                restoreState(savedState);
            }

            var users = api.memory.get("terminal_users");

            if (typeof terminalModel !== 'undefined') {
                terminalModel.append({
                    prompt: "",
                    command: "",
                    result: "|========================================|\n   PEGASUS TERMINAL OS v1.0 by: ZagonAb\n|========================================|",
                    isSystem: true
                });
            }

            if (!users || Object.keys(users).length === 0) {
                if (typeof terminalModel !== 'undefined') {
                    terminalModel.append({
                        prompt: "",
                        command: "",
                        result: "[SYSTEM] No users found.\nLet's create your first user.",
                        isSystem: true
                    });
                    terminalModel.append({
                        prompt: "username: ",
                        command: "",
                        result: "",
                        isSystem: false
                    });
                }

                bootState = states.USER_CREATION;
                prompt = "username: ";
            } else {
                if (typeof terminalModel !== 'undefined') {
                    terminalModel.append({
                        prompt: "username: ",
                        command: "",
                        result: "",
                        isSystem: false
                    });
                }

                bootState = states.LOGIN_USERNAME;
                prompt = "username: ";
            }

            registerBuiltinCommands();

            acceptingInput = true;
        }

        function saveState() {
            var state = {
                version: "1.0",
                cwd: cwd,
                environment: environment,
                lastUser: currentUser,
                timestamp: new Date().toISOString()
            };
            api.memory.set("terminal_kernel_state", state);
        }

        function restoreState(state) {
            if (state.version !== "1.0") return;

            cwd = state.cwd || "/";
            environment = state.environment || {};
            currentUser = state.lastUser || "";
        }

        function saveUserHistory() {
            if (!currentUser) return;

            var key = "terminal_history_" + currentUser;
            var history = commandHistory.slice(-100);
            api.memory.set(key, history);
        }

        function writeToBuffer(lines, type) {
            if (!Array.isArray(lines)) lines = [lines];

            lines.forEach(function(line) {
                outputBuffer.push({
                    text: line,
                    type: type || "stdout",
                    timestamp: Date.now()
                });
            });

            if (outputBuffer.length > bufferMaxSize) {
                outputBuffer = outputBuffer.slice(-bufferMaxSize);
            }

            outputBufferChanged();
        }

        function clearBuffer() {
            outputBuffer = [];
            outputBufferChanged();

            if (typeof terminalModel !== 'undefined') {
                terminalModel.clear();
            }
        }

        function resolvePath(path) {
            var absolutePath = path.startsWith("/") ? path : cwd + "/" + path;

            var segments = absolutePath.split("/").filter(function(s) {
                return s !== "" && s !== ".";
            });

            var resultSegments = [];
            segments.forEach(function(segment) {
                if (segment === "..") {
                    if (resultSegments.length > 0) {
                        resultSegments.pop();
                    }
                } else {
                    resultSegments.push(segment);
                }
            });

            var resolvedPath = "/" + resultSegments.join("/");
            return resolveVfsNode(resolvedPath);
        }

        function resolveVfsNode(path) {
            var segments = path.split("/").filter(s => s !== "");

            if (segments.length === 0) {
                var rootContents = [
                    { name: "Collections", type: "directory" },
                    { name: "All-games", type: "directory" },
                    { name: "Favorites", type: "directory" },
                    { name: "LastPlayed", type: "directory" },
                    { name: "MostPlayed", type: "directory" }
                ];

                return {
                    type: "directory",
                    path: "/",
                    name: "root",
                    vfsPath: "/",
                    contents: rootContents
                };
            }

            var firstSegment = segments[0].toLowerCase();

            if (firstSegment === "collections") {
                if (segments.length === 1) {
                    return {
                        type: "directory",
                        path: "/collections",
                        name: "Collections",
                        vfsPath: "/Collections",
                        contents: listCollections()
                    };
                }

                var collectionName = segments[1];
                var collection = findCollection(collectionName);
                if (!collection) {
                    return { type: "error", error: "Collection not found" };
                }

                if (segments.length === 2) {
                    return {
                        type: "directory",
                        path: "/collections/" + collectionName,
                        name: collectionName,
                        vfsPath: "/Collections/" + collectionName,
                        contents: [
                            { name: "games", type: "directory" }
                        ]
                    };
                }

                if (segments[2].toLowerCase() === "games") {
                    return {
                        type: "directory",
                        path: "/collections/" + collectionName + "/games",
                        name: "games",
                        vfsPath: "/Collections/" + collectionName + "/games",
                        contents: listGamesInCollection(collection)
                    };
                }
            }

            if (firstSegment === "all-games") {
                if (segments.length === 1) {
                    var allGamesList = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var game = api.allGames.get(i);
                        allGamesList.push({
                            name: game.title,
                            type: "game"
                        });
                    }

                    return {
                        type: "directory",
                        path: "/all-games",
                        name: "All-games",
                        vfsPath: "/All-games",
                        contents: allGamesList
                    };
                }
            }

            if (firstSegment === "favorites") {
                if (segments.length === 1) {
                    var favoritesList = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var game = api.allGames.get(i);
                        if (game.favorite) {
                            favoritesList.push({
                                name: game.title,
                                type: "game"
                            });
                        }
                    }

                    return {
                        type: "directory",
                        path: "/favorites",
                        name: "Favorites",
                        vfsPath: "/Favorites",
                        contents: favoritesList
                    };
                }
            }

            if (firstSegment === "lastplayed") {
                if (segments.length === 1) {
                    var lastPlayedList = [];
                    var gamesArray = [];

                    for (var i = 0; i < api.allGames.count; i++) {
                        var game = api.allGames.get(i);
                        if (game.lastPlayed && game.lastPlayed > 0) {
                            gamesArray.push(game);
                        }
                    }

                    gamesArray.sort(function(a, b) {
                        return (b.lastPlayed || 0) - (a.lastPlayed || 0);
                    });

                    for (var i = 0; i < gamesArray.length; i++) {
                        lastPlayedList.push({
                            name: gamesArray[i].title,
                            type: "game"
                        });
                    }

                    return {
                        type: "directory",
                        path: "/lastplayed",
                        name: "LastPlayed",
                        vfsPath: "/LastPlayed",
                        contents: lastPlayedList
                    };
                }
            }

            if (firstSegment === "mostplayed") {
                if (segments.length === 1) {
                    var mostPlayedList = [];
                    var gamesArray = [];

                    for (var i = 0; i < api.allGames.count; i++) {
                        var game = api.allGames.get(i);
                        if (game.playTime && game.playTime > 0) {
                            gamesArray.push(game);
                        }
                    }

                    gamesArray.sort(function(a, b) {
                        return (b.playTime || 0) - (a.playTime || 0);
                    });

                    for (var i = 0; i < gamesArray.length; i++) {
                        mostPlayedList.push({
                            name: gamesArray[i].title,
                            type: "game"
                        });
                    }

                    return {
                        type: "directory",
                        path: "/mostplayed",
                        name: "MostPlayed",
                        vfsPath: "/MostPlayed",
                        contents: mostPlayedList
                    };
                }
            }

            if (firstSegment === "home") {
                if (segments.length === 1) {
                    var users = api.memory.get("terminal_users") || {};
                    var userDirs = [];
                    for (var username in users) {
                        if (users.hasOwnProperty(username)) {
                            userDirs.push({
                                name: username,
                                type: "directory"
                            });
                        }
                    }

                    return {
                        type: "directory",
                        path: "/home",
                        name: "home",
                        vfsPath: "/home",
                        contents: userDirs
                    };
                }

                var homeUser = segments[1];
                return {
                    type: "directory",
                    path: "/home/" + homeUser,
                    name: homeUser,
                    vfsPath: "/home/" + homeUser,
                    contents: [
                        { name: "Documents", type: "directory" },
                        { name: "Downloads", type: "directory" }
                    ]
                };
            }

            if (firstSegment === "system") {
                if (segments.length === 1) {
                    return {
                        type: "directory",
                        path: "/system",
                        name: "system",
                        vfsPath: "/system",
                        contents: [
                            { name: "version.txt", type: "file" },
                            { name: "config", type: "directory" }
                        ]
                    };
                }
            }

            return { type: "error", error: "PATH_NOT_FOUND" };
        }

        function getUserPath(vfsPath) {
            if (!currentUser) return vfsPath;

            if (vfsPath === "/") {
                return "~";
            }

            if (vfsPath.startsWith("/home/" + currentUser)) {
                return vfsPath.replace("/home/" + currentUser, "~");
            }

            if (vfsPath === "/All-Games") {
                return "~/All-Games";
            }
            else if (vfsPath === "/Favorites") {
                return "~/Favorites";
            }
            else if (vfsPath === "/MostPlayed") {
                return "~/MostPlayed";
            }
            else if (vfsPath === "/LastPlayed") {
                return "~/LastPlayed";
            }
            else if (vfsPath.startsWith("/Collections/")) {
                var parts = vfsPath.split("/").filter(function(s) { return s !== ""; });
                if (parts.length >= 2) {
                    var collectionName = parts[1];
                    var userPath = "~/Collections/" + collectionName;
                    if (parts.length >= 3 && parts[2] === "games") {
                        userPath += "/games";
                    }
                    return userPath;
                }
            }
            else if (vfsPath === "/system") {
                return "~/system";
            }
            else if (vfsPath === "/home") {
                return "~";
            }

            if (vfsPath.startsWith("/")) {
                return "~" + vfsPath;
            }

            return vfsPath;
        }

        function findCollection(shortName) {
            for (var i = 0; i < api.collections.count; i++) {
                var coll = api.collections.get(i);
                if (coll.shortName.toLowerCase() === shortName.toLowerCase()) {
                    return coll;
                }
            }
            return null;
        }

        function listCollections() {
            var list = [];
            for (var i = 0; i < api.collections.count; i++) {
                var coll = api.collections.get(i);
                list.push({
                    name: coll.shortName,
                    type: "collection",
                    fullName: coll.name
                });
            }
            return list;
        }

        function listGamesInCollection(collection) {
            var list = [];
            if (!collection || !collection.games) return list;

            for (var i = 0; i < collection.games.count; i++) {
                var game = collection.games.get(i);
                list.push({
                    name: game.title,
                    type: "game",
                    id: game.title.toLowerCase().replace(/[^a-z0-9]/g, "_")
                });
            }
            return list;
        }


        function executeCommand(rawInput) {
            if (!rawInput || rawInput.trim() === "") {
                return {
                    stdout: [],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (bootState === states.USER_CREATION) {
                return handleUserCreation(rawInput);
            } else if (bootState === states.USER_CREATION_PASSWORD) {
                return handleUserCreationPassword(rawInput);
            } else if (bootState === states.USER_CREATION_CONFIRM) {
                return handleUserCreationConfirm(rawInput);
            } else if (bootState === states.LOGIN_USERNAME) {
                return handleLoginUsername(rawInput);
            } else if (bootState === states.LOGIN_PASSWORD) {
                return handleLoginPassword(rawInput);
            }

            commandHistory.push({
                command: rawInput,
                timestamp: Date.now(),
                                user: currentUser,
                                cwd: cwd
            });
            historyIndex = -1;
            saveUserHistory();

            var parsed = parseCommand(rawInput);
            if (parsed.error) {
                return {
                    stdout: [],
                    stderr: ["Syntax error: " + parsed.error],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var cmdName = parsed.command;
            var cmdInfo = commandRegistry[cmdName];

            if (!cmdInfo || cmdInfo.aliasOf) {
                if (cmdInfo && cmdInfo.aliasOf) {
                    cmdName = cmdInfo.aliasOf;
                    cmdInfo = commandRegistry[cmdName];
                } else {
                    return {
                        stdout: [],
                        stderr: ["Command not found: " + cmdName],
                        exitCode: 127,
                        sideEffects: {}
                    };
                }
            }

            if (cmdInfo.requiredState && cmdInfo.requiredState !== bootState) {
                return {
                    stdout: [],
                    stderr: ["Command not available in current state"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (cmdInfo.requiredAuth && !authenticated) {
                return {
                    stdout: [],
                    stderr: ["Authentication required"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (parsed.args.length < cmdInfo.minArgs) {
                return {
                    stdout: [],
                    stderr: ["Not enough arguments. Usage: " + cmdInfo.usage],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (cmdInfo.maxArgs !== null && parsed.args.length > cmdInfo.maxArgs) {
                return {
                    stdout: [],
                    stderr: ["Too many arguments. Usage: " + cmdInfo.usage],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            try {
                var context = {
                    kernel: terminalKernel,
                    api: api,
                    resolvePath: resolvePath,
                    setTimeout: setTimeout
                };

                var result = cmdInfo.execute.call(context, parsed.args, parsed.flags);

                if (result.sideEffects) {
                    if (result.sideEffects.cwdChanged && result.stdout.length > 0) {
                        cwd = result.stdout[result.stdout.length - 1];
                        if (bootState === states.SHELL && currentUser) {
                            prompt = currentUser + "@pegasus:" + cwd + "$ ";
                        }
                    }
                    if (result.sideEffects.stateChanged && pendingStateChange !== null) {
                        bootState = pendingStateChange;
                        pendingStateChange = null;
                    }
                }

                lastExitCode = result.exitCode;

                if (result.sideEffects &&
                    (result.sideEffects.cwdChanged || result.sideEffects.stateChanged)) {
                    saveState();
                    }

                    return result;

            } catch (error) {
                return {
                    stdout: [],
                    stderr: ["Command execution error: " + error],
                    exitCode: 2,
                    sideEffects: {}
                };
            }
        }


        function handleUserCreation(input) {
            var username = input.trim();

            if (username.length < 3) {
                return {
                    stdout: [],
                    stderr: ["Error: Username must be at least 3 characters"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var users = api.memory.get("terminal_users") || {};
            if (users[username]) {
                return {
                    stdout: [],
                    stderr: ["Error: User already exists"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            tempUsername = username;
            bootState = states.USER_CREATION_PASSWORD;
            prompt = "password: ";
            passwordMode = true;

            return {
                stdout: [],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }

        function handleUserCreationPassword(input) {
            var password = input.trim();

            if (password.length < 4) {
                passwordMode = false;
                tempPassword = "";
                bootState = states.USER_CREATION_PASSWORD;
                prompt = "password: ";
                passwordMode = true;
                return {
                    stdout: [],
                    stderr: ["Error: Password must be at least 4 characters"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            tempPassword = password;
            bootState = states.USER_CREATION_CONFIRM;
            prompt = "confirm password: ";

            return {
                stdout: [],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }

        function handleUserCreationConfirm(input) {
            var confirmPassword = input.trim();

            passwordMode = false;

            if (confirmPassword !== tempPassword) {
                tempUsername = "";
                tempPassword = "";
                bootState = states.USER_CREATION;
                prompt = "username: ";
                return {
                    stdout: [],
                    stderr: ["Error: Passwords do not match. Please try again."],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var result = createUser(tempUsername, tempPassword);

            if (result.success) {
                tempUsername = "";
                tempPassword = "";

                bootState = states.LOGIN_USERNAME;
                prompt = "username: ";

                return {
                    stdout: ["User created successfully. Please login."],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            } else {
                tempUsername = "";
                tempPassword = "";
                bootState = states.USER_CREATION;
                prompt = "username: ";
                return {
                    stdout: [],
                    stderr: ["Error: Failed to create user - " + result.error],
                    exitCode: 1,
                    sideEffects: {}
                };
            }
        }

        function handleLoginUsername(input) {
            var username = input.trim();

            if (username.length === 0) {
                return {
                    stdout: [],
                    stderr: ["Error: Username cannot be empty"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var users = api.memory.get("terminal_users") || {};
            if (!users[username]) {
                return {
                    stdout: [],
                    stderr: ["Error: User does not exist"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            tempUsername = username;
            bootState = states.LOGIN_PASSWORD;
            prompt = "password: ";
            passwordMode = true;

            return {
                stdout: [],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }

        function handleLoginPassword(input) {
            var password = input.trim();

            passwordMode = false;

            var result = login(tempUsername, password);

            if (result.success) {
                tempUsername = "";

                function formatPlayTime(seconds) {
                    var hours = Math.floor(seconds / 3600);
                    var minutes = Math.floor((seconds % 3600) / 60);
                    var secs = seconds % 60;

                    var hh = (hours < 10 ? "0" : "") + hours;
                    var mm = (minutes < 10 ? "0" : "") + minutes;
                    var ss = (secs < 10 ? "0" : "") + secs;

                    return hh + ":" + mm + ":" + ss;
                }

                var stats = [];
                stats.push("Login successful. Welcome, " + currentUser + "!");
                stats.push("");

                var lastPlayedGame = null;
                var lastPlayedTime = 0;
                var lastPlayedIndex = -1;
                for (var i = 0; i < api.allGames.count; i++) {
                    var game = api.allGames.get(i);
                    if (game.lastPlayed && game.lastPlayed.getTime() > lastPlayedTime) {
                        lastPlayedGame = game;
                        lastPlayedTime = game.lastPlayed.getTime();
                        lastPlayedIndex = i;
                    }
                }
                if (lastPlayedGame) {
                    stats.push("Last Played: index " + lastPlayedIndex + " - " + lastPlayedGame.title +
                    " | playtime: " + formatPlayTime(lastPlayedGame.playTime));
                } else {
                    stats.push("Last Played: None");
                }

                var favCount = 0;
                for (var i = 0; i < api.allGames.count; i++) {
                    if (api.allGames.get(i).favorite) {
                        favCount++;
                    }
                }
                stats.push("Favorites: " + favCount);

                var mostPlayed = null;
                var maxPlayTime = 0;
                var mostPlayedIndex = -1;
                for (var i = 0; i < api.allGames.count; i++) {
                    var game = api.allGames.get(i);
                    if (game.playTime > maxPlayTime) {
                        mostPlayed = game;
                        maxPlayTime = game.playTime;
                        mostPlayedIndex = i;
                    }
                }
                if (mostPlayed && maxPlayTime > 0) {
                    stats.push("Most Played: index " + mostPlayedIndex + " - " + mostPlayed.title +
                    " | playtime: " + formatPlayTime(mostPlayed.playTime));
                } else {
                    stats.push("Most Played: None");
                }

                stats.push("Collections: " + api.collections.count);

                return {
                    stdout: stats,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            } else {
                tempUsername = "";
                bootState = states.LOGIN_USERNAME;
                prompt = "username: ";
                return {
                    stdout: [],
                    stderr: ["Login incorrect"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }
        }

        function parseCommand(input) {
            var tokens = [];
            var currentToken = "";
            var inQuotes = false;
            var quoteChar = '';

            for (var i = 0; i < input.length; i++) {
                var c = input.charAt(i);

                if (inQuotes) {
                    if (c === quoteChar) {
                        inQuotes = false;
                        if (currentToken !== "") {
                            tokens.push(currentToken);
                            currentToken = "";
                        }
                    } else {
                        currentToken += c;
                    }
                } else {
                    if (c === '"' || c === "'") {
                        inQuotes = true;
                        quoteChar = c;
                        if (currentToken !== "") {
                            tokens.push(currentToken);
                            currentToken = "";
                        }
                    } else if (c === ' ' || c === '\t') {
                        if (currentToken !== "") {
                            tokens.push(currentToken);
                            currentToken = "";
                        }
                    } else if (c === '|' || c === '>' || c === '<') {
                        if (currentToken !== "") {
                            tokens.push(currentToken);
                        }
                        tokens.push(c);
                        currentToken = "";
                    } else {
                        currentToken += c;
                    }
                }
            }

            if (currentToken !== "") {
                tokens.push(currentToken);
            }

            if (inQuotes) {
                return { error: "Unclosed quotes" };
            }

            if (tokens.length === 0) {
                return { error: "Empty command" };
            }

            var command = tokens[0];
            var args = [];
            var flags = {};

            for (var j = 1; j < tokens.length; j++) {
                var token = tokens[j];

                if (token.indexOf("--") === 0) {
                    var flagPart = token.substring(2);
                    var equalsIndex = flagPart.indexOf("=");

                    if (equalsIndex !== -1) {
                        var flagName = flagPart.substring(0, equalsIndex);
                        var flagValue = flagPart.substring(equalsIndex + 1);
                        flags[flagName] = flagValue;
                    } else {
                        flags[flagPart] = true;
                    }
                } else if (token.indexOf("-") === 0) {
                    var shortFlags = token.substring(1);
                    for (var k = 0; k < shortFlags.length; k++) {
                        flags[shortFlags.charAt(k)] = true;
                    }
                } else {
                    args.push(token);
                }
            }

            return {
                command: command,
                args: args,
                flags: flags,
                raw: input
            };
        }

        function getHistoryPrevious() {
            if (commandHistory.length === 0) return "";

            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
            } else {
                historyIndex = commandHistory.length - 1;
            }

            return commandHistory[commandHistory.length - 1 - historyIndex].command;
        }

        function getHistoryNext() {
            if (commandHistory.length === 0 || historyIndex < 0) return "";

            historyIndex--;
            if (historyIndex < 0) {
                return "";
            }

            return commandHistory[commandHistory.length - 1 - historyIndex].command;
        }

        function createUser(username, password) {
            if (!username || !password) {
                return { success: false, error: "Username and password required" };
            }

            var users = api.memory.get("terminal_users") || {};

            if (users[username]) {
                return { success: false, error: "User already exists" };
            }

            var salt = Math.random().toString(36).substring(2, 15);
            var hash = simpleHash(salt + password);

            users[username] = {
                password_hash: hash,
                salt: salt,
                created: new Date().toISOString(),
                last_login: null,
                permissions: ["user"]
            };

            api.memory.set("terminal_users", users);

            if (typeof terminalModel !== 'undefined') {
                terminalModel.append({
                    prompt: "",
                    command: "",
                    result: "User '" + username + "' created successfully.",
                    isSystem: true
                });
            }

            return { success: true, username: username };
        }

        function login(username, password) {
            var users = api.memory.get("terminal_users") || {};
            var user = users[username];

            if (!user) {
                return { success: false, error: "Invalid credentials" };
            }

            var hash = simpleHash(user.salt + password);
            if (hash !== user.password_hash) {
                return { success: false, error: "Invalid credentials" };
            }

            currentUser = username;
            authenticated = true;
            userData = user;
            user.last_login = new Date().toISOString();
            users[username] = user;
            api.memory.set("terminal_users", users);

            bootState = states.SHELL;
            cwd = "/";

            prompt = username + "@pegasus:~$ ";

            loadUserHistory();

            return { success: true, username: username };
        }

        function logout() {
            saveUserHistory();

            currentUser = "";
            authenticated = false;
            userData = {};
            bootState = states.LOGIN_USERNAME;
            prompt = "username: ";
            commandHistory = [];
            historyIndex = -1;

            writeToBuffer(["Logged out"], "system");
            return { success: true };
        }

        function simpleHash(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + code;
                hash = hash & hash;
            }
            return hash.toString(36);
        }

        function loadUserHistory() {
            if (!currentUser) return;

            var key = "terminal_history_" + currentUser;
            var history = api.memory.get(key) || [];
            commandHistory = history;
            historyIndex = -1;
        }

        function findGame(identifier) {
            var searchId = identifier.toLowerCase();

            for (var i = 0; i < api.allGames.count; i++) {
                var game = api.allGames.get(i);
                if (game.title.toLowerCase() === searchId) {
                    return game;
                }
            }

            for (var i = 0; i < api.allGames.count; i++) {
                var game = api.allGames.get(i);
                if (game.title.toLowerCase().indexOf(searchId) !== -1) {
                    return game;
                }
            }

            if (activeCollection && activeCollection.games) {
                for (var i = 0; i < activeCollection.games.count; i++) {
                    var game = activeCollection.games.get(i);
                    if (game.title.toLowerCase().indexOf(searchId) !== -1) {
                        return game;
                    }
                }
            }

            return null;
        }

        function registerCommand(name, descriptor) {
            commandRegistry[name] = descriptor;

            if (descriptor.aliases) {
                for (var i = 0; i < descriptor.aliases.length; i++) {
                    var alias = descriptor.aliases[i];
                    commandRegistry[alias] = { aliasOf: name };
                }
            }
        }

        function registerBuiltinCommands() {
            Utils.registerTerminalCommands(terminalKernel);
        }

        function setTimeout(func, delay) {
             var timer = Qt.createQmlObject("import QtQuick 2.0; Timer {interval: " + delay + "; repeat: false; running: true;}", terminalKernel, "timeoutTimer");
             timer.triggered.connect(function() {
                 func();
                 timer.destroy();
             });
             return timer;
        }
    }

    Rectangle {
        id: terminalContainer
        anchors.fill: parent
        color: root.currentColorScheme.backgroundColor

        Flickable {
            id: outputView
            anchors.fill: parent
            anchors.bottomMargin: statusBar.height

            contentWidth: width
            contentHeight: terminalColumn.height
            clip: true

            onContentHeightChanged: {
                if (contentHeight > height) {
                    contentY = contentHeight - height;
                }
            }

            Column {
                id: terminalColumn
                width: parent.width
                spacing: vpx(0)
                x: vpx(10)

                Repeater {
                    id: terminalRepeater
                    model: ListModel { id: terminalModel }

                    delegate: Item {
                        width: terminalColumn.width
                        height: lineColumn.height

                        Column {
                            id: lineColumn
                            width: parent.width
                            spacing: vpx(2)

                            Item {
                                width: parent.width
                                height: Math.max(promptText.height, commandText.height, vpx(16))
                                visible: model.prompt !== "" || model.command !== ""

                                Row {
                                    id: contentRow
                                    spacing: vpx(0)
                                    anchors.verticalCenter: parent.verticalCenter
                                    height: parent.height

                                    Text {
                                        id: promptText
                                        text: model.prompt
                                        color: model.isError ? root.currentColorScheme.promptErrorColor : root.currentColorScheme.promptColor
                                        font.family: global.fonts.mono
                                        font.pixelSize: vpx(14)
                                        anchors.verticalCenter: parent.verticalCenter
                                    }

                                    Row {
                                        width: commandText.contentWidth + vpx(10)
                                        height: parent.height

                                        Row {
                                            spacing: vpx(0)
                                            anchors.verticalCenter: parent.verticalCenter

                                            Text {
                                                id: textBeforeCursor
                                                text: {
                                                    if (index !== terminalModel.count - 1 || terminalKernel.passwordMode) {
                                                        return model.command;
                                                    }
                                                    var pos = commandInput.cursorPosition;
                                                    return model.command.substring(0, pos);
                                                }
                                                color: root.currentColorScheme.textColor
                                                font.family: global.fonts.mono
                                                font.pixelSize: vpx(14)
                                                wrapMode: Text.NoWrap
                                            }

                                            Rectangle {
                                                id: cursorRect
                                                width: charUnderCursor.contentWidth > 0 ? charUnderCursor.contentWidth : vpx(8)
                                                height: vpx(16)
                                                color: root.currentColorScheme.cursorColor
                                                visible: index === terminalModel.count - 1 && !terminalKernel.passwordMode
                                                anchors.verticalCenter: parent.verticalCenter

                                                Text {
                                                    id: charUnderCursor
                                                    anchors.centerIn: parent
                                                    text: {
                                                        if (index !== terminalModel.count - 1 || terminalKernel.passwordMode) {
                                                            return "";
                                                        }
                                                        var pos = commandInput.cursorPosition;
                                                        if (pos >= model.command.length) {
                                                            return " ";
                                                        }
                                                        return model.command.charAt(pos);
                                                    }
                                                    color: root.currentColorScheme.cursorTextColor
                                                    font.family: global.fonts.mono
                                                    font.pixelSize: vpx(14)
                                                }

                                                SequentialAnimation on opacity {
                                                    loops: Animation.Infinite
                                                    running: cursorRect.visible

                                                    NumberAnimation {
                                                        from: 1.0
                                                        to: 0.3
                                                        duration: 530
                                                        easing.type: Easing.InOutQuad
                                                    }

                                                    PauseAnimation { duration: 200 }

                                                    NumberAnimation {
                                                        from: 0.3
                                                        to: 1.0
                                                        duration: 530
                                                        easing.type: Easing.InOutQuad
                                                    }

                                                    PauseAnimation { duration: 200 }
                                                }
                                            }

                                            Text {
                                                id: textAfterCursor
                                                text: {
                                                    if (index !== terminalModel.count - 1 || terminalKernel.passwordMode) {
                                                        return "";
                                                    }

                                                    var pos = commandInput.cursorPosition;
                                                    if (pos >= model.command.length) {
                                                        return "";
                                                    }
                                                    return model.command.substring(pos + 1);
                                                }
                                                color: root.currentColorScheme.textColor
                                                font.family: global.fonts.mono
                                                font.pixelSize: vpx(14)
                                                wrapMode: Text.NoWrap
                                            }
                                        }

                                        Text {
                                            id: commandText
                                            text: model.command
                                            color: root.currentColorScheme.textColor
                                            font.family: global.fonts.mono
                                            font.pixelSize: vpx(14)
                                            visible: false
                                        }
                                    }
                                }
                            }

                            Text {
                                width: parent.width
                                text: model.result
                                color: {
                                    if (model.isError) return root.currentColorScheme.errorColor;
                                    if (model.isSystem) return root.currentColorScheme.systemColor;

                                    var line = text.trim();

                                    if (line === "Collections" ||
                                        line === "MostPlayed" ||
                                        line === "LastPlayed" ||
                                        line === "Favorites" ||
                                        line === "All-games" ||
                                        line === "games" ||
                                        line === "home" ||
                                        line === "system") {
                                        return root.currentColorScheme.directoryColor;
                                        }

                                        if (line.indexOf("Collections") === 0 ||
                                            line.indexOf("MostPlayed") === 0 ||
                                            line.indexOf("LastPlayed") === 0 ||
                                            line.indexOf("Favorites") === 0 ||
                                            line.indexOf("All-games") === 0 ||
                                            line.indexOf("games") === 0) {
                                            return root.currentColorScheme.directoryColor;
                                            }

                                            if (terminalKernel.cwd === "/Collections" && line.length > 0 && line !== "(empty directory)") {
                                                return root.currentColorScheme.directoryColor;
                                            }

                                            return root.currentColorScheme.normalTextColor;
                                }
                                font.family: global.fonts.mono
                                font.pixelSize: vpx(14)
                                wrapMode: Text.Wrap
                                visible: text !== ""
                            }
                        }
                    }
                }
            }

            function addNewPrompt() {
                var promptText = "";

                if (terminalKernel.bootState === terminalKernel.states.SHELL && terminalKernel.currentUser) {
                    promptText = root.currentPromptStyle.generatePrompt(terminalKernel);
                } else {
                    promptText = root.currentPromptStyle.generateStatePrompt(terminalKernel);
                }

                terminalModel.append({
                    prompt: promptText,
                    command: "",
                    result: "",
                    isSystem: false,
                    isError: false
                });
            }

            function updateCurrentCommand(cmd) {
                if (terminalModel.count > 0) {
                    var lastIndex = terminalModel.count - 1;
                    terminalModel.setProperty(lastIndex, "command", cmd);
                }
            }

            function addResultToLast(output, isError, isSystem) {
                if (terminalModel.count > 0) {
                    var lastIndex = terminalModel.count - 1;
                    var currentResult = terminalModel.get(lastIndex).result || "";
                    var newResult = currentResult + (currentResult ? "\n" : "") + output;
                    terminalModel.setProperty(lastIndex, "result", newResult);
                    terminalModel.setProperty(lastIndex, "isError", isError || false);
                    terminalModel.setProperty(lastIndex, "isSystem", isSystem || false);
                }
            }

            MouseArea {
                anchors.fill: parent
                onWheel: {
                    var delta = wheel.angleDelta.y;
                    var newY = outputView.contentY - delta;

                    if (newY < 0) newY = 0;
                    if (newY > outputView.contentHeight - outputView.height) {
                        newY = outputView.contentHeight - outputView.height;
                    }

                    outputView.contentY = newY;
                    wheel.accepted = true;
                }

                onPressed: mouse.accepted = false
            }
        }

        TextInput {
            id: commandInput
            anchors.fill: parent
            visible: false
            focus: true

            echoMode: terminalKernel.passwordMode ? TextInput.Password : TextInput.Normal
            passwordCharacter: "*"

            onTextChanged: {
                if (!terminalKernel.passwordMode) {
                    outputView.updateCurrentCommand(text);
                } else {
                    outputView.updateCurrentCommand("*".repeat(text.length));
                }
            }

            onCursorPositionChanged: {
                if (terminalModel.count > 0 && !terminalKernel.passwordMode) {
                    var lastIndex = terminalModel.count - 1;
                    terminalModel.setProperty(lastIndex, "command", text);
                }
            }

            onAccepted: {
                var inputText = text.trim();

                text = "";

                if (inputText === "" && !terminalKernel.passwordMode) {
                    if (terminalKernel.bootState === terminalKernel.states.SHELL && terminalKernel.currentUser) {
                        outputView.addNewPrompt();
                    }
                    return;
                }

                if (terminalKernel.bootState >= terminalKernel.states.USER_CREATION &&
                    terminalKernel.bootState <= terminalKernel.states.LOGIN_PASSWORD) {

                    var previousState = terminalKernel.bootState;

                if (terminalKernel.passwordMode) {
                    outputView.updateCurrentCommand("*".repeat(inputText.length));
                } else {
                    outputView.updateCurrentCommand(inputText);
                }

                var result = terminalKernel.executeCommand(inputText);

                if (result.stdout && result.stdout.length > 0) {
                    outputView.addResultToLast(result.stdout.join('\n'), false, true);
                }
                if (result.stderr && result.stderr.length > 0) {
                    outputView.addResultToLast(result.stderr.join('\n'), true, false);
                }

                if (terminalKernel.bootState === terminalKernel.states.SHELL) {
                    outputView.addNewPrompt();
                } else if (terminalKernel.bootState !== previousState || terminalKernel.prompt !== "") {
                    terminalModel.append({
                        prompt: terminalKernel.prompt,
                        command: "",
                        result: "",
                        isSystem: false,
                        isError: false
                    });
                }
                    }else {
                        outputView.updateCurrentCommand(inputText);

                        var result = terminalKernel.executeCommand(inputText);

                        if (result.stdout && result.stdout.length > 0) {
                            outputView.addResultToLast(result.stdout.join('\n'), false, false);
                        }
                        if (result.stderr && result.stderr.length > 0) {
                            outputView.addResultToLast(result.stderr.join('\n'), true, false);
                        }

                        if (result.sideEffects && result.sideEffects.clearScreen) {
                        } else {
                            outputView.addNewPrompt();
                        }
                    }

                    forceActiveFocus();
            }

            Keys.onPressed: {
                if (!terminalKernel.passwordMode) {
                    if (event.key === Qt.Key_Tab) {
                        event.accepted = true;
                        var completed = terminalKernel.completeCommand(text);
                        text = completed;
                    } else if (event.key === Qt.Key_Up) {
                        event.accepted = true;
                        var prevCmd = terminalKernel.getHistoryPrevious();
                        if (prevCmd !== undefined) {
                            text = prevCmd;
                        }
                    } else if (event.key === Qt.Key_Down) {
                        event.accepted = true;
                        var nextCmd = terminalKernel.getHistoryNext();
                        text = nextCmd !== undefined ? nextCmd : "";
                    } else if (event.key === Qt.Key_L &&
                        (event.modifiers & Qt.ControlModifier)) {
                        event.accepted = true;
                    terminalModel.clear();
                    outputView.addNewPrompt();
                    text = "";
                        } else if (event.key === Qt.Key_C &&
                            (event.modifiers & Qt.ControlModifier)) {
                            event.accepted = true;
                        text = "";
                        outputView.updateCurrentCommand("");
                        outputView.addNewPrompt();
                            }
                }
            }
        }

        Rectangle {
            id: statusBar
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: vpx(20)
            color: root.currentColorScheme.statusBarBackground

            RowLayout {
                anchors.fill: parent
                anchors.margins: vpx(2)
                anchors.leftMargin: vpx(10)
                anchors.rightMargin: vpx(10)


                spacing: vpx(10)

                Text {
                    text: terminalKernel.currentUser || "guest"
                    color: root.currentColorScheme.statusUserColor
                    font.family: global.fonts.condensed
                    font.pixelSize: vpx(12)
                }

                Text {
                    text: {
                        var path = terminalKernel.cwd;
                        if (terminalKernel.getUserPath) {
                            path = terminalKernel.getUserPath(terminalKernel.cwd);
                        }
                        return path;
                    }
                    color: root.currentColorScheme.statusPathColor
                    font.family: global.fonts.condensed
                    font.pixelSize: vpx(12)
                    elide: Text.ElideLeft
                    Layout.fillWidth: true
                }

                Text {
                    text: {
                        switch(terminalKernel.bootState) {
                            case terminalKernel.states.BOOTING: return "BOOTING";
                            case terminalKernel.states.USER_CREATION: return "SETUP";
                            case terminalKernel.states.USER_CREATION_PASSWORD: return "SETUP";
                            case terminalKernel.states.USER_CREATION_CONFIRM: return "SETUP";
                            case terminalKernel.states.LOGIN_USERNAME: return "LOGIN";
                            case terminalKernel.states.LOGIN_PASSWORD: return "LOGIN";
                            case terminalKernel.states.SHELL: return "SHELL";
                            case terminalKernel.states.LOCKED: return "LOCKED";
                            case terminalKernel.states.GAME_RUNNING: return "GAME";
                            default: return "UNKNOWN";
                        }
                    }
                    color: root.currentColorScheme.statusStateColor
                    font.family: global.fonts.condensed
                    font.pixelSize: vpx(12)
                }
            }
        }
    }
}
