// Serviço para gerenciar chamadas à API de IA via proxy serverless
class AIService {
  constructor() {
    // URL do proxy serverless que protege a chave da API
    this.proxyUrl = "https://bi-generativo.vercel.app/api/openai-proxy"; // Será substituído pelo endpoint real
  }

  // Processar consulta em linguagem natural
  async processQuery(query, conversationContext = [] ) {
    try {
      console.log("Processando consulta:", query);
      
      // Tentar fazer requisição para o proxy serverless
      try {
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
          console.log("Erro na requisição, usando simulação:", response.status);
          throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Resposta da API:", data);
        
        // Processar a resposta da API
        try {
          const content = data.choices[0].message.content;
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsedResponse = JSON.parse(jsonStr);
            return parsedResponse;
          }
        } catch (parseError) {
          console.error("Erro ao processar resposta da API:", parseError);
        }
      } catch (apiError) {
        console.error("Erro na API, usando simulação:", apiError);
      }
      
      // Se chegou aqui, usar simulação como fallback
      console.log("Usando simulação para:", query);
      return this.simulateResponse(query);
    } catch (error) {
      console.error("Erro geral ao processar consulta:", error);
      return this.simulateResponse(query);
    }
  }

  // Método aprimorado para simular respostas durante desenvolvimento
  simulateResponse(query) {
    console.log("Simulando resposta para:", query);
    
    // Converter para minúsculas para facilitar comparação
    const queryLower = query.toLowerCase();
    
    // Consultas sobre total de inspeções
    if (queryLower.includes("total") && queryLower.includes("inspeções")) {
      if (queryLower.includes("tipo") || queryLower.includes("veículo")) {
        return {
          intention: "VISUALIZE",
          metric: "total_inspections",
          groupBy: "vehicle_type",
          visualization: "BAR_CHART",
          message: "Visualizando total de inspeções por tipo de veículo"
        };
      } else if (queryLower.includes("mês") || queryLower.includes("mes")) {
        return {
          intention: "VISUALIZE_TREND",
          metric: "total_inspections",
          period: "monthly",
          message: "Visualizando total de inspeções por mês"
        };
      }
    }
    
    // Consultas sobre motoristas
    if (queryLower.includes("motorista") || queryLower.includes("condutor")) {
      if (queryLower.includes("não conformidade") || queryLower.includes("problema") || 
          queryLower.includes("mais") || queryLower.includes("pior")) {
        return {
          intention: "LIST",
          metric: "non_compliance",
          groupBy: "driver",
          limit: 5,
          message: "Listando motoristas com mais não conformidades"
        };
      }
    }
    
    // Consultas sobre conformidade
    if (queryLower.includes("conformidade") || queryLower.includes("conforme")) {
      if (queryLower.includes("garagem") || queryLower.includes("local") || queryLower.includes("entre")) {
        return {
          intention: "COMPARE",
          metric: "compliance_rate",
          groupBy: "garage",
          message: "Comparando taxa de conformidade entre garagens"
        };
      } else if (queryLower.includes("tendência") || queryLower.includes("evolução") || 
                 queryLower.includes("últimos meses") || queryLower.includes("ao longo do tempo")) {
        return {
          intention: "VISUALIZE_TREND",
          metric: "compliance_rate",
          period: "monthly",
          message: "Visualizando tendência de conformidade ao longo do tempo"
        };
      }
    }
    
    // Consultas sobre quantidades
    if (queryLower.includes("quantas") || queryLower.includes("quantos") || 
        queryLower.includes("quantidade") || queryLower.includes("número")) {
      if (queryLower.includes("inspeção") || queryLower.includes("inspeções")) {
        if (queryLower.includes("abril") || queryLower.includes("mês passado")) {
          return {
            intention: "VISUALIZE",
            metric: "total_inspections",
            period: "april",
            visualization: "BAR_CHART",
            message: "Visualizando total de inspeções em abril"
          };
        } else if (queryLower.includes("tipo") || queryLower.includes("veículo")) {
          return {
            intention: "VISUALIZE",
            metric: "total_inspections",
            groupBy: "vehicle_type",
            visualization: "BAR_CHART",
            message: "Visualizando total de inspeções por tipo de veículo"
          };
        } else {
          return {
            intention: "VISUALIZE_TREND",
            metric: "total_inspections",
            period: "monthly",
            message: "Visualizando total de inspeções por mês"
          };
        }
      }
    }
    
    // Consultas sobre problemas ou não conformidades
    if (queryLower.includes("problema") || queryLower.includes("não conformidade") || 
        queryLower.includes("falha") || queryLower.includes("erro")) {
      if (queryLower.includes("tipo") || queryLower.includes("veículo")) {
        return {
          intention: "VISUALIZE",
          metric: "non_compliance",
          groupBy: "vehicle_type",
          visualization: "BAR_CHART",
          message: "Visualizando não conformidades por tipo de veículo"
        };
      } else if (queryLower.includes("motorista") || queryLower.includes("condutor")) {
        return {
          intention: "LIST",
          metric: "non_compliance",
          groupBy: "driver",
          limit: 5,
          message: "Listando motoristas com mais não conformidades"
        };
      } else {
        return {
          intention: "VISUALIZE_TREND",
          metric: "non_compliance",
          period: "monthly",
          message: "Visualizando tendência de não conformidades ao longo do tempo"
        };
      }
    }
    
    // Consultas sobre comparações
    if (queryLower.includes("compare") || queryLower.includes("comparar") || 
        queryLower.includes("diferença") || queryLower.includes("entre")) {
      if (queryLower.includes("garagem") || queryLower.includes("local")) {
        return {
          intention: "COMPARE",
          metric: "compliance_rate",
          groupBy: "garage",
          message: "Comparando taxa de conformidade entre garagens"
        };
      } else if (queryLower.includes("tipo") || queryLower.includes("veículo")) {
        return {
          intention: "COMPARE",
          metric: "compliance_rate",
          groupBy: "vehicle_type",
          message: "Comparando taxa de conformidade entre tipos de veículos"
        };
      } else if (queryLower.includes("motorista") || queryLower.includes("condutor")) {
        return {
          intention: "LIST",
          metric: "compliance_rate",
          groupBy: "driver",
          limit: 5,
          message: "Comparando taxa de conformidade entre motoristas"
        };
      }
    }
    
    // Consultas sobre tendências ou evolução
    if (queryLower.includes("tendência") || queryLower.includes("evolução") || 
        queryLower.includes("ao longo do tempo") || queryLower.includes("últimos meses")) {
      if (queryLower.includes("conformidade")) {
        return {
          intention: "VISUALIZE_TREND",
          metric: "compliance_rate",
          period: "monthly",
          message: "Visualizando tendência de conformidade ao longo do tempo"
        };
      } else if (queryLower.includes("inspeção") || queryLower.includes("inspeções")) {
        return {
          intention: "VISUALIZE_TREND",
          metric: "total_inspections",
          period: "monthly",
          message: "Visualizando tendência de inspeções ao longo do tempo"
        };
      } else {
        return {
          intention: "VISUALIZE_TREND",
          metric: "compliance_rate",
          period: "monthly",
          message: "Visualizando tendência ao longo do tempo"
        };
      }
    }
    
    // Consultas sobre melhores ou piores
    if (queryLower.includes("melhor") || queryLower.includes("pior") || 
        queryLower.includes("mais") || queryLower.includes("menos")) {
      if (queryLower.includes("motorista") || queryLower.includes("condutor")) {
        if (queryLower.includes("conformidade") && !queryLower.includes("não")) {
          return {
            intention: "LIST",
            metric: "compliance_rate",
            groupBy: "driver",
            limit: 5,
            order: "desc",
            message: "Listando motoristas com melhores taxas de conformidade"
          };
        } else {
          return {
            intention: "LIST",
            metric: "non_compliance",
            groupBy: "driver",
            limit: 5,
            message: "Listando motoristas com mais não conformidades"
          };
        }
      } else if (queryLower.includes("veículo") || queryLower.includes("tipo")) {
        return {
          intention: "VISUALIZE",
          metric: "compliance_rate",
          groupBy: "vehicle_type",
          visualization: "BAR_CHART",
          message: "Visualizando taxa de conformidade por tipo de veículo"
        };
      }
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
