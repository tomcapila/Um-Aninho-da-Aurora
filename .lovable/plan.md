
# Plano: Contagem Separada para Criancas

## Visao Geral
Adicionar uma contagem separada para criancas na area administrativa, identificando-as pelo caractere "*" no nome.

## Mudancas Necessarias

### Arquivo: src/pages/Admin.tsx

**1. Adicionar calculos de contagem**
Junto com as contagens existentes (linha 303-304), adicionar:
```typescript
const childrenCount = guests.filter((g) => g.name.includes('*')).length;
const confirmedChildrenCount = guests.filter((g) => g.name.includes('*') && g.confirmed).length;
const adultsCount = totalCount - childrenCount;
const confirmedAdultsCount = confirmedCount - confirmedChildrenCount;
```

**2. Expandir grid de estatisticas**
Alterar o grid de 2 colunas para 4 colunas (ou 2x2 em mobile) com:
- Total de convidados
- Confirmados
- Criancas (total e confirmadas)
- Adultos (total e confirmados)

**3. Adicionar icone para criancas**
Importar icone `Baby` do lucide-react para representar criancas visualmente.

### Layout Proposto

```text
+------------------+------------------+
|    Total: 50     |  Confirmados: 30 |
+------------------+------------------+
|  Adultos: 35     |  Criancas: 15    |
| (25 confirmados) | (5 confirmados)  |
+------------------+------------------+
```

## Detalhes Tecnicos

- Logica de identificacao: `name.includes('*')` 
- Nenhuma mudanca no banco de dados necessaria
- Exibicao visual clara com icones diferenciados
- Cores consistentes com o design atual
