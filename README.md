# 🚀 FirstStep - Plataforma de Onboarding para a VIVO

**URL do Projeto:** [firststep-challenge.vercel.app](https://firststep-challenge.vercel.app)  
**Repositório:** [github.com/gabrielvilela12/FirstStep](https://github.com/gabrielvilela12/FirstStep)

---

## 📘 Sobre o Projeto

O **FirstStep** é uma plataforma desenvolvida para a **VIVO**, com o objetivo de otimizar e tornar mais eficiente o processo de **onboarding de novos colaboradores** (Onboardees) e o acompanhamento pelos seus **Buddies** (mentores designados).

A proposta é oferecer uma **experiência interativa, organizada e centralizada**, permitindo acompanhar o progresso da jornada de 90 dias do colaborador, seus cursos, documentos e acessos — tudo em um só lugar.

---

## 👥 Perfis de Usuário

### 🧭 Onboardee (Novo Colaborador)

O colaborador recém-chegado tem acesso a uma jornada visual de 90 dias, organizada por etapas.  
Ele pode visualizar **tarefas, cursos, acessos, documentos e progresso** da sua integração.

#### Funcionalidades:
- **Dashboard – Jornada de Onboarding:**  
  - Exibe etapa atual, datas e barra de progresso.  
  - Mapa com 10 etapas coloridas:  
    - 🟩 Concluída  
    - 🟪 Etapa atual  
    - ⚪ Ainda não iniciada  
  - Cada etapa tem um checklist de tarefas.

- **Cursos:**  
  - Mostra apenas os cursos da etapa atual.  
  - Histórico de cursos concluídos.  
  - Botão **“Assistir”** redireciona para vídeos externos.  
  - Concluir o curso atualiza o progresso automaticamente.

- **Meus Acessos:**  
  - Lista acessos pendentes e aprovados.  
  - Status colorido: 🟩 Aprovado | 🟦 Pendente  
  - Botão “Abrir chamado para TI”.

- **Central de Documentos:**  
  - Visualizar, baixar e favoritar documentos obrigatórios.

---

### 🧑‍🏫 Buddy (Acompanhante do Onboardee)

O **Buddy** é responsável por acompanhar um ou mais novos colaboradores, garantindo que cumpram suas etapas e tarefas dentro do prazo.

#### Funcionalidades:
- **Dashboard do Buddy:**  
  - Exibe todos os onboardees acompanhados.  
  - Mostra: nome, data de início, previsão de término, progresso, etapa atual e contatos.  
  - Filtros por status:  
    - 🟦 Em Progresso  
    - 🟥 Atrasado  
    - 🟩 Concluído  

---

## ⚙️ Funcionalidades Gerais

- 🔐 Login com perfis diferentes (Onboardee / Buddy)
- 🧭 Sidebar dinâmica com menus, foto e botão de logout
- 📱 Layout responsivo (Desktop e Mobile)
- 🧩 Mock de dados para simulação (JSON ou estrutura em memória)

---

## 🧑‍💻 Como Testar o Projeto

O projeto está hospedado no Vercel.  
Você pode acessá-lo diretamente com os seguintes logins de teste:

### 👤 **Onboardee (Novo Colaborador)**
Email: novato@gmail.com<br>
Senha: novato123

markdown
Copiar código

### 👨‍🏫 **Buddy (Acompanhante)**
Email: buddy@firststep.com<br>
Senha: 123456

yaml
Copiar código

Acesse: 👉 [https://firststep-challenge.vercel.app](https://firststep-challenge.vercel.app)

---

## 🧩 Tecnologias Utilizadas

- **React.js** – Frontend principal  
- **TypeScript** – Tipagem estática e melhor manutenção  
- **Vite** – Build rápido e moderno  
- **TailwindCSS / ShadCN UI** – Estilização moderna e responsiva  
- **Mock Data / JSON** – Simulação de dados de progresso e cursos  

---

## 📈 Estrutura do Projeto

📦 FirstStep
├── src/
│ ├── components/ # Componentes reutilizáveis
│ ├── pages/ # Páginas do sistema
│ ├── hooks/ # Hooks personalizados
│ ├── data/ # Mock de dados (JSON)
│ ├── utils/ # Funções auxiliares
│ ├── styles/ # Estilos globais
│ └── App.tsx # Componente principal
├── public/
├── package.json
└── README.md

yaml
Copiar código

---

## 🎯 Objetivo do Projeto

Facilitar a adaptação de novos colaboradores da **VIVO**, oferecendo:
- Uma jornada visual, clara e intuitiva;
- Controle total do progresso e atividades;
- Apoio direto do Buddy com acompanhamento centralizado.

---

## 🧠 Desenvolvido por

👨‍💻 **Gabriel Vilela**  
Estudante de **Engenharia de Software na FIAP**  
Desenvolvedor focado em **React (Frontend)** e **Java (Backend)**  
📍 [GitHub](https://github.com/gabrielvilela12)

---

## 🏁 Licença

Este projeto foi desenvolvido para fins acadêmicos e demonstrativos.  
Todos os direitos sobre a marca **VIVO** pertencem à **Telefônica Brasil S.A.**.

---

✨ *"First steps matter — make them great!"*
