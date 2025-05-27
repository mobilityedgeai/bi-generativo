// Configuração para integração com Firebase e proxy seguro para OpenAI
// Este arquivo gerencia a conexão com o Firebase e as chamadas à API de IA

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxLjaiYl3WqGQDVrFqlx9wh8vJqJsQJnU",
  authDomain: "sentinel-insights-o7f49d.firebaseapp.com",
  projectId: "sentinel-insights-o7f49d",
  storageBucket: "sentinel-insights-o7f49d.appspot.com",
  messagingSenderId: "1098979780754",
  appId: "1:1098979780754:web:c0a2b0a1e0e26a3b4d3e5f"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Classe para gerenciar a conexão com o Firebase
class FirebaseService {
  constructor() {
    this.db = firebase.firestore();
    this.enterpriseId = "sA9EmrE3ymtnBqJKcYn7"; // ID da empresa para filtrar dados
    this.cache = new Map(); // Cache para consultas frequentes
  }

  // Obter dados da collection Checklist
  async getChecklistData(filters = {}) {
    try {
      // Construir chave de cache
      const cacheKey = JSON.stringify(filters);
      
      // Verificar cache
      if (this.cache.has(cacheKey)) {
        console.log("Usando dados em cache");
        return this.cache.get(cacheKey);
      }
      
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
      
      // Armazenar em cache
      this.cache.set(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error("Erro ao obter dados do Checklist:", error);
      throw error;
    }
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
      throw error;
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
      throw error;
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
        const date = item.timestamp.toDate();
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
      throw error;
    }
  }

  // Obter inspeções recentes
  async getRecentInspections(limit = 10) {
    try {
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
      throw error;
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
    this.proxyUrl = "https://bi-generativo.vercel.app/api/openai-proxy"; // Será substituído pelo endpoint real
  }

  // Processar consulta em linguagem natural
  async processQuery(query, conversationContext = []) {
    try {
      // Em ambiente de produção, esta chamada seria feita para um proxy serverless
      // que protege a chave da API OpenAI
      console.log("Processando consulta:", query);
      
      // Simulação de resposta durante desenvolvimento
      // Em produção, isso seria substituído pela chamada real ao proxy
      return this.simulateResponse(query);
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      throw error;
    }
  }

  // Método temporário para simular respostas durante desenvolvimento
  simulateResponse(query) {
    // Normalizar a consulta para comparação
    const normalizedQuery = query.toLowerCase();
    
    // Simular diferentes tipos de consultas
    if (normalizedQuery.includes("total de inspeções") && normalizedQuery.includes("tipo de veículo")) {
      return {
        intention: "VISUALIZE",
        metric: "total_inspections",
        groupBy: "vehicle_type",
        timeRange: { period: "this_month" },
        visualization: "BAR_CHART"
      };
    } 
    else if (normalizedQuery.includes("motoristas") && normalizedQuery.includes("não conformidades")) {
      return {
        intention: "LIST",
        metric: "non_compliance",
        groupBy: "driver",
        orderBy: "desc",
        limit: 5,
        visualization: "TABLE"
      };
    }
    else if (normalizedQuery.includes("taxa de conformidade") && normalizedQuery.includes("garagens")) {
      return {
        intention: "COMPARE",
        metric: "compliance_rate",
        groupBy: "garage",
        visualization: "BAR_CHART"
      };
    }
    else if (normalizedQuery.includes("tendência") || normalizedQuery.includes("evolução")) {
      return {
        intention: "VISUALIZE_TREND",
        metric: "compliance_rate",
        timeRange: { period: "last_6_months" },
        visualization: "LINE_CHART"
      };
    }
    else {
      // Resposta genérica para outras consultas
      return {
        intention: "UNKNOWN",
        message: "Não consegui entender sua consulta. Pode reformular?"
      };
    }
  }

  // Gerar insights baseados nos dados
  generateInsights(data) {
    // Em produção, isso seria feito via chamada ao proxy serverless
    // Por enquanto, vamos gerar insights simples baseados nos dados
    
    const insights = [];
    
    // Exemplo: Insight sobre taxa de conformidade
    if (data.complianceRate) {
      const rate = parseFloat(data.complianceRate);
      if (rate < 70) {
        insights.push({
          type: "warning",
          title: "Taxa de conformidade abaixo do ideal",
          description: `A taxa atual de ${rate}% está abaixo da meta de 80%.`
        });
      } else if (rate > 90) {
        insights.push({
          type: "success",
          title: "Excelente taxa de conformidade",
          description: `A taxa atual de ${rate}% está acima da meta de 90%.`
        });
      }
    }
    
    // Exemplo: Insight sobre não conformidades
    if (data.vehicleTypeData) {
      const worstType = [...data.vehicleTypeData].sort((a, b) => 
        a.complianceRate - b.complianceRate)[0];
      
      if (worstType) {
        insights.push({
          type: "info",
          title: `${worstType.type} tem a menor taxa de conformidade`,
          description: `Com ${worstType.complianceRate.toFixed(1)}%, este tipo de veículo precisa de atenção.`
        });
      }
    }
    
    // Exemplo: Insight sobre tendência
    if (data.trendData && data.trendData.length >= 2) {
      const first = data.trendData[0].complianceRate;
      const last = data.trendData[data.trendData.length - 1].complianceRate;
      const change = last - first;
      
      if (change > 5) {
        insights.push({
          type: "success",
          title: "Tendência positiva de conformidade",
          description: `Aumento de ${change.toFixed(1)}% na taxa de conformidade nos últimos meses.`
        });
      } else if (change < -5) {
        insights.push({
          type: "warning",
          title: "Tendência negativa de conformidade",
          description: `Queda de ${Math.abs(change).toFixed(1)}% na taxa de conformidade nos últimos meses.`
        });
      }
    }
    
    return insights;
  }
}

// Exportar serviços para uso em outros arquivos
window.FirebaseService = FirebaseService;
window.AIService = AIService;
