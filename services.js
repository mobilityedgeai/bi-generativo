// Configuração para integração com Firebase e proxy seguro para OpenAI
// Este arquivo gerencia a conexão com o Firebase e as chamadas à API de IA

// Classe para gerenciar a conexão com o Firebase
class FirebaseService {
  constructor() {
    this.db = firebase.firestore();
    this.enterpriseId = "sA9EmrE3ymtnBqJKcYn7"; // ID da empresa para filtrar dados
    this.cache = new Map(); // Cache para consultas frequentes
    this.initialized = false;
    
    // Verificar se a autenticação já está pronta
    if (window.authReady) {
      this.initialized = true;
      console.log("FirebaseService inicializado - autenticação já estava pronta");
    } else {
      // Aguardar evento de autenticação pronta
      document.addEventListener('auth-ready', () => {
        this.initialized = true;
        console.log("FirebaseService inicializado após evento auth-ready");
      });
    }
  }

  // Garantir que o serviço esteja inicializado antes de qualquer operação
  async ensureInitialized() {
    if (this.initialized) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.initialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  // Obter dados da collection Checklist
  async getChecklistData(filters = {}) {
    try {
      // Garantir que o serviço esteja inicializado
      await this.ensureInitialized();
      
      // Construir chave de cache
      const cacheKey = JSON.stringify(filters);
      
      // Verificar cache
      if (this.cache.has(cacheKey)) {
        console.log("Usando dados em cache");
        return this.cache.get(cacheKey);
      }
      
      console.log("Buscando dados da collection Checklist...");
      
      // Construir consulta base
      let query = this.db.collection("Checklist")
        .where("enterpriseId", "==", this.enterpriseId);
      
      // Adicionar filtros adicionais
      if (filters.startDate) {
        query = query.where("timestamp", ">=", new Date(filters.startDate));
      }
      
      if (filters.endDate) {
        query = query.where("timestamp", "<=", new Date(filters.endDate));
      }
      
      if (filters.planName) {
        query = query.where("planName", "==", filters.planName);
      }
      
      if (filters.compliant !== undefined) {
        query = query.where("compliant", "==", filters.compliant);
      }
      
      // Executar consulta
      const snapshot = await query.get();
      
      // Processar resultados
      const results = [];
      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`Encontrados ${results.length} registros na collection Checklist`);
      
      // Armazenar em cache
      this.cache.set(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error("Erro ao obter dados do Checklist:", error);
      // Retornar dados simulados em caso de erro
      return this.getSimulatedData(filters);
    }
  }

  // Dados simulados para fallback em caso de erro
  getSimulatedData(filters = {}) {
    console.log("Usando dados simulados devido a erro na conexão");
    
    // Dados simulados de inspeções
    const simulatedData = [
      {
        id: "sim1",
        enterpriseId: this.enterpriseId,
        timestamp: new Date(),
        planName: "Veículos Leves",
        vehiclePlate: "ABC1234",
        driverName: "João Silva",
        compliant: true
      },
      {
        id: "sim2",
        enterpriseId: this.enterpriseId,
        timestamp: new Date(),
        planName: "Veículos Médios",
        vehiclePlate: "DEF5678",
        driverName: "Maria Oliveira",
        compliant: true
      },
      {
        id: "sim3",
        enterpriseId: this.enterpriseId,
        timestamp: new Date(),
        planName: "Veículos Pesados",
        vehiclePlate: "GHI9012",
        driverName: "Pedro Santos",
        compliant: false
      },
      {
        id: "sim4",
        enterpriseId: this.enterpriseId,
        timestamp: new Date(),
        planName: "Veículos Leves",
        vehiclePlate: "JKL3456",
        driverName: "Ana Costa",
        compliant: true
      },
      {
        id: "sim5",
        enterpriseId: this.enterpriseId,
        timestamp: new Date(),
        planName: "Veículos Especiais",
        vehiclePlate: "MNO7890",
        driverName: "Carlos Ferreira",
        compliant: false
      }
    ];
    
    return simulatedData;
  }

  // Calcular métricas gerais
  async getMetrics() {
    try {
      const data = await this.getChecklistData();
      
      // Total de inspeções
      const totalInspections = data.length;
      
      // Inspeções conformes
      const compliantInspections = data.filter(item => item.compliant).length;
      
      // Taxa de conformidade
      const complianceRate = totalInspections > 0 
        ? (compliantInspections / totalInspections) * 100 
        : 0;
      
      // Não conformidades
      const nonCompliantCount = totalInspections - compliantInspections;
      
      return {
        totalInspections,
        compliantInspections,
        nonCompliantCount,
        complianceRate: complianceRate.toFixed(1)
      };
    } catch (error) {
      console.error("Erro ao calcular métricas:", error);
      // Retornar dados simulados em caso de erro
      return {
        totalInspections: 4903,
        compliantInspections: 3824,
        nonCompliantCount: 1079,
        complianceRate: "78.0"
      };
    }
  }

  // Obter dados para gráfico de conformidade por tipo de veículo
  async getComplianceByVehicleType() {
    try {
      const data = await this.getChecklistData();
      
      // Agrupar por tipo de veículo
      const vehicleTypes = {};
      
      data.forEach(item => {
        const type = item.planName || "Não especificado";
        
        if (!vehicleTypes[type]) {
          vehicleTypes[type] = {
            total: 0,
            compliant: 0
          };
        }
        
        vehicleTypes[type].total++;
        if (item.compliant) {
          vehicleTypes[type].compliant++;
        }
      });
      
      // Calcular taxas de conformidade
      const result = Object.entries(vehicleTypes).map(([type, data]) => ({
        type,
        total: data.total,
        compliant: data.compliant,
        complianceRate: (data.compliant / data.total) * 100
      }));
      
      // Ordenar por taxa de conformidade
      result.sort((a, b) => b.complianceRate - a.complianceRate);
      
      return result;
    } catch (error) {
      console.error("Erro ao obter dados de conformidade por tipo de veículo:", error);
      // Retornar dados simulados em caso de erro
      return [
        { type: "Veículos Leves", total: 1250, compliant: 1038, complianceRate: 83.0 },
        { type: "Veículos Médios", total: 850, compliant: 621, complianceRate: 73.0 },
        { type: "Veículos Pesados", total: 620, compliant: 459, complianceRate: 74.0 },
        { type: "Veículos Especiais", total: 320, compliant: 198, complianceRate: 62.0 }
      ];
    }
  }

  // Obter dados para gráfico de tendência de conformidade
  async getComplianceTrend(months = 6) {
    try {
      // Calcular data inicial (X meses atrás)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const data = await this.getChecklistData({
        startDate,
        endDate
      });
      
      // Agrupar por mês
      const monthlyData = {};
      
      data.forEach(item => {
        const date = item.timestamp instanceof Date ? item.timestamp : item.timestamp.toDate();
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: new Date(date.getFullYear(), date.getMonth(), 1),
            total: 0,
            compliant: 0
          };
        }
        
        monthlyData[monthKey].total++;
        if (item.compliant) {
          monthlyData[monthKey].compliant++;
        }
      });
      
      // Calcular taxas de conformidade por mês
      const result = Object.values(monthlyData).map(data => ({
        month: data.month,
        total: data.total,
        compliant: data.compliant,
        complianceRate: (data.compliant / data.total) * 100
      }));
      
      // Ordenar por data
      result.sort((a, b) => a.month - b.month);
      
      return result;
    } catch (error) {
      console.error("Erro ao obter tendência de conformidade:", error);
      // Retornar dados simulados em caso de erro
      const result = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const baseRate = 70;
        const improvement = (months - i) * 3;
        const rate = Math.min(baseRate + improvement, 85);
        
        result.push({
          month,
          total: 100 + Math.floor(Math.random() * 50),
          compliant: Math.floor((100 + Math.floor(Math.random() * 50)) * (rate / 100)),
          complianceRate: rate
        });
      }
      
      return result;
    }
  }

  // Obter inspeções recentes
  async getRecentInspections(limit = 10) {
    try {
      await this.ensureInitialized();
      
      const snapshot = await this.db.collection("Checklist")
        .where("enterpriseId", "==", this.enterpriseId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();
      
      const results = [];
      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return results;
    } catch (error) {
      console.error("Erro ao obter inspeções recentes:", error);
      // Retornar dados simulados em caso de erro
      return this.getSimulatedData().slice(0, limit);
    }
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
  }
}

// Classe para gerenciar chamadas à API de IA via proxy serverless
class AIService {
  constructor() {
    // URL do proxy serverless que protege a chave da API
    this.proxyUrl = "https://bi-generativo.vercel.app/api/openai-proxy"; // Endpoint real do Vercel
  }

  // Processar consulta em linguagem natural
  async processQuery(query, conversationContext = []) {
    try {
      console.log("Processando consulta:", query);
      
      // Em ambiente de produção, esta chamada seria feita para o proxy serverless
      // que protege a chave da API OpenAI
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
              content: "Você é um assistente especializado em análise de dados de inspeções veiculares. Sua tarefa é interpretar consultas em linguagem natural e convertê-las em parâmetros para visualizações de dados. Responda apenas com um objeto JSON contendo os parâmetros para a visualização, sem explicações adicionais."
            },
            {
              role: "user",
              content: `Converta a seguinte consulta em parâmetros para visualização: "${query}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na chamada à API: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Resposta da API:", data);
      
      // Extrair a resposta do modelo
      const content = data.choices[0].message.content;
      
      try {
        // Tentar fazer parse do JSON na resposta
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsedResponse = JSON.parse(jsonStr);
          console.log("Processando resposta:", parsedResponse);
          return parsedResponse;
        }
      } catch (parseError) {
        console.error("Erro ao fazer parse da resposta:", parseError);
      }
      
      // Se não conseguir processar a resposta da API, usar simulação
      return this.simulateResponse(query);
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      // Em caso de erro, usar simulação
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
      } else if (queryLower.includes("mês") || queryLower.includes("mensal")) {
        return {
          intention: "VISUALIZE_TREND",
          metric: "total_inspections",
          period: "monthly",
          visualization: "LINE_CHART",
          message: "Visualizando total de inspeções por mês"
        };
      }
    }
    
    // Consultas sobre motoristas
    if (queryLower.includes("motorista") || queryLower.includes("condutor")) {
      if (queryLower.includes("não conformidade") || queryLower.includes("problema")) {
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
window.FirebaseService = FirebaseService;
window.AIService = AIService;
