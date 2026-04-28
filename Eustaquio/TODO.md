# D&D Sheet Engine - Roadmap (Data Center)

Este documento registra os objetivos de longo prazo para transformar a Engine de Ficha em uma plataforma robusta de criação e gerenciamento de personagens de D&D.

## Fases do Projeto

### Fase 1: Fundação do Data Center (Concluído ✓)
- [x] Transição de dados fixos (JSON) para arquivos JS (`data.js`) independentes do código central.
- [x] Criação do `compendium.js` para armazenar Spells globais.
- [x] Integração da aba de Magias para referenciar e preencher atributos buscando direto do Compêndio (ex: Connor).
- [x] Adicionar registro global de Classes no Compêndio (definindo Hit Dice, etc).

### Fase 2: Experiência do Usuário (Concluído ✓)
- [x] Refatorar layout da UI (Coração de HP em Pixel Art, Temas e Paletas customizáveis).
- [x] Melhorar visual do Seletor de Personagens com fundos imersivos e fontes temáticas.
- [x] Incluir barra de pesquisa e categorias por nível na Aba de Magias.
- [x] Implementar mecânica de Descanso Curto com rolagens individuais de Hit Dice.
- [x] Input de Dano e Cura customizáveis.

### Fase 3: Construtor de Personagens
- [ ] Adicionar botão "Criar Novo Personagem" funcional no menu inicial.
- [ ] Interface visual step-by-step para:
  - Selecionar Raça e Classe (puxando dados de `COMPENDIUM.classes`).
  - Atribuir Atributos base (Point Buy / Standard Array / Rolagem).
  - Escolher Perícias e Proficiências.
  - Equipar Inventário e Magias arrastando e soltando do Compêndio.
- [ ] Salvar os dados do personagem recém-criado em um objeto JSON/JS pronto para ser anexado ao `DATABASE`.
- [ ] Suporte a importação de avatar/portrait via upload de imagens.

### Fase 4: Painel do Mestre (DM Screen)
- [ ] Botão "Modo Mestre" na tela inicial.
- [ ] Vista dividida: mini-cards vivos de todos os personagens da mesa ao mesmo tempo.
- [ ] Exibir num relance: HP atual, CA, Percepção Passiva e Condições de todos os jogadores.
- [ ] Controle centralizado de iniciativa (ordem de turno automática).

### Fase 5: Drag-and-Drop & Compêndio Visual
- [ ] Botão "Consultar Compêndio" na ficha que abre painel flutuante.
- [ ] Arrastar e soltar magias e itens do Compêndio diretamente para a ficha.
- [ ] Itens adicionados ao inventário auto-calculam peso e geram ataques no painel de Combate.
- [ ] Expandir `COMPENDIUM` com equipamentos, armas e armaduras mundanas do SRD.

### Fase 6: Condições Dinâmicas & Efeitos Visuais
- [ ] Botão "Adicionar Condição" no menu superior (Cego, Envenenado, Paralisado, Amedrontado, etc).
- [ ] Aplicação visual: fundo da tela ganha tom sutil baseado na condição (verde-tóxico para envenenado, etc).
- [ ] Aplicação mecânica: condições alteram automaticamente rolagens (ex: Envenenado = desvantagem em ataques e saves).
- [ ] Condições com duração automática (ex: "até o final do próximo turno").

### Fase 7: Imersão Sonora & Animações
- [ ] Efeito sonoro de dados rolando ao fazer uma rolagem.
- [ ] Micro-animação SVG de dados "pulando" na tela antes de revelar o resultado.
- [ ] Efeitos visuais de impacto ao tomar dano crítico (screen shake, flash vermelho).
- [ ] Trilha ambiente sutil por cenário (floresta, monastério, etc).

### Fase 8: Integrações e Mecânicas Complexas
- [ ] Multiclasse: Lidar com junções de `hitDice` de diferentes classes no descanso curto.
- [ ] Inventário Ativo: Peso das armaduras limitando destreza dinamicamente.
- [ ] Múltiplos ataques: suporte a extra attack automático em painel unificado.
- [ ] Concentração: rastrear automaticamente magias com concentração e alertar ao tomar dano.

---

## Saúde da Codebase & Melhorias Técnicas

### Problemas Identificados
- [ ] **Limpeza de Arquivos Órfãos**: Remover `temp.js`, `temp2.js`, `log.txt`, `log2.txt`, `log3.txt`, `output.log`, `Ficha Eustáquio.html` (versão antiga).
- [ ] **`var` no rollD20**: A função `rollD20` usa `var nat` (hoisting inseguro). Migrar para `let`.
- [ ] **TopBar portrait hardcoded**: A linha 101 de `sheet-components.jsx` ainda mostra "EP" fixo. Deveria exibir `ch.meta.name.substring(0,2)` dinamicamente.
- [ ] **Estilo inline excessivo**: O `CharacterSelector` e o `ShortRestModal` usam centenas de propriedades CSS inline. Migrar para classes no `styles.css`.
- [ ] **`useStateT` vs `useState`**: A codebase mistura `useStateT` (de tweaks-panel) com `useState` (de React). Padronizar para evitar confusão.
- [ ] **CSS legado no `:root`**: As variáveis `--c-green`, `--c-red`, `--c-gold` no `:root` do `styles.css` ainda estão hardcoded nos valores verdes originais, podendo conflitar com os temas injetados.

### Melhorias Arquiteturais
- [ ] **Persistência (localStorage)**: Salvar o estado da ficha (HP, slots, inventário, tweaks) no `localStorage` para não perder dados ao recarregar.
- [ ] **Separação de Concerns**: O `sheet-components.jsx` tem 810 linhas. Considerar separar `HPHeart`, `ShortRestModal` e `TopBar` em arquivos próprios.
- [ ] **Tipagem com JSDoc**: Documentar as interfaces dos objetos principais (`CHARACTER`, `SPELL`, `COMPENDIUM`) com JSDoc para que editores exibam autocomplete.
- [ ] **Migração para Vite**: O Babel standalone é ótimo para prototipação rápida, mas lento. Quando a engine crescer, migrar para Vite + React para hot-reload e builds otimizados.
