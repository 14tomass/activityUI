Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\tomas\.gemini\antigravity\brain\e866e8af-7a1c-46bc-978b-b8eae384cb26\.user_uploaded\media_1790285058203.jpg")
$bmp = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.DrawImage($img, 0, 0, 512, 512)
$bmp.Save("\\wsl.localhost\Ubuntu\home\tomas\USAL LINUX\activityUI\public\app-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Host "Image converted to PNG!"
