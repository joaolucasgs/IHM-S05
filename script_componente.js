class AulasComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.hoje = "ter";
    this._loaded = false;
  }

  connectedCallback() {
    this.loadData();
  }

  async loadData() {
    try {
      const response = await fetch("aulas.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const aulas = await response.json();
      this._loaded = true;
      this.render(aulas);
    } catch (error) {
      console.error("Erro ao carregar os dados das aulas:", error);
      this.render([], error);
    }
  }

  render(aulas, erro = null) {
    // Limpa conteúdo mantendo link CSS se já criado
    if (!this._cssAppended) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles_componente.css";
      this.shadowRoot.appendChild(link);
      this._cssAppended = true;
    }
    // Remove tudo após o link
    Array.from(this.shadowRoot.childNodes).forEach((n, idx) => {
      if (idx > 0) this.shadowRoot.removeChild(n);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "aulas-wrapper";

    if (erro) {
      const divErro = document.createElement("div");
      divErro.className = "erro-aulas";
      divErro.textContent =
        "Não foi possível carregar as aulas. Verifique o arquivo aulas.json.";
      wrapper.appendChild(divErro);
      this.shadowRoot.appendChild(wrapper);
      return;
    }

    const aulasDia = aulas.filter((a) => a.data === this.hoje);
    if (!aulasDia.length) {
      const vazio = document.createElement("div");
      vazio.className = "comp-aula";
      vazio.textContent = `Nenhuma aula para hoje (${this.hoje}).`;
      wrapper.appendChild(vazio);
      this.shadowRoot.appendChild(wrapper);
      return;
    }

    aulasDia.forEach((a) => {
      const card = document.createElement("div");
      card.className = "comp-aula";

      const prova = document.createElement("div");
      prova.className = "lable-prova p_lable";
      if (!a.prova_alert) prova.style.display = "none";
      prova.innerHTML = `PROVA: <b>${a.prova}</b>`;

      const titulo = document.createElement("div");
      titulo.className = "titulo_aula";
      titulo.textContent = a.disciplina;

      const pLocal = document.createElement("p");
      pLocal.className = "p";
      pLocal.innerHTML = `Local e Horário: <b>${a.local} - ${a.horario}</b>`;

      const labels = document.createElement("div");
      labels.className = "lables";

      const freq = document.createElement("div");
      freq.className = "lable-frequencia p_lable";
      freq.innerHTML = `FALTAS: <b>${a.frequencia}</b>`;

      const notaDiv = document.createElement("div");
      notaDiv.className = "lable-nota p_lable";
      const notaNum = parseFloat(a.nota);
      if (!isNaN(notaNum)) {
        if (notaNum < 6) notaDiv.classList.add("nota-baixa");
        else if (notaNum < 8) notaDiv.classList.add("nota-media");
        else notaDiv.classList.add("nota-alta");
      }
      notaDiv.innerHTML = `CR: <b>${a.nota}</b>`;

      labels.appendChild(freq);
      labels.appendChild(notaDiv);

      card.appendChild(prova);
      card.appendChild(titulo);
      card.appendChild(pLocal);
      card.appendChild(labels);

      wrapper.appendChild(card);
    });

    this.shadowRoot.appendChild(wrapper);
  }
}

customElements.define("aulas-component", AulasComponent);
