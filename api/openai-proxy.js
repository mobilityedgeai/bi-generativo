const axios = require('axios');

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Lidar com requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verificar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    console.log('Recebendo requisição:', req.body);
    
    // Fazer requisição para a OpenAI
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      data: req.body
    } );
    
    console.log('Resposta da OpenAI:', response.data);
    
    // Retornar resposta
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro na chamada à API OpenAI:', error.message);
    
    // Tratar erro
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Erro interno do servidor'
    });
  }
};
