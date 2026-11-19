Add-Type -AssemblyName System.Runtime.InteropServices
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $full = (Resolve-Path "competition_pitch.pptx").Path
    $pres = $ppt.Presentations.Open($full, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    for ($i = 1; $i -le $pres.Slides.Count; $i++) {
        $outPath = (Join-Path (Get-Location) "exports\slide$($i)_actual.png")
        $pres.Slides.Item($i).Export($outPath, "PNG", 1920, 1080)
    }
    Write-Host "All $($pres.Slides.Count) slides exported successfully to exports/"
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
