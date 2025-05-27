// Aplicação principal do BI Generativo
// Este arquivo gerencia a inicialização e coordenação dos componentes

// Esperar pelo carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar serviços após autenticação
  initializeAfterAuth();
  
  // Função para inicializar após autenticação
  function initializeAfterAuth() {
    // Verificar se a autenticação já está pronta
    if (window.authReady) {
      initializeApp();
    } else {
      // Aguardar evento de autenticação pronta
      document.addEventListener('auth-ready', initializeApp);
    }
  }
  
  // Inicializar aplicação
  function initializeApp() {
    console.log("Inicializando aplicação após autenticação");
    
    // Inicializar serviços
    const firebaseService = new FirebaseService();
    const aiService = new AIService();
    
    // Inicializar gerenciador de visualizações
    const chartManager = new ChartManager();
    
    // Expor serviços globalmente para uso em outros scripts
    window.app = {
      firebaseService,
      aiService,
      chartManager
    };
    
    // Carregar dados iniciais
    loadInitialData();
    
    // Configurar eventos de interface
    setupEventListeners();
  }
  
  // Função para carregar dados iniciais
  async function loadInitialData() {
    try {
      showLoading(true);
      
      const firebaseService = window.app.firebaseService;
      const aiService = window.app.aiService;
      const chartManager = window.app.chartManager;
      
      // Carregar métricas gerais
      const metrics = await firebaseService.getMetrics();
      updateMetrics(metrics);
      
      // Carregar dados para gráfico de conformidade por tipo de veículo
      const vehicleTypeData = await firebaseService.getComplianceByVehicleType();
      chartManager.createVehicleTypeChart(vehicleTypeData);
      
      // Carregar dados para gráfico de tendência
      const trendData = await firebaseService.getComplianceTrend(6);
      chartManager.createComplianceTrendChart(trendData);
      
      // Carregar inspeções recentes
      const recentInspections = await firebaseService.getRecentInspections(5);
      updateRecentInspectionsTable(recentInspections);
      
      // Gerar insights iniciais
      const insights = aiService.generateInsights({
        complianceRate: metrics.complianceRate,
        vehicleTypeData,
        trendData
      });
      updateInsights(insights);
      
      showLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      showError("Não foi possível carregar os dados iniciais. Por favor, tente novamente mais tarde.");
      showLoading(false);
      
      // Renderizar dados simulados em caso de erro
      renderSimulatedData();
    }
  }
  
  // Renderizar dados simulados em caso de erro
  function renderSimulatedData() {
    // Métricas simuladas
    updateMetrics({
      totalInspections: 4903,
      compliantInspections: 3824,
      nonCompliantCount: 1079,
      complianceRate: "78.0"
    });
    
    // Dados simulados para gráficos
    const chartManager = window.app.chartManager;
    
    // Dados simulados para gráfico de tipo de veículo
    const vehicleTypeData = [
      { type: "Veículos Leves", total: 1250, compliant: 1038, complianceRate: 83.0 },
      { type: "Veículos Médios", total: 850, compliant: 621, complianceRate: 73.0 },
      { type: "Veículos Pesados", total: 620, compliant: 459, complianceRate: 74.0 },
      { type: "Veículos Especiais", total: 320, compliant: 198, complianceRate: 62.0 }
    ];
    chartManager.createVehicleTypeChart(vehicleTypeData);
    
    // Dados simulados para gráfico de tendência
    const trendData = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const baseRate = 70;
      const improvement = (5 - i) * 3;
      const rate = Math.min(baseRate + improvement, 85);
      
      trendData.push({
        month,
        total: 100 + Math.floor(Math.random() * 50),
        compliant: Math.floor((100 + Math.floor(Math.random() * 50)) * (rate / 100)),
        complianceRate: rate
      });
    }
    chartManager.createComplianceTrendChart(trendData);
    
    // Inspeções recentes simuladas
    const recentInspections = [
      {
        timestamp: new Date(),
        planName: "Veículos Leves",
        vehiclePlate: "ABC1234",
        driverName: "João Silva",
        compliant: true
      },
      {
        timestamp: new Date(Date.now() - 86400000),
        planName: "Veículos Médios",
        vehiclePlate: "DEF5678",
        driverName: "Maria Oliveira",
        compliant: true
      },
      {
        timestamp: new Date(Date.now() - 172800000),
        planName: "Veículos Pesados",
        vehiclePlate: "GHI9012",
        driverName: "Pedro Santos",
        compliant: false
      },
      {
        timestamp: new Date(Date.now() - 259200000),
        planName: "Veículos Leves",
        vehiclePlate: "JKL3456",
        driverName: "Ana Costa",
        compliant: true
      },
      {
        timestamp: new Date(Date.now() - 345600000),
        planName: "Veículos Especiais",
        vehiclePlate: "MNO7890",
        driverName: "Carlos Ferreira",
        compliant: false
      }
    ];
    updateRecentInspectionsTable(recentInspections);
    
    // Insights simulados
    const aiService = window.app.aiService;
    const insights = aiService.generateInsights({
      complianceRate: "78.0",
      vehicleTypeData,
      trendData
    });
    updateInsights(insights);
  }
  
  // Configurar eventos de interface
  function setupEventListeners() {
    // Evento de envio de consulta
    const queryInput = document.getElementById('query-input');
    const submitButton = document.getElementById('submit-query');
    
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
    
    // Evento de clique em sugestões
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.textContent;
        if (queryInput) {
          queryInput.value = query;
          processUserQuery(query);
        }
      });
    });
  }
  
  // Processar consulta do usuário
  async function processUserQuery(query) {
    try {
      showLoading(true);
      
      const aiService = window.app.aiService;
      const firebaseService = window.app.firebaseService;
      const chartManager = window.app.chartManager;
      
      // Limpar área de visualização personalizada se existir
      const customVisualization = document.getElementById('custom-visualization');
      if (customVisualization) {
        customVisualization.remove();
      }
      
      // Processar consulta via serviço de IA
      const queryParams = await aiService.processQuery(query);
      
      // Verificar se a consulta foi compreendida
      if (queryParams.intention === 'UNKNOWN') {
        throw new Error(queryParams.message || "Não foi possível entender sua consulta.");
      }
      
      // Executar consulta apropriada baseada na intenção
      let result;
      switch (queryParams.intention) {
        case 'VISUALIZE':
          // Criar visualização simples
          result = await handleVisualization(queryParams, firebaseService, chartManager);
          break;
        case 'VISUALIZE_TREND':
          // Criar visualização de tendência
          result = await handleTrendVisualization(queryParams, firebaseService, chartManager);
          break;
        case 'COMPARE':
          // Criar comparação
          result = await handleComparison(queryParams, firebaseService, chartManager);
          break;
        case 'LIST':
          // Criar listagem
          result = await handleListing(queryParams, firebaseService, chartManager);
          break;
        default:
          throw new Error("Tipo de consulta não suportado.");
      }
      
      // Gerar insights baseados nos resultados
      const insights = aiService.generateInsights(result);
      updateInsights(insights);
      
      showLoading(false);
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      showError("Não foi possível processar sua consulta. Por favor, tente novamente.");
      showLoading(false);
    }
  }
  
  // Funções auxiliares para processamento de consultas
  async function handleVisualization(queryParams, firebaseService, chartManager) {
    // Implementação simplificada para visualização
    console.log('Criando visualização para:', queryParams);
    
    // Simulação de dados para desenvolvimento
    const mockData = simulateData(queryParams);
    
    // Criar visualização apropriada
    if (queryParams.visualization === 'BAR_CHART') {
      createBarChart(mockData, queryParams, chartManager);
    } else if (queryParams.visualization === 'LINE_CHART') {
      createLineChart(mockData, queryParams, chartManager);
    } else if (queryParams.visualization === 'PIE_CHART') {
      createPieChart(mockData, queryParams, chartManager);
    } else if (queryParams.visualization === 'TABLE') {
      createTable(mockData, queryParams, chartManager);
    }
    
    return mockData;
  }
  
  async function handleTrendVisualization(queryParams, firebaseService, chartManager) {
    // Implementação simplificada para visualização de tendência
    console.log('Criando visualização de tendência para:', queryParams);
    
    // Simulação de dados para desenvolvimento
    const mockData = simulateTrendData(queryParams);
    
    // Criar gráfico de linha para tendência
    createLineChart(mockData, queryParams, chartManager);
    
    return mockData;
  }
  
  async function handleComparison(queryParams, firebaseService, chartManager) {
    // Implementação simplificada para comparação
    console.log('Criando comparação para:', queryParams);
    
    // Simulação de dados para desenvolvimento
    const mockData = simulateComparisonData(queryParams);
    
    // Criar gráfico de barras para comparação
    createBarChart(mockData, queryParams, chartManager);
    
    return mockData;
  }
  
  async function handleListing(queryParams, firebaseService, chartManager) {
    // Implementação simplificada para listagem
    console.log('Criando listagem para:', queryParams);
    
    // Simulação de dados para desenvolvimento
    const mockData = simulateListData(queryParams);
    
    // Criar tabela para listagem
    createTable(mockData, queryParams, chartManager);
    
    return mockData;
  }
  
  // Funções para criar visualizações
  function createBarChart(data, queryParams, chartManager) {
    // Criar área para visualização personalizada
    const customViz = getOrCreateCustomVisualization();
    
    // Configurar título
    const title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = getTitle(queryParams);
    customViz.appendChild(title);
    
    // Criar container para o gráfico
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');
    customViz.appendChild(chartContainer);
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    canvas.id = 'custom-chart';
    chartContainer.appendChild(canvas);
    
    // Criar gráfico usando Chart.js
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: data.label,
          data: data.values,
          backgroundColor: '#3b82f6',
          borderColor: '#1a56db',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  function createLineChart(data, queryParams, chartManager) {
    // Criar área para visualização personalizada
    const customViz = getOrCreateCustomVisualization();
    
    // Configurar título
    const title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = getTitle(queryParams);
    customViz.appendChild(title);
    
    // Criar container para o gráfico
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');
    customViz.appendChild(chartContainer);
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    canvas.id = 'custom-chart';
    chartContainer.appendChild(canvas);
    
    // Criar gráfico usando Chart.js
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: data.label,
          data: data.values,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#1a56db',
          borderWidth: 2,
          tension: 0.2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  function createPieChart(data, queryParams, chartManager) {
    // Criar área para visualização personalizada
    const customViz = getOrCreateCustomVisualization();
    
    // Configurar título
    const title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = getTitle(queryParams);
    customViz.appendChild(title);
    
    // Criar container para o gráfico
    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');
    customViz.appendChild(chartContainer);
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    canvas.id = 'custom-chart';
    chartContainer.appendChild(canvas);
    
    // Criar gráfico usando Chart.js
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#ec4899'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  
  function createTable(data, queryParams, chartManager) {
    // Criar área para visualização personalizada
    const customViz = getOrCreateCustomVisualization();
    
    // Configurar título
    const title = document.createElement('h3');
    title.classList.add('card-title');
    title.textContent = getTitle(queryParams);
    customViz.appendChild(title);
    
    // Criar container para a tabela
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    customViz.appendChild(tableContainer);
    
    // Criar tabela
    const table = document.createElement('table');
    table.classList.add('data-table');
    tableContainer.appendChild(table);
    
    // Criar cabeçalho
    const thead = document.createElement('thead');
    table.appendChild(thead);
    
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
    
    data.columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });
    
    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    data.rows.forEach(row => {
      const tr = document.createElement('tr');
      tbody.appendChild(tr);
      
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
    });
  }
  
  // Funções auxiliares
  function getOrCreateCustomVisualization() {
    let customViz = document.getElementById('custom-visualization');
    
    if (!customViz) {
      customViz = document.createElement('div');
      customViz.id = 'custom-visualization';
      customViz.classList.add('card', 'fade-in');
      
      // Inserir após os gráficos principais
      const dashboard = document.querySelector('.dashboard');
      if (dashboard && dashboard.parentNode) {
        dashboard.parentNode.insertBefore(customViz, dashboard.nextSibling);
      } else {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.appendChild(customViz);
        }
      }
    } else {
      // Limpar conteúdo existente
      customViz.innerHTML = '';
    }
    
    return customViz;
  }
  
  function getTitle(queryParams) {
    if (queryParams.intention === 'VISUALIZE') {
      return `Visualização de ${queryParams.metric || 'dados'}`;
    } else if (queryParams.intention === 'VISUALIZE_TREND') {
      return `Tendência de ${queryParams.metric || 'dados'} ao longo do tempo`;
    } else if (queryParams.intention === 'COMPARE') {
      return `Comparação de ${queryParams.metric || 'dados'}`;
    } else if (queryParams.intention === 'LIST') {
      return `Listagem de ${queryParams.metric || 'dados'}`;
    }
    return 'Visualização Personalizada';
  }
  
  // Atualizar métricas na interface
  function updateMetrics(metrics) {
    const complianceRateElement = document.getElementById('compliance-rate');
    const totalInspectionsElement = document.getElementById('total-inspections');
    const nonComplianceCountElement = document.getElementById('non-compliance-count');
    
    if (complianceRateElement) {
      complianceRateElement.textContent = `${metrics.complianceRate}%`;
    }
    
    if (totalInspectionsElement) {
      totalInspectionsElement.textContent = metrics.totalInspections.toLocaleString('pt-BR');
    }
    
    if (nonComplianceCountElement) {
      nonComplianceCountElement.textContent = metrics.nonCompliantCount.toLocaleString('pt-BR');
    }
  }
  
  // Atualizar tabela de inspeções recentes
  function updateRecentInspectionsTable(inspections) {
    const tableBody = document.querySelector('#recent-inspections');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    inspections.forEach(inspection => {
      const row = document.createElement('tr');
      
      // Formatar data
      let formattedDate;
      if (inspection.timestamp) {
        const date = inspection.timestamp instanceof Date ? 
          inspection.timestamp : 
          (inspection.timestamp.toDate ? inspection.timestamp.toDate() : new Date(inspection.timestamp));
        formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);
      } else {
        formattedDate = 'N/A';
      }
      
      // Criar células
      const dateCell = document.createElement('td');
      dateCell.textContent = formattedDate;
      
      const typeCell = document.createElement('td');
      typeCell.textContent = inspection.planName || 'Não especificado';
      
      const plateCell = document.createElement('td');
      plateCell.textContent = inspection.vehiclePlate || 'Não especificado';
      
      const driverCell = document.createElement('td');
      driverCell.textContent = inspection.driverName || 'Não especificado';
      
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.classList.add('status-badge');
      
      if (inspection.compliant) {
        statusBadge.classList.add('success');
        statusBadge.textContent = 'Conforme';
      } else {
        statusBadge.classList.add('error');
        statusBadge.textContent = 'Não Conforme';
      }
      
      statusCell.appendChild(statusBadge);
      
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
      } else if (insight.type === 'warning') {
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9V12M12 16H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      } else {
        iconSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      
      iconDiv.innerHTML = iconSvg;
      
      const contentDiv = document.createElement('div');
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
        document.querySelector('.main-content').appendChild(loadingElement);
      }
    } else if (loadingElement) {
      loadingElement.remove();
    }
  }
  
  // Mostrar mensagem de erro
  function showError(message) {
    // Implementar notificação de erro
    alert(message);
  }
  
  // Funções para simular dados durante desenvolvimento
  function simulateData(queryParams) {
    if (queryParams.metric === 'compliance_rate' && queryParams.groupBy === 'vehicle_type') {
      return {
        labels: ['Veículos Leves', 'Veículos Médios', 'Veículos Pesados', 'Veículos Especiais'],
        values: [83, 73, 74, 62],
        label: 'Taxa de Conformidade (%)'
      };
    } else if (queryParams.metric === 'total_inspections' && queryParams.groupBy === 'vehicle_type') {
      return {
        labels: ['Veículos Leves', 'Veículos Médios', 'Veículos Pesados', 'Veículos Especiais'],
        values: [1250, 850, 620, 320],
        label: 'Total de Inspeções'
      };
    }
    
    // Dados genéricos
    return {
      labels: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D', 'Categoria E'],
      values: [65, 59, 80, 81, 56],
      label: 'Valor'
    };
  }
  
  function simulateTrendData(queryParams) {
    return {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      values: [70, 73, 75, 80, 84, 85],
      label: 'Taxa de Conformidade (%)'
    };
  }
  
  function simulateComparisonData(queryParams) {
    return {
      labels: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília'],
      values: [80, 75, 85, 70],
      label: 'Taxa de Conformidade (%)'
    };
  }
  
  function simulateListData(queryParams) {
    if (queryParams.metric === 'non_compliance' && queryParams.groupBy === 'driver') {
      return {
        columns: ['Motorista', 'Total de Inspeções', 'Não Conformidades', 'Taxa de Conformidade'],
        rows: [
          ['Pedro Santos', '110', '31', '71.8%'],
          ['Carlos Ferreira', '105', '28', '73.3%'],
          ['João Silva', '120', '24', '80.0%'],
          ['Ana Costa', '85', '12', '85.9%'],
          ['Maria Oliveira', '95', '8', '91.6%']
        ]
      };
    }
    
    // Dados genéricos
    return {
      columns: ['Item', 'Valor A', 'Valor B', 'Valor C'],
      rows: [
        ['Item 1', '10', '20', '30'],
        ['Item 2', '15', '25', '35'],
        ['Item 3', '20', '30', '40'],
        ['Item 4', '25', '35', '45'],
        ['Item 5', '30', '40', '50']
      ]
    };
  }
});
