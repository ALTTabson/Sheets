# D&D Sheet Engine - Arquitetura e Documentação

Este documento centraliza as decisões arquiteturais da Engine de Fichas React Vanilla.
A intenção é manter a aplicação leve, sem bundlers, sendo modular e altamente personalizável.

## Estrutura do Projeto
- `data.js`: Banco de dados principal. Contém as estatísticas brutas (`DATABASE`), perícias e traduções (`I18N_PT`). 
- `sheet-app.jsx`: Componente raiz. Gerencia estado global, temas, *Character Selector* e roteamento entre abas.
- `sheet-tabs.jsx`: Os "screens" da aplicação. Componentes massivos que arranjam os menores por aba (Visão Geral, Combate, Magias, Perícias, etc.).
- `sheet-components.jsx`: Componentes atômicos e blocos reutilizáveis (Barras de HP, Inventário, Cards de Ação, Editor de Magias).
- `styles.css`: Estilização principal, usando variáveis CSS na `root` para controle de temas.

## State Management
Todo o estado de sessão de um personagem ("vida atual", "recursos", "spell slots") é inicializado na seleção de personagem no `sheet-app.jsx`. As edições (como adicionar itens ou magias) modificam este estado, mas para persistência real entre reloads seria necessário conectar ao `localStorage` futuramente.

## Mecânicas Dinâmicas
### Iniciativa Dinâmica
O cálculo da Iniciativa não é mais um número fixo, mas derivado dos atributos configurados no personagem.
No `DATABASE`, a iniciativa é definida assim:
```json
"initiative": {
  "base": "DEX",
  "modifiers": ["INT"] // Pode ser vazio ou omitido
}
```
A função em tempo de execução somará o bônus de destreza com qualquer bônus extra provido em `modifiers`. Exemplo: Bônus tático do *Chronurgy Wizard*.

### Spellcasting Engine
Personagens conjuradores precisam do objeto `spells` em seu dado principal:
```json
"spells": {
  "castingAbility": "INT",
  "slots": {
    "1": { "max": 4, "current": 4 },
    "2": { "max": 3, "current": 3 }
  },
  "known": [
    { "name": "Mísseis Mágicos", "level": 1, "time": "1 ação", "range": "120 ft", "desc": "3 dardos causadores de 1d4+1..." }
  ]
}
```
O componente `<TabSpells />` processa esses dados, gerando bolinhas rastreáveis de spell slots e exibindo os SpellCards. A UI permite "Adicionar Magias" empurrando novos objetos para o array `known`.

## Como Adicionar Uma Nova Ficha
1. Vá em `data.js`
2. Adicione um novo objeto na array `DATABASE`.
3. Garanta os campos obrigatórios `meta`, `abilities`, `hp`, `resources`, `features`. Se for conjurador, adicione `spells`.
