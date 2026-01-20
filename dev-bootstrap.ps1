# PowerShell Dev Bootstrap Script for Windows + Docker + WSL2
# Ensures Docker is running, WSL2 is tuned, containers are up, and opens your dev environment

# 1. Ensure Docker Desktop is running
function docker-ok {
  docker info *> $null
  if (-not $?) {
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "Starting Docker Desktop..."
    Start-Sleep -Seconds 10
    $try = 0
    while ($try -lt 12) {
      docker info *> $null
      if ($?) { Write-Host "Docker running ✅"; break }
      Start-Sleep -Seconds 5
      $try++
    }
    if (-not $?) { Write-Host "Docker failed to start ❌"; exit 1 }
  } else {
    Write-Host "Docker already running ✅"
  }
}

# 2. Ensure com.docker.service is running and automatic
function ensure-docker-service {
  $svc = Get-Service com.docker.service -ErrorAction SilentlyContinue
  if ($null -eq $svc) {
    Write-Host "Docker service not found!"; exit 1
  }
  if ($svc.Status -ne 'Running') { Start-Service com.docker.service }
  if ($svc.StartType -ne 'Automatic') { Set-Service com.docker.service -StartupType Automatic }
  Write-Host "Docker service running and set to Automatic ✅"
}

# 3. WSL2 resource tuning (optional, edit as needed)
$wslConfig = "$env:USERPROFILE\.wslconfig"
if (-not (Test-Path $wslConfig)) {
  @"
[wsl2]
memory=6GB
processors=4
"@ | Out-File -Encoding ASCII $wslConfig
  Write-Host ".wslconfig created for WSL2 resource tuning (6GB RAM, 4 CPUs)"
}

# 4. Start containers with restart policy
if (Test-Path "docker-compose.yml") {
  docker-compose up -d --remove-orphans
  Write-Host "docker-compose containers started with restart policy (check your compose file for 'unless-stopped')"
} elseif (Test-Path "compose.yaml") {
  docker compose up -d --remove-orphans
  Write-Host "docker compose containers started with restart policy (check your compose file for 'unless-stopped')"
} else {
  Write-Host "No docker-compose.yml or compose.yaml found. Skipping container start."
}

# 5. Open VS Code in workspace root
if (Get-Command code -ErrorAction SilentlyContinue) {
  code .
  Write-Host "VS Code opened in workspace root."
}

# 6. Open browser to local dev URL (edit as needed)
$devUrl = "http://localhost:3000"
Start-Process $devUrl
Write-Host "Browser opened to $devUrl"

Write-Host "\nDev environment bootstrap complete!\n"
