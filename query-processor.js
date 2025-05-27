// Processador de consultas em linguagem natural
// Este arquivo gerencia a interpretação de consultas do usuário

// Esperar pelo carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Referência ao campo de entrada de consulta
  const queryInput = document.getElementById('query-input');
  const submitButton = document.getElementById('submit-query');
  
  // Configurar evento de envio
  if (submitButton && queryInput) {
    submitButton.addEventListener('click', () => {
      const query = queryInput.value.trim();
      if (query) {
        processQuery(query);
      }
    });
    
    queryInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const query = queryInput.value.trim();
        if (query) {
          processQuery(query);
        }
      }
    });
  }
  
  // Configurar eventos para chips de sugestão
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (queryInput) {
        queryInput.value = chip.textContent;
        processQuery(chip.textContent);
      }
    });
  });
  
  // Função para processar consulta
  async function processQuery(query) {
    console.log('Processando consulta:', query);
    
    // Mostrar indicador de carregamento
    showLoading(true);
    
    try {
      // Obter instâncias dos serviços
      const app = window.app || {};
      const aiService = app.aiService || new AIService();
      const firebaseService = app.firebaseService || new FirebaseService();
      const chartManager = app.chartManager || new ChartManager();
      
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
  
  function showLoading(isLoading) {
    let loadingElement = document.querySelector('.loading');
    
    if (isLoading) {
      if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.classList.add('loading');
        
        const spinner = document.createElement('div');
        spinner.classList.add('loading-spinner');
        
        loadingElement.appendChild(spinner);
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.appendChild(loadingElement);
        }
      }
    } else if (loadingElement) {
      loadingElement.remove();
    }
  }
  
  function showError(message) {
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
