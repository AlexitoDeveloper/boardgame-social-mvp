# Script para cerrar los issues completados en Sprint 1 en GitHub
param (
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Repo = "AlexitoDeveloper/boardgame-social-mvp"
)

$hdrs = @{
    "Authorization"        = "Bearer $Token"
    "Accept"               = "application/vnd.github+json"
    "User-Agent"           = "Antigravity-Orchestrator"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$issues = @(
    @{
        Number = 80
        Comment = "Completado en Sprint 1:`n- Componente CenterCountdownOverlay con anillo circular SVG animado y cuenta regresiva central.`n- Integrado en FirstPlayerSelector con retroalimentación háptica y selección justa."
    },
    @{
        Number = 81
        Comment = "Completado en Sprint 1:`n- Migración SQL supabase/add_group_guests.sql para tabla group_guests.`n- Gestión de jugadores invitados habituales del grupo en GroupMembersTab (AddGroupGuestModal).`n- Flujo de asociación/reclamo a usuarios registrados (AssociateGuestModal).`n- Chips de autocompletado en registro rápido de partidas (QuickLogMatchModal)."
    },
    @{
        Number = 82
        Comment = "Completado en Sprint 1:`n- Diálogo de confirmación destructiva accesible DeleteTableConfirmDialog.`n- Integrado en Sidebar (desktop), Action Dock (móvil) y tarjetas de partidas finalizadas en la vista de grupo.`n- Soporte para eliminar mesas activas o finalizadas por el organizador, con redirección adecuada."
    },
    @{
        Number = 84
        Comment = "Completado en Sprint 1:`n- Modal AddGuestPlayerModal para agregar invitados con avatar táctil de color y nombre.`n- Integrado en lista de asistentes MeetupDetailAttendees con control de aforo máximo.`n- Persistencia en Supabase mediante useMeetupDetail."
    },
    @{
        Number = 85
        Comment = "Completado en Sprint 1:`n- Selector de pestañas segmentado (Próximas vs Jugadas) en GroupUpcomingMeetups.`n- Componente GroupPastMatchesList para listar partidas finalizadas y quick matches con estadísticas y ganadores.`n- Carga de historial en useGroupHub."
    }
)

Write-Host "Cerrando issues de Sprint 1 en GitHub..." -ForegroundColor Cyan

foreach ($item in $issues) {
    $num = $item.Number
    $urlComments = "https://api.github.com/repos/$Repo/issues/$num/comments"
    $commentObj = @{ body = $item.Comment }
    $commentJson = $commentObj | ConvertTo-Json
    $commentBytes = [System.Text.Encoding]::UTF8.GetBytes($commentJson)
    
    try {
        Invoke-RestMethod -Uri $urlComments -Method Post -Headers $hdrs -Body $commentBytes -ContentType "application/json; charset=utf-8" | Out-Null
        Write-Host "  -> Comentario agregado al Issue #$num" -ForegroundColor Gray
    } catch {
        Write-Warning "No se pudo agregar comentario al Issue #$num"
    }

    $urlIssue = "https://api.github.com/repos/$Repo/issues/$num"
    $closeObj = @{
        state = "closed"
        state_reason = "completed"
    }
    $closeJson = $closeObj | ConvertTo-Json
    $closeBytes = [System.Text.Encoding]::UTF8.GetBytes($closeJson)

    try {
        $res = Invoke-RestMethod -Uri $urlIssue -Method Patch -Headers $hdrs -Body $closeBytes -ContentType "application/json; charset=utf-8"
        Write-Host "  [OK] Issue #$num cerrado exitosamente (State: $($res.state), Reason: $($res.state_reason))" -ForegroundColor Green
    } catch {
        Write-Error "Error al cerrar Issue #$num"
    }
    
    Start-Sleep -Milliseconds 600
}

Write-Host "Completado." -ForegroundColor Green
