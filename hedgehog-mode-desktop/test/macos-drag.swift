import CoreGraphics
import Foundation

let values = CommandLine.arguments.dropFirst().compactMap(Double.init)
guard values.count == 4 else {
    exit(2)
}

let start = CGPoint(x: values[0], y: values[1])
let end = CGPoint(x: values[2], y: values[3])
let moveOnly = CommandLine.arguments.last == "--move-only"

func post(_ type: CGEventType, at point: CGPoint) {
    guard let event = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: point, mouseButton: .left) else {
        exit(3)
    }
    event.post(tap: .cghidEventTap)
}

post(.mouseMoved, at: start)
if moveOnly {
    exit(0)
}
usleep(250_000)
post(.leftMouseDown, at: start)
for step in 1...8 {
    let progress = CGFloat(step) / 8
    let point = CGPoint(
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
    )
    post(.leftMouseDragged, at: point)
    usleep(50_000)
}
post(.leftMouseUp, at: end)
