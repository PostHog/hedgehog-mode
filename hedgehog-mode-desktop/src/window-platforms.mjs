import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execute = promisify(execFile);

const MACOS_SYSTEM_SURFACE_OWNERS = new Set([
  "com.apple.controlcenter",
  "com.apple.dock",
  "com.apple.notificationcenterui",
  "com.apple.systemuiserver",
  "com.apple.WindowManager",
]);

const WINDOWS_SCRIPT = String.raw`
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class HedgehogWindows {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out Rect rect);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@
[HedgehogWindows]::EnumWindows({
  param($handle, $state)
  [uint32]$windowProcessId = 0
  [void][HedgehogWindows]::GetWindowThreadProcessId($handle, [ref]$windowProcessId)
  if ([HedgehogWindows]::IsWindowVisible($handle) -and -not [HedgehogWindows]::IsIconic($handle) -and [HedgehogWindows]::GetWindowTextLength($handle) -gt 0 -and $windowProcessId -ne $env:HEDGEHOG_PID) {
    $rect = New-Object HedgehogWindows+Rect
    if ([HedgehogWindows]::GetWindowRect($handle, [ref]$rect)) {
      Write-Output ("{0} {1} {2} {3}" -f $rect.Left, $rect.Top, ($rect.Right - $rect.Left), ($rect.Bottom - $rect.Top))
    }
  }
  return $true
}, [IntPtr]::Zero)
`;

export function parseWindowRects(output, desktopBounds) {
  return output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).map(Number))
    .filter(
      ([x, y, width, height]) =>
        [x, y, width, height].every(Number.isFinite) &&
        width >= 10 &&
        height > 0
    )
    .map(([x, y, width]) => {
      const left = Math.max(x, desktopBounds.x);
      const right = Math.min(x + width, desktopBounds.x + desktopBounds.width);
      return {
        x: left - desktopBounds.x,
        y:
          Math.max(
            desktopBounds.y,
            Math.min(y, desktopBounds.y + desktopBounds.height)
          ) - desktopBounds.y,
        width: right - left,
      };
    })
    .filter((rect) => rect.width >= 10);
}

export function normalizeNativeWindows(windows, desktopBounds) {
  return windows
    .filter(
      (window) =>
        window.owner?.processId !== process.pid &&
        !MACOS_SYSTEM_SURFACE_OWNERS.has(window.owner?.bundleId) &&
        window.bounds?.width >= 10 &&
        window.bounds?.height > 0
    )
    .map((window) => {
      const { x, y, width } = window.bounds;
      const left = Math.max(x, desktopBounds.x);
      const right = Math.min(x + width, desktopBounds.x + desktopBounds.width);
      return {
        x: left - desktopBounds.x,
        y:
          Math.max(
            desktopBounds.y,
            Math.min(y, desktopBounds.y + desktopBounds.height)
          ) - desktopBounds.y,
        width: right - left,
      };
    })
    .filter((rect) => rect.width >= 10);
}

export async function listDesktopWindowPlatforms(
  platform,
  desktopBounds,
  macosBinary
) {
  let result;
  if (platform === "darwin") {
    result = await execute(
      macosBinary,
      [
        "--no-accessibility-permission",
        "--no-screen-recording-permission",
        "--open-windows-list",
      ],
      { timeout: 3000 }
    );
    return normalizeNativeWindows(JSON.parse(result.stdout), desktopBounds);
  } else if (platform === "win32") {
    result = await execute(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_SCRIPT],
      {
        env: { ...process.env, HEDGEHOG_PID: String(process.pid) },
        timeout: 3000,
      }
    );
  } else {
    return [];
  }

  return parseWindowRects(result.stdout, desktopBounds);
}
