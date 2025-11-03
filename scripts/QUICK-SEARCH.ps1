# Quick Legacy Pattern Search Commands
# Use these for targeted searches

Write-Host "Quick Legacy Pattern Searches" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
Set-Location $projectRoot

function Search-Pattern {
    param(
        [string]$Pattern,
        [string]$Description,
        [string[]]$Paths = @("src"),
        [string[]]$Extensions = @("*.js", "*.vue")
    )
    
    Write-Host "🔍 $Description" -ForegroundColor Yellow
    
    $found = $false
    foreach ($path in $Paths) {
        foreach ($ext in $Extensions) {
            $files = Get-ChildItem -Path $path -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
            
            foreach ($file in $files) {
                $matches = Select-String -Path $file.FullName -Pattern $Pattern -AllMatches
                
                if ($matches) {
                    $found = $true
                    foreach ($match in $matches) {
                        $relativePath = $file.FullName.Replace($projectRoot + "\", "")
                        Write-Host "  $relativePath:$($match.LineNumber)" -ForegroundColor Gray
                        Write-Host "    $($match.Line.Trim())" -ForegroundColor White
                    }
                }
            }
        }
    }
    
    if (-not $found) {
        Write-Host "  ✅ No matches found" -ForegroundColor Green
    }
    Write-Host ""
}

# Menu
Write-Host "Select search type:" -ForegroundColor Cyan
Write-Host "1. Hardcoded component maps" -ForegroundColor White
Write-Host "2. Polling patterns (setTimeout/setInterval)" -ForegroundColor White
Write-Host "3. Global object sniffing" -ForegroundColor White
Write-Host "4. jQuery usage" -ForegroundColor White
Write-Host "5. EventBus usage" -ForegroundColor White
Write-Host "6. Direct Pods field access" -ForegroundColor White
Write-Host "7. Hardcoded field names" -ForegroundColor White
Write-Host "8. ALL patterns (comprehensive)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-8)"

switch ($choice) {
    "1" {
        Search-Pattern -Pattern "const\s+componentMap\s*=" -Description "Hardcoded component maps"
        Search-Pattern -Pattern "defineAsyncComponent.*import\('@components/" -Description "Hardcoded async component imports"
    }
    "2" {
        Search-Pattern -Pattern "setTimeout.*\(.*=>" -Description "setTimeout arrow functions"
        Search-Pattern -Pattern "setInterval" -Description "setInterval calls"
        Search-Pattern -Pattern "while.*!window\." -Description "While loops checking window objects"
    }
    "3" {
        Search-Pattern -Pattern "if\s*\(.*window\.\w+" -Description "If statements checking window objects"
        Search-Pattern -Pattern "typeof window\.\w+.*!==.*undefined" -Description "Typeof window object checks"
    }
    "4" {
        Search-Pattern -Pattern "\$\.ajax|\$\.get|\$\.post" -Description "jQuery AJAX calls"
        Search-Pattern -Pattern "jQuery\(" -Description "jQuery usage"
    }
    "5" {
        Search-Pattern -Pattern "EventBus\.\$emit|EventBus\.\$on|EventBus\.\$off" -Description "EventBus usage"
    }
    "6" {
        Search-Pattern -Pattern "gmkbData\.pods\.|podsData\.\w+_\w+" -Description "Direct Pods field access"
    }
    "7" {
        Search-Pattern -Pattern "fieldMapping|fieldMap|field_map" -Description "Hardcoded field mappings"
        Search-Pattern -Pattern "'guestify_\w+'" -Description "Hardcoded Pods field names"
    }
    "8" {
        Write-Host "Running comprehensive scan..." -ForegroundColor Cyan
        Write-Host ""
        
        Search-Pattern -Pattern "const\s+componentMap\s*=" -Description "1. Hardcoded component maps"
        Search-Pattern -Pattern "setTimeout.*retry|setTimeout.*wait" -Description "2. Polling with setTimeout"
        Search-Pattern -Pattern "setInterval" -Description "3. setInterval usage"
        Search-Pattern -Pattern "if\s*\(.*window\.gmkb\w+" -Description "4. Global object sniffing"
        Search-Pattern -Pattern "\$\.ajax|\$\.get|\$\.post" -Description "5. jQuery AJAX"
        Search-Pattern -Pattern "EventBus\.\$" -Description "6. EventBus usage"
        Search-Pattern -Pattern "fieldMapping\s*=" -Description "7. Hardcoded field mappings"
        Search-Pattern -Pattern "this\.\$root|this\.\$parent" -Description "8. Vue 2 parent access patterns"
        
        Write-Host "Comprehensive scan complete!" -ForegroundColor Green
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Read-Host "Press Enter to close"
