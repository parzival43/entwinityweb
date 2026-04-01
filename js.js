const introScreen = document.getElementById('intro-screen');
const logoWrap = document.querySelector('.logo-wrap');
const app = document.getElementById('app');
const groupListEl = document.getElementById('group-list');
const titleEl = document.getElementById('group-title');
const descriptionEl = document.getElementById('group-description');
const linkEl = document.getElementById('group-link');

const fallbackGroups = [
  {
    title: 'Developer Collective',
    description: 'A place for coders, engineers, and software builders to share ideas, collaborate on projects, and learn new technologies together.',
    link: 'https://example.com/developer-collective'
  },
  {
    title: 'Design & UX Hub',
    description: 'A creative community focused on user experience, interface design, branding, and product thinking.',
    link: 'https://example.com/design-hub'
  },
  {
    title: 'Startup Network',
    description: 'Founders, operators, and startup enthusiasts share resources, feedback, and introductions to help early-stage ventures grow.',
    link: 'https://example.com/startup-network'
  },
  {
    title: 'AI & Data Circle',
    description: 'A group built around machine learning, data science, and artificial intelligence discussions and projects.',
    link: 'https://example.com/ai-data-circle'
  }
];

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (line.length <= 2) {
      0; // Skip very short lines
    } else if (char === '"' ) {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  console.log('Split CSV line:', result);
  return result;
}

function parseCsv(csv) {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

  return lines
    .slice(1)
    .map((line) => {
      const values = splitCsvLine(line).map((value) => value.trim().replace(/^"|"$/g, ''));
      const row = headers.reduce((acc, header, index) => {
        acc[header] = values[index] || '';
        return acc;
      }, {});

      const group = {
        title: row.title || row.group || row.name || '',
        description: row.description || row.desc || '',
        link: row.link || row.url || ''
      };

      const hasContent = Object.values(group).some((value) => value.trim() !== '');
      return hasContent ? group : null;
    })
    .filter(Boolean);
}

function selectGroup(group, buttonElement) {
  document.querySelectorAll('.group-card').forEach((button) => button.classList.remove('active'));
  if (buttonElement) buttonElement.classList.add('active');

  titleEl.textContent = group.title || 'Untitled group';
  descriptionEl.textContent = group.description || 'No description available.';
  linkEl.href = group.link || '#';
  linkEl.textContent = group.link ? 'Visit community link' : 'No community link available';
}

function renderGroups(groups) {
  groupListEl.innerHTML = '';
  console.log(groups);
  groups.forEach((group, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'group-card';
    button.innerHTML = `
      <div class="group-label">${group.title}</div>
      <div class="group-meta">${group.description.slice(0, 72)}${group.description.length > 72 ? '…' : ''}</div>
    `;
    button.addEventListener('click', () => selectGroup(group, button));
    groupListEl.appendChild(button);

    if (index === 0) selectGroup(group, button);
  });
}

function loadGroups() {
  fetch('groups.csv')
    .then((response) => {
      if (!response.ok) throw new Error('CSV fetch failed');
      return response.text();
    })
    .then((text) => {
      const parsed = parseCsv(text);
      if (!parsed.length) throw new Error('No rows found in CSV');
      //console.log('Parsed groups from CSV:', parsed);
      renderGroups(parsed);
    })
    .catch((error) => {
      console.warn('Unable to load groups.csv, using fallback groups.', error);
      renderGroups(fallbackGroups);
    });
}

window.addEventListener('load', () => {
  setTimeout(() => {
    logoWrap.classList.add('show');
    setTimeout(() => {
      logoWrap.classList.add('move');
      introScreen.classList.add('intro-hidden');
      setTimeout(() => {
        introScreen.style.display = 'none';
        app.classList.remove('hidden');
        loadGroups();
      }, 700);
    }, 1200);
  }, 100);
});
