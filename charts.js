// Gerenciador de gráficos e visualizações
// Este arquivo gerencia a criação e atualização de gráficos

class ChartManager {
  constructor() {
    // Armazenar referências aos gráficos
    this.charts = {};
    
    // Configurações de cores
    this.colors = {
      primary: '#1a56db',
      primaryLight: '#3b82f6',
      secondary: '#e0f2fe',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      textPrimary: '#1e293b',
      textSecondary: '#64748b'
    };
    
    // Configurações padrão para gráficos
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12
            },
            color: this.colors.textSecondary
          }
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: this.colors.textPrimary,
          bodyColor: this.colors.textSecondary,
          borderColor: this.colors.secondary,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 13
          },
          displayColors: true,
          boxPadding: 4
        }
      }
    };
  }
  
  // Criar gráfico de conformidade por tipo de veículo
  createVehicleTypeChart(data) {
    const ctx = document.getElementById('vehicle-type-chart').getContext('2d');
    
    // Preparar dados para o gráfico
    const labels = data.map(item => item.type);
    const complianceRates = data.map(item => item.complianceRate);
    
    // Destruir gráfico existente se houver
    if (this.charts.vehicleType) {
      this.charts.vehicleType.destroy();
    }
    
    // Criar novo gráfico
    this.charts.vehicleType = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taxa de Conformidade (%)',
          data: complianceRates,
          backgroundColor: this.colors.primaryLight,
          borderColor: this.colors.primary,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          ...this.defaultOptions.plugins,
          title: {
            display: false,
            text: 'Taxa de Conformidade por Tipo de Veículo',
            font: {
              family: "'Inter', sans-serif",
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
    
    return this.charts.vehicleType;
  }
  
  // Criar gráfico de tendência de conformidade
  createComplianceTrendChart(data) {
    const ctx = document.getElementById('compliance-trend-chart').getContext('2d');
    
    // Preparar dados para o gráfico
    const labels = data.map(item => {
      const date = item.month;
      return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
    });
    
    const complianceRates = data.map(item => item.complianceRate);
    
    // Destruir gráfico existente se houver
    if (this.charts.complianceTrend) {
      this.charts.complianceTrend.destroy();
    }
    
    // Criar novo gráfico
    this.charts.complianceTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taxa de Conformidade (%)',
          data: complianceRates,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: this.colors.primary,
          borderWidth: 2,
          pointBackgroundColor: this.colors.primary,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.2
        }]
      },
      options: {
        ...this.defaultOptions,
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(100, Math.ceil(Math.max(...complianceRates) / 10) * 10),
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
    
    return this.charts.complianceTrend;
  }
  
  // Criar gráfico personalizado baseado na consulta do usuário
  createCustomChart(type, data, options = {}) {
    // Criar container para o gráfico personalizado
    let customContainer = document.getElementById('custom-visualization');
    
    if (!customContainer) {
      customContainer = document.createElement('div');
      customContainer.id = 'custom-visualization';
      customContainer.classList.add('card', 'fade-in');
      
      const title = document.createElement('h3');
      title.classList.add('card-title');
      title.textContent = options.title || 'Visualização Personalizada';
      
      const chartContainer = document.createElement('div');
      chartContainer.classList.add('chart-container');
      
      const canvas = document.createElement('canvas');
      canvas.id = 'custom-chart';
      
      chartContainer.appendChild(canvas);
      customContainer.appendChild(title);
      customContainer.appendChild(chartContainer);
      
      // Inserir após os gráficos principais
      const dashboard = document.querySelector('.dashboard');
      dashboard.parentNode.insertBefore(customContainer, dashboard.nextSibling);
    }
    
    const ctx = document.getElementById('custom-chart').getContext('2d');
    
    // Destruir gráfico existente se houver
    if (this.charts.custom) {
      this.charts.custom.destroy();
    }
    
    // Configurar opções baseadas no tipo
    let chartOptions = { ...this.defaultOptions };
    
    if (type === 'bar') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(226, 232, 240, 0.5)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      };
    } else if (type === 'line') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(226, 232, 240, 0.5)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      };
    } else if (type === 'pie' || type === 'doughnut') {
      chartOptions.cutout = type === 'doughnut' ? '60%' : undefined;
    }
    
    // Mesclar com opções personalizadas
    chartOptions = { ...chartOptions, ...options };
    
    // Criar novo gráfico
    this.charts.custom = new Chart(ctx, {
      type: type,
      data: data,
      options: chartOptions
    });
    
    return this.charts.custom;
  }
  
  // Criar tabela personalizada
  createCustomTable(data, columns, options = {}) {
    // Criar container para a tabela personalizada
    let customContainer = document.getElementById('custom-visualization');
    
    if (!customContainer) {
      customContainer = document.createElement('div');
      customContainer.id = 'custom-visualization';
      customContainer.classList.add('card', 'fade-in');
      
      const title = document.createElement('h3');
      title.classList.add('card-title');
      title.textContent = options.title || 'Visualização Personalizada';
      
      const tableContainer = document.createElement('div');
      tableContainer.classList.add('table-container');
      
      const table = document.createElement('table');
      table.id = 'custom-table';
      table.classList.add('data-table');
      
      tableContainer.appendChild(table);
      customContainer.appendChild(title);
      customContainer.appendChild(tableContainer);
      
      // Inserir após os gráficos principais
      const dashboard = document.querySelector('.dashboard');
      dashboard.parentNode.insertBefore(customContainer, dashboard.nextSibling);
    }
    
    const table = document.getElementById('custom-table');
    table.innerHTML = '';
    
    // Criar cabeçalho
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.label;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    
    data.forEach(item => {
      const row = document.createElement('tr');
      
      columns.forEach(column => {
        const td = document.createElement('td');
        
        // Verificar se há formatador personalizado
        if (column.format) {
          td.innerHTML = column.format(item[column.field], item);
        } else {
          td.textContent = item[column.field] || '';
        }
        
        row.appendChild(td);
      });
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    return table;
  }
}

// Processador de consultas em linguagem natural
class QueryProcessor {
  constructor(firebaseService, aiService, chartManager) {
    this.firebaseService = firebaseService;
    this.aiService = aiService;
    this.chartManager = chartManager;
    this.conversationContext = [];
  }
  
  // Processar consulta do usuário
  async processQuery(query) {
    try {
      // Adicionar consulta ao contexto
      this.conversationContext.push({
        role: 'user',
        content: query
      });
      
      // Processar consulta via serviço de IA
      const queryParams = await this.aiService.processQuery(query, this.conversationContext);
      
      // Verificar se a consulta foi compreendida
      if (queryParams.intention === 'UNKNOWN') {
        throw new Error(queryParams.message || "Não foi possível entender sua consulta.");
      }
      
      // Executar consulta apropriada baseada na intenção
      let result;
      switch (queryParams.intention) {
        case 'VISUALIZE':
          result = await this.handleVisualization(queryParams);
          break;
        case 'VISUALIZE_TREND':
          result = await this.handleTrendVisualization(queryParams);
          break;
        case 'COMPARE':
          result = await this.handleComparison(queryParams);
          break;
        case 'LIST':
          result = await this.handleListing(queryParams);
          break;
        default:
          throw new Error("Tipo de consulta não suportado.");
      }
      
      // Gerar insights baseados nos resultados
      const insights = this.aiService.generateInsights(result);
      this.updateInsights(insights);
      
      // Adicionar resposta ao contexto
      this.conversationContext.push({
        role: 'assistant',
        content: `Visualização criada: ${queryParams.visualization || 'personalizada'}`
      });
      
      // Limitar tamanho do contexto
      if (this.conversationContext.length > 10) {
        this.conversationContext = this.conversationContext.slice(-10);
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      throw error;
    }
  }
  
  // Lidar com visualização simples
  async handleVisualization(queryParams) {
    const { metric, groupBy, timeRange } = queryParams;
    
    // Construir filtros baseados nos parâmetros
    const filters = {};
    
    if (timeRange) {
      if (timeRange.period === 'this_month') {
        const now = new Date();
        filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (timeRange.period === 'last_month') {
        const now = new Date();
        filters.startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filters.endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (timeRange.startDate && timeRange.endDate) {
        filters.startDate = new Date(timeRange.startDate);
        filters.endDate = new Date(timeRange.endDate);
      }
    }
    
    // Obter dados do Firebase
    const data = await this.firebaseService.getChecklistData(filters);
    
    // Processar dados baseado no agrupamento
    let processedData;
    let chartType;
    let chartData;
    let chartOptions;
    
    if (groupBy === 'vehicle_type') {
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
      
      // Calcular métricas baseadas no tipo de métrica solicitada
      processedData = Object.entries(vehicleTypes).map(([type, counts]) => {
        let value;
        
        if (metric === 'compliance_rate') {
          value = (counts.compliant / counts.total) * 100;
        } else if (metric === 'non_compliance_rate') {
          value = ((counts.total - counts.compliant) / counts.total) * 100;
        } else if (metric === 'total_inspections') {
          value = counts.total;
        } else if (metric === 'compliant_inspections') {
          value = counts.compliant;
        } else if (metric === 'non_compliant_inspections') {
          value = counts.total - counts.compliant;
        }
        
        return {
          type,
          value,
          total: counts.total,
          compliant: counts.compliant
        };
      });
      
      // Ordenar dados
      processedData.sort((a, b) => b.value - a.value);
      
      // Preparar dados para o gráfico
      chartType = 'bar';
      chartData = {
        labels: processedData.map(item => item.type),
        datasets: [{
          label: this.getMetricLabel(metric),
          data: processedData.map(item => item.value),
          backgroundColor: this.chartManager.colors.primaryLight,
          borderColor: this.chartManager.colors.primary,
          borderWidth: 1,
          borderRadius: 4
        }]
      };
      
      // Configurar opções do gráfico
      chartOptions = {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (metric.includes('rate')) {
                  return value + '%';
                }
                return value;
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: this.getTitleForMetric(metric, groupBy, timeRange),
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      };
    }
    
    // Criar visualização
    this.chartManager.createCustomChart(chartType, chartData, chartOptions);
    
    return {
      processedData,
      chartType,
      chartData,
      chartOptions
    };
  }
  
  // Lidar com visualização de tendência
  async handleTrendVisualization(queryParams) {
    const { metric, timeRange } = queryParams;
    
    // Determinar período de tempo
    let months = 6;
    if (timeRange && timeRange.period) {
      if (timeRange.period === 'last_3_months') months = 3;
      else if (timeRange.period === 'last_6_months') months = 6;
      else if (timeRange.period === 'last_12_months') months = 12;
    }
    
    // Obter dados de tendência
    const trendData = await this.firebaseService.getComplianceTrend(months);
    
    // Preparar dados para o gráfico
    const labels = trendData.map(item => {
      const date = item.month;
      return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
    });
    
    let values;
    if (metric === 'compliance_rate') {
      values = trendData.map(item => item.complianceRate);
    } else if (metric === 'non_compliance_rate') {
      values = trendData.map(item => 100 - item.complianceRate);
    } else if (metric === 'total_inspections') {
      values = trendData.map(item => item.total);
    }
    
    const chartData = {
      labels: labels,
      datasets: [{
        label: this.getMetricLabel(metric),
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: this.chartManager.colors.primary,
        borderWidth: 2,
        pointBackgroundColor: this.chartManager.colors.primary,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.2
      }]
    };
    
    // Configurar opções do gráfico
    const chartOptions = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (metric.includes('rate')) {
                return value + '%';
              }
              return value;
            }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `Tendência de ${this.getMetricLabel(metric)} nos últimos ${months} meses`,
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    };
    
    // Criar visualização
    this.chartManager.createCustomChart('line', chartData, chartOptions);
    
    return {
      trendData,
      chartData,
      chartOptions
    };
  }
  
  // Lidar com comparação
  async handleComparison(queryParams) {
    const { metric, groupBy } = queryParams;
    
    // Implementação simplificada para comparação
    // Em uma implementação completa, isso seria mais sofisticado
    
    // Obter dados do Firebase
    const data = await this.firebaseService.getChecklistData();
    
    // Processar dados baseado no agrupamento
    // Este é um exemplo para comparação de garagens
    if (groupBy === 'garage') {
      // Simulação de dados de garagem (na implementação real, isso viria do Firebase)
      const garages = {
        'São Paulo': { total: 1200, compliant: 960 },
        'Rio de Janeiro': { total: 980, compliant: 735 },
        'Belo Horizonte': { total: 750, compliant: 638 },
        'Brasília': { total: 620, compliant: 496 }
      };
      
      // Calcular métricas
      const processedData = Object.entries(garages).map(([garage, counts]) => {
        const complianceRate = (counts.compliant / counts.total) * 100;
        
        return {
          garage,
          complianceRate,
          total: counts.total,
          compliant: counts.compliant,
          nonCompliant: counts.total - counts.compliant
        };
      });
      
      // Ordenar por taxa de conformidade
      processedData.sort((a, b) => b.complianceRate - a.complianceRate);
      
      // Preparar dados para o gráfico
      const chartData = {
        labels: processedData.map(item => item.garage),
        datasets: [{
          label: 'Taxa de Conformidade (%)',
          data: processedData.map(item => item.complianceRate),
          backgroundColor: this.chartManager.colors.primaryLight,
          borderColor: this.chartManager.colors.primary,
          borderWidth: 1,
          borderRadius: 4
        }]
      };
      
      // Configurar opções do gráfico
      const chartOptions = {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Comparação de Taxa de Conformidade por Garagem',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      };
      
      // Criar visualização
      this.chartManager.createCustomChart('bar', chartData, chartOptions);
      
      return {
        processedData,
        chartData,
        chartOptions
      };
    }
    
    throw new Error("Tipo de comparação não suportado.");
  }
  
  // Lidar com listagem
  async handleListing(queryParams) {
    const { metric, groupBy, orderBy, limit } = queryParams;
    
    // Implementação simplificada para listagem
    // Em uma implementação completa, isso seria mais sofisticado
    
    if (groupBy === 'driver' && metric === 'non_compliance') {
      // Simulação de dados de motoristas (na implementação real, isso viria do Firebase)
      const drivers = [
        { name: 'João Silva', total: 120, nonCompliant: 24, complianceRate: 80 },
        { name: 'Maria Oliveira', total: 95, nonCompliant: 8, complianceRate: 91.6 },
        { name: 'Pedro Santos', total: 110, nonCompliant: 31, complianceRate: 71.8 },
        { name: 'Ana Costa', total: 85, nonCompliant: 12, complianceRate: 85.9 },
        { name: 'Carlos Ferreira', total: 105, nonCompliant: 28, complianceRate: 73.3 },
        { name: 'Lúcia Martins', total: 90, nonCompliant: 5, complianceRate: 94.4 },
        { name: 'Roberto Almeida', total: 100, nonCompliant: 22, complianceRate: 78 }
      ];
      
      // Ordenar por não conformidades
      drivers.sort((a, b) => b.nonCompliant - a.nonCompliant);
      
      // Limitar resultados
      const limitedDrivers = drivers.slice(0, limit || 5);
      
      // Definir colunas para a tabela
      const columns = [
        { field: 'name', label: 'Motorista' },
        { field: 'total', label: 'Total de Inspeções' },
        { field: 'nonCompliant', label: 'Não Conformidades' },
        { field: 'complianceRate', label: 'Taxa de Conformidade', 
          format: (value) => `${value.toFixed(1)}%` }
      ];
      
      // Criar tabela personalizada
      this.chartManager.createCustomTable(limitedDrivers, columns, {
        title: 'Motoristas com Mais Não Conformidades'
      });
      
      return {
        drivers: limitedDrivers,
        columns
      };
    }
    
    throw new Error("Tipo de listagem não suportado.");
  }
  
  // Obter rótulo para métrica
  getMetricLabel(metric) {
    switch (metric) {
      case 'compliance_rate':
        return 'Taxa de Conformidade (%)';
      case 'non_compliance_rate':
        return 'Taxa de Não Conformidade (%)';
      case 'total_inspections':
        return 'Total de Inspeções';
      case 'compliant_inspections':
        return 'Inspeções Conformes';
      case 'non_compliant_inspections':
        return 'Inspeções Não Conformes';
      default:
        return metric;
    }
  }
  
  // Obter título para métrica
  getTitleForMetric(metric, groupBy, timeRange) {
    let title = '';
    
    // Adicionar métrica
    switch (metric) {
      case 'compliance_rate':
        title = 'Taxa de Conformidade';
        break;
      case 'non_compliance_rate':
        title = 'Taxa de Não Conformidade';
        break;
      case 'total_inspections':
        title = 'Total de Inspeções';
        break;
      case 'compliant_inspections':
        title = 'Inspeções Conformes';
        break;
      case 'non_compliant_inspections':
        title = 'Inspeções Não Conformes';
        break;
      default:
        title = metric;
    }
    
    // Adicionar agrupamento
    switch (groupBy) {
      case 'vehicle_type':
        title += ' por Tipo de Veículo';
        break;
      case 'driver':
        title += ' por Motorista';
        break;
      case 'garage':
        title += ' por Garagem';
        break;
    }
    
    // Adicionar período
    if (timeRange) {
      if (timeRange.period === 'this_month') {
        title += ' (Mês Atual)';
      } else if (timeRange.period === 'last_month') {
        title += ' (Mês Passado)';
      } else if (timeRange.period === 'this_year') {
        title += ' (Ano Atual)';
      }
    }
    
    return title;
  }
  
  // Atualizar insights na interface
  updateInsights(insights) {
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
}
