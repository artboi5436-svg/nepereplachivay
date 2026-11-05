$ErrorActionPreference = "Stop"

$template = [System.IO.File]::ReadAllText("scripts/bundle-template.js", [System.Text.Encoding]::UTF8)
$mobileJson = [System.IO.File]::ReadAllText("data/mobile.json", [System.Text.Encoding]::UTF8)
$internetJson = [System.IO.File]::ReadAllText("data/internet.json", [System.Text.Encoding]::UTF8)
$subscriptionsJson = [System.IO.File]::ReadAllText("data/subscriptions.json", [System.Text.Encoding]::UTF8)
$insuranceJson = [System.IO.File]::ReadAllText("data/insurance.json", [System.Text.Encoding]::UTF8)

$result = $template.Replace("/*__MOBILE__*/", $mobileJson)
$result = $result.Replace("/*__INTERNET__*/", $internetJson)
$result = $result.Replace("/*__SUBSCRIPTIONS__*/", $subscriptionsJson)
$result = $result.Replace("/*__INSURANCE__*/", $insuranceJson)

[System.IO.File]::WriteAllText("js/app.js", $result, [System.Text.Encoding]::UTF8)
Write-Host "Файл js/app.js успешно собран с чистой кодировкой UTF-8!"
