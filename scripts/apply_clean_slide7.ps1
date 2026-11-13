$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$tempDir = (Join-Path (Get-Location) "temp_pptx_clean")
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

$pptxPath = (Resolve-Path "presentation.pptx").Path
[System.IO.Compression.ZipFile]::ExtractToDirectory($pptxPath, $tempDir)

# Copy clean_slide7.xml into tempDir/ppt/slides/slide7.xml
Copy-Item (Resolve-Path "clean_slide7.xml").Path (Join-Path $tempDir "ppt\slides\slide7.xml") -Force

# Repack presentation.pptx
if (Test-Path $pptxPath) { Remove-Item $pptxPath -Force }

$zipFile = [System.IO.File]::Create($pptxPath)
$archive = New-Object System.IO.Compression.ZipArchive($zipFile, [System.IO.Compression.ZipArchiveMode]::Create)

$allFiles = Get-ChildItem -Path $tempDir -Recurse | Where-Object { -not $_.PSIsContainer }
foreach ($file in $allFiles) {
    $relPath = $file.FullName.Substring($tempDir.Length + 1).Replace('\', '/')
    $entry = $archive.CreateEntry($relPath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
}

$archive.Dispose()
$zipFile.Dispose()
Remove-Item $tempDir -Recurse -Force
Remove-Item "clean_slide7.xml" -Force
Write-Host "Rebuilt presentation.pptx successfully."

# Export Slide 7 to PNG via PowerPoint COM
Add-Type -AssemblyName System.Runtime.InteropServices
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $pres = $ppt.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    $slide7 = $pres.Slides.Item(7)
    $outPng = (Join-Path (Get-Location) "slide7_actual.png")
    if (Test-Path $outPng) { Remove-Item $outPng -Force }
    $slide7.Export($outPng, "PNG", 1920, 1080)
    Write-Host "New Slide 7 exported to slide7_actual.png"
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
