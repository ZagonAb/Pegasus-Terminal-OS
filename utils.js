/*
 * Pegasus Terminal OS v1.0
 * Created by: Gonzalo Abbate
 *
 */

function padRight(str, length) {
    str = str || "";
    while (str.length < length) {
        str += " ";
    }
    return str;
}

function repeatString(str, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += str;
    }
    return result;
}

var CommandRegistry = {
    commands: {},

    register: function (kernel, name, descriptor) {
        kernel.registerCommand(name, descriptor);
    }
};

function registerTerminalCommands(kernel) {

    CommandRegistry.register(kernel, "help", {
        help: "Show help for commands",
        usage: "help [command]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["?", "man"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];

            if (args.length === 0) {
                stdout.push("Available commands:");
                stdout.push("==================");

                var cmdNames = [];
                for (var key in kernel.commandRegistry) {
                    if (kernel.commandRegistry.hasOwnProperty(key)) {
                        var cmd = kernel.commandRegistry[key];
                        if (!cmd.aliasOf) {
                            cmdNames.push(key);
                        }
                    }
                }

                cmdNames.sort();

                for (var i = 0; i < cmdNames.length; i++) {
                    var name = cmdNames[i];
                    var cmd = kernel.commandRegistry[name];
                    stdout.push("  " + padRight(name, 12) + " - " +
                        (cmd.help || "No description"));
                }

                stdout.push("");
                stdout.push("Use 'help <command>' for more information.");
            } else {
                var cmdName = args[0];
                var cmdInfo = kernel.commandRegistry[cmdName];

                if (!cmdInfo || cmdInfo.aliasOf) {
                    if (cmdInfo && cmdInfo.aliasOf) {
                        cmdName = cmdInfo.aliasOf;
                        cmdInfo = kernel.commandRegistry[cmdName];
                    } else {
                        return {
                            stdout: [],
                            stderr: ["No help available for: " + args[0]],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                }

                stdout.push("Command: " + cmdName);
                if (cmdInfo.aliases && cmdInfo.aliases.length > 0) {
                    stdout.push("Aliases: " + cmdInfo.aliases.join(", "));
                }
                stdout.push("Description: " + (cmdInfo.help || "No description"));
                stdout.push("Usage: " + (cmdInfo.usage || cmdName + " [args]"));
                stdout.push("Requires authentication: " + (cmdInfo.requiredAuth ? "yes" : "no"));
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "scanline", {
        help: "Control enhanced CRT/scanline effects. Use 'scanline --help' for details",
        usage: "scanline [on|off|toggle|status|reset|default] [options]",
        minArgs: 0,
        maxArgs: 30,
        aliases: ["crt", "scan"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];
            var stderr = [];

            function getScanlines() {
                if (typeof root !== 'undefined' && root.scanlines) {
                    return root.scanlines;
                }
                return null;
            }

            var scanlines = getScanlines();
            if (!scanlines) {
                stderr.push("Error: Scanline system not available");
                return {
                    stdout: [],
                    stderr: stderr,
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (flags.help) {
                stdout.push("SCANLINE - Enhanced CRT Effect Control");
                stdout.push(repeatString("=", 70));
                stdout.push("");
                stdout.push("DESCRIPTION");
                stdout.push("  Advanced CRT/scanline overlay with full interface distortion.");
                stdout.push("  Applies authentic CRT curvature to ALL UI elements (text, graphics, etc.)");
                stdout.push("  All changes are applied immediately and saved automatically.");
                stdout.push("");
                stdout.push("USAGE");
                stdout.push("  scanline [command] [options]");
                stdout.push("");
                stdout.push("COMMANDS");
                stdout.push("  on                  Enable CRT effect");
                stdout.push("  off                 Disable CRT effect");
                stdout.push("  toggle              Toggle effect on/off");
                stdout.push("  status              Show current settings and parameters");
                stdout.push("  reset               Reset all settings to factory defaults");
                stdout.push("  default             Apply default preset");
                stdout.push("  list, presets       List all available presets");
                stdout.push("");
                stdout.push("PRESETS");
                stdout.push("  Apply predefined CRT configurations:");
                stdout.push("  scanline <preset>   Apply preset (see list below)");
                stdout.push("");
                stdout.push("  Available presets:");
                stdout.push("    default    - Clean balanced CRT (no curve)");
                stdout.push("    vhs        - VHS tape with heavy distortion & chromatic aberration");
                stdout.push("    retro      - Classic 90s gaming monitor");
                stdout.push("");
                stdout.push("BASIC PARAMETERS");
                stdout.push("  --intensity <0.0-0.3>   Scanline darkness (default: 0.01)");
                stdout.push("  --count <800-2000>      Number of scanlines (default: 1600)");
                stdout.push("  --curvature <0.0-1.0>   Screen barrel distortion (default: 0.0)");
                stdout.push("                          Affects entire interface! 0.2-0.4 recommended");
                stdout.push("  --flicker <0.0-1.0>     Screen flicker amount (default: 0.0)");
                stdout.push("  --fade <0.0-0.1>        Edge fade softness (default: 0.0)");
                stdout.push("                          Controls smooth brightness fade at curved edges");
                stdout.push("  --fadeopacity <0.0-1.0> Edge fade color blend (default: 0.0)");
                stdout.push("                          0.0=fade to black, 1.0=fade to theme color");
                stdout.push("");
                stdout.push("QUALITY PARAMETERS");
                stdout.push("  --brightness <0.1-1.5>  Overall brightness (default: 1.0)");
                stdout.push("  --temperature <0.1-5.0> Color warmth - higher=warmer (default: 1.0)");
                stdout.push("  --chroma <0.0-3.0>      Chromatic aberration/RGB shift (default: 0.0)");
                stdout.push("  --noise <0.0-1.0>       Film grain/noise amount (default: 0.0)");
                stdout.push("  --glow <0.0-3.0>        Phosphor glow/bloom on bright elements (default: 0.0)");
                stdout.push("                          Simulates CRT phosphor bloom around lit text");
                stdout.push("  --glowspread <0.0-1.0>  Glow spread/saturation (default: 0.0)");
                stdout.push("                          0.0=soft diffuse halo, 1.0=solid bright core");
                stdout.push("  --zoom <1.0-1.2>        Screen zoom for curvature (default: 1.0)");
                stdout.push("");
                stdout.push("VHS EFFECT");
                stdout.push("  --vhs <0.0-1.0>         VHS tape distortion effect (default: 0.0)");
                stdout.push("                          Adds authentic VHS artifacts:");
                stdout.push("                          • Horizontal tracking errors and shifts");
                stdout.push("                          • Color bleeding and banding");
                stdout.push("                          • Tracking noise lines");
                stdout.push("                          • Vertical jitter and instability");
                stdout.push("                          • Additional chromatic aberration");
                stdout.push("                          • Warm color temperature shift");
                stdout.push("                          0.0 = off, 0.3-0.5 = subtle, 1.0 = maximum");
                stdout.push("");
                stdout.push("ALIASES");
                stdout.push("  crt, scan");
                stdout.push("");
                stdout.push("NOTES");
                stdout.push("  • Effect is OFF by default on first run");
                stdout.push("  • Curvature distorts the ENTIRE interface (ShaderEffectSource)");
                stdout.push("  • Edge fade creates smooth blend at curved borders (no hard edges)");
                stdout.push("  • VHS effect is independent from 'vhs' preset - can be combined!");
                stdout.push("  • All settings persist across sessions (api.memory)");
                stdout.push("  • Changes apply instantly without restart");
                stdout.push("  • Higher curvature values may affect readability");
                stdout.push("  • Use 'reset' if experiencing visual issues");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length > 0 && (args[0] === "list" || args[0] === "presets")) {
                stdout.push("AVAILABLE CRT/SCANLINE PRESETS");
                stdout.push(repeatString("=", 70));
                stdout.push("");

                var presets = [
                    { name: "default",  desc: "Clean balanced CRT",
                        specs: "I:0.01 C:1600 Curv:0.0 Fade:0.0 FadeOp:0.0 Zoom:1.0" },
                        { name: "vhs",      desc: "VHS tape aesthetic",
                            specs: "I:0.15 C:1400 Curv:0.25 Temp:1.15 Chroma:1.5 Fade:0.04" },
                            { name: "retro",    desc: "90s gaming monitor",
                                specs: "I:0.12 C:1500 Curv:0.15 Temp:1.08 Chroma:0.8 Fade:0.03" }
                ];

                var currentPreset = scanlines.currentPreset;

                for (var i = 0; i < presets.length; i++) {
                    var p = presets[i];
                    var marker = p.name === currentPreset ? " [*]" : "    ";
                    stdout.push(marker + padRight(p.name, 12) + " - " + p.desc);
                    stdout.push("      " + p.specs);
                }

                stdout.push("");
                stdout.push("Apply with: scanline <preset_name>");
                stdout.push("View details: scanline status");
                stdout.push("");
                stdout.push("TIP: Use --vhs flag for additional VHS tape distortion!");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length > 0 && args[0] === "status") {
                stdout.push("CURRENT SCANLINE SETTINGS");
                stdout.push(repeatString("=", 70));
                stdout.push("");
                stdout.push("Status:          " + (scanlines.enabled ? "ENABLED ✓" : "DISABLED ✗"));
                stdout.push("Current preset:  " + scanlines.currentPreset);
                stdout.push("");
                stdout.push("BASIC PARAMETERS");
                stdout.push("  Scanline intensity:  " + scanlines.scanlineIntensity.toFixed(3));
                stdout.push("  Scanline count:      " + scanlines.scanlineCount.toFixed(0));
                stdout.push("  Screen curvature:    " + scanlines.curvatureAmount.toFixed(3) + (scanlines.curvatureAmount > 0 ? " ⚠" : ""));
                stdout.push("  Flicker amount:      " + scanlines.flickerAmount.toFixed(3));
                stdout.push("  Edge fade:           " + scanlines.edgeSoftness.toFixed(3));
                stdout.push("  Fade opacity:        " + scanlines.fadeOpacity.toFixed(2));
                stdout.push("");
                stdout.push("QUALITY PARAMETERS");
                stdout.push("  Brightness:          " + scanlines.brightness.toFixed(2));
                stdout.push("  Color temperature:   " + scanlines.colorTemperature.toFixed(2));
                stdout.push("  Chromatic shift:     " + scanlines.chromaShift.toFixed(2));
                stdout.push("  Noise/grain:         " + scanlines.noiseAmount.toFixed(3));
                stdout.push("  Phosphor glow:       " + scanlines.glowAmount.toFixed(2));
                stdout.push("  Glow spread:         " + scanlines.glowSpread.toFixed(2));
                stdout.push("  Zoom factor:         " + scanlines.zoomFactor.toFixed(2));
                stdout.push("");
                stdout.push("VHS EFFECT");
                stdout.push("  VHS distortion:      " + scanlines.vhsEffect.toFixed(2) + (scanlines.vhsEffect > 0 ? " ✓" : ""));
                if (scanlines.vhsEffect > 0) {
                    stdout.push("    Active effects: tracking errors, color bleeding, noise lines");
                }
                stdout.push("");
                stdout.push("Use 'scanline --help' for parameter ranges and descriptions");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length > 0 && args[0] === "reset") {
                scanlines.applyPreset("default");
                scanlines.enabled = false;
                scanlines.saveSettings();

                stdout.push("✓ All settings reset to factory defaults");
                stdout.push("  Effect is now DISABLED");
                stdout.push("  All parameters restored to baseline values");
                stdout.push("  VHS effect reset to 0.0");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length > 0 && args[0] === "on") {
                scanlines.enabled = true;
                scanlines.saveSettings();
                stdout.push("✓ CRT effect ENABLED");
                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length > 0 && args[0] === "off") {
                scanlines.enabled = false;
                scanlines.saveSettings();
                stdout.push("✓ CRT effect DISABLED");
                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length > 0 && args[0] === "toggle") {
                scanlines.enabled = !scanlines.enabled;
                scanlines.saveSettings();
                stdout.push("✓ CRT effect " + (scanlines.enabled ? "ENABLED" : "DISABLED"));
                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            var validPresets = ["default", "vhs", "retro"];
            var presetApplied = false;
            var customAdjustments = false;

            if (args.length > 0 && validPresets.indexOf(args[0]) !== -1) {
                scanlines.applyPreset(args[0]);
                presetApplied = true;
                stdout.push("✓ Applied preset: " + args[0]);
            }

            if (flags.intensity !== undefined) {
                var intensity = parseFloat(flags.intensity);
                if (isNaN(intensity) || intensity < 0 || intensity > 0.3) {
                    stderr.push("Error: --intensity must be between 0.0 and 0.3");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.scanlineIntensity = intensity;
                customAdjustments = true;
                stdout.push("Scanline intensity set to " + intensity.toFixed(3));
            }

            if (flags.count !== undefined) {
                var count = parseFloat(flags.count);
                if (isNaN(count) || count < 800 || count > 2000) {
                    stderr.push("Error: --count must be between 800 and 2000");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.scanlineCount = count;
                customAdjustments = true;
                stdout.push("Scanline count set to " + count.toFixed(0));
            }

            if (flags.curvature !== undefined) {
                var curvature = parseFloat(flags.curvature);
                if (isNaN(curvature) || curvature < 0 || curvature > 1.0) {
                    stderr.push("Error: --curvature must be between 0.0 and 1.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.curvatureAmount = curvature;
                customAdjustments = true;
                stdout.push("Curvature set to " + curvature.toFixed(3));
                if (curvature > 0.4) {
                    stdout.push("⚠ Warning: High curvature may affect UI readability");
                }
            }

            if (flags.flicker !== undefined) {
                var flicker = parseFloat(flags.flicker);
                if (isNaN(flicker) || flicker < 0 || flicker > 1.0) {
                    stderr.push("Error: --flicker must be between 0.0 and 1.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.flickerAmount = flicker;
                customAdjustments = true;
                stdout.push("Flicker amount set to " + flicker.toFixed(3));
            }

            if (flags.fade !== undefined) {
                var fade = parseFloat(flags.fade);
                if (isNaN(fade) || fade < 0 || fade > 0.1) {
                    stderr.push("Error: --fade must be between 0.0 and 0.1");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.edgeSoftness = fade;
                customAdjustments = true;
                stdout.push("Edge fade set to " + fade.toFixed(3));
            }

            if (flags.fadeopacity !== undefined) {
                var fadeopacity = parseFloat(flags.fadeopacity);
                if (isNaN(fadeopacity) || fadeopacity < 0 || fadeopacity > 1.0) {
                    stderr.push("Error: --fadeopacity must be between 0.0 and 1.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.fadeOpacity = fadeopacity;
                customAdjustments = true;
                stdout.push("Fade opacity set to " + fadeopacity.toFixed(2));
            }

            if (flags.brightness !== undefined) {
                var brightness = parseFloat(flags.brightness);
                if (isNaN(brightness) || brightness < 0.1 || brightness > 1.5) {
                    stderr.push("Error: --brightness must be between 0.1 and 1.5");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.brightness = brightness;
                customAdjustments = true;
                stdout.push("Brightness set to " + brightness.toFixed(2));
            }

            if (flags.temperature !== undefined) {
                var temperature = parseFloat(flags.temperature);
                if (isNaN(temperature) || temperature < 0.1 || temperature > 5.0) {
                    stderr.push("Error: --temperature must be between 0.1 and 5.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.colorTemperature = temperature;
                customAdjustments = true;
                stdout.push("Color temperature set to " + temperature.toFixed(2));
            }

            if (flags.chroma !== undefined) {
                var chroma = parseFloat(flags.chroma);
                if (isNaN(chroma) || chroma < 0 || chroma > 3.0) {
                    stderr.push("Error: --chroma must be between 0.0 and 3.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.chromaShift = chroma;
                customAdjustments = true;
                stdout.push("Chromatic aberration set to " + chroma.toFixed(2));
            }

            if (flags.noise !== undefined) {
                var noise = parseFloat(flags.noise);
                if (isNaN(noise) || noise < 0 || noise > 1.0) {
                    stderr.push("Error: --noise must be between 0.0 and 1.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.noiseAmount = noise;
                customAdjustments = true;
                stdout.push("Noise/grain set to " + noise.toFixed(3));
            }

            if (flags.glow !== undefined) {
                var glow = parseFloat(flags.glow);
                if (isNaN(glow) || glow < 0 || glow > 3.0) {
                    stderr.push("Error: --glow must be between 0.0 and 3.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.glowAmount = glow;
                customAdjustments = true;
                stdout.push("Phosphor glow set to " + glow.toFixed(2));
                if (glow > 2.0) {
                    stdout.push("⚠ Warning: High glow values may wash out fine detail");
                }
            }

            if (flags.glowspread !== undefined) {
                var glowspread = parseFloat(flags.glowspread);
                if (isNaN(glowspread) || glowspread < 0 || glowspread > 1.0) {
                    stderr.push("Error: --glowspread must be between 0.0 and 1.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.glowSpread = glowspread;
                customAdjustments = true;
                stdout.push("Glow spread set to " + glowspread.toFixed(2));
            }

            if (flags.zoom !== undefined) {
                var zoom = parseFloat(flags.zoom);
                if (isNaN(zoom) || zoom < 1.0 || zoom > 1.2) {
                    stderr.push("Error: --zoom must be between 1.0 and 1.2");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.zoomFactor = zoom;
                customAdjustments = true;
                stdout.push("Zoom factor set to " + zoom.toFixed(2));
            }

            if (flags.vhs !== undefined) {
                var vhs = parseFloat(flags.vhs);
                if (isNaN(vhs) || vhs < 0.0 || vhs > 1.0) {
                    stderr.push("Error: --vhs must be between 0.0 and 1.0");
                    return { stdout: [], stderr: stderr, exitCode: 1, sideEffects: {} };
                }
                scanlines.vhsEffect = vhs;
                customAdjustments = true;
                stdout.push("VHS distortion set to " + vhs.toFixed(2));
                if (vhs > 0) {
                    stdout.push("  Effects active: tracking errors, color bleeding, noise lines");
                }
                if (vhs >= 0.7) {
                    stdout.push("⚠ Warning: High VHS values create heavy distortion");
                }
            }

            if (presetApplied || customAdjustments) {
                if (customAdjustments) {
                    scanlines.currentPreset = "custom";
                }
                scanlines.saveSettings();

                stdout.push("");
                stdout.push("✓ Settings applied and saved");
                stdout.push("Effect is " + (scanlines.enabled ? "ENABLED" : "DISABLED"));

                if (customAdjustments && presetApplied) {
                    stdout.push("Note: Custom adjustments override preset values");
                }

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length === 0 && Object.keys(flags).length === 0) {
                stdout.push("CRT/SCANLINE - Enhanced CRT Effect Control");
                stdout.push(repeatString("=", 70));
                stdout.push("");
                stdout.push("Current state: " + (scanlines.enabled ? "ENABLED ✓" : "DISABLED ✗"));
                stdout.push("Current preset: " + scanlines.currentPreset);
                if (scanlines.curvatureAmount > 0) {
                    stdout.push("⚠ Curvature: " + scanlines.curvatureAmount.toFixed(3) + " (active)");
                }
                if (scanlines.vhsEffect > 0) {
                    stdout.push("📼 VHS effect: " + scanlines.vhsEffect.toFixed(2) + " (active)");
                }
                stdout.push("");
                stdout.push("QUICK COMMANDS");
                stdout.push("  scanline on/off/toggle    Control effect");
                stdout.push("  scanline status           View all settings");
                stdout.push("  scanline list             List all presets");
                stdout.push("  scanline <preset>         Apply preset");
                stdout.push("  scanline --vhs <0.0-1.0>  VHS tape distortion");
                stdout.push("  scanline --help           Full documentation");
                stdout.push("");
                stdout.push("PRESETS: vhs, retro");
                stdout.push("HINT: Try 'scanline retro' for curved CRT!");
                stdout.push("      Try 'scanline --vhs 0.5' for authentic VHS tape look!");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            stderr.push("Error: unknown scanline command or option");
            stderr.push("Use 'scanline --help' for usage information");

            return {
                stdout: [],
                stderr: stderr,
                exitCode: 1,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "clear", {
        help: "Clear the terminal screen",
        usage: "clear",
        minArgs: 0,
        maxArgs: 0,
        aliases: ["cls"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            kernel.clearBuffer();

            if (typeof terminalModel !== 'undefined') {
                var promptText = "";
                if (typeof root !== 'undefined' && root.currentPromptStyle) {
                    promptText = root.currentPromptStyle.generatePrompt(kernel);
                } else {
                    promptText = kernel.currentUser + "@pegasus:" +
                    (kernel.getUserPath ? kernel.getUserPath(kernel.cwd) : kernel.cwd) + "$ ";
                }

                terminalModel.append({
                    prompt: promptText,
                    command: "",
                    result: "",
                    isSystem: false,
                    isError: false
                });
            }

            return {
                stdout: [],
                stderr: [],
                exitCode: 0,
                sideEffects: {
                    clearScreen: true
                }
            };
        }
    });

    CommandRegistry.register(kernel, "pwd", {
        help: "Print working directory",
        usage: "pwd",
        minArgs: 0,
        maxArgs: 0,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var displayPath = kernel.cwd;

            if (displayPath === "/") {
                displayPath = "/home/" + kernel.currentUser;
            }
            else if (displayPath.startsWith("/")) {
                if (displayPath === "/All-Games") {
                    displayPath = "/home/" + kernel.currentUser + "/All-Games";
                }
                else if (displayPath === "/Favorites") {
                    displayPath = "/home/" + kernel.currentUser + "/Favorites";
                }
                else if (displayPath === "/MostPlayed") {
                    displayPath = "/home/" + kernel.currentUser + "/MostPlayed";
                }
                else if (displayPath === "/LastPlayed") {
                    displayPath = "/home/" + kernel.currentUser + "/LastPlayed";
                }
                else if (displayPath.startsWith("/Collections/")) {
                    var parts = displayPath.split("/").filter(function(s) { return s !== ""; });
                    if (parts.length >= 2) {
                        var collectionName = parts[1];
                        displayPath = "/home/" + kernel.currentUser + "/Collections/" + collectionName + "/games";
                    }
                }
                else if (displayPath.startsWith("/home/")) {
                }
            }

            return {
                stdout: [displayPath],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "ls", {
        help: "List directory contents",
        usage: "ls [path] [--limit=<n>] [--head=<n>] [--tail=<n>] [--wide]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["dir"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var path = args.length > 0 ? args[0] : kernel.cwd;
            var resolved = kernel.resolvePath(path);

            if (resolved.error) {
                return {
                    stdout: [],
                    stderr: ["ls: cannot access '" + path + "': No such directory"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (resolved.type === "error") {
                return {
                    stdout: [],
                    stderr: ["ls: " + resolved.error + ": " + path],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (resolved.type !== "directory" && !resolved.isDirectory) {
                var prefix = getFilePrefix(resolved.type);
                return {
                    stdout: [prefix + resolved.name],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            var stdout = [];
            var gameListing = [];

            if (!resolved.contents || resolved.contents.length === 0) {
                return {
                    stdout: ["(empty directory)"],
                             stderr: [],
                             exitCode: 0,
                             sideEffects: {}
                };
            }

            var items = resolved.contents;
            var limit = null;
            var fromStart = true;
            var showInfo = false;

            if (flags.limit) {
                limit = parseInt(flags.limit);
                showInfo = true;
            } else if (flags.head) {
                limit = parseInt(flags.head);
                fromStart = true;
                showInfo = true;
            } else if (flags.tail) {
                limit = parseInt(flags.tail);
                fromStart = false;
                showInfo = true;
            }

            var displayItems = items;
            var totalCount = items.length;
            var startOffset = 0;

            if (limit && limit > 0) {
                if (fromStart) {
                    displayItems = items.slice(0, Math.min(limit, items.length));
                    startOffset = 0;
                } else {
                    startOffset = Math.max(0, items.length - limit);
                    displayItems = items.slice(startOffset);
                }
            }

            if (flags.wide) {
                stdout = formatWideListing(displayItems);

                var gameIndex = 0;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.type === "game") {
                        if (i >= startOffset && i < startOffset + displayItems.length) {
                            gameListing.push({
                                index: gameIndex,
                                name: item.name,
                                title: item.name
                            });
                        }
                        gameIndex++;
                    }
                }
            } else {
                var gameIndex = 0;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    
                    if (item.type === "game") {
                        if (i >= startOffset && i < startOffset + displayItems.length) {
                            var prefix = getFilePrefix(item.type);
                            stdout.push(gameIndex + "- " + item.name);

                            gameListing.push({
                                index: gameIndex,
                                name: item.name,
                                title: item.name
                            });
                        }
                        gameIndex++;
                    } else if (i >= startOffset && i < startOffset + displayItems.length) {
                        var prefix = getFilePrefix(item.type);
                        stdout.push(prefix + item.name);
                    }
                }
            }

            if (showInfo && limit && totalCount > displayItems.length) {
                stdout.push("");
                if (fromStart) {
                    stdout.push("Showing first " + displayItems.length + " of " + totalCount + " items");
                    stdout.push("Use --tail=" + limit + " to see the last " + limit);
                } else {
                    stdout.push("Showing last " + displayItems.length + " of " + totalCount + " items");
                    stdout.push("Use --head=" + limit + " to see the first " + limit);
                }
            }

            if (gameListing.length > 0) {
                kernel.lastGameListing = gameListing;
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "head", {
        help: "Show first N items of current directory",
        usage: "head [n] [path]",
        minArgs: 0,
        maxArgs: 2,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var limit = 10;
            var path = kernel.cwd;

            if (args.length === 1) {
                var num = parseInt(args[0]);
                if (!isNaN(num)) {
                    limit = num;
                } else {
                    path = args[0];
                }
            } else if (args.length === 2) {
                limit = parseInt(args[0]);
                path = args[1];
            }

            flags.head = limit.toString();

            var lsCommand = kernel.commandRegistry["ls"];
            return lsCommand.execute.call(this, [path], flags);
        }
    });

    CommandRegistry.register(kernel, "tail", {
        help: "Show last N items of current directory",
        usage: "tail [n] [path]",
        minArgs: 0,
        maxArgs: 2,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var limit = 10;
            var path = kernel.cwd;

            if (args.length === 1) {
                var num = parseInt(args[0]);
                if (!isNaN(num)) {
                    limit = num;
                } else {
                    path = args[0];
                }
            } else if (args.length === 2) {
                limit = parseInt(args[0]);
                path = args[1];
            }

            flags.tail = limit.toString();

            var lsCommand = kernel.commandRegistry["ls"];
            return lsCommand.execute.call(this, [path], flags);
        }
    });

    CommandRegistry.register(kernel, "cols", {
        help: "List directory contents in clean columns",
        usage: "cols [path]",
        minArgs: 0,
        maxArgs: 1,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var path = args.length > 0 ? args[0] : kernel.cwd;
            var resolved = kernel.resolvePath(path);

            if (resolved.error || resolved.type === "error") {
                return {
                    stdout: [],
                    stderr: ["cols: cannot access '" + path + "': No such directory"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (resolved.type !== "directory" && !resolved.isDirectory) {
                return {
                    stdout: [resolved.name],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            var stdout = [];

            if (resolved.contents && resolved.contents.length > 0) {
                var items = [];
                for (var i = 0; i < resolved.contents.length; i++) {
                    items.push(resolved.contents[i].name);
                }
                stdout = formatSimpleColumns(items, 4);
            } else {
                stdout.push("(empty directory)");
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    function formatSimpleColumns(items, columns) {
        var result = [];
        var maxWidth = 0;

        for (var i = 0; i < items.length; i++) {
            if (items[i].length > maxWidth) {
                maxWidth = items[i].length;
            }
        }
        maxWidth += 2;

        var itemsPerColumn = Math.ceil(items.length / columns);

        for (var row = 0; row < itemsPerColumn; row++) {
            var line = "";
            for (var col = 0; col < columns; col++) {
                var index = row + (col * itemsPerColumn);
                if (index < items.length) {
                    line += padRight(items[index], maxWidth);
                }
            }
            line = line.replace(/\s+$/, '');
            if (line.length > 0) {
                result.push(line);
            }
        }

        return result;
    }

    CommandRegistry.register(kernel, "ll", {
        help: "List directory contents in wide format (columns)",
        usage: "ll [path]",
        minArgs: 0,
        maxArgs: 1,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var path = args.length > 0 ? args[0] : kernel.cwd;
            var resolved = kernel.resolvePath(path);

            if (resolved.error) {
                return {
                    stdout: [],
                    stderr: ["ll: cannot access '" + path + "': No such directory"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (resolved.type === "error") {
                return {
                    stdout: [],
                    stderr: ["ll: " + resolved.error + ": " + path],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (resolved.type !== "directory" && !resolved.isDirectory) {
                var prefix = getFilePrefix(resolved.type);
                return {
                    stdout: [prefix + resolved.name],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            var stdout = [];

            if (resolved.contents && resolved.contents.length > 0) {
                stdout = formatWideListingWithNumbers(resolved.contents);
            } else {
                stdout.push("(empty directory)");
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    function getFilePrefix(type) {
        switch(type) {
            case "directory": return "";
            case "collection": return "";
            case "game": return "";
            case "favorite": return "[FAV]  ";
            case "lastplayed": return "[REC]  ";
            case "mostplayed": return "[TOP]  ";
            case "file": return "";
            default: return "[???]  ";
        }
    }

    function formatWideListing(items) {
        var result = [];
        var maxColumns = 4;
        var itemsPerColumn = Math.ceil(items.length / maxColumns);

        var columns = [];
        for (var col = 0; col < maxColumns; col++) {
            columns[col] = [];
        }

        for (var i = 0; i < items.length; i++) {
            var col = Math.floor(i / itemsPerColumn);
            if (col < maxColumns) {
                var item = items[i];
                var prefix = getFilePrefix(item.type);
                columns[col].push(prefix + padRight(item.name, 20));
            }
        }

        var maxRows = 0;
        for (var col = 0; col < maxColumns; col++) {
            if (columns[col].length > maxRows) {
                maxRows = columns[col].length;
            }
        }

        for (var row = 0; row < maxRows; row++) {
            var line = "";
            for (var col = 0; col < maxColumns; col++) {
                if (row < columns[col].length) {
                    line += columns[col][row];
                } else {
                    line += padRight("", 27);
                }
            }
            line = line.replace(/\s+$/, '');
            if (line.length > 0) {
                result.push(line);
            }
        }

        return result;
    }

    function formatWideListingWithNumbers(items) {
        var result = [];
        var maxColumns = 4;
        var itemsPerColumn = Math.ceil(items.length / maxColumns);

        var columns = [];
        for (var col = 0; col < maxColumns; col++) {
            columns[col] = [];
        }

        var gameIndex = 0;
        for (var i = 0; i < items.length; i++) {
            var col = Math.floor(i / itemsPerColumn);
            if (col < maxColumns) {
                var item = items[i];
                var prefix = getFilePrefix(item.type);
                var displayText = "";

                if (item.type === "game") {
                    displayText = gameIndex + "- " + padRight(item.name, 20);
                    gameIndex++;
                } else {
                    displayText = prefix + padRight(item.name, 20);
                }

                columns[col].push(displayText);
            }
        }

        var maxRows = 0;
        for (var col = 0; col < maxColumns; col++) {
            if (columns[col].length > maxRows) {
                maxRows = columns[col].length;
            }
        }

        for (var row = 0; row < maxRows; row++) {
            var line = "";
            for (var col = 0; col < maxColumns; col++) {
                if (row < columns[col].length) {
                    line += columns[col][row];
                } else {
                    line += padRight("", 27);
                }
            }
            line = line.replace(/\s+$/, '');
            if (line.length > 0) {
                result.push(line);
            }
        }

        return result;
    }

    CommandRegistry.register(kernel, "cd", {
        help: "Change directory",
        usage: "cd [path]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["chdir"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var targetPath = args.length > 0 ? args[0] : "/";

            if (targetPath === "~" || targetPath === "") {
                targetPath = "/";
            }
            else if (targetPath.startsWith("~/")) {
                targetPath = "/" + targetPath.substring(2);
            }
            else if (targetPath === "/home/" + kernel.currentUser ||
                targetPath === "/home/" + kernel.currentUser + "/") {
                targetPath = "/";
                }
                else if (targetPath.startsWith("/home/" + kernel.currentUser + "/")) {
                    targetPath = "/" + targetPath.substring(("/home/" + kernel.currentUser + "/").length);
                }

                var resolved = kernel.resolvePath(targetPath);

            if (resolved.error || resolved.type === "error") {
                return {
                    stdout: [],
                    stderr: ["cd: " + (resolved.error || "No such directory") + ": " + targetPath],
                             exitCode: 1,
                             sideEffects: {}
                };
            }

            if (resolved.type !== "directory" && !resolved.isDirectory) {
                return {
                    stdout: [],
                    stderr: ["cd: not a directory: " + targetPath],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var newCwd = resolved.vfsPath || resolved.path;
            kernel.cwd = newCwd;

            kernel.prompt = kernel.currentUser + "@pegasus:" +
            (kernel.getUserPath ? kernel.getUserPath(newCwd) : newCwd) + "$ ";
            if (newCwd.toLowerCase().indexOf("/collections/") === 0) {
                var parts = newCwd.split("/").filter(function(s) { return s !== ""; });
                if (parts.length >= 2 && parts[0].toLowerCase() === "collections") {
                    var collName = parts[1];
                    kernel.activeCollection = kernel.findCollection(collName);
                }
            } else {
                kernel.activeCollection = null;
            }

            return {
                stdout: [],
                stderr: [],
                exitCode: 0,
                sideEffects: {
                    cwdChanged: true
                }
            };
        }
    });

    CommandRegistry.register(kernel, "whoami", {
        help: "Print current user",
        usage: "whoami",
        minArgs: 0,
        maxArgs: 0,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            return {
                stdout: [kernel.currentUser || "guest"],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "logout", {
        help: "Log out current user",
        usage: "logout",
        minArgs: 0,
        maxArgs: 0,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var result = kernel.logout();
            return {
                stdout: ["Logged out successfully"],
                stderr: [],
                exitCode: 0,
                sideEffects: { stateChanged: true }
            };
        }
    });

    CommandRegistry.register(kernel, "reboot", {
        help: "Reboot the terminal system",
        usage: "reboot",
        minArgs: 0,
        maxArgs: 0,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            kernel.writeToBuffer("[SYSTEM] Rebooting terminal...", "system");

            kernel.setTimeout(function () {
                kernel.clearBuffer();
                kernel.initializeKernel();
            }, 1000);

            return {
                stdout: ["System rebooting..."],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "history", {
        help: "Show or manage command history",
        usage: "history [n] [--limit=<n>] [--all] [--clear]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["hist"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];

            if (flags.clear) {
                kernel.commandHistory = [];

                if (kernel.currentUser) {
                    var key = "terminal_history_" + kernel.currentUser;
                    api.memory.unset(key);
                }

                kernel.historyIndex = -1;

                stdout.push("Command history cleared");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }


            if (!kernel.commandHistory || kernel.commandHistory.length === 0) {
                return {
                    stdout: ["No history available"],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            var limit = 20;

            if (flags.limit !== undefined) {
                limit = parseInt(flags.limit);
                if (isNaN(limit) || limit <= 0) {
                    return {
                        stdout: [],
                        stderr: ["Invalid limit value: " + flags.limit],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }
            } else if (flags.all) {
                limit = kernel.commandHistory.length;
            } else if (args.length > 0) {
                limit = parseInt(args[0]);
                if (isNaN(limit) || limit <= 0) {
                    return {
                        stdout: [],
                        stderr: ["Invalid number: " + args[0]],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }
            }

            var totalCommands = kernel.commandHistory.length;
            var start = Math.max(0, totalCommands - limit);
            var showing = totalCommands - start;

            stdout.push("COMMAND HISTORY");
            stdout.push(repeatString("=", 40));

            if (showing < totalCommands) {
                stdout.push("Showing last " + showing + " of " + totalCommands + " commands");
            } else {
                stdout.push("Showing all " + totalCommands + " commands");
            }

            stdout.push(repeatString("-", 40));

            for (var i = start; i < totalCommands; i++) {
                var entry = kernel.commandHistory[i];
                var index = i + 1;

                var line = padRight("[" + index + "]", 6) + " " + entry.command;

                if (entry.timestamp) {
                    var date = new Date(entry.timestamp);
                    var timeStr = date.toLocaleTimeString();
                    line += " (" + timeStr + ")";
                }

                stdout.push(line);
            }

            stdout.push(repeatString("-", 40));
            stdout.push("Total: " + totalCommands + " command" + (totalCommands !== 1 ? "s" : ""));

            if (totalCommands > limit && !flags.all) {
                stdout.push("");
                stdout.push("Tip: Use 'history --all' to see all " + totalCommands + " commands");
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "collections", {
        help: "List available collections",
        usage: "collections [--short]",
        minArgs: 0,
        maxArgs: 0,
        aliases: ["cols", "coll"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];
            var count = api.collections.count;

            stdout.push("Available collections (" + count + "):");
            stdout.push(repeatString("=", 40));

            for (var i = 0; i < count; i++) {
                var coll = api.collections.get(i);
                if (flags.short) {
                    stdout.push(coll.shortName + " - " + coll.name);
                } else {
                    stdout.push("");
                    stdout.push("Collection: " + coll.name);
                    stdout.push("  Short name: " + coll.shortName);
                    stdout.push("  Games: " + coll.games.count);
                    if (coll.summary) {
                        stdout.push("  Description: " + coll.summary);
                    }
                }
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "games", {
        help: "List games in current collection or all games",
        usage: "games [--collection=<shortName>] [--limit=<n>]",
        minArgs: 0,
        maxArgs: 0,
        aliases: ["list", "g"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];
            var gamesList = [];
            var collectionName = flags.collection || null;
            var limit = flags.limit ? parseInt(flags.limit) : 100;

            if (collectionName) {
                var collection = null;

                for (var i = 0; i < api.collections.count; i++) {
                    var coll = api.collections.get(i);

                    if (coll.name.toLowerCase() === collectionName.toLowerCase()) {
                        collection = coll;
                        break;
                    }

                    if (coll.shortName.toLowerCase() === collectionName.toLowerCase()) {
                        collection = coll;
                        break;
                    }
                }

                if (!collection) {
                    return {
                        stdout: [],
                        stderr: ["Collection not found: " + collectionName],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                stdout.push("Games in collection: " + collection.name + " (" + collection.shortName + ")");
                stdout.push(repeatString("=", 60));

                if (collection.games && collection.games.count > 0) {
                    var maxGames = Math.min(limit, collection.games.count);

                    for (var i = 0; i < maxGames; i++) {
                        var game = collection.games.get(i);
                        gamesList.push({
                            index: i,
                            name: game.title,
                            title: game.title
                        });
                        stdout.push(i + "- " + game.title);
                    }

                    if (collection.games.count > limit) {
                        stdout.push("");
                        stdout.push("... and " + (collection.games.count - limit) + " more games");
                        stdout.push("Use --limit=" + collection.games.count + " to see all");
                    }

                    stdout.push("");
                    stdout.push("Total: " + collection.games.count + " games (showing " + maxGames + ")");
                } else {
                    stdout.push("(no games in this collection)");
                }

            } else {
                stdout.push("All Games");
                stdout.push(repeatString("=", 60));

                var totalGames = api.allGames.count;
                var maxGames = Math.min(limit, totalGames);

                for (var i = 0; i < maxGames; i++) {
                    var game = api.allGames.get(i);
                    gamesList.push({
                        index: i,
                        name: game.title,
                        title: game.title
                    });
                    stdout.push(i + "- " + game.title);
                }

                if (totalGames > limit) {
                    stdout.push("");
                    stdout.push("... and " + (totalGames - limit) + " more games");
                    stdout.push("Use --limit=" + totalGames + " to see all");
                }

                stdout.push("");
                stdout.push("Total: " + totalGames + " games (showing " + maxGames + ")");
            }

            if (gamesList.length > 0) {
                kernel.lastGameListing = gamesList;
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "use", {
        help: "Navigate to a collection directory",
        usage: "use <collection_name>",
        minArgs: 1,
        maxArgs: 1,
        aliases: ["goto", "collection"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var collectionName = args[0].toLowerCase();
            var targetPath = null;
            var collectionFullName = null;
            var collectionShortName = null;
            var gameCount = 0;


            if (collectionName === "all" || collectionName === "all-games" || collectionName === "allgames") {
                targetPath = "/All-Games";
                collectionFullName = "All Games";
                collectionShortName = "all";
                gameCount = api.allGames.count;
            }

            else if (collectionName === "favorites" || collectionName === "fav") {
                targetPath = "/Favorites";
                collectionFullName = "Favorites";
                collectionShortName = "favorites";
                for (var i = 0; i < api.allGames.count; i++) {
                    var game = api.allGames.get(i);
                    if (game.favorite) {
                        gameCount++;
                    }
                }
            }

            else if (collectionName === "mostplayed" || collectionName === "most") {
                targetPath = "/MostPlayed";
                collectionFullName = "Most Played";
                collectionShortName = "mostplayed";
                for (var i = 0; i < api.allGames.count; i++) {
                    var game = api.allGames.get(i);
                    if (game.playTime && game.playTime > 0) {
                        gameCount++;
                    }
                }
            }

            else if (collectionName === "lastplayed" || collectionName === "last" || collectionName === "recent") {
                targetPath = "/LastPlayed";
                collectionFullName = "Last Played";
                collectionShortName = "lastplayed";
                for (var i = 0; i < api.allGames.count; i++) {
                    var game = api.allGames.get(i);
                    if (game.lastPlayed && game.lastPlayed > 0) {
                        gameCount++;
                    }
                }
            }

            else {
                var collection = null;
                for (var i = 0; i < api.collections.count; i++) {
                    var coll = api.collections.get(i);
                    if (coll.shortName.toLowerCase() === collectionName) {
                        collection = coll;
                        break;
                    }
                }

                if (!collection) {
                    for (var i = 0; i < api.collections.count; i++) {
                        var coll = api.collections.get(i);
                        if (coll.name.toLowerCase() === collectionName) {
                            collection = coll;
                            break;
                        }
                    }
                }

                if (!collection) {
                    return {
                        stdout: [
                            "Collection not found: " + collectionName,
                            "",
                            "Available collections:",
                            "  • all, favorites, mostplayed, lastplayed",
                            "  • Use 'collections' to see all available collections"
                        ],
                        stderr: [],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                targetPath = "/Collections/" + collection.shortName + "/games";
                collectionFullName = collection.name;
                collectionShortName = collection.shortName;
                gameCount = collection.games.count;

                kernel.activeCollection = collection;
            }


            var resolved = kernel.resolvePath(targetPath);

            if (resolved.error || resolved.type === "error") {
                return {
                    stdout: [],
                    stderr: ["Error accessing collection: " + targetPath],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            kernel.cwd = targetPath;


            var infoLines = [
                collectionFullName,
                repeatString("=", 40),
                             "Games: " + gameCount,
                             "Location: " + targetPath,
                             "",
                             "Quick commands:",
                             "  ls              - List all games",
                             "  ls --limit=10   - Show first 10 games",
                             "  info @" + collectionShortName + ":0    - Game info by index",
                             "  launch @" + collectionShortName + ":0   - Launch game by index"
            ];

            if (gameCount > 50) {
                infoLines.push("");
                infoLines.push("Tip: Use 'ls --limit=20' to avoid long lists");
            }


            if (typeof terminalModel !== 'undefined') {
                var resultText = infoLines.join('\n');

                if (terminalModel.count > 0) {
                    var lastIndex = terminalModel.count - 1;
                    terminalModel.setProperty(lastIndex, "result", resultText);
                    terminalModel.setProperty(lastIndex, "isSystem", true);
                }
            }

            return {
                stdout: [],
                stderr: [],
                exitCode: 0,
                sideEffects: {
                    cwdChanged: true
                }
            };
        }
    });

    CommandRegistry.register(kernel, "info", {
        help: "Show game information",
        usage: "info <game_title|index|@collection:index> [--collection=<n>] [--index=<n>] [-d|--description] [-a|--ascii]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["show", "detail"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            function wrapText(text, maxWidth) {
                if (!text) return [];

                var words = text.split(' ');
                var lines = [];
                var currentLine = '';

                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    if (word.length > maxWidth) {
                        if (currentLine !== '') {
                            lines.push(currentLine);
                            currentLine = '';
                        }
                        for (var j = 0; j < word.length; j += maxWidth) {
                            var chunk = word.substring(j, j + maxWidth);
                            lines.push(chunk);
                        }
                    } else {
                        if ((currentLine + ' ' + word).length > maxWidth && currentLine !== '') {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            currentLine = currentLine === '' ? word : currentLine + ' ' + word;
                        }
                    }
                }

                if (currentLine !== '') {
                    lines.push(currentLine);
                }

                return lines;
            }

            function asciiProgressBar(value, max, width, filledChar, emptyChar) {
                if (value === undefined || value === null) return "N/A";
                if (max === undefined) max = 1;
                if (width === undefined) width = 20;
                if (filledChar === undefined) filledChar = "█";
                if (emptyChar === undefined) emptyChar = "░";

                var percent = value / max;
                var filledCount = Math.round(percent * width);
                filledCount = Math.min(filledCount, width);

                var bar = filledChar.repeat(filledCount) + emptyChar.repeat(width - filledCount);
                var percentDisplay = Math.round(percent * 100) + "%";

                return bar + " " + percentDisplay;
            }

            function asciiStars(value, maxStars) {
                if (value === undefined || value === null) return "N/A";
                if (maxStars === undefined) maxStars = 5;

                var filledStars = Math.round(value * maxStars);
                filledStars = Math.min(filledStars, maxStars);

                return "★".repeat(filledStars) + "☆".repeat(maxStars - filledStars) + " " + (value * 100).toFixed(0) + "%";
            }

            function asciiHeatmap(value, min, max) {
                if (value === undefined || value === null) return "N/A";

                var colors = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
                var percent = (value - min) / (max - min);
                var index = Math.min(Math.floor(percent * colors.length), colors.length - 1);
                index = Math.max(0, index);

                return colors[index] + " " + value;
            }

            function formatPlayTime(seconds) {
                if (!seconds || seconds === 0) return "0h 0m";

                var hours = Math.floor(seconds / 3600);
                var minutes = Math.floor((seconds % 3600) / 60);

                var symbol = "⏱️";
                if (hours > 100) symbol = "🔥";
                else if (hours > 50) symbol = "⚡";
                else if (hours > 10) symbol = "📊";

                return symbol + " " + hours + "h " + minutes + "m";
            }

            function asciiCheckbox(value) {
                return value ? "[✓]" : "[ ]";
            }

            function asciiBox(text, width, style) {
                if (style === undefined) style = "single";

                var top, middle, bottom, left, right;

                if (style === "single") {
                    top = "┌" + "─".repeat(width - 2) + "┐";
                    middle = "│";
                    bottom = "└" + "─".repeat(width - 2) + "┘";
                } else if (style === "double") {
                    top = "╔" + "═".repeat(width - 2) + "╗";
                    middle = "║";
                    bottom = "╚" + "═".repeat(width - 2) + "╝";
                } else if (style === "rounded") {
                    top = "╭" + "─".repeat(width - 2) + "╮";
                    middle = "│";
                    bottom = "╰" + "─".repeat(width - 2) + "╯";
                }

                var lines = [];
                lines.push(top);

                var wrappedLines = wrapText(text, width - 4);
                if (wrappedLines.length === 0) {
                    lines.push(middle + " ".repeat(width - 2) + middle);
                } else {
                    for (var i = 0; i < wrappedLines.length; i++) {
                        var line = wrappedLines[i];
                        var padding = width - 2 - line.length;
                        var leftPad = Math.floor(padding / 2);
                        var rightPad = padding - leftPad;
                        lines.push(middle + " ".repeat(leftPad) + line + " ".repeat(rightPad) + middle);
                    }
                }

                lines.push(bottom);
                return lines;
            }

            function asciiRatingBar(value) {
                if (!value || value === 0) return "☆☆☆☆☆ 0%";

                var stars = "";
                var percent = Math.round(value * 100);

                for (var i = 0; i < 5; i++) {
                    if (value >= (i + 1) * 0.2) {
                        stars += "★";
                    } else if (value >= i * 0.2 + 0.1) {
                        stars += "½";
                    } else {
                        stars += "☆";
                    }
                }

                return stars + " " + percent + "%";
            }

            function asciiPlayCount(count) {
                if (!count || count === 0) return "0 times";

                var bars = "";
                var intensity = Math.min(Math.floor(Math.log10(count + 1) * 2), 8);

                for (var i = 0; i < 8; i++) {
                    if (i < intensity) {
                        bars += "█";
                    } else {
                        bars += "░";
                    }
                }

                return bars + " " + count + (count === 1 ? " play" : " plays");
            }

            if (args.length === 0 && (flags.collection === undefined || flags.index === undefined)) {
                return {
                    stdout: [],
                    stderr: ["Not enough arguments. Usage: info <game_title|index|@collection:index> [--collection=<n>] [--index=<n>] [-d|--description] [-a|--ascii]"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var identifier = args.length > 0 ? args[0] : null;
            var game = null;

            if (identifier && identifier.indexOf("@") === 0) {
                var parts = identifier.substring(1).split(":");
                if (parts.length !== 2) {
                    return {
                        stdout: [],
                        stderr: ["Invalid format. Use: @collection:index (e.g., @snes:5)"],
                             exitCode: 1,
                             sideEffects: {}
                    };
                }

                var collectionName = parts[0].toLowerCase();
                var gameIndex = parseInt(parts[1]);

                if (isNaN(gameIndex) || gameIndex < 0) {
                    return {
                        stdout: [],
                        stderr: ["Invalid index: " + parts[1]],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                if (collectionName === "all-games") collectionName = "all";
                if (collectionName === "allgames") collectionName = "all";

                if (collectionName === "favorites" || collectionName === "fav") {
                    var favIndex = 0;
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.favorite) {
                            if (favIndex === gameIndex) {
                                game = g;
                                break;
                            }
                            favIndex++;
                        }
                    }

                    if (!game) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in favorites"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                }

                else if (collectionName === "mostplayed" || collectionName === "most") {
                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.playTime && g.playTime > 0) {
                            gamesArray.push(g);
                        }
                    }
                    gamesArray.sort(function(a, b) {
                        return (b.playTime || 0) - (a.playTime || 0);
                    });

                    if (gameIndex >= gamesArray.length) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in mostplayed"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                    game = gamesArray[gameIndex];
                }

                else if (collectionName === "lastplayed" || collectionName === "last" || collectionName === "recent") {
                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.lastPlayed && g.lastPlayed > 0) {
                            gamesArray.push(g);
                        }
                    }
                    gamesArray.sort(function(a, b) {
                        return (b.lastPlayed || 0) - (a.lastPlayed || 0);
                    });

                    if (gameIndex >= gamesArray.length) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in lastplayed"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                    game = gamesArray[gameIndex];
                }

                else if (collectionName === "all" || collectionName === "allgames") {
                    if (gameIndex >= api.allGames.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found (max: " + (api.allGames.count - 1) + ")"],
                             exitCode: 1,
                             sideEffects: {}
                        };
                    }
                    game = api.allGames.get(gameIndex);
                }

                else {
                    var collection = null;
                    for (var i = 0; i < api.collections.count; i++) {
                        var coll = api.collections.get(i);
                        if (coll.shortName.toLowerCase() === collectionName) {
                            collection = coll;
                            break;
                        }
                    }

                    if (!collection) {
                        return {
                            stdout: [],
                            stderr: ["Collection not found: " + collectionName],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    if (gameIndex >= collection.games.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in " + collection.name],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    game = collection.games.get(gameIndex);
                }
            }

            else if (flags.collection !== undefined && flags.index !== undefined) {
                var collectionName = flags.collection.toLowerCase();
                var gameIndex = parseInt(flags.index);

                if (isNaN(gameIndex) || gameIndex < 0) {
                    return {
                        stdout: [],
                        stderr: ["Invalid index: " + flags.index],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                if (collectionName === "all-games") collectionName = "all";
                if (collectionName === "allgames") collectionName = "all";

                if (collectionName === "favorites" || collectionName === "fav") {
                    var favIndex = 0;
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.favorite) {
                            if (favIndex === gameIndex) {
                                game = g;
                                break;
                            }
                            favIndex++;
                        }
                    }

                    if (!game) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in favorites"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                }

                else if (collectionName === "mostplayed" || collectionName === "most") {
                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.playTime && g.playTime > 0) {
                            gamesArray.push(g);
                        }
                    }
                    gamesArray.sort(function(a, b) {
                        return (b.playTime || 0) - (a.playTime || 0);
                    });

                    if (gameIndex >= gamesArray.length) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in mostplayed"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                    game = gamesArray[gameIndex];
                }

                else if (collectionName === "lastplayed" || collectionName === "last" || collectionName === "recent") {
                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.lastPlayed && g.lastPlayed > 0) {
                            gamesArray.push(g);
                        }
                    }
                    gamesArray.sort(function(a, b) {
                        return (b.lastPlayed || 0) - (a.lastPlayed || 0);
                    });

                    if (gameIndex >= gamesArray.length) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in lastplayed"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                    game = gamesArray[gameIndex];
                }

                else if (collectionName === "all" || collectionName === "allgames") {
                    if (gameIndex >= api.allGames.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found (max: " + (api.allGames.count - 1) + ")"],
                             exitCode: 1,
                             sideEffects: {}
                        };
                    }
                    game = api.allGames.get(gameIndex);
                }

                else {
                    var collection = null;
                    for (var i = 0; i < api.collections.count; i++) {
                        var coll = api.collections.get(i);
                        if (coll.shortName.toLowerCase() === collectionName) {
                            collection = coll;
                            break;
                        }
                    }

                    if (!collection) {
                        return {
                            stdout: [],
                            stderr: ["Collection not found: " + collectionName],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    if (gameIndex >= collection.games.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in " + collection.name],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    game = collection.games.get(gameIndex);
                }
            }

            else if (identifier !== null) {
                var gameNumber = parseInt(identifier);

                if (!isNaN(gameNumber) && gameNumber.toString() === identifier) {
                    if (gameNumber >= 0 && gameNumber < api.allGames.count) {
                        game = api.allGames.get(gameNumber);
                    } else {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameNumber + " not found. Valid range: 0-" + (api.allGames.count - 1)],
                             exitCode: 1,
                             sideEffects: {}
                        };
                    }
                }

                if (!game) {
                    game = kernel.findGame(identifier);
                }
            }

            if (!game) {
                return {
                    stdout: [],
                    stderr: ["Game not found: " + (identifier || "")],
                             exitCode: 1,
                             sideEffects: {}
                };
            }

            var stdout = [];
            var useAscii = flags.a !== undefined || flags.ascii !== undefined;

            if (useAscii) {

                var titleBox = asciiBox(game.title, 50, "double");
                stdout = stdout.concat(titleBox);
                stdout.push("");

                stdout.push("║ " + padRight("DEVELOPER:", 15) + " " + (game.developer || "Unknown"));
                stdout.push("║ " + padRight("PUBLISHER:", 15) + " " + (game.publisher || "Unknown"));
                stdout.push("║ " + padRight("GENRE:", 15) + " " + (game.genre || "Unknown"));

                if (game.releaseYear > 0) {
                    stdout.push("║ " + padRight("RELEASED:", 15) + " " + game.releaseYear +
                    (game.releaseMonth > 0 ? "-" + padLeft(game.releaseMonth.toString(), 2, '0') : "") +
                    (game.releaseDay > 0 ? "-" + padLeft(game.releaseDay.toString(), 2, '0') : ""));
                }

                if (game.players > 0) {
                    var playerIcons = "";
                    for (var i = 0; i < Math.min(game.players, 4); i++) {
                        playerIcons += "👤";
                    }
                    if (game.players > 4) playerIcons += "…";
                    stdout.push("║ " + padRight("PLAYERS:", 15) + " " + game.players + " " + playerIcons);
                }

                if (game.rating > 0) {
                    stdout.push("║ " + padRight("RATING:", 15) + " " + asciiRatingBar(game.rating));
                }

                stdout.push("║ " + padRight("PLAY TIME:", 15) + " " + formatPlayTime(game.playTime));

                if (game.playCount > 0) {
                    stdout.push("║ " + padRight("PLAYS:", 15) + " " + asciiPlayCount(game.playCount));
                }

                if (game.lastPlayed && game.lastPlayed > 0) {
                    var lastDate = new Date(game.lastPlayed);
                    var now = new Date();
                    var diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

                    var recencyIcon;
                    if (diffDays === 0) recencyIcon = "🟢";
                    else if (diffDays < 7) recencyIcon = "🟡";
                    else if (diffDays < 30) recencyIcon = "🟠";
                    else recencyIcon = "🔴";

                    stdout.push("║ " + padRight("LAST PLAYED:", 15) + " " + recencyIcon + " " +
                    formatDateRelative(lastDate) + " (" + lastDate.toLocaleDateString() + ")");
                } else {
                    stdout.push("║ " + padRight("LAST PLAYED:", 15) + " ⚫ Never");
                }

                stdout.push("║ " + padRight("FAVORITE:", 15) + " " + asciiCheckbox(game.favorite));

                if ((flags.d !== undefined || flags.description !== undefined) && game.description) {
                    stdout.push("");
                    stdout.push("╔" + "═".repeat(48) + "╗");
                    stdout.push("║" + centerText(" DESCRIPTION ", 48, "═") + "║");

                    var wrappedDesc = wrapText(game.description, 46);
                    for (var i = 0; i < wrappedDesc.length; i++) {
                        stdout.push("║ " + padRight(wrappedDesc[i], 46) + " ║");
                    }

                    stdout.push("╚" + "═".repeat(48) + "╝");
                }

                stdout.push("");
                stdout.push("╔" + "═".repeat(48) + "╗");
                stdout.push("║" + centerText(" COLLECTIONS ", 48, "═") + "║");

                if (game.collections && game.collections.count > 0) {
                    for (var i = 0; i < game.collections.count; i++) {
                        var coll = game.collections.get(i);
                        var bullet = (i % 2 === 0) ? "◆" : "◈";
                        stdout.push("║ " + bullet + " " + padRight(coll.name, 44) + " ║");
                    }
                } else {
                    stdout.push("║ " + centerText("(no collections)", 46) + " ║");
                }

                stdout.push("╚" + "═".repeat(48) + "╝");

            } else {
                stdout.push(repeatString("=", 40));
                stdout.push("GAME INFORMATION");
                stdout.push(repeatString("=", 40));
                stdout.push("");
                stdout.push("Title: " + game.title);

                if (game.developer) {
                    stdout.push("Developer: " + game.developer);
                }

                if (game.publisher) {
                    stdout.push("Publisher: " + game.publisher);
                }

                if (game.genre) {
                    stdout.push("Genre: " + game.genre);
                }

                if (game.releaseYear > 0) {
                    var dateParts = [];
                    if (game.releaseYear > 0) dateParts.push(game.releaseYear);
                    if (game.releaseMonth > 0) dateParts.push(game.releaseMonth.toString());
                    if (game.releaseDay > 0) dateParts.push(game.releaseDay.toString());
                    stdout.push("Release: " + dateParts.join("-"));
                }

                if (game.players > 0) {
                    stdout.push("Players: " + game.players);
                }

                if (game.rating > 0) {
                    stdout.push("Rating: " + Math.round(game.rating * 100) + "%");
                }

                if (game.playCount > 0) {
                    stdout.push("Play count: " + game.playCount);
                }

                if (game.playTime > 0) {
                    var hours = Math.floor(game.playTime / 3600);
                    var minutes = Math.floor((game.playTime % 3600) / 60);
                    stdout.push("Play Time: " + hours + "h " + minutes + "m");
                } else {
                    stdout.push("Play Time: 0h 0m");
                }

                if (game.lastPlayed && game.lastPlayed > 0) {
                    var lastDate = new Date(game.lastPlayed);
                    var now = new Date();
                    var diffMs = now - lastDate;
                    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                        var diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        if (diffHours === 0) {
                            var diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            stdout.push("Last Played: " + diffMinutes + " minutes ago | " + lastDate.toLocaleDateString());
                        } else {
                            stdout.push("Last Played: " + diffHours + " hours ago | " + lastDate.toLocaleDateString());
                        }
                    } else {
                        stdout.push("Last Played: " + diffDays + " days ago | " + lastDate.toLocaleDateString());
                    }
                } else {
                    stdout.push("Last Played: Never");
                }

                stdout.push("Favorite: " + (game.favorite ? "yes" : "no"));

                if ((flags.d !== undefined || flags.description !== undefined)) {
                    stdout.push("");
                    stdout.push("Description:");

                    if (game.description) {
                        var wrappedLines = wrapText(game.description, 70);

                        if (wrappedLines.length === 0) {
                            stdout.push("  no description");
                        } else {
                            for (var i = 0; i < wrappedLines.length; i++) {
                                stdout.push("  " + wrappedLines[i]);
                            }
                        }
                    } else {
                        stdout.push("  no description");
                    }
                }

                stdout.push("");
                stdout.push("Collections:");
                if (game.collections && game.collections.count > 0) {
                    for (var i = 0; i < game.collections.count; i++) {
                        var coll = game.collections.get(i);
                        stdout.push("  • " + coll.name);
                    }
                } else {
                    stdout.push("  (no collections)");
                }
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    function repeatString(str, count) {
        return new Array(count + 1).join(str);
    }

    function padRight(text, width) {
        text = text || "";
        if (text.length >= width) return text;
        return text + " ".repeat(width - text.length);
    }

    function padLeft(text, width, padChar) {
        padChar = padChar || " ";
        text = text || "";
        if (text.length >= width) return text;
        return padChar.repeat(width - text.length) + text;
    }

    function centerText(text, width, fillChar) {
        fillChar = fillChar || " ";
        if (text.length >= width) return text;

        var leftPad = Math.floor((width - text.length) / 2);
        var rightPad = width - text.length - leftPad;

        return fillChar.repeat(leftPad) + text + fillChar.repeat(rightPad);
    }

    function formatDateRelative(date) {
        var now = new Date();
        var diffMs = now - date;
        var diffSec = Math.floor(diffMs / 1000);
        var diffMin = Math.floor(diffSec / 60);
        var diffHour = Math.floor(diffMin / 60);
        var diffDay = Math.floor(diffHour / 24);

        if (diffDay > 0) {
            return diffDay + " day" + (diffDay > 1 ? "s" : "") + " ago";
        } else if (diffHour > 0) {
            return diffHour + " hour" + (diffHour > 1 ? "s" : "") + " ago";
        } else if (diffMin > 0) {
            return diffMin + " minute" + (diffMin > 1 ? "s" : "") + " ago";
        } else {
            return "just now";
        }
    }


    CommandRegistry.register(kernel, "launch", {
        help: "Launch a game by title, number, or from collection",
        usage: "launch <game_title|index|@collection:index> [--collection=<name>] [--index=<n>]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["run", "play"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            if (args.length === 0 && (flags.collection === undefined || flags.index === undefined)) {
                return {
                    stdout: [],
                    stderr: ["Not enough arguments. Usage: launch <game_title|index|@collection:index> [--collection=<name>] [--index=<n>]"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var identifier = args.length > 0 ? args[0] : null;
            var gameName = identifier;
            var game = null;

            if (identifier && identifier.indexOf("@") === 0) {
                var parts = identifier.substring(1).split(":");
                if (parts.length !== 2) {
                    return {
                        stdout: [],
                        stderr: ["Invalid format. Use: @collection:index (e.g., @mame:5)"],
                             exitCode: 1,
                             sideEffects: {}
                    };
                }

                var collectionName = parts[0].toLowerCase();
                var gameIndex = parseInt(parts[1]);

                if (isNaN(gameIndex) || gameIndex < 0) {
                    return {
                        stdout: [],
                        stderr: ["Invalid index: " + parts[1]],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                if (collectionName === "all-games") {
                    collectionName = "all";
                } else if (collectionName === "allgames") {
                    collectionName = "all";
                }

                if (collectionName === "favorites" || collectionName === "fav") {
                    var favIndex = 0;
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.favorite) {
                            if (favIndex === gameIndex) {
                                game = g;
                                break;
                            }
                            favIndex++;
                        }
                    }

                    if (!game) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in favorites"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                } else if (collectionName === "mostplayed" || collectionName === "most") {
                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.playTime && g.playTime > 0) {
                            gamesArray.push(g);
                        }
                    }
                    gamesArray.sort(function(a, b) {
                        return (b.playTime || 0) - (a.playTime || 0);
                    });

                    if (gameIndex >= gamesArray.length) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in mostplayed"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                    game = gamesArray[gameIndex];

                } else if (collectionName === "lastplayed" || collectionName === "last" || collectionName === "recent") {
                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var g = api.allGames.get(i);
                        if (g.lastPlayed && g.lastPlayed > 0) {
                            gamesArray.push(g);
                        }
                    }
                    gamesArray.sort(function(a, b) {
                        return (b.lastPlayed || 0) - (a.lastPlayed || 0);
                    });

                    if (gameIndex >= gamesArray.length) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in lastplayed"],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }
                    game = gamesArray[gameIndex];

                } else if (collectionName === "all" || collectionName === "allgames") {
                    if (gameIndex >= api.allGames.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in all-games (max: " + (api.allGames.count - 1) + ")"],
                             exitCode: 1,
                             sideEffects: {}
                        };
                    }
                    game = api.allGames.get(gameIndex);

                } else {
                    var collection = null;
                    for (var i = 0; i < api.collections.count; i++) {
                        var coll = api.collections.get(i);
                        if (coll.shortName.toLowerCase() === collectionName) {
                            collection = coll;
                            break;
                        }
                    }

                    if (!collection) {
                        return {
                            stdout: [],
                            stderr: ["Collection not found: " + collectionName],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    if (!collection.games || gameIndex >= collection.games.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in collection: " + collection.name],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    game = collection.games.get(gameIndex);
                }
            }

            else if (flags.collection !== undefined && flags.index !== undefined) {
                var collectionName = flags.collection.toLowerCase();
                var gameIndex = parseInt(flags.index);

                if (isNaN(gameIndex) || gameIndex < 0) {
                    return {
                        stdout: [],
                        stderr: ["Invalid index: " + flags.index],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                if (collectionName === "all-games") {
                    collectionName = "all";
                } else if (collectionName === "allgames") {
                    collectionName = "all";
                }

                if (collectionName === "all" || collectionName === "allgames") {
                    if (gameIndex >= api.allGames.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in all-games (max: " + (api.allGames.count - 1) + ")"],
                             exitCode: 1,
                             sideEffects: {}
                        };
                    }
                    game = api.allGames.get(gameIndex);
                } else {
                    var collection = null;
                    for (var i = 0; i < api.collections.count; i++) {
                        var coll = api.collections.get(i);
                        if (coll.shortName.toLowerCase() === collectionName) {
                            collection = coll;
                            break;
                        }
                    }

                    if (!collection) {
                        return {
                            stdout: [],
                            stderr: ["Collection not found: " + collectionName],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    if (!collection.games || gameIndex >= collection.games.count) {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameIndex + " not found in collection: " + collection.name],
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    game = collection.games.get(gameIndex);
                }
            }

            else if (identifier !== null) {
                var gameNumber = parseInt(identifier);

                if (!isNaN(gameNumber) && gameNumber.toString() === identifier) {

                    if (gameNumber >= 0 && gameNumber < api.allGames.count) {
                        game = api.allGames.get(gameNumber);

                        if (game) {
                        }
                    }

                    if (!game) {
                        if (kernel.lastGameListing && kernel.lastGameListing.length > 0) {
                            var foundGame = null;
                            for (var i = 0; i < kernel.lastGameListing.length; i++) {
                                if (kernel.lastGameListing[i].index === gameNumber) {
                                    foundGame = kernel.lastGameListing[i];
                                    break;
                                }
                            }

                            if (foundGame) {
                                gameName = foundGame.title;
                                game = kernel.findGame(gameName);
                            } else {
                                return {
                                    stdout: [],
                                    stderr: ["Game index " + gameNumber + " not found. Valid range: 0-" + (api.allGames.count - 1)],
                             exitCode: 1,
                             sideEffects: {}
                                };
                            }
                        } else {
                            return {
                                stdout: [],
                                stderr: ["Game index " + gameNumber + " not found. Valid range: 0-" + (api.allGames.count - 1)],
                             exitCode: 1,
                             sideEffects: {}
                            };
                        }
                    }
                }

                if (!game) {
                    game = kernel.findGame(gameName);
                }
            }

            if (!game) {
                return {
                    stdout: [],
                    stderr: ["Game not found: " + (identifier || "")],
                             exitCode: 1,
                             sideEffects: {}
                };
            }

            api.memory.set("terminal_last_context", {
                cwd: kernel.cwd,
                collection: kernel.activeCollection ? kernel.activeCollection.shortName : null,
                game: game.title,
                timestamp: new Date().toISOString()
            });

            kernel.pendingStateChange = kernel.states.GAME_RUNNING;

            try {
                game.launch();
                return {
                    stdout: ["Launching: " + game.title + "..."],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: { stateChanged: true }
                };
            } catch (error) {
                return {
                    stdout: [],
                    stderr: ["Failed to launch game: " + error],
                    exitCode: 2,
                    sideEffects: {}
                };
            }
        }
    });

    CommandRegistry.register(kernel, "favorites", {
        help: "Manage favorite games",
        usage: "favorites [add|remove|list|launch] <index|title>",
        minArgs: 1,
        maxArgs: 2,
        aliases: ["fav", "f"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var action = args[0];

            if (action === "list") {
                var stdout = [];
                var favoritesList = [];

                stdout.push("Favorite games:");
                stdout.push(repeatString("=", 60));

                var gameIndex = 0;
                for (var i = 0; i < api.allGames.count; i++) {
                    var game = api.allGames.get(i);
                    if (game.favorite) {
                        favoritesList.push({
                            index: gameIndex,
                            name: game.title,
                            title: game.title
                        });
                        stdout.push(gameIndex + "- " + game.title);
                        gameIndex++;
                    }
                }

                if (gameIndex === 0) {
                    stdout.push("No favorite games yet");
                } else {
                    stdout.push("");
                    stdout.push("Total: " + gameIndex + " game(s)");

                    kernel.lastGameListing = favoritesList;
                }

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (args.length < 2) {
                return {
                    stdout: [],
                    stderr: ["Game index or title required for action: " + action],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            var identifier = args[1];
            var game = null;
            var gameNumber = parseInt(identifier);

            if (!isNaN(gameNumber) && gameNumber.toString() === identifier) {

                if (kernel.lastGameListing && kernel.lastGameListing.length > 0) {
                    var foundInListing = null;
                    for (var i = 0; i < kernel.lastGameListing.length; i++) {
                        if (kernel.lastGameListing[i].index === gameNumber) {
                            foundInListing = kernel.lastGameListing[i];
                            break;
                        }
                    }

                    if (foundInListing) {
                        game = kernel.findGame(foundInListing.title);
                    }
                }

                if (!game) {
                    if (gameNumber >= 0 && gameNumber < api.allGames.count) {
                        game = api.allGames.get(gameNumber);
                    } else {
                        return {
                            stdout: [],
                            stderr: ["Game index " + gameNumber + " out of range (0-" + (api.allGames.count - 1) + ")"],
                             exitCode: 1,
                             sideEffects: {}
                        };
                    }
                }
            } else {
                game = kernel.findGame(identifier);
            }

            if (!game) {
                return {
                    stdout: [],
                    stderr: ["Game not found: " + identifier],
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (action === "add") {
                if (game.favorite) {
                    return {
                        stdout: [game.title + " is already in favorites"],
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {}
                    };
                }

                game.favorite = true;
                return {
                    stdout: ["Added to favorites: " + game.title],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };

            } else if (action === "remove") {
                if (!game.favorite) {
                    return {
                        stdout: [game.title + " is not in favorites"],
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {}
                    };
                }

                game.favorite = false;
                return {
                    stdout: ["Removed from favorites: " + game.title],
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };

            } else if (action === "launch" || action === "play" || action === "run") {
                api.memory.set("terminal_last_context", {
                    cwd: kernel.cwd,
                    collection: kernel.activeCollection ? kernel.activeCollection.shortName : null,
                    game: game.title,
                    timestamp: new Date().toISOString()
                });

                kernel.pendingStateChange = kernel.states.GAME_RUNNING;

                try {
                    game.launch();
                    return {
                        stdout: ["Launching: " + game.title + "..."],
                        stderr: [],
                        exitCode: 0,
                        sideEffects: { stateChanged: true }
                    };
                } catch (error) {
                    return {
                        stdout: [],
                        stderr: ["Failed to launch game: " + error],
                        exitCode: 2,
                        sideEffects: {}
                    };
                }

            } else {
                return {
                    stdout: [],
                    stderr: ["Invalid action. Use: add, remove, list, or launch"],
                    exitCode: 1,
                    sideEffects: {}
                };
            }
        }
    });

    CommandRegistry.register(kernel, "stats", {
        help: "Show gaming statistics",
        usage: "stats [-a|--ascii-true]",
        minArgs: 0,
        maxArgs: 1,
        aliases: ["stat", "statistics"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];
            var asciiMode = flags.a || flags['ascii-true'] || false;
            var totalGames = api.allGames.count;
            var totalPlayTime = 0;
            var totalPlayCount = 0;
            var favoriteCount = 0;
            var gamesWithPlaytime = 0;
            var gamesPlayed = 0;
            var lastPlayedGame = null;
            var lastPlayedDate = 0;
            var lastPlayedIndex = -1;

            for (var i = 0; i < api.allGames.count; i++) {
                var game = api.allGames.get(i);

                totalPlayTime += game.playTime || 0;
                totalPlayCount += game.playCount || 0;

                if (game.favorite) {
                    favoriteCount++;
                }

                if (game.playTime && game.playTime > 0) {
                    gamesWithPlaytime++;
                }

                if (game.playCount && game.playCount > 0) {
                    gamesPlayed++;
                }

                if (game.lastPlayed && game.lastPlayed > lastPlayedDate) {
                    lastPlayedDate = game.lastPlayed;
                    lastPlayedGame = game;
                    lastPlayedIndex = i;
                }
            }

            var avgRating = 0;
            var ratedGames = 0;
            for (var i = 0; i < api.allGames.count; i++) {
                var game = api.allGames.get(i);
                if (game.rating > 0) {
                    avgRating += game.rating;
                    ratedGames++;
                }
            }
            avgRating = ratedGames > 0 ? avgRating / ratedGames : 0;

            var avgPlayTime = gamesWithPlaytime > 0 ? totalPlayTime / gamesWithPlaytime : 0;

            function createAsciiBar(value, maxValue, barWidth) {
                barWidth = barWidth || 40;
                var percentage = maxValue > 0 ? (value / maxValue) : 0;
                var filledWidth = Math.round(percentage * barWidth);
                var bar = "[";
                for (var i = 0; i < barWidth; i++) {
                    if (i < filledWidth) {
                        bar += "█";
                    } else {
                        bar += "░";
                    }
                }
                bar += "] " + Math.round(percentage * 100) + "%";
                return bar;
            }

            function formatPlayTime(seconds) {
                var hours = Math.floor(seconds / 3600);
                var minutes = Math.floor((seconds % 3600) / 60);

                if (hours >= 1000) {
                    return hours + "h " + minutes + "m";
                } else if (hours > 0) {
                    return padRight(hours + "h " + minutes + "m", 10);
                } else {
                    return padRight(minutes + "m", 10);
                }
            }

            if (asciiMode) {
                stdout.push("╔═══════════════════════════════════════════════════════════════╗");
                stdout.push("           GLOBAL STATISTICS - " + padRight(kernel.currentUser, 28));
                stdout.push("╚═══════════════════════════════════════════════════════════════╝");
                stdout.push("");

                stdout.push("┌─ LIBRARY ─────────────────────────────────────────────────────┐");
                stdout.push("│");
                stdout.push("│  Total Games:     " + padRight(totalGames.toString(), 42));

                if (totalGames > 0) {
                    var playedPercentage = totalGames > 0 ? (gamesPlayed / totalGames) : 0;
                    stdout.push("│  Games Played:    " + gamesPlayed + " / " + totalGames);
                    stdout.push("│  " + createAsciiBar(gamesPlayed, totalGames, 50));
                    stdout.push("│");

                    var favoritePercentage = totalGames > 0 ? (favoriteCount / totalGames) : 0;
                    stdout.push("│  Favorites:       " + favoriteCount + " / " + totalGames);
                    stdout.push("│  " + createAsciiBar(favoriteCount, totalGames, 50));
                }

                if (ratedGames > 0) {
                    stdout.push("│");
                    stdout.push("│  Average Rating:  " + Math.round(avgRating * 100) + "%");
                    stdout.push("│  " + createAsciiBar(avgRating, 1, 50));
                    stdout.push("│  Games Rated:     " + ratedGames + " / " + totalGames);
                }
                stdout.push("│");
                stdout.push("└───────────────────────────────────────────────────────────────┘");
                stdout.push("");

                stdout.push("┌─ PLAY STATISTICS ─────────────────────────────────────────────┐");
                stdout.push("│");

                var totalHours = Math.floor(totalPlayTime / 3600);
                var totalMinutes = Math.floor((totalPlayTime % 3600) / 60);
                stdout.push("│  Total Launches:  " + padRight(totalPlayCount.toString(), 42));
                stdout.push("│  Total Play Time: " + totalHours + "h " + totalMinutes + "m" + padRight("", 34));

                if (gamesWithPlaytime > 0) {
                    var avgHours = Math.floor(avgPlayTime / 3600);
                    var avgMinutes = Math.floor((avgPlayTime % 3600) / 60);
                    stdout.push("│  Avg per Game:    " + avgHours + "h " + avgMinutes + "m" + padRight("", 34));
                }

                stdout.push("│");

                if (totalPlayTime > 0) {
                    stdout.push("│  Top 5 Games by Playtime:");
                    stdout.push("│");

                    var gamesArray = [];
                    for (var i = 0; i < api.allGames.count; i++) {
                        var game = api.allGames.get(i);
                        if (game.playTime && game.playTime > 0) {
                            gamesArray.push({
                                title: game.title,
                                playTime: game.playTime
                            });
                        }
                    }

                    gamesArray.sort(function(a, b) { return b.playTime - a.playTime; });
                    var topGames = gamesArray.slice(0, 5);

                    stdout.push("│  ┌────┬──────────────────────────┬────────────┐");
                    stdout.push("│  │ #  │ Title                    │ Playtime   │");
                    stdout.push("│  ├────┼──────────────────────────┼────────────┤");

                    for (var i = 0; i < topGames.length; i++) {
                        var gameTitle = topGames[i].title.length > 24 ?
                        topGames[i].title.substring(0, 21) + "..." :
                        topGames[i].title;
                        var position = padRight((i + 1).toString(), 2);
                        var titlePadded = padRight(gameTitle, 24);
                        var timePadded = formatPlayTime(topGames[i].playTime);

                        stdout.push("│  │ " + position + " │ " + titlePadded + " │ " + timePadded + " │");
                    }

                    stdout.push("│  └────┴──────────────────────────┴────────────┘");
                }

                stdout.push("│");
                stdout.push("└───────────────────────────────────────────────────────────────┘");
                stdout.push("");

                if (lastPlayedGame) {
                    stdout.push("┌─ LAST PLAYED ─────────────────────────────────────────────────┐");
                    stdout.push("│");

                    var gameTitle = lastPlayedGame.title.length > 55 ?
                    lastPlayedGame.title.substring(0, 52) + "..." :
                    lastPlayedGame.title;
                    stdout.push("│  Game:       " + padRight(gameTitle, 48));
                    stdout.push("│  Index:      #" + padRight(lastPlayedIndex.toString(), 47));

                    var collectionName = "Unknown";
                    if (lastPlayedGame.collections && lastPlayedGame.collections.count > 0) {
                        collectionName = lastPlayedGame.collections.get(0).name;
                    }
                    var collectionDisplay = collectionName.length > 45 ?
                    collectionName.substring(0, 42) + "..." :
                    collectionName;
                    stdout.push("│  Collection: " + padRight(collectionDisplay, 48));

                    var lastDate = new Date(lastPlayedGame.lastPlayed);
                    var dateStr = lastDate.toLocaleDateString();
                    var timeStr = lastDate.toLocaleTimeString();
                    stdout.push("│  Date:       " + padRight(dateStr + " at " + timeStr, 48));

                    var now = new Date();
                    var diffMs = now - lastDate;
                    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    var diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    var timeAgo = "";
                    if (diffDays > 0) {
                        timeAgo = diffDays + " day" + (diffDays !== 1 ? "s" : "") +
                        " and " + diffHours + " hour" + (diffHours !== 1 ? "s" : "");
                    } else if (diffHours > 0) {
                        var diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        timeAgo = diffHours + " hour" + (diffHours !== 1 ? "s" : "") +
                        " and " + diffMinutes + " minute" + (diffMinutes !== 1 ? "s" : "");
                    } else {
                        var diffMinutes = Math.floor(diffMs / (1000 * 60));
                        timeAgo = diffMinutes + " minute" + (diffMinutes !== 1 ? "s" : "");
                    }
                    stdout.push("│  Time Ago:   " + padRight(timeAgo, 48) + "│");

                    stdout.push("│");
                    stdout.push("└───────────────────────────────────────────────────────────────┘");
                }

            } else {
                stdout.push("GLOBAL STATISTICS - " + kernel.currentUser);
                stdout.push(repeatString("=", 40));
                stdout.push("");

                stdout.push("Library:");
                stdout.push("  Total games: " + totalGames);
                stdout.push("  Favorite games: " + favoriteCount);
                if (ratedGames > 0) {
                    stdout.push("  Average rating: " + Math.round(avgRating * 100) + "%");
                    stdout.push("  Games rated: " + ratedGames);
                }

                stdout.push("");

                stdout.push("Play Statistics:");
                stdout.push("  Games played: " + gamesPlayed);
                stdout.push("  Total launches: " + totalPlayCount);

                var totalHours = Math.floor(totalPlayTime / 3600);
                var totalMinutes = Math.floor((totalPlayTime % 3600) / 60);
                stdout.push("  Total play time: " + totalHours + "h " + totalMinutes + "m");

                if (gamesWithPlaytime > 0) {
                    var avgHours = Math.floor(avgPlayTime / 3600);
                    var avgMinutes = Math.floor((avgPlayTime % 3600) / 60);
                    stdout.push("  Average per game: " + avgHours + "h " + avgMinutes + "m");
                }

                if (lastPlayedGame) {
                    stdout.push("");
                    stdout.push("Last Played:");
                    stdout.push("  Game: " + lastPlayedGame.title);
                    stdout.push("  Index: #" + lastPlayedIndex);

                    var collectionName = "Unknown";
                    if (lastPlayedGame.collections && lastPlayedGame.collections.count > 0) {
                        collectionName = lastPlayedGame.collections.get(0).name;
                    }
                    stdout.push("  Collection: " + collectionName);

                    var lastDate = new Date(lastPlayedGame.lastPlayed);
                    var dateStr = lastDate.toLocaleDateString();
                    var timeStr = lastDate.toLocaleTimeString();
                    stdout.push("  Date: " + dateStr + " at " + timeStr);

                    var now = new Date();
                    var diffMs = now - lastDate;
                    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    var diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    if (diffDays > 0) {
                        stdout.push("  Time ago: " + diffDays + " day" + (diffDays !== 1 ? "s" : "") +
                        " and " + diffHours + " hour" + (diffHours !== 1 ? "s" : ""));
                    } else if (diffHours > 0) {
                        var diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        stdout.push("  Time ago: " + diffHours + " hour" + (diffHours !== 1 ? "s" : "") +
                        " and " + diffMinutes + " minute" + (diffMinutes !== 1 ? "s" : ""));
                    } else {
                        var diffMinutes = Math.floor(diffMs / (1000 * 60));
                        stdout.push("  Time ago: " + diffMinutes + " minute" + (diffMinutes !== 1 ? "s" : ""));
                    }
                }
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "neofetch", {
        help: "Display system information with ASCII art",
        usage: "neofetch [--no-art]",
        minArgs: 0,
        maxArgs: 0,
        aliases: ["fetch", "sysinfo"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var validFlags = ["no-art"];
            for (var flag in flags) {
                if (flags.hasOwnProperty(flag) && validFlags.indexOf(flag) === -1) {
                    return {
                        stdout: [],
                        stderr: ["neofetch: invalid option '--" + flag + "'", "Try 'neofetch --help' for more information."],
                        exitCode: 1,
                        sideEffects: {}
                    };
                }
            }

            var stdout = [];
            var showArt = flags["no-art"] === undefined;

            var asciiArt = [
                "                                                 ",
                "                   .:~!7?JJJJJ?7!^:.             ",
                "               :~?5B#@@@@@@@@@@@@@@&#GY!:         ",
                "            ^JG&@@@@@@@@@@@@@@@@@@@@@@@@&G7.      ",
                "         ^JB@@@@@@@@@@@@@@@@@@@@@@@@@@@&&@@&Y.    ",
                "       ~P@@@@@@@@@@&B#&@@@@@@@&#GPY?7~^..5@@@#7   ",
                "     ^P@@@@@@@@@@@@#..:^~7?!~^.           G@@@@J  ",
                "    ?&@@@@@@&#GPY?7~     ^~:       .:^~7J5#@@@@@? ",
                "   P@@@@G!~^.          ^B@@@G!7J5PB#&@@@&BG@@@@@&:",
                "  P@@@@@J        .:^~7JB@@@@@@@@@@@@@J::. ^@@@@@@?",
                " J@@@@@@Y.^!7J5GB&@@@@@@@@@@@@@@@@@@P     Y@@@@@@Y",
                ":&@@@@@@@@@@&#BP5J7!&@@@@@@@@@@@@@@Y     !@@@@@@@?",
                "?@@@@@@@G!~^.       #@@@@@@@@@@@&5^     7@@@@@@@&:",
                "Y@@@@@@@J        .:~&@@@@@@@@#P7:     ^P@@@@@@@@J ",
                "?@@@@@@@Y.^~7J5GB&@@@&#BPYJ!^.      ~5@@@@@@@@@P  ",
                ":&@@@@@@@@@@@&BG5J7~^:.         .~JB@@@@@@@@@@5   ",
                " ?@@@@@@G7~^:.             :^!JG#@@@@@@@@@@@&?    ",
                "  J@@@@@J        .::      J@@@@@@@@@@@@@@@@P^     ",
                "   7#@@@Y.^~7JYPB#&#. ... Y@@@@@@@@@@@@@@P~       ",
                "    .Y&@@&@@@@@@@@@@######&@@@@@@@@@@@BJ^         ",
                "      .7G&@@@@@@@@@@@@@@@@@@@@@@@@&GJ^            ",
                "         :!YG#&@@@@@@@@@@@@@@#B5?~:               ",
                "             .:^!7?JJJJJ?7!~:.                    "
            ];

            var username = kernel.currentUser || "guest";
            var hostname = "pegasus";
            var os = "Pegasus Frontend";
            var kernel_version = "Terminal OS v1.0";

            var totalGames = api.allGames.count;
            var totalCollections = api.collections.count;

            var favoriteCount = 0;
            var playedCount = 0;
            var totalPlayTime = 0;

            for (var i = 0; i < api.allGames.count; i++) {
                var game = api.allGames.get(i);
                if (game.favorite) favoriteCount++;
                if (game.playCount > 0) playedCount++;
                totalPlayTime += game.playTime;
            }

            var playHours = Math.floor(totalPlayTime / 3600);
            var playMinutes = Math.floor((totalPlayTime % 3600) / 60);

            var batteryInfo = "N/A";
            if (!isNaN(api.device.batteryPercent)) {
                var batPercent = Math.round(api.device.batteryPercent * 100);
                var batStatus = api.device.batteryCharging ? " ⚡ Charging" : "";
                batteryInfo = batPercent + "%" + batStatus;
            }

            var now = new Date();
            var uptime = now.toLocaleTimeString();
            var currentDate = now.toLocaleDateString();

            var userHost = username + "@" + hostname;
            var separator = repeatString("-", userHost.length);

            var infoLines = [
                "",
                "",
                userHost,
                separator,
                "OS: " + os,
                "Kernel: " + kernel_version,
                "Uptime: " + uptime,
                "Date: " + currentDate,
                "Shell: pegasus-terminal",
                "",
                "Games: " + totalGames,
                "Collections: " + totalCollections,
                "Favorites: " + favoriteCount,
                "Played: " + playedCount + " (" + Math.round((playedCount / totalGames) * 100) + "%)",
                             "Play Time: " + playHours + "h " + playMinutes + "m",
                             "",
                             "Battery: " + batteryInfo,
                             "Current Dir: " + (kernel.getUserPath ? kernel.getUserPath(kernel.cwd) : kernel.cwd)
            ];

            var colorBar = "███ ███ ███ ███ ███ ███ ███ ███";

            if (showArt) {
                var maxLines = Math.max(asciiArt.length, infoLines.length);
                var artWidth = 58;

    for (var i = 0; i < maxLines; i++) {
        var line = "";

        if (i < asciiArt.length) {
            line += asciiArt[i];
        } else {
            line += padRight("", artWidth);
        }

        if (i < infoLines.length) {
            line += "   " + infoLines[i];
        }

        stdout.push(line);
    }

    stdout.push("");
    stdout.push(padRight("", artWidth - 5) + colorBar);
            } else {
                stdout = infoLines;
                stdout.push("");
                stdout.push(colorBar);
            }

            stdout.push("");

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "search", {
        help: "Search games with advanced filtering",
        usage: "search <term> [--field=title|developer|genre|year|all] [--limit=N] [--precise]",
        minArgs: 1,
        maxArgs: 1,
        aliases: ["find", "grep"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var term = args[0].toLowerCase();
            var field = flags.field || "title";
            var limit = flags.limit ? parseInt(flags.limit) : null;
            var precise = flags.precise !== undefined;

            var stdout = [];
            var results = [];

            for (var i = 0; i < api.allGames.count; i++) {
                var game = api.allGames.get(i);
                var searchText = "";
                var match = false;

                if (field === "title") {
                    searchText = game.title || "";
                } else if (field === "developer") {
                    searchText = game.developer || "";
                } else if (field === "genre") {
                    searchText = game.genre || "";
                } else if (field === "year") {
                    searchText = game.releaseYear ? game.releaseYear.toString() : "";
                } else if (field === "all") {
                    searchText = (game.title || "") + " " +
                    (game.developer || "") + " " +
                    (game.genre || "") + " " +
                    (game.releaseYear || "");
                }

                if (searchText.toLowerCase().indexOf(term) !== -1) {
                    match = true;
                }

                if (match) {
                    var score = 0;
                    var lowerSearch = searchText.toLowerCase();
                    var lowerTerm = term.toLowerCase();

                    if (lowerSearch === lowerTerm) {
                        score = 100;
                    } else if (lowerSearch.indexOf(lowerTerm) === 0) {
                        score = 80;
                    } else if (lowerSearch.indexOf(" " + lowerTerm) !== -1) {
                        score = 60;
                    } else {
                        score = 40;
                    }

                    var collections = [];
                    if (game.collections && game.collections.count > 0) {
                        for (var c = 0; c < game.collections.count; c++) {
                            var coll = game.collections.get(c);
                            collections.push(coll.shortName);
                        }
                    }

                    results.push({
                        index: i,
                        game: game,
                        score: score,
                        collections: collections.join(", ")
                    });
                }
            }

            if (precise) {
                results.sort(function(a, b) {
                    return b.score - a.score;
                });
            }

            if (precise) {
                stdout.push("Search results for: '" + term + "' (sorted by relevance)");
            } else if (limit) {
                stdout.push("Search results for: '" + term + "' (showing " +
                Math.min(limit, results.length) + " of " + results.length + ")");
            } else {
                stdout.push("Search results for: '" + term + "'");
            }
            stdout.push(repeatString("=", 40));

            if (results.length === 0) {
                stdout.push("No games found");
            } else {
                var displayCount = limit ? Math.min(limit, results.length) : results.length;

                for (var i = 0; i < displayCount; i++) {
                    var result = results[i];
                    var game = result.game;

                    var line = "[" + result.index + "] " + game.title;

                    if (game.developer) {
                        line += " (" + game.developer + ")";
                    }

                    if (result.collections) {
                        line += " - " + result.collections;
                    }

                    stdout.push(line);
                }

                stdout.push("");
                stdout.push("Total: " + results.length + " game" +
                (results.length !== 1 ? "s" : "") + " found");

                if (limit && results.length > limit) {
                    stdout.push("");
                    stdout.push("Use 'search " + args[0] + "' to see all " +
                    results.length + " results");
                }
            }

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "device", {
        help: "Show device information",
        usage: "device",
        minArgs: 0,
        maxArgs: 0,
        aliases: ["dev", "hw"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];

            stdout.push("DEVICE INFORMATION");
            stdout.push(repeatString("=", 40));

            if (!isNaN(api.device.batteryPercent)) {
                var batPercent = Math.round(api.device.batteryPercent * 100);
                var batStatus = api.device.batteryCharging ? " (charging)" : "";
                stdout.push("Battery: " + batPercent + "%" + batStatus);

                if (api.device.batterySeconds > 0) {
                    var batHours = Math.floor(api.device.batterySeconds / 3600);
                    var batMinutes = Math.floor((api.device.batterySeconds % 3600) / 60);
                    stdout.push("Remaining: " + batHours + "h " + batMinutes + "m");
                }
            } else {
                stdout.push("Battery: Not available");
            }

            var now = new Date();
            stdout.push("Current time: " + now.toLocaleTimeString());
            stdout.push("Current date: " + now.toLocaleDateString());

            return {
                stdout: stdout,
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "echo", {
        help: "Echo arguments",
        usage: "echo <text>",
        minArgs: 1,
        maxArgs: null,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            return {
                stdout: [args.join(" ")],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "date", {
        help: "Show current date and time",
        usage: "date",
        minArgs: 0,
        maxArgs: 0,
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var now = new Date();
            return {
                stdout: [
                    now.toDateString(),
                    now.toTimeString()
                ],
                stderr: [],
                exitCode: 0,
                sideEffects: {}
            };
        }
    });

    CommandRegistry.register(kernel, "theme", {
        help: "Manage terminal theme, color schemes, prompt styles, fonts and font size",
        usage: "theme [list|set <scheme>|prompt [list|set <style>|current|reset]|font [list|set <font>|current|reset] [--size=<8-32>]|current|reset]",
        minArgs: 0,
        maxArgs: 4,
        aliases: ["colors", "scheme"],
        requiredState: kernel.states.SHELL,
        requiredAuth: true,
        execute: function (args, flags) {
            var stdout = [];
            var stderr = [];

            var availableSchemes = [
                { name: "default",       displayName: "Default Terminal", description: "Classic terminal colors" },
                { name: "matrix",        displayName: "Matrix Green",     description: "Green on black Matrix style" },
                { name: "cyberpunk",     displayName: "Cyberpunk Neon",   description: "Cyan and magenta neon colors" },
                { name: "dracula",       displayName: "Dracula Dark",     description: "Popular Dracula theme palette" },
                { name: "monokai",       displayName: "Monokai Pro",      description: "Classic Monokai editor theme" },
                { name: "amber",         displayName: "Amber Retro",      description: "Vintage amber monochrome terminal" },
                { name: "gruvbox",       displayName: "Gruvbox Dark",     description: "Retro groove color scheme" },
                { name: "nord",          displayName: "Nord Polar",       description: "Arctic inspired palette" },
                { name: "material-dark", displayName: "Material Dark",    description: "Google Material Design dark theme" },
                { name: "solarized-dark",displayName: "Solarized Dark",   description: "Classic developer color scheme" },
                { name: "one-dark",      displayName: "One Dark",         description: "Popular Atom/VS Code theme" },
                { name: "tokyo-night",   displayName: "Tokyo Night",      description: "Modern Japanese neon aesthetic" },
                { name: "synthwave-84",  displayName: "Synthwave '84",    description: "Retrowave/Outrun 80s style" },
                { name: "rose-pine",     displayName: "Rose Pine",        description: "Elegant minimalist theme" }
            ];

            var availablePromptStyles = [
                { name: "default",   displayName: "Default",   description: "Standard user@host:path$ format" },
                { name: "minimal",   displayName: "Minimal",   description: "Clean > prompt" },
                { name: "powerline", displayName: "Powerline", description: "Styled with powerline separators" },
                { name: "arrow",     displayName: "Arrow",     description: "Simple arrow prompt →" },
                { name: "retro",     displayName: "Retro",     description: "C:\\> style DOS prompt" },
                { name: "fish",      displayName: "Fish",      description: "Fish shell style prompt" },
                { name: "zsh",       displayName: "Zsh",       description: "Oh-my-zsh style with git info" },
                { name: "hacker",    displayName: "Hacker",    description: "Matrix-style hacker prompt" },
                { name: "root",      displayName: "Root",      description: "Superuser/admin style prompt" },
                { name: "unix",      displayName: "Unix",      description: "Classic Unix/BSD style prompt" },
                { name: "session",   displayName: "Session",   description: "Interactive console with session info" },
                { name: "clock",     displayName: "Clock",     description: "Shows current time in prompt" },
                { name: "date",      displayName: "Date",      description: "Shows current date in prompt" },
                { name: "geometric", displayName: "Geometric", description: "Styled with ◢◤◥◣ geometric symbols" }
            ];

            var availableFonts = [
                { name: "default",      displayName: "Default Mono",   description: "System default monospace font" },
                { name: "dotgothic16",  displayName: "Dot Gothic 16",  description: "Pixel-style gothic font" },
                { name: "firacode",     displayName: "Fira Code",      description: "Developer font with ligatures" },
                { name: "pressstart2p", displayName: "Press Start 2P", description: "Classic 8-bit arcade font" },
                { name: "spacemono",    displayName: "Space Mono",     description: "Fixed-width typewriter style" },
                { name: "specialelite", displayName: "Special Elite",  description: "Vintage typewriter aesthetic" },
                { name: "synemono",     displayName: "Syne Mono",      description: "Modern geometric monospace" },
                { name: "vt323",        displayName: "VT323",          description: "Classic CRT terminal font" },
                { name: "terminus",     displayName: "Terminus",       description: "Clean bitmap font for terminals" },
                { name: "ubuntumono",   displayName: "Ubuntu Mono",    description: "Ubuntu's monospace companion font" },
                { name: "cascadiacode", displayName: "Cascadia Code",  description: "Microsoft's coding font with ligatures" },
                { name: "ibmplexmono",  displayName: "IBM Plex Mono",  description: "IBM's modern monospace typeface" }
            ];

            if (args.length === 0) {
                stdout.push("THEME MANAGER");
                stdout.push(repeatString("=", 70));
                stdout.push("");
                stdout.push("DESCRIPTION");
                stdout.push("  Manage terminal appearance: color schemes, prompt styles, fonts and font size.");
                stdout.push("  All changes are applied immediately and saved automatically.");
                stdout.push("");
                stdout.push("USAGE");
                stdout.push("  theme [command] [options]");
                stdout.push("");
                stdout.push("COLOR SCHEMES");
                stdout.push("  theme list                    - List available color schemes");
                stdout.push("  theme set <scheme>            - Set active color scheme");
                stdout.push("  theme current                 - Show current settings");
                stdout.push("  theme reset                   - Reset color scheme to default");
                stdout.push("");
                stdout.push("PROMPT STYLES");
                stdout.push("  theme prompt list             - List available prompt styles");
                stdout.push("  theme prompt set <style>      - Set prompt style");
                stdout.push("  theme prompt current          - Show current prompt style");
                stdout.push("  theme prompt reset            - Reset prompt to default style");
                stdout.push("");
                stdout.push("FONTS & SIZE");
                stdout.push("  theme font list               - List available fonts");
                stdout.push("  theme font set <font>         - Set terminal font");
                stdout.push("  theme font current            - Show current font and size");
                stdout.push("  theme font reset              - Reset font to default");
                stdout.push("  theme font --size=<8-32>      - Change font size only");
                stdout.push("");
                stdout.push("EXAMPLES");
                stdout.push("  theme set cyberpunk            - Cyberpunk color scheme");
                stdout.push("  theme prompt set arrow         - Arrow prompt style");
                stdout.push("  theme font set vt323           - VT323 retro font");
                stdout.push("  theme font --size=20           - Change to 20 vpx (keeps current font)");
                stdout.push("  theme font set firacode --size=18 - Change font AND size together");
                stdout.push("  theme font current             - Show current font configuration");
                stdout.push("");
                stdout.push("SIZE REFERENCE");
                stdout.push("  8-12  : Small (compact mode)");
                stdout.push("  14-18 : Normal (default: 16)");
                stdout.push("  20-26 : Large (better readability)");
                stdout.push("  28-32 : Extra large (accessibility)");
                stdout.push("");
                stdout.push("ALIASES");
                stdout.push("  colors, scheme");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            var subcommand = args[0].toLowerCase();

            if (flags.size !== undefined && subcommand !== "font") {
                stderr.push("Error: --size flag can only be used with 'theme font'");
                stderr.push("Usage: theme font --size=<8-32>");
                return {
                    stdout: [],
                    stderr: stderr,
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (subcommand === "prompt") {
                if (args.length < 2) {
                    stderr.push("Error: prompt subcommand required");
                    stderr.push("Usage: theme prompt [list|set <style>|current|reset]");
                    return {
                        stdout: [],
                        stderr: stderr,
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                var promptCmd = args[1].toLowerCase();

                if (promptCmd === "list" || promptCmd === "ls") {
                    stdout.push("AVAILABLE PROMPT STYLES");
                    stdout.push(repeatString("=", 70));
                    stdout.push("");

                    var currentPrompt = api.memory.get("terminal_prompt_style") || "default";

                    for (var i = 0; i < availablePromptStyles.length; i++) {
                        var style = availablePromptStyles[i];
                        var marker = style.name === currentPrompt ? " [*]" : "    ";
                        stdout.push(marker + padRight(style.name, 12) + " - " + style.displayName);
                        stdout.push("       " + style.description);
                    }

                    stdout.push("");
                    stdout.push("Current prompt style: " + currentPrompt);
                    stdout.push("Use 'theme prompt set <style>' to change");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {}
                    };
                }

                if (promptCmd === "current" || promptCmd === "show") {
                    var currentPrompt = api.memory.get("terminal_prompt_style") || "default";

                    var promptInfo = null;
                    for (var i = 0; i < availablePromptStyles.length; i++) {
                        if (availablePromptStyles[i].name === currentPrompt) {
                            promptInfo = availablePromptStyles[i];
                            break;
                        }
                    }

                    stdout.push("CURRENT PROMPT STYLE");
                    stdout.push(repeatString("=", 70));
                    stdout.push("");

                    if (promptInfo) {
                        stdout.push("Name: " + promptInfo.displayName);
                        stdout.push("ID:   " + promptInfo.name);
                        stdout.push("Desc: " + promptInfo.description);

                        var examplePath = "~/Documents";
                        var examplePrompt = "";

                        switch (currentPrompt) {
                            case "default":    examplePrompt = kernel.currentUser + "@pegasus:" + examplePath + "$ "; break;
                            case "minimal":    examplePrompt = "[Documents] > "; break;
                            case "arrow":      examplePrompt = "→ "; break;
                            case "retro":      examplePrompt = "C:\\Users\\" + kernel.currentUser + "\\Documents>"; break;
                            case "hacker":     examplePrompt = "root@" + kernel.currentUser + ":/11010101# "; break;
                            default:           examplePrompt = kernel.currentUser + "@pegasus:" + examplePath + "$ ";
                        }

                        stdout.push("Example: " + examplePrompt);
                    } else {
                        stdout.push("Style: " + currentPrompt);
                    }

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {}
                    };
                }

                if (promptCmd === "reset") {
                    api.memory.set("terminal_prompt_style", "default");
                    stdout.push("Prompt style reset to default");
                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {
                            reloadPrompt: true
                        }
                    };
                }

                if (promptCmd === "set") {
                    if (args.length < 3) {
                        stderr.push("Error: prompt style name required");
                        stderr.push("Usage: theme prompt set <style>");
                        stderr.push("Use 'theme prompt list' to see available styles");

                        return {
                            stdout: [],
                            stderr: stderr,
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    var newPromptStyle = args[2].toLowerCase();
                    var styleExists = false;
                    var styleDisplayName = "";

                    for (var i = 0; i < availablePromptStyles.length; i++) {
                        if (availablePromptStyles[i].name === newPromptStyle) {
                            styleExists = true;
                            styleDisplayName = availablePromptStyles[i].displayName;
                            break;
                        }
                    }

                    if (!styleExists) {
                        stderr.push("Error: prompt style '" + newPromptStyle + "' not found");
                        stderr.push("Use 'theme prompt list' to see available styles");

                        return {
                            stdout: [],
                            stderr: stderr,
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    api.memory.set("terminal_prompt_style", newPromptStyle);
                    stdout.push("Prompt style changed to: " + styleDisplayName);
                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {
                            reloadPrompt: true
                        }
                    };
                }

                stderr.push("Error: unknown prompt subcommand '" + promptCmd + "'");
                stderr.push("Use 'theme prompt' for help");

                return {
                    stdout: [],
                    stderr: stderr,
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (subcommand === "font") {
                if (flags.size !== undefined && (args.length === 1 || (args.length === 2 && args[1] === "size"))) {
                    var newSize = parseInt(flags.size);
                    if (isNaN(newSize) || newSize < 8 || newSize > 32) {
                        stderr.push("Error: --size must be between 8 and 32 vpx");
                        return {
                            stdout: [],
                            stderr: stderr,
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    var currentFont = api.memory.get("terminal_font") || "default";
                    api.memory.set("terminal_font_size", newSize);

                    var fontInfo = null;
                    for (var i = 0; i < availableFonts.length; i++) {
                        if (availableFonts[i].name === currentFont) {
                            fontInfo = availableFonts[i];
                            break;
                        }
                    }

                    stdout.push("Font size changed to: " + newSize + " vpx");
                    stdout.push("Current font: " + (fontInfo ? fontInfo.displayName : currentFont));
                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {
                            reloadFont: true
                        }
                    };
                }

                if (args.length < 2) {
                    stderr.push("Error: font subcommand required");
                    stderr.push("Usage: theme font [list|set <font>|current|reset] [--size=<8-32>]");
                    return {
                        stdout: [],
                        stderr: stderr,
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                var fontCmd = args[1].toLowerCase();

                if (fontCmd === "list" || fontCmd === "ls") {
                    stdout.push("AVAILABLE FONTS");
                    stdout.push(repeatString("=", 70));
                    stdout.push("");

                    var currentFont = api.memory.get("terminal_font") || "default";
                    var currentSize = api.memory.get("terminal_font_size") || 16;

                    for (var i = 0; i < availableFonts.length; i++) {
                        var f = availableFonts[i];
                        var marker = f.name === currentFont ? " [*]" : "    ";
                        stdout.push(marker + padRight(f.name, 14) + " - " + f.displayName);
                        stdout.push("       " + f.description);
                    }

                    stdout.push("");
                    stdout.push("FONT SIZE");
                    stdout.push(repeatString("-", 70));
                    stdout.push("Current size: " + currentSize + " vpx");
                    stdout.push("Range: 8-32 vpx (default: 16)");
                    stdout.push("");
                    stdout.push("USAGE");
                    stdout.push("  theme font set <font>              - Change font only");
                    stdout.push("  theme font --size=<N>              - Change size only");
                    stdout.push("  theme font set <font> --size=<N>   - Change both font and size");
                    stdout.push("");
                    stdout.push("EXAMPLES");
                    stdout.push("  theme font set vt323                - VT323 font");
                    stdout.push("  theme font --size=20                - 20 vpx size (keeps current font)");
                    stdout.push("  theme font set firacode --size=18   - Fira Code at 18 vpx");
                    stdout.push("  theme font current                  - Show current configuration");
                    stdout.push("  theme font reset                    - Reset to default font (size unchanged)");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {}
                    };
                }

                if (fontCmd === "current" || fontCmd === "show") {
                    var currentFont = api.memory.get("terminal_font") || "default";
                    var currentSize = api.memory.get("terminal_font_size") || 16;
                    var fontInfo = null;

                    for (var i = 0; i < availableFonts.length; i++) {
                        if (availableFonts[i].name === currentFont) {
                            fontInfo = availableFonts[i];
                            break;
                        }
                    }

                    stdout.push("CURRENT FONT CONFIGURATION");
                    stdout.push(repeatString("=", 70));
                    stdout.push("");

                    if (fontInfo) {
                        stdout.push("Font Name: " + fontInfo.displayName);
                        stdout.push("Font ID:   " + fontInfo.name);
                        stdout.push("Font Size: " + currentSize + " vpx");
                        stdout.push("Description: " + fontInfo.description);
                    } else {
                        stdout.push("Font ID:   " + currentFont);
                        stdout.push("Font Size: " + currentSize + " vpx");
                    }

                    stdout.push("");
                    stdout.push("Size reference:");
                    stdout.push("  8-12  : Small (compact)");
                    stdout.push("  14-18 : Normal (default: 16)");
                    stdout.push("  20-26 : Large");
                    stdout.push("  28-32 : Extra large");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {}
                    };
                }

                if (fontCmd === "reset") {
                    api.memory.unset("terminal_font");
                    stdout.push("Font reset to default (Default Mono)");
                    stdout.push("Font size unchanged: " + (api.memory.get("terminal_font_size") || 16) + " vpx");
                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {
                            reloadFont: true
                        }
                    };
                }

                if (fontCmd === "set") {
                    if (args.length < 3) {
                        stderr.push("Error: font name required");
                        stderr.push("Usage: theme font set <font> [--size=<8-32>]");
                        stderr.push("Use 'theme font list' to see available fonts");

                        return {
                            stdout: [],
                            stderr: stderr,
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    var newFont = args[2].toLowerCase();
                    var fontExists = false;
                    var fontDisplayName = "";

                    for (var i = 0; i < availableFonts.length; i++) {
                        if (availableFonts[i].name === newFont) {
                            fontExists = true;
                            fontDisplayName = availableFonts[i].displayName;
                            break;
                        }
                    }

                    if (!fontExists) {
                        stderr.push("Error: font '" + newFont + "' not found");
                        stderr.push("Use 'theme font list' to see available fonts");

                        return {
                            stdout: [],
                            stderr: stderr,
                            exitCode: 1,
                            sideEffects: {}
                        };
                    }

                    api.memory.set("terminal_font", newFont);
                    stdout.push("Font changed to: " + fontDisplayName);

                    if (flags.size !== undefined) {
                        var newSize = parseInt(flags.size);
                        if (isNaN(newSize) || newSize < 8 || newSize > 32) {
                            stderr.push("Warning: --size must be between 8 and 32 vpx. Size unchanged.");
                        } else {
                            api.memory.set("terminal_font_size", newSize);
                            stdout.push("Font size set to: " + newSize + " vpx");
                        }
                    }

                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: stderr.length > 0 ? stderr : [],
                        exitCode: 0,
                        sideEffects: {
                            reloadFont: true
                        }
                    };
                }

                stderr.push("Error: unknown font subcommand '" + fontCmd + "'");
                stderr.push("Use 'theme font' for help");

                return {
                    stdout: [],
                    stderr: stderr,
                    exitCode: 1,
                    sideEffects: {}
                };
            }

            if (subcommand === "list" || subcommand === "ls") {
                stdout.push("AVAILABLE COLOR SCHEMES");
                stdout.push(repeatString("=", 70));
                stdout.push("");

                var currentScheme = api.memory.get("terminal_color_scheme") || "default";

                for (var i = 0; i < availableSchemes.length; i++) {
                    var scheme = availableSchemes[i];
                    var marker = scheme.name === currentScheme ? " [*]" : "    ";
                    stdout.push(marker + padRight(scheme.name, 16) + " - " + scheme.displayName);
                    stdout.push("       " + scheme.description);
                }

                stdout.push("");
                stdout.push("Current color scheme: " + currentScheme);
                stdout.push("Use 'theme set <scheme>' to change");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (subcommand === "current" || subcommand === "show") {
                var currentScheme = api.memory.get("terminal_color_scheme") || "default";
                var currentPrompt = api.memory.get("terminal_prompt_style") || "default";
                var currentFont = api.memory.get("terminal_font") || "default";
                var currentSize = api.memory.get("terminal_font_size") || 16;

                stdout.push("CURRENT TERMINAL CONFIGURATION");
                stdout.push(repeatString("=", 70));
                stdout.push("");
                stdout.push("COLOR SCHEME");
                stdout.push(repeatString("-", 70));
                var schemeInfo = null;
                for (var i = 0; i < availableSchemes.length; i++) {
                    if (availableSchemes[i].name === currentScheme) {
                        schemeInfo = availableSchemes[i];
                        break;
                    }
                }
                if (schemeInfo) {
                    stdout.push("  Name: " + schemeInfo.displayName);
                    stdout.push("  ID:   " + schemeInfo.name);
                    stdout.push("  Desc: " + schemeInfo.description);
                } else {
                    stdout.push("  Scheme: " + currentScheme);
                }
                stdout.push("");

                stdout.push("PROMPT STYLE");
                stdout.push(repeatString("-", 70));
                var promptInfo = null;
                for (var i = 0; i < availablePromptStyles.length; i++) {
                    if (availablePromptStyles[i].name === currentPrompt) {
                        promptInfo = availablePromptStyles[i];
                        break;
                    }
                }
                if (promptInfo) {
                    stdout.push("  Name: " + promptInfo.displayName);
                    stdout.push("  ID:   " + promptInfo.name);
                } else {
                    stdout.push("  Style: " + currentPrompt);
                }
                stdout.push("");

                stdout.push("FONT");
                stdout.push(repeatString("-", 70));
                var fontInfo = null;
                for (var i = 0; i < availableFonts.length; i++) {
                    if (availableFonts[i].name === currentFont) {
                        fontInfo = availableFonts[i];
                        break;
                    }
                }
                if (fontInfo) {
                    stdout.push("  Name: " + fontInfo.displayName);
                    stdout.push("  ID:   " + fontInfo.name);
                    stdout.push("  Size: " + currentSize + " vpx");
                } else {
                    stdout.push("  Font: " + currentFont);
                    stdout.push("  Size: " + currentSize + " vpx");
                }

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {}
                };
            }

            if (subcommand === "reset") {
                if (args.length > 1 && args[1].toLowerCase() === "prompt") {
                    api.memory.set("terminal_prompt_style", "default");
                    stdout.push("Prompt style reset to default");
                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {
                            reloadPrompt: true
                        }
                    };
                }

                if (args.length > 1 && args[1].toLowerCase() === "font") {
                    api.memory.unset("terminal_font");
                    stdout.push("Font reset to default (Default Mono)");
                    stdout.push("Font size unchanged");
                    stdout.push("Changes applied immediately!");

                    return {
                        stdout: stdout,
                        stderr: [],
                        exitCode: 0,
                        sideEffects: {
                            reloadFont: true
                        }
                    };
                }

                api.memory.set("terminal_color_scheme", "default");
                stdout.push("Color scheme reset to default");
                stdout.push("Changes applied immediately!");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {
                        reloadTheme: true
                    }
                };
            }

            if (subcommand === "set") {
                if (args.length < 2) {
                    stderr.push("Error: scheme name required");
                    stderr.push("Usage: theme set <scheme>");
                    stderr.push("Use 'theme list' to see available schemes");

                    return {
                        stdout: [],
                        stderr: stderr,
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                var newScheme = args[1].toLowerCase();
                var schemeExists = false;
                var schemeDisplayName = "";

                for (var i = 0; i < availableSchemes.length; i++) {
                    if (availableSchemes[i].name === newScheme) {
                        schemeExists = true;
                        schemeDisplayName = availableSchemes[i].displayName;
                        break;
                    }
                }

                if (!schemeExists) {
                    stderr.push("Error: color scheme '" + newScheme + "' not found");
                    stderr.push("Use 'theme list' to see available schemes");

                    return {
                        stdout: [],
                        stderr: stderr,
                        exitCode: 1,
                        sideEffects: {}
                    };
                }

                api.memory.set("terminal_color_scheme", newScheme);
                stdout.push("Color scheme changed to: " + schemeDisplayName);
                stdout.push("Changes applied immediately!");

                return {
                    stdout: stdout,
                    stderr: [],
                    exitCode: 0,
                    sideEffects: {
                        reloadTheme: true
                    }
                };
            }

            stderr.push("Error: unknown subcommand '" + subcommand + "'");
            stderr.push("Use 'theme' without arguments for help");

            return {
                stdout: [],
                stderr: stderr,
                exitCode: 1,
                sideEffects: {}
            };
        }
    });
}

function loadUtilsInTheme() {
    console.log("[UTILS] Loading terminal utilities...");
}
