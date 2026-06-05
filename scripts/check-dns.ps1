# ============================================
# SCRIPT DE MONITORAMENTO DE DNS
# ============================================
# Verifica propagação DNS do domínio energialivre.com.br
# Roda em loop até o domínio estar propagado ou timeout.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\check-dns.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\check-dns.ps1 -Domain "energialivre.com.br" -TimeoutMinutes 130
# ============================================

param(
    [string]$Domain = "energialivre.com.br",
    [int]$TimeoutMinutes = 130,
    [int]$IntervalSeconds = 60
)

$startTime = Get-Date
$endTime = $startTime.AddMinutes($TimeoutMinutes)
$logFile = Join-Path $PSScriptRoot "..\dns-check.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] [$Level] $Message"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

function Test-DnsPropagated {
    param([string]$Domain)

    $result = [PSCustomObject]@{
        HasNs     = $false
        HasA      = $false
        HasCname  = $false
        NsRecords = @()
        ARecords  = @()
        CnameTarget = $null
    }

    # NS records
    try {
        $ns = Resolve-DnsName -Name $Domain -Type NS -ErrorAction SilentlyContinue
        if ($ns -and $ns.Type -eq "NS") {
            $result.HasNs = $true
            $result.NsRecords = $ns | ForEach-Object { $_.NameHost.TrimEnd('.') }
        }
    } catch {}

    # A records
    try {
        $a = Resolve-DnsName -Name $Domain -Type A -ErrorAction SilentlyContinue
        if ($a -and $a.Type -eq "A") {
            $result.HasA = $true
            $result.ARecords = $a | ForEach-Object { $_.IPAddress }
        }
    } catch {}

    # CNAME (www)
    try {
        $cname = Resolve-DnsName -Name "www.$Domain" -Type CNAME -ErrorAction SilentlyContinue
        if ($cname -and $cname.Type -eq "CNAME") {
            $result.HasCname = $true
            $result.CnameTarget = $cname.NameHost.TrimEnd('.')
        }
    } catch {}

    return $result
}

Write-Log "Iniciando monitoramento DNS para: $Domain"
Write-Log "Timeout: $TimeoutMinutes min | Intervalo: $IntervalSeconds seg"

$attempt = 0
while ((Get-Date) -lt $endTime) {
    $attempt++
    Write-Log "--- Tentativa $attempt ---" "INFO"
    $status = Test-DnsPropagated -Domain $Domain

    Write-Log ("NS:    {0}" -f ($status.NsRecords -join ", "))
    Write-Log ("A:     {0}" -f ($status.ARecords -join ", "))
    Write-Log ("CNAME: {0}" -f $status.CnameTarget)

    $isPropagated = $status.HasNs -and $status.HasA
    if ($isPropagated) {
        Write-Log "DNS PROPAGADO COM SUCESSO!" "SUCCESS"
        Write-Log "Domínio acessível: https://$Domain" "SUCCESS"
        exit 0
    }

    $elapsed = (Get-Date) - $startTime
    $remaining = $endTime - (Get-Date)
    Write-Log ("Decorrido: {0:N0}m | Restante: {1:N0}m" -f $elapsed.TotalMinutes, $remaining.TotalMinutes)
    Write-Log ("Aguardando {0}s..." -f $IntervalSeconds)
    Start-Sleep -Seconds $IntervalSeconds
}

Write-Log "TIMEOUT: DNS não propagou em $TimeoutMinutes minutos." "ERROR"
Write-Log "Verifique manualmente com:" "ERROR"
Write-Log "  nslookup $Domain 8.8.8.8" "ERROR"
Write-Log "  https://dnschecker.org/#NS/$Domain" "ERROR"
exit 1
