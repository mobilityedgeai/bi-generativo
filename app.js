// Aplicação principal do BI Generativo

// Esperar pelo carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log("Inicializando BI Generativo...");
  
  // Inicializar serviços
  const firebaseService = new FirebaseService();
  const aiService = new AIService();
  const chartManager = new ChartManager();
  
  // Disponibilizar serviços globalmente
  window.app = {
    firebaseService,
    aiService,
    chartManager
  };
  
  // Inicializar dashboard
  initializeDashboard();
  
  // Configurar eventos de interface
  setupEventListeners();
});

// Inicializar dashboard com dados
async function initializeDashboard() {
  try {
    console.log("Carregando dados do dashboard...");
    
    // Obter serviço do Firebase
    const firebaseService = window.app.firebaseService;
    const chartManager = window.app.chartManager;
    
    // Usar dados simulados durante desenvolvimento
    const data = firebaseService.simulateData();
    
    // Atualizar métricas gerais
    updateGeneralMetrics(data.generalMetrics);
    
    // Criar gráfico de conformidade por tipo de veículo
    chartManager.createVehicleTypeChart(data.vehicleTypeData);
    
    // Criar gráfico de tendência de conformidade
    chartManager.createTrendChart(data.trendData);
    
    // Preencher tabela de inspeções recentes
    populateRecentInspections(data.recentInspections);
    
    console.log("Dashboard inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar dashboard:", error);
  }
}

// Atualizar métricas gerais
function updateGeneralMetrics(metrics) {
  const complianceRateElement = document.querySelector('.metric-card h2');
  const totalInspectionsElement = document.querySelector('.metric-card .metric-total:nth-of-type(1)');
  const nonCompliantElement = document.querySelector('.metric-card .metric-total:nth-of-type(2)');
  
  if (complianceRateElement) {
    complianceRateElement.textContent = `${metrics.complianceRate}%`;
  }
  
  if (totalInspectionsElement) {
    totalInspectionsElement.textContent = metrics.totalInspections.toLocaleString();
  }
  
  if (nonCompliantElement) {
    nonCompliantElement.textContent = metrics.nonCompliantCount.toLocaleString();
  }
}

// Preencher tabela de inspeções recentes
function populateRecentInspections(inspections) {
  const tableBody = document.getElementById('recent-inspections');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  inspections.forEach(inspection => {
    const row = document.createElement('tr');
    
    // Formatar data
    const date = new Date(inspection.timestamp);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    // Criar células
    const dateCell = document.createElement('td');
    dateCell.textContent = formattedDate;
    
    const typeCell = document.createElement('td');
    typeCell.textContent = inspection.planName;
    
    const plateCell = document.createElement('td');
    plateCell.textContent = inspection.vehiclePlate;
    
    const driverCell = document.createElement('td');
    driverCell.textContent = inspection.driverName;
    
    const statusCell = document.createElement('td');
    statusCell.textContent = inspection.compliant ? 'Conforme' : 'Não Conforme';
    statusCell.style.color = inspection.compliant ? 'var(--success-color)' : 'var(--error-color)';
    
    // Adicionar células à linha
    row.appendChild(dateCell);
    row.appendChild(typeCell);
    row.appendChild(plateCell);
    row.appendChild(driverCell);
    row.appendChild(statusCell);
    
    // Adicionar linha à tabela
    tableBody.appendChild(row);
  });
}

// Configurar eventos de interface
function setupEventListeners() {
  const queryInput = document.getElementById('query-input');
  const submitButton = document.getElementById('submit-query');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  
  // Evento de envio de consulta
  if (submitButton && queryInput) {
    submitButton.addEventListener('click', () => {
      const query = queryInput.value.trim();
      if (query) {
        processUserQuery(query);
      }
    });
    
    queryInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const query = queryInput.value.trim();
        if (query) {
          processUserQuery(query);
        }
      }
    });
  }
  
  // Eventos para chips de sugestão
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (queryInput) {
        queryInput.value = chip.textContent;
        processUserQuery(chip.textContent);
      }
    });
  });
}

// Processar consulta do usuário
async function processUserQuery(query) {
  try {
    console.log("Processando consulta do usuário:", query);
    
    // Mostrar indicador de carregamento
    showLoading(true);
    
    // Obter serviços
    const aiService = window.app.aiService;
    const firebaseService = window.app.firebaseService;
    const chartManager = window.app.chartManager;
    
    // Processar consulta via serviço de IA
    const queryParams = await aiService.processQuery(query);
    
    // Verificar se a consulta foi compreendida
    if (queryParams.intention === 'UNKNOWN') {
      alert(queryParams.message || "Não foi possível entender sua consulta.");
      showLoading(false);
      return;
    }
    
    // Dados simulados para desenvolvimento
    const mockData = firebaseService.simulateData();
    
    // Executar consulta apropriada baseada na intenção
    let result;
    switch (queryParams.intention) {
      case 'VISUALIZE':
        // Criar visualização simples
        if (queryParams.metric === 'total_inspections' && queryParams.groupBy === 'vehicle_type') {
          chartManager.createCustomBarChart(
            'custom-visualization',
            'Total de Inspeções por Tipo de Veículo',
            mockData.vehicleTypeData.map(item => item.type),
            mockData.vehicleTypeData.map(item => item.total),
            'Total de Inspeções'
          );
        }
        result = mockData.vehicleTypeData;
        break;
      case 'VISUALIZE_TREND':
        // Criar visualização de tendência
        chartManager.createCustomLineChart(
          'custom-visualization',
          'Tendência de Conformidade ao Longo do Tempo',
          mockData.trendData.map(item => {
            const date = new Date(item.month);
            return `${date.getMonth() + 1}/${date.getFullYear()}`;
          }),
          mockData.trendData.map(item => parseFloat(item.complianceRate)),
          'Taxa de Conformidade (%)'
        );
        result = mockData.trendData;
        break;
      case 'COMPARE':
        // Criar comparação
        chartManager.createCustomBarChart(
          'custom-visualization',
          'Comparação de Taxa de Conformidade entre Garagens',
          ['Garagem A', 'Garagem B', 'Garagem C', 'Garagem D'],
          [85, 72, 78, 81],
          'Taxa de Conformidade (%)'
        );
        result = [
          { name: 'Garagem A', value: 85 },
          { name: 'Garagem B', value: 72 },
          { name: 'Garagem C', value: 78 },
          { name: 'Garagem D', value: 81 }
        ];
        break;
      case 'LIST':
        // Criar listagem
        if (queryParams.metric === 'non_compliance' && queryParams.groupBy === 'driver') {
          chartManager.createCustomTable(
            'custom-visualization',
            'Motoristas com Mais Não Conformidades',
            ['Motorista', 'Total de Inspeções', 'Não Conformidades', 'Taxa de Conformidade'],
            [
              ['Pedro Santos', '110', '31', '71.8%'],
              ['Carlos Ferreira', '105', '28', '73.3%'],
              ['João Silva', '120', '24', '80.0%'],
              ['Ana Costa', '85', '12', '85.9%'],
              ['Maria Oliveira', '95', '8', '91.6%']
            ]
          );
        }
        result = [
          { driver: 'Pedro Santos', inspections: 110, nonCompliance: 31, complianceRate: 71.8 },
          { driver: 'Carlos Ferreira', inspections: 105, nonCompliance: 28, complianceRate: 73.3 },
          { driver: 'João Silva', inspections: 120, nonCompliance: 24, complianceRate: 80.0 },
          { driver: 'Ana Costa', inspections: 85, nonCompliance: 12, complianceRate: 85.9 },
          { driver: 'Maria Oliveira', inspections: 95, nonCompliance: 8, complianceRate: 91.6 }
        ];
        break;
      default:
        alert("Tipo de consulta não suportado.");
        showLoading(false);
        return;
    }
    
    // Gerar insights baseados nos resultados
    const insights = aiService.generateInsights(result);
    updateInsights(insights);
    
    showLoading(false);
  } catch (error) {
    console.error("Erro ao processar consulta:", error);
    alert("Não foi possível processar sua consulta. Por favor, tente novamente.");
    showLoading(false);
  }
}

// Atualizar insights
function updateInsights(insights) {
  const insightsList = document.getElementById('insights-list');
  if (!insightsList) return;
  
  insightsList.innerHTML = '';
  
  if (insights.length === 0) {
    const noInsights = document.createElement('div');
    noInsights.classList.add('insight-item');
    noInsights.textContent = 'Nenhum insight disponível no momento.';
    insightsList.appendChild(noInsights);
    return;
  }
  
  insights.forEach(insight => {
    const insightItem = document.createElement('div');
    insightItem.classList.add('insight-item');
    
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('insight-icon');
    
    // Ícone baseado no tipo de insight
    let iconSvg;
    if (insight.type === 'success') {
      iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if (insight.type === 'warning' ) {
      iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9V12M12 16H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
      iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    
    iconDiv.innerHTML = iconSvg;
    
    const contentDiv = document.createElement('div' );
    contentDiv.classList.add('insight-content');
    
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('insight-title');
    titleDiv.textContent = insight.title;
    
    const descDiv = document.createElement('div');
    descDiv.classList.add('insight-description');
    descDiv.textContent = insight.description;
    
    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(descDiv);
    
    insightItem.appendChild(iconDiv);
    insightItem.appendChild(contentDiv);
    
    insightsList.appendChild(insightItem);
  });
}

// Mostrar/ocultar indicador de carregamento
function showLoading(isLoading) {
  let loadingElement = document.querySelector('.loading');
  
  if (isLoading) {
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.classList.add('loading');
      
      const spinner = document.createElement('div');
      spinner.classList.add('loading-spinner');
      
      loadingElement.appendChild(spinner);
      
      document.body.appendChild(loadingElement);
    }
  } else if (loadingElement) {
    loadingElement.remove();
  }
}
