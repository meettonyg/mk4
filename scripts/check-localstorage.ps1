# Search for localStorage usage in the codebase
# Run this in PowerShell from the plugin root directory

Write-Host ""
Write-Host "Searching for remaining localStorage usage..." -ForegroundColor Cyan
Write-Host ""

# Search for localStorage. patterns
$results = Get-ChildItem -Path "src" -Recurse -Include "*.js","*.vue" | Select-String -Pattern "localStorage\."

# Filter out StorageService.js (it's supposed to have localStorage)
$filtered = $results | Where-Object { $_.Path -notlike "*StorageService.js" }

if ($filtered) {
    Write-Host "Found localStorage usage in the following files:" -ForegroundColor Yellow
    Write-Host ""
    
    $groupedResults = $filtered | Group-Object Path
    
    foreach ($group in $groupedResults) {
        $relativePath = $group.Name -replace [regex]::Escape($PWD.Path + "\"), ""
        Write-Host "  File: $relativePath" -ForegroundColor White
        
        foreach ($line in $group.Group) {
            $lineText = $line.Line.Trim()
            Write-Host "     Line $($line.LineNumber): $lineText" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "To fix: Replace localStorage calls with storageService" -ForegroundColor Cyan
    Write-Host "   import storageService from '@/services/StorageService';" -ForegroundColor Gray
    Write-Host "   storageService.set('key', value);" -ForegroundColor Gray
    Write-Host "   storageService.get('key', defaultValue);" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "SUCCESS: No remaining localStorage usage found!" -ForegroundColor Green
    Write-Host "All storage access is centralized through StorageService." -ForegroundColor Gray
    Write-Host ""
}
