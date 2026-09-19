param([string]$Page = '/')
$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$url = 'http://127.0.0.1:18765'
function Test-Ready {
    try { return (Invoke-WebRequest "$url/health" -UseBasicParsing -TimeoutSec 2).Content -eq 'perfectPixel-local' } catch { return $false }
}
try {
    if (-not (Test-Ready)) {
        Start-Process -FilePath "$appRoot\runtime\node.exe" -ArgumentList ('"' + "$appRoot\server.cjs" + '"') -WorkingDirectory $appRoot -WindowStyle Hidden -RedirectStandardOutput "$appRoot\work\server.log" -RedirectStandardError "$appRoot\work\server-error.log"
        for ($i = 0; $i -lt 30; $i++) { if (Test-Ready) { break }; Start-Sleep -Milliseconds 300 }
    }
    if (-not (Test-Ready)) { throw 'PerfectPixel 启动失败，请查看 work/server-error.log。' }
    Start-Process ($url + $Page)
} catch {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'PerfectPixel') | Out-Null
}
