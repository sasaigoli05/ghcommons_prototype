async function loadBundle() {
  const response = await fetch('fhir_bundle.json');
  const bundle = await response.json();
  const rows = [];

  const patients = {};
  const encounters = {};
  const conditions = {};

  for (const e of bundle.entry) {
    const r = e.resource;
    if (r.resourceType === 'Patient') patients[r.id] = r;
    if (r.resourceType === 'Encounter') encounters[r.id] = r;
    if (r.resourceType === 'Condition') conditions[r.id] = r;
  }

  const tbody = document.querySelector('#cases-table tbody');
  tbody.innerHTML = '';

  Object.keys(patients).forEach(id => {
    const p = patients[id];
    const enc = encounters[id];
    const cond = conditions[id];
    const tr = document.createElement('tr');
    const countryExt = p.extension?.find(e => e.url.includes('patient-country'));
    const country = countryExt ? countryExt.valueString : '';

    tr.innerHTML = `
      <td>${id}</td>
      <td>${country}</td>
      <td>${p.extension_age ?? ''}</td>
      <td>${cond?.code?.text ?? ''}</td>
      <td>${enc?.period?.start ?? ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setupChatbot() {
  const input = document.getElementById('chat-text');
  const send = document.getElementById('chat-send');
  const messages = document.getElementById('messages');

  function addMessage(text, who) {
    const div = document.createElement('div');
    div.className = 'message ' + who;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  send.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';

    // Dumb canned responses as a navigator, not a real AI
    if (text.toLowerCase().includes('sierra')) {
      addMessage('Filter the table by Country = Sierra Leone to see those cases.', 'bot');
    } else if (text.toLowerCase().includes('cameroon')) {
      addMessage('Look for rows where Country = Cameroon.', 'bot');
    } else if (text.toLowerCase().includes('oncho')) {
      addMessage('Use the Condition column and filter for Onchocerciasis/Oncho.', 'bot');
    } else {
      addMessage("I'm a mock assistant. Try asking about a country or condition keyword.", 'bot');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadBundle();
  setupChatbot();
});
