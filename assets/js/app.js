(() => {
  const STORAGE_PREFIX = 'elotech-playbook-v1';
  const tabs = [...document.querySelectorAll('.tab-btn')];
  const panels = [...document.querySelectorAll('.tab-panel')];
  const toast = document.getElementById('toast');
  const taskInputs = [...document.querySelectorAll('[data-task]')];
  const directionInputs = [...document.querySelectorAll('input[name="direction"]')];

  const directionData = {
    hybrid: {
      label: 'Híbrido 60/30/10',
      title: 'Loam na estrutura. ERA no acabamento. Sobha só na atmosfera.',
      copy: 'Você preserva a narrativa premium dos três imóveis, consegue motion sofisticado com GSAP e evita o peso de uma implementação 3D que contraria a prioridade mobile.',
      next: 'Organizar assets para o Figma'
    },
    loam: {
      label: 'Loam House',
      title: 'Estrutura em capítulos como prioridade.',
      copy: 'É o caminho mais seguro: layout forte, narrativa clara por imóvel e motion de dificuldade média com pin, scrub e parallax.',
      next: 'Desenhar capítulo mestre no Figma'
    },
    era: {
      label: 'ERA Residence',
      title: 'Motion cinematográfico como linguagem principal.',
      copy: 'Exige mais tempo de refinamento e testes, mas continua viável sem WebGL. Feche o layout estático antes de criar timelines.',
      next: 'Definir 3–4 momentos de motion de alto impacto'
    },
    sobha: {
      label: 'Sobha Privy',
      title: 'Direção de alta complexidade.',
      copy: 'Reproduzir fielmente significa adicionar uma camada 3D/WebGL e otimização de GPU. Use somente se o escopo aceitar mais tempo e risco mobile.',
      next: 'Validar se 3D/WebGL entra no escopo'
    }
  };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function activateTab(name, updateHash = true) {
    const exists = panels.some(panel => panel.dataset.panel === name);
    if (!exists) name = 'overview';

    tabs.forEach(btn => {
      const active = btn.dataset.tab === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (updateHash) history.replaceState(null, '', `#${name}`);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  tabs.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
  document.querySelectorAll('[data-tab-link]').forEach(el => el.addEventListener('click', event => {
    event.preventDefault();
    activateTab(el.dataset.tabLink);
  }));

  const initialTab = location.hash.replace('#', '');
  if (initialTab) activateTab(initialTab, false);

  function setDirection(value, persist = true) {
    if (!directionData[value]) value = 'hybrid';
    directionInputs.forEach(input => {
      input.checked = input.value === value;
      input.closest('.direction-card')?.classList.toggle('is-selected', input.checked);
    });
    const data = directionData[value];
    const label = document.getElementById('chosenDirectionLabel');
    const nextFocus = document.getElementById('nextFocus');
    const summary = document.getElementById('directionSummary');
    if (label) label.textContent = data.label;
    if (nextFocus) nextFocus.textContent = data.next;
    if (summary) {
      const h3 = summary.querySelector('h3');
      const p = summary.querySelector('p');
      if (h3) h3.textContent = data.title;
      if (p) p.textContent = data.copy;
    }
    if (persist) localStorage.setItem(`${STORAGE_PREFIX}:direction`, value);
  }

  directionInputs.forEach(input => input.addEventListener('change', () => {
    setDirection(input.value);
    showToast(`Direção alterada: ${directionData[input.value].label}`);
  }));
  setDirection(localStorage.getItem(`${STORAGE_PREFIX}:direction`) || 'hybrid', false);

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (_) {}
    area.remove();
    return Promise.resolve();
  }

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', () => {
      const row = button.closest('.copy-row');
      const text = row?.querySelector('p')?.innerText?.trim() || '';
      if (!text) return;
      copyText(text).then(() => {
        const original = button.textContent;
        button.textContent = 'Copiado ✓';
        showToast('Copy copiada');
        setTimeout(() => button.textContent = original, 1200);
      });
    });
  });

  const search = document.getElementById('copySearch');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLocaleLowerCase('pt-BR');
      document.querySelectorAll('[data-copy-section]').forEach(section => {
        const matches = !q || section.innerText.toLocaleLowerCase('pt-BR').includes(q);
        section.style.display = matches ? '' : 'none';
        if (q && matches) section.open = true;
      });
    });
  }
  document.getElementById('expandAllCopy')?.addEventListener('click', () => document.querySelectorAll('[data-copy-section]').forEach(d => d.open = true));
  document.getElementById('collapseAllCopy')?.addEventListener('click', () => document.querySelectorAll('[data-copy-section]').forEach(d => d.open = false));

  function readTasks() {
    taskInputs.forEach(input => {
      input.checked = localStorage.getItem(`${STORAGE_PREFIX}:task:${input.dataset.task}`) === '1';
    });
  }

  function updateProgress() {
    const total = taskInputs.length;
    const done = taskInputs.filter(input => input.checked).length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const xp = done * 40;
    const level = Math.min(10, Math.floor(xp / 400) + 1);

    const globalProgress = document.getElementById('globalProgress');
    const progressLabel = document.getElementById('progressLabel');
    const xpLabel = document.getElementById('xpLabel');
    const progressBig = document.getElementById('progressBig');
    const checklistProgress = document.getElementById('checklistProgress');
    const checklistCount = document.getElementById('checklistCount');
    const levelNumber = document.getElementById('levelNumber');
    const statusBadge = document.getElementById('statusBadge');

    if (globalProgress) globalProgress.style.width = `${pct}%`;
    if (progressLabel) progressLabel.textContent = `${pct}% concluído`;
    if (xpLabel) xpLabel.textContent = `${xp} XP`;
    if (progressBig) progressBig.textContent = pct;
    if (checklistProgress) checklistProgress.textContent = `${pct}%`;
    if (checklistCount) checklistCount.textContent = `${done} de ${total} tarefas`;
    if (levelNumber) levelNumber.textContent = level;
    if (statusBadge) {
      statusBadge.textContent = pct === 100 ? 'PRONTO PARA PUBLICAR' : pct >= 80 ? 'QA / HOMOLOGAÇÃO' : pct >= 55 ? 'IMPLEMENTAÇÃO' : pct >= 25 ? 'DESIGN / BUILD' : 'PRÉ-PRODUÇÃO';
    }

    const achievementTitle = document.getElementById('achievementTitle');
    const achievementCopy = document.getElementById('achievementCopy');
    if (achievementTitle && achievementCopy) {
      if (pct === 100) {
        achievementTitle.textContent = 'Playbook zerado';
        achievementCopy.textContent = 'Todas as tarefas foram concluídas. Hora de validar a publicação final.';
      } else if (pct >= 80) {
        achievementTitle.textContent = 'Reta final';
        achievementCopy.textContent = 'Feche QA, tracking, homologação e domínio.';
      } else if (pct >= 55) {
        achievementTitle.textContent = 'Build em movimento';
        achievementCopy.textContent = 'Finalize conversão, tracking e motion sem perder performance.';
      } else if (pct >= 25) {
        achievementTitle.textContent = 'Sistema definido';
        achievementCopy.textContent = 'Leve o layout estático para o código antes de sofisticar o motion.';
      } else if (done > 0) {
        achievementTitle.textContent = 'Primeiro avanço';
        achievementCopy.textContent = 'Continue eliminando pendências de direção e assets.';
      } else {
        achievementTitle.textContent = 'Primeira decisão';
        achievementCopy.textContent = 'Marque as primeiras tarefas para começar a subir de nível.';
      }
    }
  }

  readTasks();
  updateProgress();
  taskInputs.forEach(input => input.addEventListener('change', () => {
    localStorage.setItem(`${STORAGE_PREFIX}:task:${input.dataset.task}`, input.checked ? '1' : '0');
    updateProgress();
    if (input.checked) showToast('+40 XP · etapa concluída');
  }));

  // Wireframe selector: only switches between static schematic layouts.
  const wireframeButtons = [...document.querySelectorAll('[data-wireframe-select]')];
  const wireframePanels = [...document.querySelectorAll('[data-wireframe-panel]')];
  function selectWireframe(name) {
    wireframeButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.wireframeSelect === name));
    wireframePanels.forEach(panel => panel.hidden = panel.dataset.wireframePanel !== name);
  }
  wireframeButtons.forEach(btn => btn.addEventListener('click', () => selectWireframe(btn.dataset.wireframeSelect)));
  if (wireframeButtons.length) selectWireframe('hybrid');

})();
