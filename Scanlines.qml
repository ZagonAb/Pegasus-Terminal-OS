/*
 * Pegasus Terminal OS v1.0
 * Created by: Gonzalo Abbate
 *
 */
import QtQuick 2.15
import QtGraphicalEffects 1.15

Item {
    id: scanlinesEffect
    anchors.fill: parent
    enabled: false

    ShaderEffect {
        id: scanlineShader
        anchors.fill: parent

        property real time: 0.0
        property real scanlineIntensity: 0.08
        property real scanlineCount: 350.0
        property real flickerAmount: 0.015
        property real vignetteIntensity: 0.15

        NumberAnimation on time {
            from: 0
            to: 1000
            duration: 1000000
            loops: Animation.Infinite
            running: true
        }

        fragmentShader: "
        varying highp vec2 qt_TexCoord0;
        uniform lowp float qt_Opacity;
        uniform highp float time;
        uniform lowp float scanlineIntensity;
        uniform highp float scanlineCount;
        uniform lowp float flickerAmount;
        uniform lowp float vignetteIntensity;
        highp float noise(highp float t) {
        return fract(sin(t * 12.9898) * 43758.5453);
    }

    void main() {
    highp vec2 uv = qt_TexCoord0;
    highp float scanline = sin(uv.y * scanlineCount * 3.14159) * 0.5 + 0.5;
    highp float scanlineEffect = scanline * scanlineIntensity;
    highp float flicker = (noise(time * 0.01) - 0.5) * flickerAmount;
    highp vec2 vignetteUV = uv * 2.0 - 1.0;
    highp float dist = length(vignetteUV);
    highp float vignette = smoothstep(1.0, 0.5, dist) * vignetteIntensity;
    highp float darkness = scanlineEffect + vignette + flicker;
    gl_FragColor = vec4(0.0, 0.0, 0.0, darkness * 0.6);
    }
    "
    }
}
