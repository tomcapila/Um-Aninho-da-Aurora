
# Plano: Modo Noturno Aurora Boreal

## Visao Geral
Criar um modo noturno imersivo que transforma a pagina em uma experiencia de observacao da aurora boreal no ceu noturno da Noruega, destacando a imagem de fundo e criando uma atmosfera magica.

## Mudancas Visuais no Modo Noturno

### 1. Imagem de Fundo Aurora
- **Modo dia**: opacidade 40% (atual)
- **Modo noite**: opacidade 85-90% para destaque total
- Adicionar filtro de saturacao para cores mais vibrantes
- Fundo escuro por tras para simular ceu noturno

### 2. Efeitos de Brilho
- Adicionar glow animado verde/azul nas bordas (cores da aurora)
- Sparkles mais brilhantes e com cores variadas (verde, azul, rosa)
- Efeito de "pulsar" suave no fundo

### 3. Cards e Conteudo
- Cards com fundo semi-transparente escuro com blur
- Texto em cores claras com boa legibilidade
- Bordas com brilho sutil

---

## Detalhes Tecnicos

### Arquivos a Modificar

**1. src/pages/Index.tsx**
- Adicionar estado para controle do modo noturno
- Botao toggle com icone lua/sol
- Classes condicionais para alternar estilos
- Salvar preferencia no localStorage

**2. src/index.css**
- Novas variaveis CSS para modo noturno aurora
- Classes utilitarias para efeitos de glow
- Animacoes de pulsar e brilho
- Gradientes especificos para ceu noturno

**3. src/components/Sparkles.tsx**
- Cores variaveis baseadas no modo (dourado vs verde/azul)
- Mais particulas no modo noturno
- Animacao mais intensa

### Estrutura do Toggle

```text
+------------------+
|  [Sol/Lua Icon]  |  <- Botao no canto superior esquerdo
+------------------+
```

### Paleta de Cores Modo Noturno
- Fundo: azul escuro profundo (#0a0a1a)
- Aurora verde: #00ff88
- Aurora azul: #00d4ff
- Aurora rosa: #ff00aa
- Texto: branco/creme claro

### Animacoes Adicionais
- `glow-pulse`: brilho pulsante nas bordas
- `aurora-wave`: movimento ondulante sutil
- Transicao suave entre modos (0.5s)

---

## Resultado Esperado
Uma experiencia visual que transporta o visitante para a Noruega, observando a aurora boreal em todo seu esplendor, com a imagem de fundo dominando a tela e efeitos de luz criando uma atmosfera magica e memoravel.
