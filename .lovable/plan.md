
# Plano: Ordenar e Agrupar Lista de Convidados

## Visao Geral
Modificar a exibicao da lista de convidados na pagina Admin para mostrar confirmados primeiro e agrupar convidados pelo numero de telefone (familias juntas).

## Mudancas Necessarias

### Arquivo: src/pages/Admin.tsx

**1. Criar funcao de ordenacao**
Adicionar logica para ordenar os convidados antes de renderizar:

```typescript
const sortedGuests = [...guests].sort((a, b) => {
  // Primeiro: confirmados antes de nao-confirmados
  if (a.confirmed !== b.confirmed) {
    return a.confirmed ? -1 : 1;
  }
  // Segundo: agrupar por telefone
  return a.phone.localeCompare(b.phone);
});
```

**2. Atualizar renderizacao da lista**
Substituir `guests.map()` por `sortedGuests.map()` na linha 580.

### Logica de Ordenacao

```text
Ordem de prioridade:
1. Confirmados (confirmed = true) aparecem primeiro
2. Dentro de cada grupo (confirmados/nao-confirmados), 
   agrupar por telefone para manter familias juntas
```

### Exemplo Visual

```text
ANTES:                      DEPOIS:
- Maria (tel: 111) [X]      - Joao (tel: 222) [✓]
- Joao (tel: 222) [✓]       - Ana (tel: 222) [✓]   <- mesma familia
- Pedro (tel: 333) [X]      - Maria (tel: 111) [X]
- Ana (tel: 222) [✓]        - Pedro (tel: 333) [X]
```

## Detalhes Tecnicos

- Usar `useMemo` para evitar re-ordenacao desnecessaria a cada render
- Ordenacao acontece apenas no frontend (nao altera dados no banco)
- Familias (mesmo telefone) ficam visualmente agrupadas
