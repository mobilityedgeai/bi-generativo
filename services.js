// Serviço para gerenciar chamadas à API de IA via proxy serverless
class AIService {
  constructor() {
    // URL do proxy serverless que protege a chave da API
    this.proxyUrl = "https://bi-generativo.vercel.app/api/openai-proxy"; // Será substituído pelo endpoint real
  }

  // Processar consulta em linguagem natural
  async processQuery(query, conversationContext = [] ) {
    try {
      // Em ambiente de produção, esta chamada seria feita para um proxy serverless
      // que protege a chave da API OpenAI
      console.log("Processando consulta:", query);
      
      // Fazer requisição para o proxy serverless
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em análise de dados de inspeções veiculares. Sua função é interpretar consultas em linguagem natural e convertê-las em parâmetros para visualizações de dados. Responda apenas com o JSON contendo os parâmetros, sem explicações adicionais."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Resposta da API:", data);
      
      // Processar a resposta da API
      try {
        // Tentar extrair JSON da resposta
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const parsedResponse = JSON.parse(jsonStr);
          return parsedResponse;
        }
        
        // Se não conseguir extrair JSON, usar resposta simulada
        return this.simulateResponse(query);
      } catch (parseError) {
        console.error("Erro ao processar resposta da API:", parseError);
        // Fallback para simulação
        return this.simulateResponse(query);
      }
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      // Fallback para simulação em caso de erro
      return this.simulateResponse(query);
    }
  }

  // Método temporário para simular respostas durante desenvolvimento
  simulateResponse(query) {
    console.log("Simulando resposta para:", query);
    
    // Consultas comuns e suas respostas simuladas
    if (query.toLowerCase().includes("total de inspeções por tipo")) {
      return {
        intention: "VISUALIZE",
        metric: "total_inspections",
        groupBy: "vehicle_type",
        visualization: "BAR_CHART",
        message: "Visualizando total de inspeções por tipo de veículo"
      };
    } else if (query.toLowerCase().includes("motoristas") && query.toLowerCase().includes("não conformidades")) {
      return {
        intention: "LIST",
        metric: "non_compliance",
        groupBy: "driver",
        limit: 5,
        message: "Listando motoristas com mais não conformidades"
      };
    } else if (query.toLowerCase().includes("taxa de conformidade") && query.toLowerCase().includes("garagens")) {
      return {
        intention: "COMPARE",
        metric: "compliance_rate",
        groupBy: "garage",
        message: "Comparando taxa de conformidade entre garagens"
      };
    } else if (query.toLowerCase().includes("tendência")) {
      return {
        intention: "VISUALIZE_TREND",
        metric: "compliance_rate",
        period: "monthly",
        message: "Visualizando tendência de conformidade ao longo do tempo"
      };
    }
    
    // Resposta padrão para consultas não reconhecidas
    return {
      intention: "UNKNOWN",
      message: "Não foi possível entender sua consulta. Por favor, tente novamente com uma pergunta mais específica."
    };
  }

  // Gerar insights baseados nos dados
  generateInsights(data) {
    // Simulação de insights
    return [
      {
        type: "success",
        title: "Alta conformidade em veículos leves",
        description: "Veículos leves apresentam a maior taxa de conformidade (83%), indicando bom desempenho nesta categoria."
      },
      {
        type: "warning",
        title: "Baixa conformidade em veículos especiais",
        description: "Veículos especiais têm a menor taxa de conformidade (62%). Recomenda-se revisar os procedimentos de inspeção."
      },
      {
        type: "info",
        title: "Tendência positiva nos últimos meses",
        description: "A taxa de conformidade geral aumentou de 70% para 85% nos últimos 6 meses, indicando melhoria contínua."
      }
    ];
  }
}

// Exportar para uso global
window.AIService = AIService;
