// Aplicação principal do BI Generativo
// Este arquivo gerencia a inicialização e coordenação dos componentes

// Esperar pelo carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar serviços
  const firebaseService = new FirebaseService();
  const aiService = new AIService();
  
  // Inicializar gerenciador de visualizações
  const chartManager = new ChartManager();
  
  // Inicializar processador de consultas
  const queryProcessor = new QueryProcessor(firebaseService, aiService, chartManager);
  
  // Carregar dados iniciais
  loadInitialData();
  
  // Configurar eventos de interface
  setupEventListeners();
  
  // Função para carregar dados iniciais
  async function loadInitialData() {
    try {
      showLoading(true);
      
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
    }
  }
  
  // Configurar eventos de interface
  function setupEventListeners() {
    // Evento de envio de consulta
    const queryInput = document.getElementById('query-input');
    const submitButton = document.getElementById('submit-query');
    
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
    
    // Evento de clique em sugestões
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.textContent;
        queryInput.value = query;
        processUserQuery(query);
      });
    });
  }
  
  // Processar consulta do usuário
  async function processUserQuery(query) {
    try {
      showLoading(true);
      
      // Limpar área de visualização personalizada se existir
      const customVisualization = document.getElementById('custom-visualization');
      if (customVisualization) {
        customVisualization.remove();
      }
      
      // Processar consulta
      await queryProcessor.processQuery(query);
      
      showLoading(false);
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      showError("Não foi possível processar sua consulta. Por favor, tente novamente.");
      showLoading(false);
    }
  }
  
  // Atualizar métricas na interface
  function updateMetrics(metrics) {
    document.getElementById('compliance-rate').textContent = `${metrics.complianceRate}%`;
    document.getElementById('total-inspections').textContent = metrics.totalInspections.toLocaleString('pt-BR');
    document.getElementById('non-compliance-count').textContent = metrics.nonCompliantCount.toLocaleString('pt-BR');
  }
  
  // Atualizar tabela de inspeções recentes
  function updateRecentInspectionsTable(inspections) {
    const tableBody = document.querySelector('#recent-inspections tbody');
    tableBody.innerHTML = '';
    
    inspections.forEach(inspection => {
      const row = document.createElement('tr');
      
      // Formatar data
      const date = inspection.timestamp.toDate();
      const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);
      
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
});
