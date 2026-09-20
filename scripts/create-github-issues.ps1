# Script para crear los 12 issues en GitHub mediante la API REST oficial de GitHub
# Uso:
#   $env:GITHUB_TOKEN = "ghp_tu_token_personal_aqui"
#   .\scripts\create-github-issues.ps1
#
# O pasando el token por parámetro:
#   .\scripts\create-github-issues.ps1 -Token "ghp_tu_token_personal_aqui"

param (
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Repo = "AlexitoDeveloper/boardgame-social-mvp"
)

if (-not $Token) {
    Write-Host "⚠️ No se especificó GITHUB_TOKEN." -ForegroundColor Yellow
    Write-Host "Por favor proporciona un token de GitHub con permisos 'repo' / 'issues':"
    Write-Host "  `$env:GITHUB_TOKEN = 'ghp_...'`n  .\scripts\create-github-issues.ps1"
    Write-Host "`nO pásalo como parámetro:"
    Write-Host "  .\scripts\create-github-issues.ps1 -Token 'ghp_...'"
    exit 1
}

$issuesDir = Join-Path $PSScriptRoot "..\.github\issues"
if (-not (Test-Path $issuesDir)) {
    Write-Error "No se encontró el directorio .github/issues"
    exit 1
}

$headers = @{
    "Authorization"        = "Bearer $Token"
    "Accept"               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent"           = "Antigravity-Orchestrator"
}

$issueFiles = Get-ChildItem -Path $issuesDir -Filter "*.md" | Sort-Object Name

Write-Host "`n🚀 Publicando $($issueFiles.Count) issues en $Repo...`n" -ForegroundColor Cyan

foreach ($file in $issueFiles) {
    [string]$content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Extraer título (primera línea con '# ')
    $firstLine = ($content -split "`r?`n" | Where-Object { $_ -match '^#\s+' } | Select-Object -First 1)
    [string]$title = ($firstLine -replace '^#\s+', '').Trim()

    # Extraer labels si existen
    $labels = @()
    if ($content -match '\*\*Labels:\*\*\s*(.*)') {
        $labelsRaw = $matches[1] -split ','
        $labels = @($labelsRaw | ForEach-Object { [string]($_.Trim().Trim('`')) } | Where-Object { $_ -ne '' })
    }

    # El cuerpo del issue es todo el contenido
    [string]$body = $content

    $payloadObj = [ordered]@{
        title  = $title
        body   = $body
        labels = $labels
    }
    $jsonPayload = $payloadObj | ConvertTo-Json -Depth 5 -Compress
    $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonPayload)

    $url = "https://api.github.com/repos/$Repo/issues"

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $payloadBytes -ContentType "application/json; charset=utf-8"
        Write-Host "  ✅ Creado Issue #$($response.number): $title" -ForegroundColor Green
        Write-Host "     URL: $($response.html_url)" -ForegroundColor DarkGray
    } catch {
        Write-Host "  ❌ Error creando '$title': $_" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 800
}

Write-Host "`n✨ Proceso de creación de issues finalizado.`n" -ForegroundColor Cyan
