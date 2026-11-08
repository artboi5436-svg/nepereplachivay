$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = (Join-Path (Get-Location) "nepereplachivay.zip")
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$items = @(
    "index.html",
    "presentation.html",
    "presentation.pptx",
    "asset-manifest.json",
    "README.md",
    "package.json",
    "css",
    "js",
    "assets"
)

$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
$baseDir = (Get-Location).Path

foreach ($item in $items) {
    $full = Join-Path $baseDir $item
    if (Test-Path $full) {
        if ((Get-Item $full).PSIsContainer) {
            $files = Get-ChildItem -Path $full -Recurse | Where-Object { -not $_.PSIsContainer }
            foreach ($f in $files) {
                $rel = $f.FullName.Substring($baseDir.Length + 1).Replace('\', '/')
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $f.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        } else {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $full, $item, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
}
$archive.Dispose()
Write-Host "Rebuilt nepereplachivay.zip ($((Get-Item $zipPath).Length) bytes)"
