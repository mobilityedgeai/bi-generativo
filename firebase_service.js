// Serviço de integração com Firebase para o BI Generativo
class FirebaseService {
  constructor( ) {
    this.db = null;
    this.enterpriseId = "qzDVZ1jB6IC60baxtsDU"; // ID da empresa para filtrar dados
    this.initFirebase();
  }

  // Inicializar Firebase
  initFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyBJ4Sm0QN41W5Z9EGBfKCf_cazGrLwutP0",
      authDomain: "bi-dashboard-sentinel-79696.firebaseapp.com",
      projectId: "bi-dashboard-sentinel-79696",
      storageBucket: "bi-dashboard-sentinel-79696.appspot.com",
      messagingSenderId: "1075389578412",
      appId: "1:1075389578412:web:a4c6d6a5a1b8e8a9e1b8e8"
    };

    // Inicializar Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.db = firebase.firestore();
    console.log("Firebase inicializado com sucesso");
  }

  // Obter dados da collection Checklist
  async getChecklistData() {
    try {
      console.log("Buscando dados da collection Checklist...");
      
      // Referência à collection Checklist
      const checklistRef = this.db.collection("Checklist");
      
      // Consulta filtrada por enterpriseId
      const query = checklistRef.where("enterpriseId", "==", this.enterpriseId);
      
      // Executar consulta
      const snapshot = await query.get();
      
      // Processar resultados
      const checklistData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        checklistData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
        });
      });
      
      console.log(`Encontrados ${checklistData.length} registros na collection Checklist`);
      return checklistData;
    } catch (error) {
      console.error("Erro ao obter dados da collection Checklist:", error);
      throw error;
    }
  }

  // Calcular métricas gerais
  async getGeneralMetrics() {
    try {
      const checklistData = await this.getChecklistData();
      
      // Total de inspeções
      const totalInspections = checklistData.length;
      
      // Inspeções conformes
      const compliantInspections = checklistData.filter(item => item.compliant).length;
      
      // Inspeções não conformes
      const nonCompliantCount = totalInspections - compliantInspections;
      
      // Taxa de conformidade
      const complianceRate = totalInspections > 0 
        ? ((compliantInspections / totalInspections) * 100).toFixed(1)
        : "0.0";
      
      return {
        totalInspections,
        compliantInspections,
        nonCompliantCount,
        complianceRate
      };
    } catch (error) {
      console.error("Erro ao calcular métricas gerais:", error);
      throw error;
    }
  }

  // Obter dados de conformidade por tipo de veículo
  async getComplianceByVehicleType() {
    try {
      const checklistData = await this.getChecklistData();
      
      // Agrupar por tipo de veículo
      const vehicleTypes = {};
      
      checklistData.forEach(item => {
        const vehicleType = item.planName || "Não especificado";
        
        if (!vehicleTypes[vehicleType]) {
          vehicleTypes[vehicleType] = {
            total: 0,
            compliant: 0
          };
        }
        
        vehicleTypes[vehicleType].total++;
        if (item.compliant) {
          vehicleTypes[vehicleType].compliant++;
        }
      });
      
      // Converter para array e calcular taxas
      const result = Object.keys(vehicleTypes).map(type => {
        const data = vehicleTypes[type];
        return {
          type,
          total: data.total,
          compliant: data.compliant,
          complianceRate: ((data.compliant / data.total) * 100).toFixed(1)
        };
      });
      
      return result;
    } catch (error) {
      console.error("Erro ao obter dados de conformidade por tipo de veículo:", error);
      throw error;
    }
  }

  // Obter tendência de conformidade ao longo do tempo
  async getComplianceTrend() {
    try {
      const checklistData = await this.getChecklistData();
      
      // Ordenar por data
      checklistData.sort((a, b) => a.timestamp - b.timestamp);
      
      // Agrupar por mês
      const monthlyData = {};
      
      checklistData.forEach(item => {
        const date = item.timestamp;
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
      
      // Converter para array e calcular taxas
      const result = Object.values(monthlyData).map(data => {
        return {
          month: data.month,
          total: data.total,
          compliant: data.compliant,
          complianceRate: ((data.compliant / data.total) * 100).toFixed(1)
        };
      });
      
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
      const checklistData = await this.getChecklistData();
      
      // Ordenar por data (mais recentes primeiro)
      checklistData.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limitar quantidade
      return checklistData.slice(0, limit);
    } catch (error) {
      console.error("Erro ao obter inspeções recentes:", error);
      throw error;
    }
  }

  // Método para simular dados durante desenvolvimento
  simulateData() {
    console.log("Simulando dados para desenvolvimento...");
    
    // Dados simulados para métricas gerais
    const generalMetrics = {
      totalInspections: 4903,
      compliantInspections: 3824,
      nonCompliantCount: 1079,
      complianceRate: "78.0"
    };
    
    // Dados simulados para conformidade por tipo de veículo
    const vehicleTypeData = [
      { type: "Veículos Leves", total: 1250, compliant: 1038, complianceRate: "83.0" },
      { type: "Veículos Médios", total: 850, compliant: 620, complianceRate: "73.0" },
      { type: "Veículos Pesados", total: 620, compliant: 459, complianceRate: "74.0" },
      { type: "Veículos Especiais", total: 320, compliant: 198, complianceRate: "62.0" }
    ];
    
    // Dados simulados para tendência de conformidade
    const trendData = [
      { month: new Date(2024, 11, 1), total: 450, compliant: 315, complianceRate: "70.0" },
      { month: new Date(2025, 0, 1), total: 480, compliant: 350, complianceRate: "73.0" },
      { month: new Date(2025, 1, 1), total: 510, compliant: 383, complianceRate: "75.0" },
      { month: new Date(2025, 2, 1), total: 530, compliant: 424, complianceRate: "80.0" },
      { month: new Date(2025, 3, 1), total: 560, compliant: 470, complianceRate: "84.0" },
      { month: new Date(2025, 4, 1), total: 590, compliant: 501, complianceRate: "85.0" }
    ];
    
    // Dados simulados para inspeções recentes
    const recentInspections = [
      { id: "1", timestamp: new Date(2025, 4, 25), planName: "Veículos Leves", vehiclePlate: "ABC1234", driverName: "João Silva", compliant: true, score: 95 },
      { id: "2", timestamp: new Date(2025, 4, 24), planName: "Veículos Pesados", vehiclePlate: "XYZ9876", driverName: "Maria Oliveira", compliant: false, score: 65 },
      { id: "3", timestamp: new Date(2025, 4, 23), planName: "Veículos Médios", vehiclePlate: "DEF5678", driverName: "Pedro Santos", compliant: true, score: 88 },
      { id: "4", timestamp: new Date(2025, 4, 22), planName: "Veículos Especiais", vehiclePlate: "GHI9012", driverName: "Ana Costa", compliant: true, score: 92 },
      { id: "5", timestamp: new Date(2025, 4, 21), planName: "Veículos Leves", vehiclePlate: "JKL3456", driverName: "Carlos Ferreira", compliant: false, score: 45 }
    ];
    
    return {
      generalMetrics,
      vehicleTypeData,
      trendData,
      recentInspections
    };
  }
}

// Exportar para uso global
window.FirebaseService = FirebaseService;
