/*
 * Default Color Scheme
 * Pegasus Terminal OS
 */
import QtQuick 2.15

QtObject {
    id: defaultScheme
    
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
