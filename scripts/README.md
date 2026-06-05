# DNS Check Log

Este arquivo contém o histórico de checagens DNS feitas durante
transições de nameservers ou delegates do domínio energialivre.com.br.

Cada entrada segue o formato:
```
[YYYY-MM-DD HH:MM:SS] [LEVEL] Mensagem
```

Níveis:
- INFO: progresso normal
- SUCCESS: DNS propagado, domínio operacional
- ERROR: timeout ou falha crítica
