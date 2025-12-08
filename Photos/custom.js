    // LD 11
document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".contact-form");
    const submitBtn = document.getElementById("submitBtn");
    const outputBox = document.getElementById("formOutput");
    const successPopup = document.getElementById("successPopup");

    const getEl = id => document.getElementById(id);

    const fields = {
        firstName: {
            el: getEl("firstName"),
            validate: (v) => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(v?.trim() ?? "")
        },
        lastName: {
            el: getEl("lastName"),
            validate: (v) => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(v?.trim() ?? "")
        },
        userEmail: {
            el: getEl("userEmail"),
            validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() ?? "")
        },
        userAddress: {
            el: getEl("userAddress"),
            validate: (v) => (v?.trim() ?? "").length > 0
        },
        Q1: { el: getEl("Q1"), validate: () => true },
        Q2: { el: getEl("Q2"), validate: () => true },
        Q3: { el: getEl("Q3"), validate: () => true }
    };

    Object.values(fields).forEach(({ el }) => {
        if (!el) return;
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("error-text");
        errorDiv.style.display = "none";
        el.parentElement.appendChild(errorDiv);
    });

    function validateField(id) {
        const field = fields[id];
        const value = field.el.value;
        const errorDiv = field.el.parentElement.querySelector(".error-text");

        if (!field.validate(value)) {
            field.el.classList.add("input-error");
            errorDiv.textContent = "Neteisingai įvesti duomenys";
            errorDiv.style.display = "block";
            return false;
        } else {
            field.el.classList.remove("input-error");
            errorDiv.style.display = "none";
            return true;
        }
    }

    Object.keys(fields).forEach(id => {
        const f = fields[id];
        if (!f.el) return;
        f.el.addEventListener("input", () => {
            validateField(id);
            toggleSubmit();
        });
    });

    const phoneInput = getEl("userPhone");

    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");

            if (value.startsWith("370")) value = value.replace(/^370/, "");
            if (value.startsWith("0")) value = value.substring(1);

            value = value.slice(0, 8);

            let formatted = "+370";

            if (value.length > 0) formatted += " " + value.substring(0, 1);
            if (value.length > 1) formatted += value.substring(1, 3);
            if (value.length > 3) formatted += " " + value.substring(3);

            e.target.value = formatted;
            toggleSubmit();
        });
    }

    function toggleSubmit() {
        const allValid = Object.keys(fields)
            .filter(id => fields[id].el)
            .every(id => validateField(id));

        const phoneFilled = phoneInput.value.length >= 10;

        submitBtn.disabled = !(allValid && phoneFilled);
    }

    toggleSubmit();

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const data = {
            firstName: getEl("firstName").value,
            lastName: getEl("lastName").value,
            email: getEl("userEmail").value,
            phone: getEl("userPhone").value,
            address: getEl("userAddress").value,
            Q1: Number(getEl("Q1").value),
            Q2: Number(getEl("Q2").value),
            Q3: Number(getEl("Q3").value)
        };

        const average = ((data.Q1 + data.Q2 + data.Q3) / 3).toFixed(1);

        outputBox.innerHTML = `
            <h3>Jūsų įvesti duomenys:</h3>
            <p><strong>Vardas:</strong> ${data.firstName}</p>
            <p><strong>Pavardė:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Telefonas:</strong> ${data.phone}</p>
            <p><strong>Adresas:</strong> ${data.address}</p>
            <p><strong>Klausimas 1:</strong> ${data.Q1}</p>
            <p><strong>Klausimas 2:</strong> ${data.Q2}</p>
            <p><strong>Klausimas 3:</strong> ${data.Q3}</p>
            <hr>
            <p><strong>${data.firstName} ${data.lastName}: ${average}</strong></p>
        `;

        successPopup.style.display = "block";
        setTimeout(() => {
            successPopup.style.display = "none";
        }, 3000);
    });

    // LD 12
    (function(){
      const ICONS = [
        'bi-star-fill','bi-heart-fill','bi-lightning-fill','bi-moon-fill',
        'bi-sun-fill','bi-fire','bi-gem','bi-gear-fill',
        'bi-music-note-beamed','bi-controller','bi-camera-fill','bi-book-fill'
      ];

      const difficultyEl = document.getElementById('difficulty');
      const startBtn = document.getElementById('startBtn');
      const resetBtn = document.getElementById('resetBtn');
      const boardContainer = document.getElementById('boardContainer');
      const movesEl = document.getElementById('moves');
      const matchesEl = document.getElementById('matches');
      const timerEl = document.getElementById('timer');
      const winMessage = document.getElementById('winMessage');
      const bestEasyEl = document.getElementById('best-easy');
      const bestHardEl = document.getElementById('best-hard');

      if (!boardContainer || !difficultyEl) return;

      let rows = 3, cols = 4;
      let totalPairs = 6;
      let cards = [];
      let firstCard = null, secondCard = null;
      let lockBoard = false;
      let moves = 0, matches = 0;
      let timerInterval = null;
      let seconds = 0;

      const LS_EASY = 'memory_best_easy';
      const LS_HARD = 'memory_best_hard';

      function loadBest() {
        const be = localStorage.getItem(LS_EASY);
        const bh = localStorage.getItem(LS_HARD);
        if (bestEasyEl) bestEasyEl.textContent = be ? be : '—';
        if (bestHardEl) bestHardEl.textContent = bh ? bh : '—';
      }

      function setDifficulty() {
        const v = difficultyEl.value;
        if (v === 'easy') { rows=3; cols=4; totalPairs=6; }
        else { rows=4; cols=6; totalPairs=12; }
        boardContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      }

      function generateCardArray() {
        const needed = totalPairs;
        const pool = ICONS.slice(0, Math.min(needed, ICONS.length));
        while (pool.length < needed) pool.push(...ICONS.slice(0, needed - pool.length));

        const pairArray = pool.concat(pool);
        return shuffle(pairArray.map((ic, idx) => ({ id: idx, icon: ic })));
      }

      function shuffle(array) {
        for (let i = array.length-1; i>0; i--) {
          const j = Math.floor(Math.random()*(i+1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }

      function renderBoard() {
        boardContainer.innerHTML = '';
        cards.forEach((c, index) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.dataset.index = index;

          const inner = document.createElement('div');
          inner.className = 'card-inner';

          const back = document.createElement('div');
          back.className = 'card-face card-back';
          back.innerHTML = '<i class="bi bi-question-circle" style="font-size:28px"></i>';

          const front = document.createElement('div');
          front.className = 'card-face card-front';
          front.innerHTML = `<i class="bi ${c.icon}" style="font-size:28px"></i>`;

          inner.appendChild(back);
          inner.appendChild(front);
          card.appendChild(inner);

          card.addEventListener('click', onCardClick);

          boardContainer.appendChild(card);
        });
      }

      function onCardClick(e) {
        if (lockBoard) return;
        const cardEl = e.currentTarget;
        const idx = Number(cardEl.dataset.index);
        const cdata = cards[idx];
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('disabled')) return;

        flip(cardEl);

        if (!firstCard) {
          firstCard = { el: cardEl, data: cdata };
          if (moves === 0 && matches === 0 && !timerInterval) startTimer();
          return;
        }

        secondCard = { el: cardEl, data: cdata };
        lockBoard = true;

        moves++;
        updateStats();

        if (firstCard.data.icon === secondCard.data.icon) {
          firstCard.el.classList.add('disabled');
          secondCard.el.classList.add('disabled');
          matches++;
          resetTurn();
          updateStats();
          if (matches === totalPairs) onWin();
        } else {
          setTimeout(() => {
            unflip(firstCard.el);
            unflip(secondCard.el);
            resetTurn();
          }, 1000);
        }
      }

      function flip(cardEl) { cardEl.classList.add('flipped'); }
      function unflip(cardEl) { cardEl.classList.remove('flipped'); }

      function resetTurn() { firstCard = null; secondCard = null; lockBoard = false; }

      function updateStats() {
        if (movesEl) movesEl.textContent = moves;
        if (matchesEl) matchesEl.textContent = matches;
      }

      function startGame(autoStart=false) {
        setDifficulty();
        cards = generateCardArray();
        renderBoard();
        moves = 0; matches = 0; seconds = 0;
        updateStats();
        updateTimerDisplay();
        if (winMessage) winMessage.style.display = 'none';
        stopTimer();
        if (autoStart) startTimer();
      }

      function resetGame() {
        cards = generateCardArray();
        renderBoard();
        moves = 0; matches = 0; seconds = 0;
        updateStats(); updateTimerDisplay();
        if (winMessage) winMessage.style.display = 'none';
        stopTimer();
      }

      function onWin() {
        stopTimer();
        if (winMessage) winMessage.style.display = 'block';
        const key = (difficultyEl.value === 'easy') ? LS_EASY : LS_HARD;
        const prev = localStorage.getItem(key);
        if (!prev || Number(prev) === 0 || moves < Number(prev)) {
          localStorage.setItem(key, String(moves));
        }
        loadBest();
      }

      function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => { seconds++; updateTimerDisplay(); }, 1000);
      }
      function stopTimer() { 
        if (timerInterval) { 
            clearInterval(timerInterval); 
            timerInterval = null; 
        } 
      }

      function updateTimerDisplay() {
        const mm = String(Math.floor(seconds/60)).padStart(2,'0');
        const ss = String(seconds%60).padStart(2,'0');
        if (timerEl) timerEl.textContent = `${mm}:${ss}`;
      }

      difficultyEl.addEventListener('change', () => {
      });
      startBtn.addEventListener('click', () => { setDifficulty(); startGame(true); });
      resetBtn.addEventListener('click', () => { resetGame(); });

      loadBest();
      setDifficulty();
      cards = generateCardArray();
      renderBoard();
    })();

});