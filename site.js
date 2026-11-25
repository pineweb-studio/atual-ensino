(function () {
  document.documentElement.classList.add("js");
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ZAP = [
    { nome: "Sanio Martins", num: "5533999756768" },
    { nome: "Helma", num: "5533999196472" }
  ];

  // fotos: cada espaço carrega img/<nome>.jpg sozinho (ex.: img/fachada.jpg).
  // Para trocar uma foto, basta subir o arquivo com o mesmo nome na pasta img/.
  document.querySelectorAll("[data-foto]").forEach(function (el) {
    var src = "img/" + el.dataset.foto + ".jpg", teste = new Image();
    teste.onload = function () { el.style.setProperty("--img", "url('" + src + "')"); };
    teste.src = src;
  });

  document.getElementById("ano").textContent = new Date().getFullYear();

  // palavra que troca no título
  var palavras = ["transforma", "aprova", "acolhe", "inspira"], i = 0, rot = document.getElementById("rot");
  if (!reduz) setInterval(function () {
    i = (i + 1) % palavras.length;
    rot.style.backgroundSize = "0% 62%";
    setTimeout(function () {
      rot.textContent = palavras[i];
      rot.style.transition = "background-size .5s cubic-bezier(.65,0,.35,1)";
      rot.style.backgroundSize = "100% 62%";
    }, 260);
  }, 2600);

  // barra de progresso
  var barra = document.getElementById("progresso");
  addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    barra.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%";
  }, { passive: true });

  // colagem acompanha o mouse
  var col = document.getElementById("colagem");
  if (!reduz && matchMedia("(pointer: fine)").matches) {
    col.parentElement.addEventListener("mousemove", function (e) {
      var r = col.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
      col.querySelectorAll(".polaroid").forEach(function (p) {
        var k = +p.dataset.prof;
        p.style.transform = "translate(" + (x * k) + "px," + (y * k) + "px) rotate(var(--r))";
      });
    });
  }

  // contadores e entrada
  function conta(el) {
    var alvo = +el.dataset.conta, t0 = null;
    if (reduz) { el.textContent = alvo; return; }
    function passo(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  var contadores = document.querySelectorAll("[data-conta]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("visto");
        e.target.querySelectorAll("[data-conta]").forEach(conta);
        if (e.target.dataset.conta) conta(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .15 });
    document.querySelectorAll(".sobe").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".sobe").forEach(function (el) { el.classList.add("visto"); });
    contadores.forEach(conta);
  }
  // fallback: nada fica fora do lugar se o observer não disparar
  setTimeout(function () {
    document.querySelectorAll(".sobe:not(.visto)").forEach(function (el) {
      if (el.getBoundingClientRect().top < innerHeight) { el.classList.add("visto"); el.querySelectorAll("[data-conta]").forEach(conta); }
    });
  }, 1500);

  // mapa do transporte
  var botoes = document.querySelectorAll("#lista-cid button");
  function mostra(cid) {
    document.querySelectorAll(".rota").forEach(function (r) { r.classList.toggle("on", r.dataset.rota === cid); });
    document.querySelectorAll(".pino").forEach(function (p) { p.classList.toggle("on", p.dataset.cid === cid); });
    botoes.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.cid === cid); });
  }
  botoes.forEach(function (b) { b.addEventListener("click", function () { mostra(b.dataset.cid); }); });
  document.querySelectorAll(".pino").forEach(function (p) { p.addEventListener("click", function () { mostra(p.dataset.cid); }); });
  mostra("gua");

  // quiz
  var PERGUNTAS = [
    { chave: "fase", titulo: "Em que fase está seu filho ou filha?", ops: [
      ["Terminando o 9º ano", "vai começar o Ensino Médio"],
      ["No Ensino Médio", "1º, 2º ou 3º ano"],
      ["Focado no ENEM", "quer entrar na faculdade"],
      ["Outra série", "quero saber o que a escola oferece"] ] },
    { chave: "prioridade", titulo: "O que mais pesa na escolha da escola?", ops: [
      ["Aprovação", "ENEM e vestibulares"],
      ["Acompanhamento", "professores perto do aluno"],
      ["Distância", "moramos em outra cidade"],
      ["Estrutura", "salas, materiais e segurança"] ] },
    { chave: "cidade", titulo: "Onde vocês moram?", ops: [
      ["Sabinópolis", ""], ["Guanhães", ""], ["Materlândia", ""], ["Rio Vermelho", ""] ] }
  ];
  var TEXTOS = {
    "Aprovação": "O material Bernoulli e os simulados preparam para o ENEM e os vestibulares desde o 1º ano.",
    "Acompanhamento": "Turmas em que o professor conhece cada aluno e conversa com a família quando algo precisa de atenção.",
    "Distância": "Muitos alunos vêm das cidades vizinhas e fazem o Ensino Médio inteiro na Atual.",
    "Estrutura": "Salas preparadas, equipamentos atualizados e uma equipe que cuida do dia a dia."
  };
  var resp = {}, etapa = 0, quiz = document.getElementById("quiz"), passos = document.querySelectorAll("#passos i");
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function desenha() {
    passos.forEach(function (p, k) { p.classList.toggle("on", k <= etapa); });
    if (etapa < PERGUNTAS.length) {
      var q = PERGUNTAS[etapa];
      quiz.innerHTML = '<div class="pergunta"><p class="olho" style="margin-bottom:12px">Pergunta ' + (etapa + 1) + ' de 3</p><h3>' + q.titulo + '</h3><div class="opcoes">' +
        q.ops.map(function (o) { return '<button type="button" data-v="' + esc(o[0]) + '">' + esc(o[0]) + (o[1] ? '<small>' + esc(o[1]) + '</small>' : '') + '</button>'; }).join("") +
        '</div>' + (etapa ? '<p style="margin-top:18px"><button type="button" class="voltar" data-voltar>Voltar</button></p>' : '') + '</div>';
      return;
    }
    var transporte = resp.cidade !== "Sabinópolis"
      ? "<p>Vocês não estariam sozinhos: a Atual recebe alunos de " + esc(resp.cidade) + " e de outras cidades da região.</p>" : "";
    var msg = "Olá! Vim pelo site da Atual. Meu filho(a) está: " + resp.fase + ". Moramos em " + resp.cidade + " e o que mais pesa para nós é: " + resp.prioridade.toLowerCase() + ". Gostaria de agendar uma visita.";
    quiz.innerHTML = '<div class="resultado"><p class="olho">Seu caminho na Atual</p>' +
      '<div class="cartao"><p class="mao" style="color:var(--tinta)">' + esc(resp.fase) + ' · ' + esc(resp.cidade) + '</p><p>' + TEXTOS[resp.prioridade] + '</p>' + transporte + '</div>' +
      '<div class="acoes">' + ZAP.map(function (z, k) {
        return '<a class="btn' + (k ? ' sec' : '') + '" href="https://wa.me/' + z.num + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">Enviar para ' + z.nome.split(" ")[0] + '</a>';
      }).join("") + '</div><p><button type="button" class="voltar" data-reinicia>Responder de novo</button></p></div>';
  }
  quiz.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-voltar")) { etapa--; }
    else if (b.hasAttribute("data-reinicia")) { etapa = 0; resp = {}; }
    else if (b.dataset.v) { resp[PERGUNTAS[etapa].chave] = b.dataset.v; etapa++; }
    desenha();
    var f = quiz.querySelector("button"); if (f && e.detail === 0) f.focus();
  });
  desenha();

  // whatsapp flutuante
  var zb = document.getElementById("zap-btn"), zm = document.getElementById("zap-menu");
  zb.addEventListener("click", function () { zm.hidden = !zm.hidden; zb.setAttribute("aria-expanded", !zm.hidden); });
  document.addEventListener("click", function (e) { if (!e.target.closest("#zap")) { zm.hidden = true; zb.setAttribute("aria-expanded", "false"); } });
})();
