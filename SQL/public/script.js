const tabLogin = document.getElementById('tab-login');
const tabCadastro = document.getElementById('tab-cadastro');
const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');
const loginMsg = document.getElementById('login-msg');
const registerMsg = document.getElementById('register-msg');

// Função para alternar abas
function activate(tab) {
  const loginActive = tab === 'login';
  tabLogin.classList.toggle('active', loginActive);
  tabLogin.setAttribute('aria-selected', String(loginActive));
  tabCadastro.classList.toggle('active', !loginActive);
  tabCadastro.setAttribute('aria-selected', String(!loginActive));
  formLogin.classList.toggle('hidden', !loginActive);
  formCadastro.classList.toggle('hidden', loginActive);
}

tabLogin.addEventListener('click', () => activate('login'));
tabCadastro.addEventListener('click', () => activate('cadastro'));

// Função genérica para enviar formulário via fetch
async function handleFormSubmit(e, url, msgDiv) {
  e.preventDefault();
  msgDiv.textContent = ''; // limpa mensagem anterior
  msgDiv.style.color = ''; // reseta cor

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const text = await res.text();

    if (res.ok) {
      msgDiv.textContent = text;        // mensagem de sucesso do backend
      msgDiv.style.color = '#22c55e';   // verde
      e.target.reset();                 // limpa formulário
    } else {
      msgDiv.textContent = text;        // mensagem de erro do backend
      msgDiv.style.color = '#f87171';   // vermelho
    }
  } catch (err) {
    msgDiv.textContent = 'Erro de conexão com o servidor.';
    msgDiv.style.color = '#f87171';
  }
}

// Eventos dos formulários
formLogin.addEventListener('submit', (e) => handleFormSubmit(e, '/login', loginMsg));
formCadastro.addEventListener('submit', (e) => handleFormSubmit(e, '/register', registerMsg));
