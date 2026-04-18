# Search for problematic import patterns
Write-Host "Scanning for problematic import patterns...`n" -ForegroundColor Cyan

$problemFiles = @()

# Pattern 1: from './components/
Write-Host "Pattern 1: from './components/' (old app structure)" -ForegroundColor Yellow
$pattern1 = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | 
    Select-String -Pattern "from\s+['\`"]\.\/components\/" | 
    Select-Object Path, LineNumber, Line
if ($pattern1) {
    $pattern1 | ForEach-Object {
        Write-Host "  File: $($_.Path)" -ForegroundColor White
        Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Gray
        $problemFiles += $_.Path
    }
} else {
    Write-Host "  No issues found" -ForegroundColor Green
}

# Pattern 2: from './contexts/
Write-Host "`nPattern 2: from './contexts/' (old app structure)" -ForegroundColor Yellow
$pattern2 = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | 
    Select-String -Pattern "from\s+['\`"]\.\/contexts\/" | 
    Select-Object Path, LineNumber, Line
if ($pattern2) {
    $pattern2 | ForEach-Object {
        Write-Host "  File: $($_.Path)" -ForegroundColor White
        Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Gray
        $problemFiles += $_.Path
    }
} else {
    Write-Host "  No issues found" -ForegroundColor Green
}

# Pattern 3: from '../contexts/
Write-Host "`nPattern 3: from '../contexts/' (should be from ../core/state/)" -ForegroundColor Yellow
$pattern3 = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | 
    Select-String -Pattern "from\s+['\`"]\.\.\/contexts\/" | 
    Select-Object Path, LineNumber, Line
if ($pattern3) {
    $pattern3 | ForEach-Object {
        Write-Host "  File: $($_.Path)" -ForegroundColor White
        Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Gray
        $problemFiles += $_.Path
    }
} else {
    Write-Host "  No issues found" -ForegroundColor Green
}

# Pattern 4: from '../components/
Write-Host "`nPattern 4: from '../components/' (checking for potential issues)" -ForegroundColor Yellow
$pattern4 = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | 
    Select-String -Pattern "from\s+['\`"]\.\.\/components\/" | 
    Select-Object Path, LineNumber, Line
if ($pattern4) {
    $pattern4 | ForEach-Object {
        Write-Host "  File: $($_.Path)" -ForegroundColor White
        Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Gray
        $problemFiles += $_.Path
    }
} else {
    Write-Host "  No issues found" -ForegroundColor Green
}

# Summary
Write-Host "`n" -ForegroundColor Cyan
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
$uniqueFiles = $problemFiles | Select-Object -Unique
$uniqueCount = $uniqueFiles | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Total files with problematic imports: $uniqueCount" -ForegroundColor Cyan
if ($uniqueCount -gt 0) {
    Write-Host "`nFiles with issues:" -ForegroundColor Yellow
    $uniqueFiles | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor White
    }
}
