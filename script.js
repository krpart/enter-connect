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

  const categoryColors = {
    food: '#C8854A',
    believer: '#4A7A5A',
    childhood: '#7A5A8A'
  };

  db.ref('visitors').on('value', function(snapshot) {
    visitors.length = 0;
    snapshot.forEach(function(child) {
      visitors.push(child.val());
    });
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

    if (!name) {
      alert('Please enter your first name.');
      return;
    }

    if (!q1 || !q2 || !q3) {
      alert('Please answer all three questions.');
      return;
    }

    db.ref('visitors').push({
      initials: name,
      food: q1.dataset.value,
      believer: q2.dataset.value,
      childhood: q3.dataset.value
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
      }
    } else {
      alert('Incorrect password.');
    }
  });

  function drawWeb() {
    const canvas = document.getElementById('web');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = 500;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById('visitor-count').textContent = visitors.length + ' voices in the web';

    const positions = [];

    visitors.forEach((visitor, i) => {
      const angle = (i / visitors.length) * 2 * Math.PI;
      const radius = Math.min(150, canvas.width / 3);
      const x = canvas.width / 2 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);
      positions.push({ x, y, visitor });
    });

    positions.forEach((a, i) => {
      positions.forEach((b, j) => {
        if (i >= j) return;

        const sharedCategories = [];
        if (a.visitor.food === b.visitor.food) sharedCategories.push('food');
        if (a.visitor.believer === b.visitor.believer) sharedCategories.push('believer');
        if (a.visitor.childhood === b.visitor.childhood) sharedCategories.push('childhood');

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
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });
    });

    positions.forEach(({ x, y, visitor }) => {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#3A2E22';
      ctx.fill();
      ctx.fillStyle = '#FAF8F4';
      ctx.font = '500 13px Jost, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(visitor.initials, x, y);
    });
  }

};
