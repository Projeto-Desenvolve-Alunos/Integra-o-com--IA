
// =======================
// Função para fazer requisição à IA
// =======================
const iaRequest = async (input, apiKey, ia, model) => {
  const iaURL = iaList[ia].url;
  const iaModel = iaList[ia].models.find((i) => i === model);
  if (!iaModel) return `Modelo ${model} não existe para ${ia}`;

  // Copia o corpo padrão
  const iaBodyRequest = JSON.parse(JSON.stringify(iaList[ia].body));

  // Monta o corpo da requisição
  if (ia === 'openai') {
    iaBodyRequest.messages[0].content = input;
    iaBodyRequest.model = iaModel;
  } else if (ia === 'gemini') {
    iaBodyRequest.contents[0].parts[0].text = input;
  }

  // Define os headers
  let header;
  if (ia === "gemini") {
    header = {
      "Content-Type": "application/json",
      "X-goog-api-key": `${apiKey}`
    };
  }
  if (ia === 'openai') {
    header = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
  }

  // Faz a requisição
  const response = await fetch(iaURL, {
    method: "POST",
    headers: header,
    body: JSON.stringify(iaBodyRequest)
  });

  const data = await response.json();

  // Retorna a resposta formatada
  if (ia === "openai") {
    return data?.choices?.[0]?.message?.content?.trim() || "Sem resposta";
  }
  if (ia === "gemini") {
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sem resposta";
  }

  return "Sem resposta";
};

// =======================
// Funções de Interface
// =======================
function mostrarResposta(texto) {
  const respostaContainer = document.getElementById('respostaContainer');
  const respostaTexto = document.getElementById('respostaTexto');
  respostaTexto.textContent = texto;
  respostaContainer.style.display = 'block';
}

function esconderResposta() {
  const respostaContainer = document.getElementById('respostaContainer');
  respostaContainer.style.display = 'none';
}

function mostrarLoading() {
  const loading = document.getElementById('loading');
  loading.style.display = 'block';
}

function esconderLoading() {
  const loading = document.getElementById('loading');
  loading.style.display = 'none';
}

function desabilitarBotao() {
  const botao = document.getElementById('perguntar');
  botao.disabled = true;
}

function habilitarBotao() {
  const botao = document.getElementById('perguntar');
  botao.disabled = false;
}

// =======================
// Evento do botão principal
// =======================
const botao = document.getElementById('perguntar');
const apiKeyInput = document.getElementById('apiKey');
const perguntaInput = document.getElementById('pergunta');
const modeloSelect = document.getElementById('modeloIA'); // dropdown para modelo
const iaSelect = document.getElementById('iaSelect'); // dropdown para escolher IA

// Funções de mensagem de erro
function mostrarErro(mensagem) {
  const erroDiv = document.getElementById('mensagemErro');
  erroDiv.textContent = mensagem;
  erroDiv.style.display = 'block';
}

function esconderErro() {
  const erroDiv = document.getElementById('mensagemErro');
  erroDiv.textContent = "";
  erroDiv.style.display = 'none';
}

botao.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const pergunta = perguntaInput.value.trim();
  const modelo = modeloSelect.value;
  const iaEscolhida = iaSelect.value;

  esconderErro(); // limpa mensagens antigas

  // Validação da API Key
  if (!apiKey) {
    mostrarErro("Por favor, insira sua API Key.");
    return;
  }

  // Validação da pergunta
  if (!pergunta) {
    mostrarErro("Por favor, digite sua pergunta.");
    return;
  }

  // Estado inicial antes da requisição
  esconderResposta();
  desabilitarBotao();
  mostrarLoading();

  try {
    const resposta = await iaRequest(pergunta, apiKey, iaEscolhida, modelo);
    mostrarResposta(resposta);
  } catch (erro) {
    mostrarErro("Erro ao buscar resposta. Tente novamente.");
  } finally {
    esconderLoading();
    habilitarBotao();
  }
});