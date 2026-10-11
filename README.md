# Calculadora de Iluminação

Ferramenta web para dimensionar a iluminação artificial de ambientes: quantas lâmpadas/luminárias são necessárias, qual o nível de iluminância resultante e quanto isso representa em potência, corrente elétrica, consumo e custo.

Foi pensada como apoio rápido de projeto: o usuário informa o ambiente, escolhe o objetivo do cálculo e acompanha o resultado atualizar em tempo real.

🔗 **Acesse online:** https://aandrxy.github.io/calculadora-iluminacao/

---

## A ideia

Dimensionar iluminação costuma exigir planilhas, tabelas de norma e várias contas encadeadas. A proposta aqui é reunir tudo em uma única tela:

1. **Entrada simples** — dimensões do cômodo e tipo de ambiente (que já traz a iluminância de referência em lux).
2. **Três níveis de profundidade** — do cálculo rápido ao projeto completo, conforme a necessidade.
3. **Resultado imediato** — tudo recalcula a cada alteração de campo.
4. **Visão de projeto** — vários ambientes podem ser salvos, somados e exportados em um relatório.

---

## Modos de cálculo

### 1. Lâmpadas necessárias
Responde: *"Quantas lâmpadas preciso para este ambiente?"*

- Lúmens necessários = `área × lux de referência`
- Quantidade = `⌈ lúmens necessários ÷ lúmens por lâmpada ⌉`
- Potência estimada = `quantidade × (lúmens por lâmpada ÷ eficácia lm/W)`

### 2. Lux resultante
Responde: *"Com as lâmpadas que já tenho, o ambiente está bem iluminado?"*

- Lux resultante = `(lúmens por lâmpada × quantidade) ÷ área`
- Compara com a referência do ambiente: **abaixo** (< 85%), **dentro** ou **acima** (> 130%) do recomendado.

### 3. Projeto completo
Aplica o **método dos lúmens** com fatores de correção:

```
N = ⌈ (E × A) ÷ (Φ × Fu × Fd) ⌉
```

| Símbolo | Significado |
|---|---|
| `E` | iluminância desejada (lux) |
| `A` | área do ambiente (m²) |
| `Φ` | fluxo luminoso da luminária (lm) |
| `Fu` | fator de utilização |
| `Fd` | fator de depreciação (padrão 0,80) |

O **Fu é calculado automaticamente** a partir do *índice do recinto* `K = (C × L) ÷ (H × (C + L))`, usando uma curva simplificada por faixas de K, ajustada pelas refletâncias de teto, parede e piso. Também pode ser editado manualmente (o cálculo automático fica travado até ser religado).

Este modo habilita ainda:

- **Qualidade da luz** — temperatura de cor (2000–6500 K) com pré-visualização da cor e IRC com alerta quando fica abaixo do recomendado para o ambiente.
- **Detalhes técnicos**
  - *DPI* (densidade de potência, W/m²): eficiente ≤ 8, moderado ≤ 14, alto consumo acima disso.
  - *Corrente estimada* = `P ÷ tensão` (127 V ou 220 V).
  - *Circuitos recomendados* considerando 80% da capacidade do disjuntor.
  - *Consumo mensal* = `P/1000 × horas/dia × dias/mês`, e custo com a tarifa informada.
- **Custos** — luminária + instalação por ponto, total e por m².

---

## Recursos de apoio

- **Distribuição sugerida** — grade (linhas × colunas) desenhada em planta, escolhida pela proporção do cômodo, com o espaçamento entre pontos. No modo completo, verifica o espaçamento máximo (critério SC = 1,5 sobre a altura útil, pé-direito − 0,75 m do plano de trabalho).
- **Projeto com vários ambientes** — botão para adicionar o ambiente atual ao projeto; o resumo soma pontos, potência, custo e consumo, e cada item pode ser removido.
- **Exportar PDF / Imprimir** — gera um relatório técnico (ambiente atual + memorial consolidado) via impressão do navegador.
- **Presets de ambiente** — quarto, sala, banheiro, cozinha, área de serviço, corredor, garagem, escritório, comercial ou valor personalizado, cada um com seu IRC recomendado.

---

## Aviso importante

Os resultados são **estimativas de referência**. O Fu automático usa uma curva simplificada, a distribuição é uma sugestão geométrica e o dimensionamento elétrico é aproximado. Para projetos luminotécnicos e elétricos finais, utilize software de cálculo fotométrico e a validação de um profissional habilitado, observando as normas aplicáveis (NBR 5413 / NBR ISO/CIE 8995-1 e NBR 5410).
