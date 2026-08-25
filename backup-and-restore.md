# Backup e restauração do banco

## Situação atual

O projeto usa PostgreSQL no Neon e não tinha uma rotina agendada de backup versionada. O Git protege o código, mas não substitui backup do banco, e os arquivos estáticos do site podem ser reconstruídos pelo build.

O Neon deve permanecer como a camada principal de snapshots e recuperação point-in-time, conforme o plano e as configurações do ambiente de produção. Os dumps deste projeto são uma segunda camada de recuperação e devem ser armazenados fora do repositório.

## Criar um backup

`DATABASE_URL` deve ser fornecida pelo ambiente de execução ou pelo gerenciador de segredos. Nunca salve a URL em um script ou no Git.

```bash
DATABASE_URL="$DATABASE_URL" bash scripts/backup-db.sh /caminho/seguro/backups
```

O script:

- gera um dump PostgreSQL em formato custom;
- exclui ownership e privilégios do dump;
- cria o diretório com `umask 077`;
- não imprime a URL do banco;
- cria um nome com timestamp UTC.

## Restaurar um backup

Teste primeiro em um banco separado. A opção `--confirm` é obrigatória porque a restauração usa `--clean` e pode remover objetos existentes.

```bash
DATABASE_URL="$DATABASE_URL" bash scripts/restore-db.sh --confirm /caminho/seguro/backups/vg-marketing-YYYYMMDDTHHMMSSZ.dump
```

Antes de restaurar produção:

1. Pause as escritas da aplicação;
2. Faça um backup atual do banco;
3. Valide o arquivo em um banco de teste;
4. Confirme que o schema esperado está disponível;
5. Execute a restauração;
6. Rode o healthcheck e valide o CRM;
7. Libere as escritas novamente.

## Procedimento recomendado

- Ativar snapshots e recuperação point-in-time no Neon quando disponíveis;
- Manter cópias periódicas criptografadas em armazenamento separado do banco;
- Usar retenção definida pelo negócio, por exemplo: diários por 14 dias e semanais por 12 semanas;
- Fazer um teste de restauração pelo menos trimestralmente;
- Monitorar idade do backup mais recente;
- Nunca commitar dumps, `.env`, URLs de conexão ou credenciais;
- Restringir o acesso aos backups às pessoas responsáveis pela operação.

Os scripts não criam um agendamento sozinhos. O agendamento deve ser configurado em um ambiente operacional seguro, como cron protegido ou um job de CI com `DATABASE_URL` fornecida por secrets, sem gravar o segredo no repositório.