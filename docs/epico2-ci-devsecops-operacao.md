# Epico 2 - CI DevSecOps (Operacao e Leitura de Falhas)

Este documento consolida como os workflows do projeto funcionam, como validar os gates de seguranca e como interpretar falhas.

## 1) Mapa dos workflows analisados

### CI dos microsservicos
- `.github/workflows/auth-service-ci.yml`
- `.github/workflows/evaluation-service-ci.yml`
- `.github/workflows/flag-service-ci.yml`
- `.github/workflows/targeting-service-ci.yml`
- `.github/workflows/analytics-service-ci.yml`
- `.github/workflows/service-ci-base.yml` (workflow reutilizavel chamado pelos 5 acima)

### Infra (referencia do projeto)
- `.github/workflows/infra-terraform-ci.yml`
- `.github/workflows/infra-terraform-apply-manual.yml`
- `.github/workflows/infra-terraform-destroy-manual.yml`

## 2) Quando o CI dos servicos dispara

Cada workflow de servico dispara em:
- `workflow_dispatch` (manual)
- `pull_request` (branches `main` e `Tech-Fase3`, com filtro de paths do servico e do workflow base)
- `push` (branches `main` e `Tech-Fase3`, com o mesmo filtro de paths)

## 3) Ordem dos jobs no pipeline

No `service-ci-base.yml`, a execucao ocorre assim:

1. `build_test`
2. `lint` (depende de `build_test`)
3. `sast` (depende de `build_test`)
4. `sca_fs` (depende de `build_test`)
5. `container_build` (depende de `build_test`, `lint`, `sast`, `sca_fs`)
6. `container_scan` (depende de `container_build`)
7. `push_ecr` (depende de `container_scan` e `container_build`)

Resultado: se um gate de seguranca falhar, o fluxo nao chega no push do ECR.

## 4) Gates de seguranca e regra de bloqueio

### SAST
- Go: `gosec -severity high -confidence medium ./...`
- Python: `bandit -r . -lll`

### SCA e scan de imagem (regra CRITICAL)
- Job `sca_fs` usa Trivy com:
  - `severity: CRITICAL`
  - `exit-code: 1` (quando `trivy_fail_on_critical=true`)
- Job `container_scan` usa Trivy com:
  - `severity: CRITICAL`
  - `exit-code: 1` (quando `trivy_fail_on_critical=true`)

Interpretacao:
- Se houver vulnerabilidade critica em dependencia ou imagem, o job falha.
- Com isso, o `push_ecr` fica bloqueado por dependencia de jobs.

## 5) Tag de imagem e publicacao no ECR

- Tag da imagem: `${GITHUB_SHA::7}` (hash curto do commit)
- Artefato intermediario: `image.tar`
- Push final para:
  - `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/<service>:<sha-curto>`

## 6) Como comprovar para o Tech Challenge

Checklist minimo de evidencia:
- 5 workflows de servico executando com sucesso
- 5 imagens no ECR com tag de hash curto
- execucao mostrando gate falhando por seguranca e depois passando apos correcao

Sugestao de roteiro rapido (demo):
1. Introduzir vulnerabilidade intencional em um servico.
2. Abrir PR/Push e mostrar falha no `sca_fs` ou `container_scan`.
3. Corrigir a vulnerabilidade.
4. Reexecutar e mostrar pipeline verde com push no ECR.

## 7) Leitura rapida de falhas por job

- `build_test`: erro de compilacao, dependencias ou testes
- `lint`: erro de padrao/codigo
- `sast`: achados de seguranca estaticos (gosec/bandit)
- `sca_fs`: vulnerabilidade de dependencia (Trivy fs)
- `container_build`: falha de Dockerfile/build
- `container_scan`: vulnerabilidade critica na imagem
- `push_ecr`: credenciais AWS, login ECR ou permissao de push

## 8) Problemas comuns e correcoes

- **Secrets AWS ausentes**  
  Sintoma: `push_ecr` exibe mensagem de skip ou falha de autenticacao.  
  Correcao: configurar `AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_SESSION_TOKEN`.

- **Falha por vulnerabilidade critica (esperado no gate)**  
  Sintoma: Trivy finaliza com exit code 1.  
  Correcao: atualizar dependencia/imagem e rodar pipeline novamente.

- **Node 20 deprecated warning (GitHub Actions)**  
  Sintoma: warning sobre migracao de runtime de actions.  
  Correcao: planejar atualizacao de actions para versoes compativeis com Node 24.

## 9) Conclusao do Epico 2 (criterio de pronto)

O Epico 2 e considerado concluido quando:
- pipelines dos 5 servicos estao verdes com execucao automatica em PR e push;
- gates de seguranca estao ativos e comprovados;
- imagens sao publicadas no ECR com tag rastreavel por commit;
- esta documentacao de operacao e falhas acompanha o repositorio.
