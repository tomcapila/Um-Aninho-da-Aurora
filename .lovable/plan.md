

# Plano: Melhorar Efeito de Aurora Boreal no Background

## Visao Geral
Criar um efeito de aurora boreal mais imersivo e dinamico, com camadas animadas que simulam as faixas de luz ondulantes tipicas do fenomeno natural.

## Situacao Atual
- Imagem estatica de fundo com filtro de saturacao
- Overlay de gradiente simples
- Sparkles (estrelas) coloridas
- Animacao `auroraWave` que apenas ajusta brilho/saturacao

## Melhorias Propostas

### 1. Novo Componente: AuroraBackground
Criar um componente dedicado para o efeito de aurora com multiplas camadas animadas.

**Arquivo:** `src/components/AuroraBackground.tsx`

Caracteristicas:
- 3-4 camadas de gradientes semi-transparentes
- Cada camada com animacao de movimento independente
- Cores da aurora (verde, azul, rosa/roxo)
- Efeito de blur para suavizar as transicoes
- Adaptacao para modo dia (tons mais suaves)

### 2. Novas Animacoes CSS

**Arquivo:** `src/index.css`

Adicionar keyframes para:
- `aurora-drift-1`: Movimento horizontal lento (20s)
- `aurora-drift-2`: Movimento diagonal (25s)  
- `aurora-drift-3`: Ondulacao vertical (15s)
- `aurora-shimmer`: Variacao de opacidade sutil

### 3. Estrutura das Camadas

```text
Camada 1 (base):     Gradiente verde -> azul, movimento horizontal
Camada 2 (meio):     Gradiente azul -> roxo, movimento diagonal
Camada 3 (destaque): Gradiente rosa -> verde, ondulacao vertical
Camada 4 (brilho):   Pontos de luz com blur intenso
```

### 4. Atualizacao da Pagina Index

**Arquivo:** `src/pages/Index.tsx`

- Substituir overlay simples pelo novo componente `AuroraBackground`
- Manter compatibilidade com modo dia/noite
- Ajustar opacidade baseado no modo

## Detalhes Tecnicos

### Estrutura do Componente AuroraBackground

```typescript
interface AuroraBackgroundProps {
  isNightMode: boolean;
}

// Camadas com gradientes conicos/lineares
// Animacoes CSS com transform e opacity
// mix-blend-mode para mesclagem de cores
```

### Novas Animacoes (CSS)

```css
@keyframes aurora-drift-1 {
  0%, 100% { transform: translateX(-10%) rotate(0deg); }
  50% { transform: translateX(10%) rotate(3deg); }
}

@keyframes aurora-drift-2 {
  0%, 100% { transform: translateY(-5%) scale(1); }
  50% { transform: translateY(5%) scale(1.1); }
}

@keyframes aurora-shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
```

### Paleta de Cores (Modo Noturno)

| Cor | HSL | Uso |
|-----|-----|-----|
| Verde Aurora | 160, 100%, 50% | Camada principal |
| Azul Celeste | 195, 100%, 50% | Transicao |
| Rosa/Magenta | 320, 100%, 55% | Acentos |
| Roxo Profundo | 280, 80%, 40% | Base |

### Paleta de Cores (Modo Dia)

| Cor | HSL | Uso |
|-----|-----|-----|
| Rosa Suave | 340, 60%, 85% | Camada principal |
| Coral | 15, 70%, 80% | Transicao |
| Dourado | 40, 80%, 75% | Acentos |

## Arquivos a Modificar

1. **src/components/AuroraBackground.tsx** (novo)
   - Componente com camadas de gradientes animados

2. **src/index.css**
   - Novas keyframes de animacao
   - Classes utilitarias para aurora

3. **src/pages/Index.tsx**
   - Integrar novo componente
   - Remover overlay antigo

## Resultado Esperado

- Efeito visual que simula faixas de luz da aurora boreal
- Movimento fluido e organico das cores
- Transicao suave entre modo dia e noite
- Performance otimizada com CSS animations (GPU-accelerated)

