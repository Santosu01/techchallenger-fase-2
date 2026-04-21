# Script de Instalação de Ferramentas - Tech Challenge Fase 3
# Execute como Administrador

$ErrorActionPreference = "Stop"

Write-Host "=== Instalando ferramentas para Tech Challenge Fase 3 ===" -ForegroundColor Green

# Verificar se Chocolatey está instalado
$chocoCheck = Get-Command choco -ErrorAction SilentlyContinue
if (-not $chocoCheck) {
    Write-Host "Chocolatey não encontrado. Instalando..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

Write-Host "Chocolatey encontrado." -ForegroundColor Green

# Instalar Terraform
Write-Host "`nInstalando Terraform..." -ForegroundColor Cyan
choco install terraform -y

# Instalar Helm
Write-Host "`nInstalando Helm..." -ForegroundColor Cyan
choco install kubernetes-helm -y

# Verificar instalações
Write-Host "`n=== Verificando instalações ===" -ForegroundColor Green
Write-Host "Terraform:" -ForegroundColor Cyan
terraform version

Write-Host "`nAWS CLI:" -ForegroundColor Cyan
aws --version

Write-Host "`nkubectl:" -ForegroundColor Cyan
kubectl version --client

Write-Host "`nHelm:" -ForegroundColor Cyan
helm version

Write-Host "`n✅ Instalação concluída!" -ForegroundColor Green
Write-Host "Feche o PowerShell e abra um novo terminal para que as mudanças de PATH entrem em vigor." -ForegroundColor Yellow
