# 🔄 INTEGRAÇÃO COM CI/CD

Guia para integrar o robô de testes em pipelines de CI/CD.

---

## 📋 Opções de Integração

### 1. GitHub Actions
### 2. GitLab CI
### 3. Jenkins
### 4. Azure Pipelines
### 5. Task Scheduler (Windows)

---

## 🔵 GitHub Actions

### Arquivo: `.github/workflows/teste-robo.yml`

```yaml
name: 🤖 Teste Robô - Plataforma Comercial

on:
  schedule:
    # Rodar todos os dias às 8:00 AM UTC
    - cron: '0 8 * * *'
  workflow_dispatch:  # Permite executar manualmente

jobs:
  test-robo:
    runs-on: windows-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright
        run: npx playwright install

      - name: Run Test Robo
        env:
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
          TEST_BASE_URL: ${{ secrets.TEST_BASE_URL || 'https://gestaocomercial.arkosintelligence.com/hub' }}
          TEST_EMAIL: ${{ secrets.TEST_EMAIL || 'renato.consultoria@cidadeviva.org' }}
          TEST_HEADLESS: 'true'
        run: node test-robo-completo.js

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: robo-screenshots
          path: test-screenshots/

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Teste Robô Falhou",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Teste Automático Falhou*\nVerifique os logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Configurar Secrets no GitHub:
1. Vá em: **Settings → Secrets and variables → Actions**
2. Adicione:
   - `TEST_PASSWORD` = `admin123`
   - `TEST_BASE_URL` = `https://gestaocomercial.arkosintelligence.com/hub`
   - `SLACK_WEBHOOK` = seu webhook do Slack (opcional)

---

## 🟠 GitLab CI

### Arquivo: `.gitlab-ci.yml`

```yaml
stages:
  - test

test-robo:
  stage: test
  image: node:18-windows
  script:
    - npm install
    - npx playwright install
    - $env:TEST_PASSWORD = "$TEST_PASSWORD"
    - $env:TEST_BASE_URL = "$TEST_BASE_URL"
    - $env:TEST_HEADLESS = "true"
    - node test-robo-completo.js
  artifacts:
    paths:
      - test-screenshots/
    when: on_failure
  only:
    - schedules  # Rodar apenas com schedule
    - web        # Permitir execução manual
  variables:
    TEST_BASE_URL: "https://gestaocomercial.arkosintelligence.com/hub"
    TEST_EMAIL: "renato.consultoria@cidadeviva.org"
  schedule:
    # Executar todos os dias às 8:00 AM
    cron: "0 8 * * *"
```

### Configurar Variables no GitLab:
1. Vá em: **CI/CD → Variables**
2. Adicione:
   - `TEST_PASSWORD` = `admin123` (Protected)
   - `TEST_BASE_URL` = `https://gestaocomercial.arkosintelligence.com/hub`

---

## 🔴 Jenkins

### Arquivo: `Jenkinsfile`

```groovy
pipeline {
  agent any

  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  triggers {
    // Executar todos os dias às 8:00 AM
    cron('0 8 * * *')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm install'
        sh 'npx playwright install'
      }
    }

    stage('Test') {
      environment {
        TEST_PASSWORD = credentials('test-password')
        TEST_BASE_URL = 'https://gestaocomercial.arkosintelligence.com/hub'
        TEST_HEADLESS = 'true'
      }
      steps {
        sh 'node test-robo-completo.js'
      }
    }
  }

  post {
    always {
      junit 'test-results.xml' || true
      archiveArtifacts artifacts: 'test-screenshots/**', allowEmptyArchive: true
    }
    failure {
      emailext(
        subject: '❌ Teste Robô Falhou',
        body: 'Verifique os logs: ${BUILD_URL}',
        to: '${DEFAULT_RECIPIENTS}'
      )
    }
  }
}
```

---

## 🟦 Azure Pipelines

### Arquivo: `azure-pipelines.yml`

```yaml
trigger:
  - main
  - develop

schedules:
  - cron: "0 8 * * *"
    displayName: Daily test
    branches:
      include:
        - main

pool:
  vmImage: 'windows-latest'

variables:
  NODE_VERSION: '18'
  TEST_BASE_URL: 'https://gestaocomercial.arkosintelligence.com/hub'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: $(NODE_VERSION)

  - script: |
      npm install
      npx playwright install
    displayName: 'Install dependencies'

  - script: |
      set TEST_PASSWORD=$(TEST_PASSWORD)
      set TEST_BASE_URL=$(TEST_BASE_URL)
      set TEST_HEADLESS=true
      node test-robo-completo.js
    displayName: 'Run Test Robo'
    env:
      TEST_PASSWORD: $(TEST_PASSWORD)

  - task: PublishBuildArtifacts@1
    condition: failed()
    inputs:
      pathToPublish: 'test-screenshots'
      artifactName: 'robo-screenshots'

  - task: SendEmail@1
    condition: failed()
    inputs:
      sendMailCustom: true
      smtpServer: 'smtp.gmail.com'
      to: 'admin@example.com'
      subject: '❌ Teste Robô Falhou'
      body: 'Verifique os artifacts: $(System.TeamFoundationCollectionUri)'
```

---

## 🪟 Task Scheduler (Windows Local)

### Script: `schedule-robo.ps1`

```powershell
# Este script cria uma tarefa agendada no Windows

$TaskName = "TestRobo-Diario"
$TaskPath = "\Commercial\"
$ScriptPath = "D:\repositorio_geral\app_comercial_education_django\comercial_nextjs\TESTE_COMPLETO.ps1"

# Verificar se tarefa já existe
$task = Get-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -ErrorAction SilentlyContinue

if ($task) {
  Write-Host "Tarefa já existe. Removendo..." -ForegroundColor Yellow
  Unregister-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -Confirm:$false
}

# Criar trigger (todos os dias às 8:00 AM)
$trigger = New-ScheduledTaskTrigger -Daily -At 8:00am

# Criar action
$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-ExecutionPolicy Bypass -File '$ScriptPath'"

# Criar settings
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -RunWithoutNetwork

# Registrar tarefa
Register-ScheduledTask `
  -TaskName $TaskName `
  -TaskPath $TaskPath `
  -Trigger $trigger `
  -Action $action `
  -Settings $settings `
  -RunLevel Highest `
  -Description "Executa teste robô da plataforma comercial diariamente"

Write-Host "✅ Tarefa criada com sucesso!" -ForegroundColor Green
Write-Host "Nome: $TaskName" -ForegroundColor Green
Write-Host "Horário: 08:00 AM" -ForegroundColor Green
Write-Host "Caminho: TaskScheduler\$TaskPath" -ForegroundColor Green
```

**Para executar:**
```powershell
.\schedule-robo.ps1
```

---

## 📊 Monitoramento e Alertas

### Slack Notification

**Arquivo: `notify-slack.ps1`**

```powershell
param(
  [string]$Status = "success",
  [string]$Message = "Teste concluído"
)

$webhookUrl = $env:SLACK_WEBHOOK_URL

$payload = @{
  "text" = if ($Status -eq "success") { "✅ Teste Passou" } else { "❌ Teste Falhou" }
  "blocks" = @(
    @{
      "type" = "section"
      "text" = @{
        "type" = "mrkdwn"
        "text" = "*Teste Robô - Plataforma Comercial*`n$Message`n$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
      }
    }
  )
}

Invoke-RestMethod -Uri $webhookUrl -Method Post -Body ($payload | ConvertTo-Json)
```

### Integrar no PowerShell:
```powershell
$result = .\TESTE_COMPLETO.ps1
if ($LASTEXITCODE -eq 0) {
  .\notify-slack.ps1 -Status "success" -Message "Todos os testes passaram!"
} else {
  .\notify-slack.ps1 -Status "failure" -Message "Alguns testes falharam"
}
```

---

## 📧 Email Notification

```powershell
$EmailParams = @{
  From = "robo-testes@empresa.com"
  To = "admin@empresa.com"
  Subject = "❌ Teste Robô Falhou - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
  Body = "Verifique os logs nos screenshots salvos"
  SmtpServer = "smtp.gmail.com"
  Port = 587
  UseSsl = $true
  Credential = (New-Object System.Management.Automation.PSCredential("user", (ConvertTo-SecureString "senha" -AsPlainText -Force)))
}

if ($LASTEXITCODE -ne 0) {
  Send-MailMessage @EmailParams
}
```

---

## 🔍 Logs e Artefatos

### Gerar Log Detalhado

```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
.\TESTE_COMPLETO.ps1 | Tee-Object "logs\teste_$timestamp.log"

# Listar todos os logs
Get-ChildItem logs/ | Sort-Object LastWriteTime -Descending
```

### Arquivar Screenshots

```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
if (Test-Path "test-screenshots") {
  Rename-Item "test-screenshots" "screenshots_$timestamp"
  New-Item -ItemType Directory "test-screenshots" -Force
}
```

---

## 📈 Dashboard de Status

Criar arquivo `status.json` com resultado:

```powershell
$result = @{
  timestamp = Get-Date -Format "o"
  status = if ($LASTEXITCODE -eq 0) { "passed" } else { "failed" }
  teste = "TESTE_COMPLETO"
  url = "https://gestaocomercial.arkosintelligence.com/hub"
  testes_passados = 11
  testes_falhados = 0
}

$result | ConvertTo-Json | Out-File "status.json"
```

---

## 🚀 Resumo

| Platform | Setup | Frequência | Alertas |
|----------|-------|-----------|---------|
| GitHub Actions | 1 arquivo | Cron | Slack/Email |
| GitLab CI | 1 arquivo | Cron | Email |
| Jenkins | Jenkinsfile | Manual/Cron | Email |
| Azure | yaml | Cron | Email |
| Task Scheduler | PowerShell | Diário | Opcional |

---

## ✨ Próximas Etapas

1. ✅ Escolher sua plataforma (GitHub, GitLab, etc)
2. ✅ Configurar arquivo de pipeline
3. ✅ Adicionar secrets/variables
4. ✅ Configurar alertas
5. ✅ Testar execução manual
6. ✅ Monitorar primeira execução automática

---

**Tudo pronto para integração!** 🚀

Qualquer dúvida sobre sua plataforma específica, avise!
