$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.InteropServices

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $full = (Resolve-Path "presentation.pptx").Path
    $pres = $ppt.Presentations.Open($full, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    $outDir = (Join-Path (Get-Location) "exports\slides_png")
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    
    for ($i = 1; $i -le $pres.Slides.Count; $i++) {
        $slide = $pres.Slides.Item($i)
        $pngPath = Join-Path $outDir ("slide_{0:D2}.png" -f $i)
        $slide.Export($pngPath, "PNG", 1920, 1080)
    }
    Write-Host "Exported all $($pres.Slides.Count) slides to $outDir"
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
