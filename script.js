//<script>
const ESP32_IP = "http://192.168.0.100";
const LED_META = [
    { name: "red", color: "#ff4040" },
    { name: "green", color: "#4dff4d" },
    { name: "blue", color: "#4da6ff" },
    { name: "yellow", color: "#ffd633" }
];
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
        
        await fetch(ESP32_IP + '/led?c=' + name + '&s=' + (turningOn ? 'on' : 'off')); //changed
        
        refreshStatus();
    } catch (e) { /* network hiccup, next poll resyncs */ }
    }

    document.getElementById('msgForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('msgInput');
    const val = input.value;
    fetch(ESP32_IP + '/set?msg=' + encodeURIComponent(val)).then(() => { //changed
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
        const res = await fetch(ESP32_IP + '/status');//changed
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
