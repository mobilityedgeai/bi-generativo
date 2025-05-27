// Inicialização do Firebase
// Este arquivo deve ser carregado antes de qualquer outro script relacionado ao Firebase

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase inicializado com sucesso");
}

// Variável global para controlar o estado da autenticação
window.authReady = false;

// Autenticação anônima
firebase.auth().signInAnonymously()
  .then(() => {
    console.log("Autenticado anonimamente com sucesso");
    window.authReady = true;
    
    // Disparar evento personalizado para notificar que a autenticação está pronta
    const authReadyEvent = new CustomEvent('auth-ready');
    document.dispatchEvent(authReadyEvent);
  })
  .catch((error) => {
    console.error("Erro na autenticação anônima:", error);
  });
