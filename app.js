// Inicializar serviços
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar serviços
    const firebaseService = new FirebaseService();
    const aiService = new AIService();
    const chartManager = new ChartManager();

    // Carregar dados iniciais
    loadInitialData();

    // Configurar eventos
    setupEventListeners();

    // Função para carregar dados iniciais
    async function loadInitialData() {
        try {
            showLoading(true);
            
            // Obter dados do Firebase
            const data = await firebaseService.getChecklistData();
            
            // Renderizar métricas gerais
            renderGeneralMetrics(data.generalMetrics);
            
            // Renderizar gráficos
            renderCharts(data);
            
            // Renderizar tabela de inspeções recentes
            renderRecentInspections(data.recentInspections);
            
            // Renderizar insights
            renderInsights(aiService.generateInsights(data));
            
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
        } finally {
            showLoading(false);
        }
    }

    // Configurar listeners de eventos
    function setupEventListeners() {
        // Processar consulta quando o botão for clicado
        document.getElementById('submit-query').addEventListener('click', async () => {
            processUserQuery();
        });
        
        // Processar consulta quando Enter for pressionado no campo de entrada
        document.getElementById('query-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                processUserQuery();
            }
        });
        
        // Configurar chips de sugestão
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.getElementById('query-input').value = chip.textContent;
                processUserQuery();
            });
        });
    }
    
    // Processar consulta do usuário
    async function processUserQuery() {
        const queryInput = document.getElementById('query-input');
        const query = queryInput.value.trim();
        
        if (!query) return;
        
        try {
            showLoading(true);
            
            // Processar consulta via serviço de IA
            const response = await aiService.processQuery(query);
            
            // Verificar se a resposta é válida
            if (response && response.intention !== 'UNKNOWN') {
                // Processar resposta válida
                processResponse(response);
                // Limpar mensagem de erro se existir
                const errorElement = document.querySelector('.error-message');
                if (errorElement) errorElement.remove();
            } else {
                // Mostrar mensagem de erro apenas se a intenção for desconhecida
                if (response.intention === 'UNKNOWN') {
                    showError("Não foi possível processar sua consulta. Por favor, tente novamente.");
                } else {
                    // Processar resposta mesmo assim
                    processResponse(response);
                }
            }
        } catch (error) {
            console.error("Erro ao processar consulta:", error);
            showError("Ocorreu um erro ao processar sua consulta. Por favor, tente novamente.");
        } finally {
            showLoading(false);
        }
    }

    // Função para mostrar erro (sem popup, apenas mensagem na interface)
    function showError(message) {
        // Remover mensagem de erro anterior se existir
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        // Criar elemento de erro
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.textContent = message;
        
        // Inserir após o campo de consulta
        const queryContainer = document.querySelector('.query-input-container');
        queryContainer.parentNode.insertBefore(errorElement, queryContainer.nextSibling);
        
        // Remover após 5 segundos
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    // Processar resposta da IA
    function processResponse(response) {
        console.log("Processando resposta:", response);
        
        // Limpar visualizações anteriores
        clearVisualizations();
        
        // Processar com base na intenção
        switch (response.intention) {
            case 'VISUALIZE':
                renderVisualization(response);
                break;
            case 'VISUALIZE_TREND':
                renderTrendVisualization(response);
                break;
            case 'LIST':
                renderList(response);
                break;
            case 'COMPARE':
                renderComparison(response);
                break;
            default:
                // Mostrar mensagem de erro para intenções não reconhecidas
                showError("Não foi possível processar sua consulta. Por favor, tente novamente.");
        }
    }

    // Limpar visualizações anteriores
    function clearVisualizations() {
        const visualizationContainers = document.querySelectorAll('.chart-container, .data-table-container');
        visualizationContainers.forEach(container => {
            // Manter o container, mas limpar o conteúdo
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        });
    }

    // Renderizar visualização baseada na resposta
    function renderVisualization(response) {
        console.log("Renderizando visualização:", response);
        
        // Obter dados para a visualização
        const data = getDataForVisualization(response);
        
        // Renderizar visualização apropriada
        if (response.visualization === 'BAR_CHART') {
            chartManager.renderBarChart(
                document.querySelector('.chart-container:nth-child(1)'),
                data.labels,
                data.values,
                data.label
            );
        } else if (response.visualization === 'PIE_CHART') {
            chartManager.renderPieChart(
                document.querySelector('.chart-container:nth-child(1)'),
                data.labels,
                data.values,
                data.label
            );
        }
    }

    // Renderizar visualização de tendência
    function renderTrendVisualization(response) {
        console.log("Renderizando tendência:", response);
        
        // Obter dados para a visualização de tendência
        const data = getDataForTrendVisualization(response);
        
        // Renderizar gráfico de linha
        chartManager.renderLineChart(
            document.querySelector('.chart-container:nth-child(2)'),
            data.labels,
            data.values,
            data.label
        );
    }

    // Renderizar lista baseada na resposta
    function renderList(response) {
        console.log("Renderizando lista:", response);
        
        // Obter dados para a lista
        const data = getDataForList(response);
        
        // Renderizar tabela
        chartManager.renderTable(
            document.querySelector('.data-table-container'),
            data.columns,
            data.rows
        );
    }

    // Renderizar comparação baseada na resposta
    function renderComparison(response) {
        console.log("Renderizando comparação:", response);
        
        // Obter dados para a comparação
        const data = getDataForComparison(response);
        
        // Renderizar gráfico de barras para comparação
        chartManager.renderBarChart(
            document.querySelector('.chart-container:nth-child(1)'),
            data.labels,
            data.values,
            data.label
        );
    }

    // Obter dados para visualização
    function getDataForVisualization(queryParams) {
        // Simulação de dados para visualização
        if (queryParams.metric === 'total_inspections' && queryParams.groupBy === 'vehicle_type') {
            return {
                labels: ['Veículos Leves', 'Veículos Médios', 'Veículos Pesados', 'Veículos Especiais'],
                values: [450, 320, 180, 129],
                label: 'Total de Inspeções'
            };
        }
        
        // Dados genéricos
        return {
            labels: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D'],
            values: [120, 150, 180, 90],
            label: 'Valor'
        };
    }

    // Obter dados para visualização de tendência
    function getDataForTrendVisualization(queryParams) {
        // Simulação de dados para tendência
        if (queryParams.metric === 'compliance_rate' && queryParams.period === 'monthly') {
            return {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                values: [65, 68, 72, 75, 80, 85],
                label: 'Taxa de Conformidade (%)'
            };
        }
        
        // Dados genéricos
        return {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            values: [10, 20, 15, 25, 30, 35],
            label: 'Valor'
        };
    }

    // Obter dados para lista
    function getDataForList(queryParams) {
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

    // Obter dados para comparação
    function getDataForComparison(queryParams) {
        if (queryParams.metric === 'compliance_rate' && queryParams.groupBy === 'garage') {
            return {
                labels: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília'],
                values: [80, 75, 85, 70],
                label: 'Taxa de Conformidade (%)'
            };
        }
        
        // Dados genéricos
        return {
            labels: ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D'],
            values: [40, 60, 50, 70],
            label: 'Valor'
        };
    }

    // Renderizar métricas gerais
    function renderGeneralMetrics(metrics) {
        document.getElementById('compliance-rate').textContent = metrics.complianceRate + '%';
        document.getElementById('total-inspections').textContent = metrics.totalInspections;
        document.getElementById('non-compliances').textContent = metrics.nonCompliances;
    }

    // Renderizar gráficos iniciais
    function renderCharts(data) {
        // Renderizar gráfico de conformidade por tipo de veículo
        chartManager.renderBarChart(
            document.querySelector('.chart-container:nth-child(1)'),
            data.vehicleTypeData.labels,
            data.vehicleTypeData.values,
            'Taxa de Conformidade (%)'
        );
        
        // Renderizar gráfico de tendência de conformidade
        chartManager.renderLineChart(
            document.querySelector('.chart-container:nth-child(2)'),
            data.trendData.labels.map(date => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getFullYear()}`;
            }),
            data.trendData.values,
            'Taxa de Conformidade (%)'
        );
    }

    // Renderizar tabela de inspeções recentes
    function renderRecentInspections(inspections) {
        const tableContainer = document.querySelector('.data-table-container');
        
        // Criar tabela
        const table = document.createElement('table');
        table.classList.add('data-table');
        
        // Criar cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Data', 'Tipo de Veículo', 'Placa', 'Motorista', 'Status'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Criar corpo da tabela
        const tbody = document.createElement('tbody');
        
        inspections.forEach(inspection => {
            const row = document.createElement('tr');
            
            // Data formatada
            const dateCell = document.createElement('td');
            const date = new Date(inspection.timestamp);
            dateCell.textContent = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            row.appendChild(dateCell);
            
            // Tipo de veículo
            const typeCell = document.createElement('td');
            typeCell.textContent = inspection.planName;
            row.appendChild(typeCell);
            
            // Placa
            const plateCell = document.createElement('td');
            plateCell.textContent = inspection.vehiclePlate;
            row.appendChild(plateCell);
            
            // Motorista
            const driverCell = document.createElement('td');
            driverCell.textContent = inspection.driverName;
            row.appendChild(driverCell);
            
            // Status
            const statusCell = document.createElement('td');
            const statusSpan = document.createElement('span');
            statusSpan.classList.add('status');
            statusSpan.classList.add(inspection.compliant ? 'status-success' : 'status-error');
            statusSpan.textContent = inspection.compliant ? 'Conforme' : 'Não Conforme';
            statusCell.appendChild(statusSpan);
            row.appendChild(statusCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    // Renderizar insights
    function renderInsights(insights) {
        const insightsList = document.querySelector('.insights-list');
        if (!insightsList) return;
        
        // Limpar insights anteriores
        insightsList.innerHTML = '';
        
        // Adicionar novos insights
        insights.forEach(insight => {
            const insightItem = document.createElement('div');
            insightItem.classList.add('insight-item');
            
            const iconDiv = document.createElement('div');
            iconDiv.classList.add('insight-icon');
            iconDiv.classList.add(`insight-${insight.type}`);
            
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
                
                document.body.appendChild(loadingElement);
            }
        } else if (loadingElement) {
            loadingElement.remove();
        }
    }
});
