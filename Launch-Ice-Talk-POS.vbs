Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Users\peace\Desktop\Works\ice-talk-system"
WshShell.Run "cmd /c npx.cmd electron electron/main.cjs", 0, False
