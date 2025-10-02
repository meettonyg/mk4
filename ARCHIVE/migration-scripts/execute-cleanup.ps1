# Scripts Folder Cleanup
# Moves one-time migration scripts to ARCHIVE

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Scripts Folder Cleanup                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Define paths
$ScriptsDir = "scripts"
$ArchiveBase = "ARCHIVE\migration-scripts"
$CleanupArchive = "$ArchiveBase\cleanup"
$VerificationArchive = "$ArchiveBase\verification"

# Ensure archive directories exist
if (-not (Test-Path $ArchiveBase)) {
    New-Item -ItemType Directory -Path $ArchiveBase -Force | Out-Null
}
if (-not (Test-Path $CleanupArchive)) {
    New-Item -ItemType Directory -Path $CleanupArchive -Force | Out-Null
}
if (-not (Test-Path $VerificationArchive)) {
    New-Item -ItemType Directory -Path $VerificationArchive -Force | Out-Null
}

# Files to archive
$CleanupScripts = @(
    "cleanup-legacy-files.sh",
    "cleanup-remaining.ps1",
    "comprehensive-cleanup.ps1",
    "DELETE_ALL_DEPRECATED_FILES.bat",
    "DELETE_DEPRECATED_FILES.bat",
    "directory-cleanup.ps1"
)

$VerificationScripts = @(
    "verify-option-a.ps1",
    "verify-option-a.sh"
)

$MovedCount = 0
$SkippedCount = 0

Write-Host "📦 Archiving cleanup scripts..." -ForegroundColor Yellow
foreach ($file in $CleanupScripts) {
    $source = Join-Path $ScriptsDir $file
    $dest = Join-Path $CleanupArchive $file
    
    if (Test-Path $source) {
        try {
            Move-Item $source $dest -Force
            Write-Host "   ✅ Moved: $file" -ForegroundColor Green
            $MovedCount++
        }
        catch {
            Write-Host "   ❌ Failed: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   ⚠️  Not found: $file" -ForegroundColor Gray
        $SkippedCount++
    }
}

Write-Host ""
Write-Host "📦 Archiving verification scripts..." -ForegroundColor Yellow
foreach ($file in $VerificationScripts) {
    $source = Join-Path $ScriptsDir $file
    $dest = Join-Path $VerificationArchive $file
    
    if (Test-Path $source) {
        try {
            Move-Item $source $dest -Force
            Write-Host "   ✅ Moved: $file" -ForegroundColor Green
            $MovedCount++
        }
        catch {
            Write-Host "   ❌ Failed: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   ⚠️  Not found: $file" -ForegroundColor Gray
        $SkippedCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Files moved: $MovedCount" -ForegroundColor Green
Write-Host "   Files skipped: $SkippedCount" -ForegroundColor Gray
Write-Host ""

# Show remaining files in scripts/
Write-Host "📁 Remaining files in scripts/:" -ForegroundColor Yellow
Get-ChildItem $ScriptsDir -File | ForEach-Object {
    Write-Host "   ✅ $($_.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Archived to:" -ForegroundColor Cyan
Write-Host "   $CleanupArchive\" -ForegroundColor Gray
Write-Host "   $VerificationArchive\" -ForegroundColor Gray
Write-Host ""
