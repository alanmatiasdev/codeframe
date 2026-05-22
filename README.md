# CodeFrame

Editor visual para criar, personalizar e exportar imagens de snippets de código.

O projeto é uma aplicação Next.js com interface em português, realce de sintaxe via PrismJS, persistência local do workspace e exportação do frame como PNG, SVG ou imagem copiada para a área de transferência.

## Recursos

- Editor de código com preview em tempo real.
- Exemplos e realce de sintaxe para PHP, JavaScript, TypeScript, Python, CSS, HTML/XML, JSON, Bash, Rust, Go e SQL.
- Temas claro e escuro no estilo AM Frame.
- Controles de janela, nome do arquivo, fonte, tamanho, altura de linha, padding, largura e cor de fundo.
- Numeração de linhas com linha inicial configurável.
- Destaque de linhas por clique ou por intervalo, como `3, 5-7`.
- Persistência automática no `localStorage`.
- Exportação para PNG, SVG e cópia da imagem para o clipboard.

## Requisitos

- Node.js 20 ou superior.
- npm.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Depois, acesse `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento do Next.js.
- `npm run build`: gera o build de produção.
- `npm run start`: executa a aplicação em modo produção depois do build.

## Estrutura

```text
app/
  components/code-frame/  Componentes da interface principal
  constants/              Opções, exemplos e estado padrão
  lib/                    Utilitários de persistência, parsing e exportação SVG
  types/                  Tipos TypeScript do workspace
```

## Tecnologias

- Next.js
- React
- TypeScript
- PrismJS
- html2canvas
