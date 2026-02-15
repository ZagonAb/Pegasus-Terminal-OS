/*
 * Pegasus Terminal OS v2.1 FINAL
 * Enhanced CRT with powerful vignette for curvature masking
*/
import QtQuick 2.15
import QtGraphicalEffects 1.15

ShaderEffect {
    id: scanlinesEffect
    anchors.fill: parent

    property variant source
    property bool enabled: false
    property string currentPreset: "default"
    property real scanlineIntensity: 0.01
    property real scanlineCount: 1600.0
    property real curvatureAmount: 0.0
    property real zoomFactor: 1.0
    property real flickerAmount: 0.015
    property real brightness: 1.0
    property real colorTemperature: 1.0
    property real chromaShift: 0.0
    property real noiseAmount: 0.0
    property real glowAmount: 0.0
    property real glowSpread: 0.0
    property real edgeSoftness: 0.0
    property color fadeColor: "#000000"
    property real fadeOpacity: 0.0
    property real vhsEffect: 0.0
    property real time: 0.0

    visible: enabled

    NumberAnimation on time {
        from: 0
        to: 1000
        duration: 10000
        loops: Animation.Infinite
        running: scanlinesEffect.enabled
    }

    fragmentShader: "
    uniform sampler2D source;
    uniform lowp float qt_Opacity;
    uniform lowp float time;
    uniform lowp float scanlineIntensity;
    uniform lowp float scanlineCount;
    uniform lowp float curvatureAmount;
    uniform lowp float zoomFactor;
    uniform lowp float flickerAmount;
    uniform lowp float brightness;
    uniform lowp float colorTemperature;
    uniform lowp float chromaShift;
    uniform lowp float noiseAmount;
    uniform lowp float edgeSoftness;
    uniform lowp vec4 fadeColor;
    uniform lowp float fadeOpacity;
    uniform lowp float vhsEffect;

    varying highp vec2 qt_TexCoord0;

    highp float noise(highp vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// VHS tracking noise
highp float vhsNoise(highp vec2 uv, highp float t) {
highp float n = noise(vec2(uv.y * 0.3 + t * 0.1, t * 0.15));
return n;
}

void main() {
vec2 uv = (qt_TexCoord0 - 0.5) / zoomFactor + 0.5;
vec2 centered = uv - 0.5;
float dist = length(centered);

vec2 curvedUV = centered * (1.0 + curvatureAmount * dist * dist) + 0.5;
vec2 finalUV = curvedUV;

// VHS EFFECT: Horizontal distortion (tracking errors)
if (vhsEffect > 0.0) {
    float trackingBand = floor(finalUV.y * 15.0);
    float trackingOffset = vhsNoise(vec2(trackingBand, 0.0), time) * vhsEffect * 0.015;

    // Random horizontal shifts on certain bands
    float bandNoise = noise(vec2(trackingBand * 0.1, floor(time * 0.5)));
    if (bandNoise > 0.85) {
        trackingOffset += (bandNoise - 0.85) * vhsEffect * 0.03;
}

finalUV.x += trackingOffset;

// VHS vertical jitter
float verticalJitter = (noise(vec2(time * 0.17, 0.0)) - 0.5) * vhsEffect * 0.008;
finalUV.y += verticalJitter;
}

vec2 distToBorder = vec2(
    min(finalUV.x, 1.0 - finalUV.x),
    min(finalUV.y, 1.0 - finalUV.y)
    );

    float borderFade = min(
        smoothstep(0.0, edgeSoftness, distToBorder.x),
        smoothstep(0.0, edgeSoftness, distToBorder.y)
        );

        if (finalUV.x < -0.1 || finalUV.x > 1.1 || finalUV.y < -0.1 || finalUV.y > 1.1) {
            gl_FragColor = vec4(fadeColor.rgb, qt_Opacity);
            return;
}

vec2 clampedUV = clamp(finalUV, 0.0, 1.0);

vec4 color;

// Chromatic aberration + VHS color separation
float totalChromaShift = chromaShift;
if (vhsEffect > 0.0) {
    totalChromaShift += vhsEffect * 1.5;
}

if (totalChromaShift > 0.0) {
    float shift = totalChromaShift * 0.003;
    float r = texture2D(source, clampedUV + vec2(shift, 0.0)).r;
    float g = texture2D(source, clampedUV).g;
    float b = texture2D(source, clampedUV - vec2(shift, 0.0)).b;
    color = vec4(r, g, b, texture2D(source, clampedUV).a);
} else {
    color = texture2D(source, clampedUV);
}

// VHS EFFECT: Color bleeding/banding
if (vhsEffect > 0.0) {
    float bandY = floor(clampedUV.y * 50.0);
    float bandNoise = noise(vec2(bandY * 0.2, time * 0.05));

    if (bandNoise > 0.7) {
        float bleedAmount = (bandNoise - 0.7) * vhsEffect * 0.2;
        color.r += bleedAmount;
        color.b -= bleedAmount * 0.5;
}
}

// Scanlines
float scanlineEffect = sin(clampedUV.y * scanlineCount) * scanlineIntensity;
color.rgb -= scanlineEffect;

// Brightness
color.rgb *= brightness;

// Color temperature
if (colorTemperature != 1.0) {
    color.r *= (1.02 * colorTemperature);
    color.g *= (0.995 / colorTemperature);
    color.b *= (1.01 * (1.0 / colorTemperature));
}

// VHS EFFECT: Color temperature shift
if (vhsEffect > 0.0) {
    color.r *= (1.0 + vhsEffect * 0.1);
    color.b *= (1.0 - vhsEffect * 0.08);
}

// Flicker
if (flickerAmount > 0.0) {
    float n1 = noise(vec2(time * 0.97, 0.3));
    float n2 = noise(vec2(time * 1.73, 0.7));
    float flicker = 1.0 - flickerAmount * 0.5 * (n1 + n2);
    color.rgb *= flicker;
}

// VHS EFFECT: Additional flicker
if (vhsEffect > 0.0) {
    float vhsFlicker = noise(vec2(time * 2.3, 0.5)) * vhsEffect * 0.15;
    color.rgb *= (1.0 - vhsFlicker);
}

// Noise
float totalNoise = noiseAmount;
if (vhsEffect > 0.0) {
    totalNoise += vhsEffect * 0.3;
}

if (totalNoise > 0.0) {
    float grainNoise = noise(clampedUV + vec2(time * 0.137, time * 0.093)) * totalNoise;
    color.rgb += grainNoise * 0.1;
}

// VHS EFFECT: Tracking noise lines
if (vhsEffect > 0.0) {
    float trackingLine = step(0.98, noise(vec2(clampedUV.y * 100.0, time * 0.3)));
    color.rgb += trackingLine * vhsEffect * 0.3;
}

// Gamma
color.rgb = pow(color.rgb, vec3(1.03));

// Edge fade
vec3 targetFadeColor = mix(vec3(0.0), fadeColor.rgb, fadeOpacity);
color.rgb = mix(targetFadeColor, color.rgb, borderFade);

gl_FragColor = color * qt_Opacity;
}
"

function applyPreset(presetName) {
    currentPreset = presetName;

    switch(presetName) {
        case "vhs":
            scanlineIntensity = 0.02;
            scanlineCount = 1000.0;
            flickerAmount = 0.15;
            curvatureAmount = 0.2;
            brightness = 1.3;
            colorTemperature = 0.90;
            chromaShift = 0.4;
            noiseAmount = 0.7;
            zoomFactor = 1.045;
            edgeSoftness = 0.01;
            vhsEffect = 0.05;
            break;

        case "retro":
            scanlineIntensity = 0.01;
            scanlineCount = 750.0;
            flickerAmount = 0.0;
            curvatureAmount = 0.0;
            brightness = 0.8;
            colorTemperature = 0.5;
            chromaShift = 0.2;
            noiseAmount = 0.0;
            zoomFactor = 0.95;
            edgeSoftness = 0.01;
            vhsEffect = 0.0;
            break;

        case "default":
        default:
            scanlineIntensity = 0.01;
            scanlineCount = 1600.0;
            flickerAmount = 0.0;
            curvatureAmount = 0.0;
            brightness = 1.0;
            colorTemperature = 1.0;
            chromaShift = 0.0;
            noiseAmount = 0.0;
            glowAmount = 0.0;
            glowSpread = 0.0;
            zoomFactor = 1.0;
            edgeSoftness = 0.0;
            fadeOpacity = 0.0;
            vhsEffect = 0.0;
            currentPreset = "default";
            break;
    }
}

function loadSettings() {
    var savedEnabled = api.memory.get("scanline_enabled");
    enabled = (savedEnabled === "true");

    var savedPreset = api.memory.get("scanline_preset") || "default";
    applyPreset(savedPreset);

    var savedIntensity = parseFloat(api.memory.get("scanline_intensity") || "-1");
    var savedCount = parseFloat(api.memory.get("scanline_count") || "-1");
    var savedFlicker = parseFloat(api.memory.get("scanline_flicker") || "-1");
    var savedCurvature = parseFloat(api.memory.get("scanline_curvature") || "-1");
    var savedBrightness = parseFloat(api.memory.get("scanline_brightness") || "-1");
    var savedColorTemp = parseFloat(api.memory.get("scanline_colortemp") || "-1");
    var savedChroma = parseFloat(api.memory.get("scanline_chroma") || "-1");
    var savedNoise = parseFloat(api.memory.get("scanline_noise") || "-1");
    var savedGlow = parseFloat(api.memory.get("scanline_glow") || "-1");
    var savedGlowSpread = parseFloat(api.memory.get("scanline_glowspread") || "-1");
    var savedZoom = parseFloat(api.memory.get("scanline_zoom") || "-1");
    var savedEdgeFade = parseFloat(api.memory.get("scanline_edgefade") || "-1");
    var savedFadeOpacity = parseFloat(api.memory.get("scanline_fadeopacity") || "-1");
    var savedVhsEffect = parseFloat(api.memory.get("scanline_vhs") || "-1");

    if (savedIntensity >= 0) scanlineIntensity = savedIntensity;
    if (savedCount >= 0) scanlineCount = savedCount;
    if (savedFlicker >= 0) flickerAmount = savedFlicker;
    if (savedCurvature >= 0) curvatureAmount = savedCurvature;
    if (savedBrightness >= 0) brightness = savedBrightness;
    if (savedColorTemp >= 0) colorTemperature = savedColorTemp;
    if (savedChroma >= 0) chromaShift = savedChroma;
    if (savedNoise >= 0) noiseAmount = savedNoise;
    if (savedGlow >= 0) glowAmount = savedGlow;
    if (savedGlowSpread >= 0) glowSpread = savedGlowSpread;
    if (savedZoom >= 0) zoomFactor = savedZoom;
    if (savedEdgeFade >= 0) edgeSoftness = savedEdgeFade;
    if (savedFadeOpacity >= 0) fadeOpacity = savedFadeOpacity;
    if (savedVhsEffect >= 0) vhsEffect = savedVhsEffect;
}

function saveSettings() {
    api.memory.set("scanline_enabled", enabled.toString());
    api.memory.set("scanline_preset", currentPreset);
    api.memory.set("scanline_intensity", scanlineIntensity.toString());
    api.memory.set("scanline_count", scanlineCount.toString());
    api.memory.set("scanline_flicker", flickerAmount.toString());
    api.memory.set("scanline_curvature", curvatureAmount.toString());
    api.memory.set("scanline_brightness", brightness.toString());
    api.memory.set("scanline_colortemp", colorTemperature.toString());
    api.memory.set("scanline_chroma", chromaShift.toString());
    api.memory.set("scanline_noise", noiseAmount.toString());
    api.memory.set("scanline_glow", glowAmount.toString());
    api.memory.set("scanline_glowspread", glowSpread.toString());
    api.memory.set("scanline_zoom", zoomFactor.toString());
    api.memory.set("scanline_edgefade", edgeSoftness.toString());
    api.memory.set("scanline_fadeopacity", fadeOpacity.toString());
    api.memory.set("scanline_vhs", vhsEffect.toString());
}

Component.onCompleted: {
    loadSettings();
}
}
