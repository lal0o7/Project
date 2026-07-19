//<script>
    const LED_META = LED_META_JSON;
    const bank = document.getElementById('ledBank');
    LED_META.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'led-switch';
    el.style.setProperty('--bulb-color', l.color);
    el.innerHTML = '<div class="led-bulb"></div><div class="led-label">' + l.name + '</div>';
    el.onclick = () => toggleLed(i, l.name);
    bank.appendChild(el);
    });

    async function toggleLed(i, name) {
    const el = bank.children[i];
    const turningOn = !el.classList.contains('on');
    try {
        await fetch('/led?c=' + name + '&s=' + (turningOn ? 'on' : 'off'));
        refreshStatus();
    } catch (e) { /* network hiccup, next poll resyncs */ }
    }

    document.getElementById('msgForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('msgInput');
    const val = input.value;
    fetch('/set?msg=' + encodeURIComponent(val)).then(() => {
        input.value = '';
        input.focus(); // clicking "Send" moves focus to the button by default — pull it back
        refreshStatus();
    });
    });

    let scrollOffset = 0;
    function renderRow0(msg) {
    const row = document.getElementById('lcdRow0');
    if (msg.length <= 16) {
        row.textContent = msg.padEnd(16, ' ');
    } else {
        const padded = ' '.repeat(16) + msg + ' '.repeat(16);
        scrollOffset = (scrollOffset + 1) % (padded.length - 16);
        row.textContent = padded.substr(scrollOffset, 16);
    }
    }

    async function refreshStatus() {
    try {
        const res = await fetch('/status');
        const data = await res.json();
        renderRow0(data.msg);
        document.getElementById('lcdRow1').textContent =
        (data.time + ' Tmp:' + data.temp + 'C').padEnd(16, ' ');
        document.getElementById('timeVal').textContent = data.time;
        document.getElementById('tempVal').textContent = data.temp + '\u00b0C';
        document.getElementById('ipLine').textContent = 'ESP32 \u00b7 ' + data.ip;
        data.leds.forEach((on, i) => bank.children[i].classList.toggle('on', on));

        const rLine = document.getElementById('reminderLine');
        rLine.textContent = data.reminder;
        rLine.classList.toggle('active', data.reminderActive);
    } catch (e) { /* server briefly busy, will retry on next tick */ }
    }

    refreshStatus();
    setInterval(refreshStatus, 1000);
 //   </script>
//
