# Create Desktop and Startup shortcuts for packaged RehabApp executable
# Run this as the user who will receive the shortcuts.

$projectDir = 'C:\Users\HP\Desktop\RehabApp'
$exePath = Join-Path $projectDir 'dist\RehabApp-win32-x64\RehabApp.exe'
if (-not (Test-Path $exePath)) {
  Write-Error "Packaged exe not found: $exePath"
  exit 1
}

$ws = New-Object -ComObject WScript.Shell

# Desktop shortcut
$desktop = [Environment]::GetFolderPath('Desktop')
$deskLink = Join-Path $desktop 'RehabApp - Silvertech.lnk'
$s1 = $ws.CreateShortcut($deskLink)
$s1.TargetPath = $exePath
$s1.WorkingDirectory = Split-Path $exePath
$s1.IconLocation = $exePath
$s1.Save()
Write-Output "Desktop shortcut created: $deskLink"

# Startup shortcut (per-user)
$startup = [Environment]::GetFolderPath('Startup')
$startLink = Join-Path $startup 'RehabApp - Silvertech.lnk'
$s2 = $ws.CreateShortcut($startLink)
$s2.TargetPath = $exePath
$s2.WorkingDirectory = Split-Path $exePath
$s2.IconLocation = $exePath
$s2.Save()
Write-Output "Startup shortcut created: $startLink"
