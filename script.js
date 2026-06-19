const firebaseConfig = {
  apiKey: "AIzaSyBbip_OkB0FhMx_qliPu7qCUJ-U3Ngbm_s",
  authDomain: "common-ground-f85eb.firebaseapp.com",
  databaseURL: "https://common-ground-f85eb-default-rtdb.firebaseio.com",
  projectId: "common-ground-f85eb",
  storageBucket: "common-ground-f85eb.firebasestorage.app",
  messagingSenderId: "105559638786",
  appId: "1:105559638786:web:d11b7f910852977860b81b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

window.onload = function() {

  const visitors = [];
  let currentPositions = [];
  let selectedIndex = null;

  const categoryColors = {
    food: '#C8854A',
    believer: '#2D7A4F',
    childhood: '#6B3FA0',
    art: '#C41230'
  };

  db.ref('visitors').on('value', function(snapshot) {
    visitors.length = 0;
    snapshot.forEach(function(child) {
      visitors.push(child.val());
    });
    selectedIndex = null;
    drawWeb();
  });

  document.querySelectorAll('.option').forEach(button => {
    button.addEventListener('click', function() {
      const q = this.dataset.q;
      document.querySelectorAll(`.option[data-q="${q}"]`).forEach(btn => {
        btn.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });

  document.getElementById('submit').addEventListener('click', function() {
    const name = document.getElementById('initials').value.trim();
    const q1 = document.querySelector('.option[data-q="1"].selected');
    const q2 = document.querySelector('.option[data-q="2"].selected');
    const q3 = document.querySelector('.option[data-q="3"].selected');
    const q4 = document.querySelector('.option[data-q="4"].selected');

    if (!name) {
      alert('Please enter your first name.');
      return;
    }

    if (!q1 || !q2 || !q3 || !q4) {
      alert('Please answer all four questions.');
      return;
    }

    db.ref('visitors').push({
      initials: name,
      food: q1.dataset.value,
      believer: q2.dataset.value,
      childhood: q3.dataset.value,
      art: q4.dataset.value
    });

    document.getElementById('initials').value = '';
    document.querySelectorAll('.option').forEach(btn => {
      btn.classList.remove('selected');
    });
  });

  document.getElementById('reset-btn').addEventListener('click', function() {
    const password = prompt('Enter the reset password:');
    if (password === 'stiramemory') {
      if (confirm('This will delete all data. Are you sure?')) {
        db.ref('visitors').remove();
        selectedIndex = null;
      }
    } else {
      alert('Incorrect password.');
    }
  });

  const canvas = document.getElementById('web');

  canvas.addEventListener('click', function(event) {
    if (currentPositions.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    let tappedIndex = null;
    currentPositions.forEach((pos, i) => {
      const dx = clickX - pos.x;
      const dy = clickY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) <= pos.nodeRadius) {
        tappedIndex = i;
      }
    });

    if (tappedIndex === null) {
      selectedIndex = null;
    } else if (selectedIndex === tappedIndex) {
      selectedIndex = null;
    } else {
      selectedIndex = tappedIndex;
    }

    drawWeb();
  });

  function drawWeb() {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;

    const radius = Math.max(150, Math.min(canvas.width / 2 - 60, visitors.length * 11));
    canvas.height = Math.max(500, radius * 2 + 140);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const instructionEl = document.getElementById('web-instruction');
    if (instructionEl) {
      instructionEl.textContent = visitors.length > 0
        ? 'Tap a name to see their connections'
        : '';
    }

    document.getElementById('visitor-count').textContent = visitors.length + ' voices in the web';

    const nodeRadius = visitors.length > 20 ? 16 : 20;
    const centerY = canvas.height / 2;

    currentPositions = visitors.map((visitor, i) => {
      const angle = (i / visitors.length) * 2 * Math.PI;
      const x = canvas.width / 2 + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, visitor, nodeRadius };
    });

    const positions = currentPositions;

    positions.forEach((a, i) => {
      positions.forEach((b, j) => {
        if (i >= j) return;

        if (selectedIndex !== null && selectedIndex !== i && selectedIndex !== j) {
          return;
        }

        const sharedCategories = [];
        if (a.visitor.food === b.visitor.food) sharedCategories.push('food');
        if (a.visitor.believer === b.visitor.believer) sharedCategories.push('believer');
        if (a.visitor.childhood === b.visitor.childhood) sharedCategories.push('childhood');
        if (a.visitor.art === b.visitor.art) sharedCategories.push('art');

        sharedCategories.forEach((category, index) => {
          const offset = (index - (sharedCategories.length - 1) / 2) * 6;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len;
          const ny = dx / len;

          ctx.beginPath();
          ctx.moveTo(a.x + nx * offset, a.y + ny * offset);
          ctx.lineTo(b.x + nx * offset, b.y + ny * offset);
          ctx.strokeStyle = categoryColors[category];
          ctx.lineWidth = selectedIndex !== null ? 3 : 2;
          ctx.globalAlpha = selectedIndex === null ? 0.35 : 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      });
    });

    positions.forEach((pos, i) => {
      const isFaded = selectedIndex !== null && selectedIndex !== i;
      ctx.globalAlpha = isFaded ? 0.35 : 1;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = selectedIndex === i ? '#C8854A' : '#3A2E22';
      ctx.fill();

      ctx.fillStyle = '#FAF8F4';
      ctx.font = (visitors.length > 20 ? '500 11px ' : '500 13px ') + 'Jost, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pos.visitor.initials, pos.x, pos.y);

      ctx.globalAlpha = 1;
    });
  }

  drawWeb();

};
