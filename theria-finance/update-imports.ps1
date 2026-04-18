$projectRoot = Get-Location
$stats = @{
    totalFiles = 0
    modifiedFiles = 0
    totalReplacements = 0
}

# Helper function to count occurrences
function CountOccurrences {
    param([string]$text, [string]$pattern)
    return ([regex]::Matches($text, [regex]::Escape($pattern))).Count
}

Write-Host "Starting import path updates..." -ForegroundColor Cyan

# Category 1: src/features/*/screens/ and src/features/*/components/
Write-Host "`n=== Category 1: Features (screens & components) ===" -ForegroundColor Yellow

$featuresFiles = Get-ChildItem -Path "src/features" -Recurse -Include "*.ts", "*.tsx" | Where-Object {
    ($_.FullName -match "\\screens\\|/screens/") -or ($_.FullName -match "\\components\\|/components/")
}

$featuresReplacements = @(
    @{pattern = "from '../contexts/"; replacement = "from '../../../core/state/"}
    @{pattern = "from '../../contexts/"; replacement = "from '../../../core/state/"}
    @{pattern = "from '../components/"; replacement = "from '../../shared/components/"}
    @{pattern = "from '../../components/"; replacement = "from '../../../shared/components/"}
    @{pattern = "from '../../../components/"; replacement = "from '../../../../shared/components/"}
)

foreach ($file in $featuresFiles) {
    $stats.totalFiles++
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content
    $replacementCount = 0
    
    foreach ($rep in $featuresReplacements) {
        $oldCount = CountOccurrences -text $content -pattern $rep.pattern
        $content = $content -replace [regex]::Escape($rep.pattern), $rep.replacement
        $replacementCount += $oldCount
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $stats.modifiedFiles++
        $stats.totalReplacements += $replacementCount
        $relativePath = $file.FullName.Replace($projectRoot.Path + '\', '')
        Write-Host "✓ $relativePath ($replacementCount replacements)" -ForegroundColor Green
    }
}

# Category 2: src/shared/
Write-Host "`n=== Category 2: Shared ===" -ForegroundColor Yellow

$sharedFiles = Get-ChildItem -Path "src/shared" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue

$sharedReplacements = @(
    @{pattern = "from '../contexts/"; replacement = "from '../../core/state/"}
    @{pattern = "from '../../contexts/"; replacement = "from '../../core/state/"}
)

foreach ($file in $sharedFiles) {
    $stats.totalFiles++
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content
    $replacementCount = 0
    
    foreach ($rep in $sharedReplacements) {
        $oldCount = CountOccurrences -text $content -pattern $rep.pattern
        $content = $content -replace [regex]::Escape($rep.pattern), $rep.replacement
        $replacementCount += $oldCount
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $stats.modifiedFiles++
        $stats.totalReplacements += $replacementCount
        $relativePath = $file.FullName.Replace($projectRoot.Path + '\', '')
        Write-Host "✓ $relativePath ($replacementCount replacements)" -ForegroundColor Green
    }
}

# Category 3: src/core/
Write-Host "`n=== Category 3: Core ===" -ForegroundColor Yellow

$coreFiles = Get-ChildItem -Path "src/core" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue

$coreReplacements = @(
    @{pattern = "from '../contexts/"; replacement = "from './"}
    @{pattern = "from '../../contexts/"; replacement = "from '../'"}
)

foreach ($file in $coreFiles) {
    $stats.totalFiles++
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content
    $replacementCount = 0
    
    foreach ($rep in $coreReplacements) {
        $oldCount = CountOccurrences -text $content -pattern $rep.pattern
        $content = $content -replace [regex]::Escape($rep.pattern), $rep.replacement
        $replacementCount += $oldCount
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $stats.modifiedFiles++
        $stats.totalReplacements += $replacementCount
        $relativePath = $file.FullName.Replace($projectRoot.Path + '\', '')
        Write-Host "✓ $relativePath ($replacementCount replacements)" -ForegroundColor Green
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total files scanned: $($stats.totalFiles)" -ForegroundColor White
Write-Host "Files modified: $($stats.modifiedFiles)" -ForegroundColor White
Write-Host "Total replacements made: $($stats.totalReplacements)" -ForegroundColor White
