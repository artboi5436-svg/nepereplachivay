$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.InteropServices

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $full = (Resolve-Path "presentation.pptx").Path
    $pres = $ppt.Presentations.Open($full, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    $slide7 = $pres.Slides.Item(7)
    $outPng = (Join-Path (Get-Location) "slide7_actual.png")
    $slide7.Export($outPng, "PNG", 1920, 1080)
    Write-Host "Slide 7 exported to slide7_actual.png"
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
