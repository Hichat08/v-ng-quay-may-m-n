      const defaultSegments = [
        { label: "Bên trái uống", color: "#ff595e" },
        { label: "Bên phải uống", color: "#ffca3a" },
        { label: "Đối diện uống", color: "#8ac926" },
        { label: "An toàn", color: "#1982c4" },
        { label: "Bạn uống", color: "#6a4c93" },
        { label: "Không uống", color: "#ff924c" },
        { label: "2 chén", color: "#00b4d8" },
        { label: "Cả bàn cùng uống", color: "#b5179e" },
      ];
      let segments = [...defaultSegments];

      const canvas = document.getElementById("wheel");
      const ctx = canvas.getContext("2d");
      const spinButton = document.getElementById("spinButton");
      const centerSpin = document.getElementById("centerSpin");
      const result = document.getElementById("result");
      const legend = document.getElementById("legend");
      const nameInput = document.getElementById("nameInput");
      const singleName = document.getElementById("singleName");
      const addName = document.getElementById("addName");
      const clearNames = document.getElementById("clearNames");
      const fireworksCanvas = document.getElementById("fireworks");
      const fireworksCtx = fireworksCanvas.getContext("2d");
      const winModal = document.getElementById("winModal");
      const modalResult = document.getElementById("modalResult");
      const closeModal = document.getElementById("closeModal");

      const radius = canvas.width / 2;
      const center = { x: radius, y: radius };
      let segmentAngle = (Math.PI * 2) / segments.length;
      const pointerAngle = 0; // Kim ở bên phải (0 rad)
      let currentAngle = 0;
      let spinning = false;
      let fireworksTimer = null;
      let modalTimer = null;

      function resizeFireworks() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
      }

      resizeFireworks();
      window.addEventListener("resize", resizeFireworks);

      function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        segments.forEach((segment, index) => {
          const start = currentAngle + index * segmentAngle;
          const end = start + segmentAngle;

          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.arc(center.x, center.y, radius - 12, start, end);
          ctx.closePath();
          ctx.fillStyle = segment.color;
          ctx.fill();

          ctx.save();
          ctx.translate(center.x, center.y);
          ctx.rotate(start + segmentAngle / 2);
          ctx.textAlign = "right";
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.font = "600 18px 'Be Vietnam Pro', sans-serif";
          ctx.fillText(segment.label, radius - 28, 8);
          ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius - 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      function renderLegend() {
        legend.innerHTML = "";
        segments.forEach((segment) => {
          const item = document.createElement("div");
          item.className = "legend-item";
          item.innerHTML = `<span class="swatch" style="background:${segment.color}"></span>${segment.label}`;
          legend.appendChild(item);
        });
      }

      function makeColors(count) {
        const colors = [];
        for (let i = 0; i < count; i += 1) {
          const hue = Math.round((360 / count) * i);
          colors.push(`hsl(${hue}, 80%, 55%)`);
        }
        return colors;
      }

      function launchFireworks(duration = 2200) {
        const particles = [];
        const gravity = 0.06;
        const startTime = performance.now();
        let lastBurst = 0;

        function spawnBurst() {
          const cx = Math.random() * fireworksCanvas.width * 0.8 + fireworksCanvas.width * 0.1;
          const cy = Math.random() * fireworksCanvas.height * 0.35 + fireworksCanvas.height * 0.1;
          const colors = ["#ffcc33", "#ff8f1f", "#f94144", "#f3722c"];
          const count = 28 + Math.floor(Math.random() * 16);

          for (let i = 0; i < count; i += 1) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 1.6 + Math.random() * 2.2;
            particles.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1,
              color: colors[i % colors.length],
            });
          }
        }

        function animate(time) {
          const elapsed = time - startTime;
          fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

          if (elapsed - lastBurst > 350 && elapsed < duration) {
            spawnBurst();
            lastBurst = elapsed;
          }

          for (let i = particles.length - 1; i >= 0; i -= 1) {
            const p = particles[i];
            p.vy += gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.012;

            if (p.life <= 0) {
              particles.splice(i, 1);
              continue;
            }

            fireworksCtx.beginPath();
            fireworksCtx.fillStyle = p.color;
            fireworksCtx.globalAlpha = Math.max(p.life, 0);
            fireworksCtx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
            fireworksCtx.fill();
          }

          fireworksCtx.globalAlpha = 1;

          if (elapsed < duration || particles.length > 0) {
            fireworksTimer = requestAnimationFrame(animate);
          }
        }

        cancelAnimationFrame(fireworksTimer);
        fireworksTimer = requestAnimationFrame(animate);
      }

      function showWinner(label) {
        modalResult.textContent = label;
        winModal.classList.add("show");
        winModal.setAttribute("aria-hidden", "false");
        launchFireworks();
        clearTimeout(modalTimer);
        modalTimer = setTimeout(closeWinner, 5000);
      }

      function closeWinner() {
        winModal.classList.remove("show");
        winModal.setAttribute("aria-hidden", "true");
        clearTimeout(modalTimer);
      }

      function buildSegmentsFromNames(names) {
        if (names.length < 2) {
          segments = [...defaultSegments];
          result.textContent = "Đã dùng danh sách mặc định.";
        } else {
          const colors = makeColors(names.length);
          segments = names.map((name, index) => ({
            label: name,
            color: colors[index],
          }));
          result.textContent = "Đã cập nhật danh sách người chơi.";
        }

        segmentAngle = (Math.PI * 2) / segments.length;
        currentAngle = 0;
        drawWheel();
        renderLegend();
      }

      function getNames() {
        return nameInput.value
          .split("\n")
          .map((name) => name.trim())
          .filter(Boolean);
      }

      function addSingleName() {
        const name = singleName.value.trim();
        if (!name) return;

        const names = getNames();
        names.push(name);
        nameInput.value = names.join("\n");
        singleName.value = "";
        singleName.focus();
        buildSegmentsFromNames(names);
      }

      function clearNameList() {
        nameInput.value = "";
        singleName.value = "";
        buildSegmentsFromNames([]);
      }

      function spin() {
        if (spinning) return;
        spinning = true;
        spinButton.disabled = true;
        centerSpin.disabled = true;
        result.textContent = "Đang quay...";

        const rotations = 6 + Math.floor(Math.random() * 3);
        const randomOffset = Math.random() * Math.PI * 2;
        const startAngle = currentAngle;
        const endAngle = rotations * Math.PI * 2 + randomOffset;
        const duration = 5200 + Math.random() * 1600;
        const startTime = performance.now();

        function animate(time) {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Easing mượt, chậm dần liên tục, không giật hay quay ngược
          const eased = 1 - Math.pow(1 - progress, 5);
          currentAngle = startAngle + (endAngle - startAngle) * eased;
          drawWheel();

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            currentAngle = endAngle % (Math.PI * 2);
            spinning = false;
            spinButton.disabled = false;
            centerSpin.disabled = false;
            const angleFromStart =
              (pointerAngle - currentAngle + Math.PI * 2) % (Math.PI * 2);
            const winnerIndex =
              Math.floor(angleFromStart / segmentAngle) % segments.length;
            const label = segments[winnerIndex].label;
            result.textContent = `Bạn nhận được: ${label}`;
            showWinner(label);
          }
        }

        requestAnimationFrame(animate);
      }

      spinButton.addEventListener("click", spin);
      centerSpin.addEventListener("click", spin);
      addName.addEventListener("click", addSingleName);
      clearNames.addEventListener("click", clearNameList);
      closeModal.addEventListener("click", closeWinner);
      winModal.addEventListener("click", (event) => {
        if (event.target === winModal) {
          closeWinner();
        }
      });
      singleName.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addSingleName();
        }
      });

      renderLegend();
      drawWheel();
