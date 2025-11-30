class ServicosComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cssAppended = false;
  }

  connectedCallback() {
    this.loadData();
  }

  async loadData() {
    try {
      const resp = await fetch("servicos.json");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const servicos = await resp.json();
      this.render(servicos);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      this.render([], err);
    }
  }

  render(servicos, erro = null) {
    if (!this._cssAppended) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles_componente.css";
      this.shadowRoot.appendChild(link);
      this._cssAppended = true;
    }

    Array.from(this.shadowRoot.childNodes).forEach((n, idx) => {
      if (idx > 0) this.shadowRoot.removeChild(n);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "servicos-wrapper";

    if (erro) {
      const errDiv = document.createElement("div");
      errDiv.className = "erro-aulas";
      errDiv.textContent = "Não foi possível carregar os serviços.";
      wrapper.appendChild(errDiv);
      this.shadowRoot.appendChild(wrapper);
      return;
    }

    const title = document.createElement("h3");
    title.textContent = "Serviços de Apoio Acadêmico";
    title.style.margin = "0 0 10px 0";
    wrapper.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "servicos-grid";

    servicos.forEach((s) => {
      const card = document.createElement("div");
      card.className = "servico-card";

      const h4 = document.createElement("div");
      h4.className = "titulo_aula";
      h4.textContent = s.titulo;

      const resumo = document.createElement("p");
      resumo.className = "p";
      resumo.textContent = s.resumo;

      const footer = document.createElement("div");
      footer.className = "evento-footer";

      const contato = document.createElement("div");
      contato.style.fontSize = "12px";
      contato.textContent = `✉️ ${s.contato}`;

      const btnMais = document.createElement("button");
      btnMais.className = "btn-primary";
      btnMais.textContent = "Ver mais";
      btnMais.addEventListener("click", () => this.openDetalhes(s));

      footer.appendChild(contato);
      footer.appendChild(btnMais);

      card.appendChild(h4);
      card.appendChild(resumo);
      card.appendChild(footer);

      grid.appendChild(card);
    });

    wrapper.appendChild(grid);

    this.shadowRoot.appendChild(wrapper);
  }

  openDetalhes(servico) {
    const overlay = document.createElement("div");
    overlay.className = "modal";

    const content = document.createElement("div");
    content.className = "modal-content";

    const h = document.createElement("h3");
    h.textContent = servico.titulo;

    const desc = document.createElement("p");
    desc.textContent = servico.descricao;

    const contato = document.createElement("p");
    contato.style.fontSize = "13px";
    contato.textContent = `Contato: ${servico.contato}`;

    content.appendChild(h);
    content.appendChild(desc);
    content.appendChild(contato);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginTop = "12px";

    const btnFechar = document.createElement("button");
    btnFechar.className = "btn-secondary";
    btnFechar.textContent = "Fechar";
    btnFechar.addEventListener("click", () => overlay.remove());

    actions.appendChild(btnFechar);

    if (servico.tem_agendamento) {
      const agendar = document.createElement("button");
      agendar.className = "btn-primary";
      agendar.textContent = "Agendar atendimento";
      agendar.addEventListener("click", () =>
        this.openAgendamento(servico, overlay)
      );
      actions.appendChild(agendar);
    }

    content.appendChild(actions);

    overlay.appendChild(content);
    // append modal to document body so it overlays whole page and uses global styles
    document.body.appendChild(overlay);
  }

  openAgendamento(servico, parentOverlay = null) {
    if (parentOverlay) parentOverlay.remove();

    const overlay = document.createElement("div");
    overlay.className = "modal";

    const content = document.createElement("div");
    content.className = "modal-content";

    const h = document.createElement("h3");
    h.textContent = `Agendar: ${servico.titulo}`;

    const form = document.createElement("form");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "8px";

    const labelDate = document.createElement("label");
    labelDate.textContent = "Escolha a data:";
    const inputDate = document.createElement("input");
    inputDate.type = "date";
    if (servico.disponibilidade && servico.disponibilidade.length) {
      inputDate.min = servico.disponibilidade[0];
      inputDate.value = servico.disponibilidade[0];
    }

    const labelTime = document.createElement("label");
    labelTime.textContent = "Horário:";
    const selectTime = document.createElement("select");
    ["09:00", "10:00", "14:00", "15:00", "16:00"].forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      selectTime.appendChild(opt);
    });

    const nome = document.createElement("input");
    nome.placeholder = "Seu nome";
    nome.required = true;

    const email = document.createElement("input");
    email.placeholder = "Seu e-mail";
    email.type = "email";
    email.required = true;

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn-primary";
    submit.textContent = "Confirmar agendamento";

    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.className = "btn-secondary";
    cancelar.textContent = "Cancelar";
    cancelar.addEventListener("click", () => overlay.remove());

    form.appendChild(labelDate);
    form.appendChild(inputDate);
    form.appendChild(labelTime);
    form.appendChild(selectTime);
    form.appendChild(nome);
    form.appendChild(email);
    form.appendChild(submit);
    form.appendChild(cancelar);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ag = {
        servicoId: servico.id,
        servicoTitulo: servico.titulo,
        nome: nome.value,
        email: email.value,
        data: inputDate.value,
        horario: selectTime.value,
        criadoEm: new Date().toISOString(),
      };
      const key = "agendamentos";
      const existentes = JSON.parse(localStorage.getItem(key) || "[]");
      existentes.push(ag);
      localStorage.setItem(key, JSON.stringify(existentes));

      content.innerHTML = `<h3>Agendamento confirmado</h3><p>Serviço: ${ag.servicoTitulo}</p><p>Data: ${ag.data} ${ag.horario}</p><p>Nome: ${ag.nome}</p>`;
      const ok = document.createElement("button");
      ok.className = "btn-primary";
      ok.textContent = "Fechar";
      ok.addEventListener("click", () => overlay.remove());
      content.appendChild(ok);
    });

    content.appendChild(h);
    content.appendChild(form);
    overlay.appendChild(content);
    // append modal to document body so it overlays whole page and uses global styles
    document.body.appendChild(overlay);
  }
}

customElements.define("servicos-component", ServicosComponent);
