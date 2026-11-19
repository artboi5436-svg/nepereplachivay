Add-Type -AssemblyName System.Runtime.InteropServices
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $full = (Resolve-Path "competition_pitch.pptx").Path
    $pres = $ppt.Presentations.Open($full, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    if (-not (Test-Path "exports")) { New-Item -ItemType Directory -Path "exports" | Out-Null }
    
    $pres.Slides.Item(1).Export((Join-Path (Get-Location) "exports\slide1_preview.png"), "PNG", 1920, 1080)
    $pres.Slides.Item(4).Export((Join-Path (Get-Location) "exports\slide4_preview.png"), "PNG", 1920, 1080)
    $pres.Slides.Item(10).Export((Join-Path (Get-Location) "exports\slide10_preview.png"), "PNG", 1920, 1080)
    
    Write-Host "Exported sample slides to exports/ directory."
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
