# 🪟 Setup para Windows — Importar Conselhos Tutelares

## ⚡ Modo Rápido

### 1️⃣ Configure as Credenciais do Firebase

Abra o **CMD** (Prompt de Comando) como Administrador e execute:

```cmd
REM Caminho para sua chave Firebase (obtenha na Console do Firebase)
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\seu-usuario\Desktop\chave-firebase.json

REM ID do seu projeto Firebase
set FIREBASE_PROJECT_ID=seu-project-id
```

**Exemplo real:**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Helena\Desktop\teiasp-key.json
set FIREBASE_PROJECT_ID=teiasp-prod
```

### 2️⃣ Abra a Pasta do Projeto

```cmd
cd C:\caminho\para\seu\TeiaSP
```

### 3️⃣ Execute o Script

```cmd
importar-conselhos.bat
```

Ou na mão:

```cmd
node scripts/firestore-batch-import.js scripts/conselhos-tutelares-final.json
```

---

## 📋 Pré-Requisitos

### ✅ Node.js Instalado

Verifique se tem instalado:

```cmd
node --version
npm --version
```

Se não aparecer versão:
- Baixe em: https://nodejs.org/ (recomendado: versão LTS)
- Instale e reinicie o CMD

### ✅ Credenciais do Firebase

1. Abra [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** → **Contas de Serviço**
4. Clique em **Gerar nova chave privada**
5. Salve o arquivo `.json` em um lugar seguro (ex: `C:\Users\seu-usuario\Desktop\`)

---

## 🔐 Configurar Variáveis de Ambiente (Permanente)

Para não ter que configurar toda vez, salve permanentemente:

### Windows 10/11:

1. Pressione `Win + X` e abra **Configurações**
2. Vá em **Sistema** → **Sobre** → **Configurações avançadas do sistema**
3. Clique em **Variáveis de Ambiente**
4. Em **Variáveis de usuário**, clique em **Nova**

**Nome:** `GOOGLE_APPLICATION_CREDENTIALS`
**Valor:** `C:\Users\seu-usuario\Desktop\chave-firebase.json`

5. Clique em **OK** e feche tudo
6. Reinicie o CMD para as mudanças terem efeito

Repita para `FIREBASE_PROJECT_ID`:
**Nome:** `FIREBASE_PROJECT_ID`
**Valor:** `seu-project-id`

---

## 📊 Arquivos Usados

```
TeiaSP/
├─ conselhos-tutelares-final.json      ← JSON com 47 endereços + coordenadas
├─ importar-conselhos.bat               ← Script para Windows (clique 2x)
├─ scripts/
│  ├─ firestore-batch-import.js        ← Faz a importação (rodado pelo .bat)
│  └─ IMPORTAR.md                      ← Docs técnica
└─ WINDOWS-SETUP.md                    ← Este arquivo
```

---

## 🆘 Troubleshooting

### "Node.js não encontrado"
- Instale Node.js: https://nodejs.org/
- Reinicie o CMD após instalar

### "Arquivo não encontrado"
- Verifique o caminho da chave Firebase
- Use o caminho completo (ex: `C:\Users\...`)

### "Permission denied / Erro de acesso"
- Rodeo CMD **como Administrador**
- Verifique as permissões da chave `.json`

### "Cannot read property 'database'"
- Firebase Project ID está errado
- Revise na console do Firebase

### "Sem pontos importados"
- Confirme que o arquivo `conselhos-tutelares-final.json` existe
- Verifique se tem lat/lng válidos (números)

---

## ✅ Sucesso!

Se vir mensagem **"Importação concluída!"**, tudo funcionou 🎉

Acesse o mapa no site em 1-2 minutos (cache se atualiza automaticamente).
