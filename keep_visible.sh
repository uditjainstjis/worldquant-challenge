#!/bin/zsh
# Keeps the BRAIN Challenge tab visible so Chrome does not freeze it (Page Lifecycle freeze after ~5 min hidden).
while true; do
osascript <<'AS' >/dev/null 2>&1
tell application "Google Chrome"
  repeat with w in windows
    set i to 0
    repeat with t in tabs of w
      set i to i + 1
      if (URL of t contains "competition/challenge") and (title of t contains "WorldQuant") then
        set active tab index of w to i
        set minimized of w to false
        set index of w to 1
      end if
    end repeat
  end repeat
  activate
end tell
AS
sleep 200
done
