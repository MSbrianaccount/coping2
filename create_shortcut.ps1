# Create a Desktop shortcut to launch the RehabApp via `npm start`.
# Usage: Run this PowerShell script as the user who wants the shortcut.

$desktop = [Environment]::GetFolderPath('Desktop')
$linkPath = Join-Path $desktop 'RehabApp - Silvertech.lnk'

$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut($linkPath)

# Target PowerShell and run npm start in the project directory
$projectDir = 'C:\Users\HP\Desktop\RehabApp'
$s.TargetPath = "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"
$s.Arguments = "-NoExit -Command \"Set-Location -LiteralPath '$projectDir'; npm start\""
$s.WorkingDirectory = $projectDir

# Try to set the icon to the Silvertech image (may require .ico for best results)
$iconPath = Join-Path $projectDir 'assets\silvertech_logo.png'
if (Test-Path $iconPath) { $s.IconLocation = $iconPath }

$s.Save()

Write-Output "Shortcut created: $linkPath"
