const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const TODO_FILE = path.join(DATA_DIR, 'todos.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readTodos() {
  ensureDataDir();
  if (!fs.existsSync(TODO_FILE)) {
    const initial = { entries: [], groups: [], nextId: 1 };
    fs.writeFileSync(TODO_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
}

function writeTodos(data) {
  ensureDataDir();
  fs.writeFileSync(TODO_FILE, JSON.stringify(data, null, 2));
}

function loadRawArgs() {
  const args = process.argv.slice(2);
  const result = { command: args[0], params: {} };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--text' || arg === '-t') {
      result.params.text = args[++i];
    } else if (arg === '--id' || arg === '-i') {
      result.params.id = parseInt(args[++i]);
    } else if (arg === '--status' || arg === '-s') {
      result.params.status = args[++i];
    } else if (arg === '--group' || arg === '-g') {
      result.params.group = args[++i];
    } else if (arg === '--new-name') {
      result.params.newName = args[++i];
    } else if (arg === '--delete-entries') {
      result.params.deleteEntries = true;
    } else if (arg === '--all') {
      result.params.showAll = true;
    }
  }

  return result;
}

const { command, params } = loadRawArgs();
const todos = readTodos();

switch (command) {
  case 'add': {
    const text = params.text;
    const group = params.group || 'Inbox';
    const status = params.status || 'pending';

    if (!todos.groups.includes(group)) {
      todos.groups.push(group);
    }

    const entry = {
      id: todos.nextId++,
      text,
      status,
      group,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.entries.push(entry);
    writeTodos(todos);
    console.log(JSON.stringify({ success: true, id: entry.id }));
    break;
  }

  case 'list': {
    let entries = todos.entries;

    if (params.group) {
      entries = entries.filter(e => e.group === params.group);
    }

    if (params.status) {
      entries = entries.filter(e => e.status === params.status);
    }

    if (!params.showAll) {
      entries = entries.filter(e => e.status !== 'done' && e.status !== 'skipped');
    }

    console.log(JSON.stringify({ success: true, entries, groups: todos.groups }));
    break;
  }

  case 'complete':
  case 'done': {
    const entry = todos.entries.find(e => e.id === params.id);
    if (entry) {
      entry.status = 'done';
      entry.updatedAt = new Date().toISOString();
      writeTodos(todos);
      console.log(JSON.stringify({ success: true }));
    } else {
      console.log(JSON.stringify({ success: false, error: 'Entry not found' }));
    }
    break;
  }

  case 'start': {
    const entry = todos.entries.find(e => e.id === params.id);
    if (entry) {
      entry.status = 'in_progress';
      entry.updatedAt = new Date().toISOString();
      writeTodos(todos);
      console.log(JSON.stringify({ success: true }));
    } else {
      console.log(JSON.stringify({ success: false, error: 'Entry not found' }));
    }
    break;
  }

  case 'remove': {
    todos.entries = todos.entries.filter(e => e.id !== params.id);
    writeTodos(todos);
    console.log(JSON.stringify({ success: true }));
    break;
  }

  case 'edit': {
    const entry = todos.entries.find(e => e.id === params.id);
    if (entry) {
      entry.text = params.text || entry.text;
      entry.updatedAt = new Date().toISOString();
      writeTodos(todos);
      console.log(JSON.stringify({ success: true }));
    } else {
      console.log(JSON.stringify({ success: false, error: 'Entry not found' }));
    }
    break;
  }

  case 'move': {
    const entry = todos.entries.find(e => e.id === params.id);
    if (entry) {
      if (!todos.groups.includes(params.group)) {
        todos.groups.push(params.group);
      }
      entry.group = params.group;
      entry.updatedAt = new Date().toISOString();
      writeTodos(todos);
      console.log(JSON.stringify({ success: true }));
    } else {
      console.log(JSON.stringify({ success: false, error: 'Entry not found' }));
    }
    break;
  }

  case 'group-add': {
    if (!todos.groups.includes(params.group)) {
      todos.groups.push(params.group);
      writeTodos(todos);
    }
    console.log(JSON.stringify({ success: true }));
    break;
  }

  case 'group-rename': {
    const idx = todos.groups.indexOf(params.group);
    if (idx !== -1) {
      todos.groups[idx] = params.newName;
      todos.entries.forEach(e => {
        if (e.group === params.group) e.group = params.newName;
      });
      writeTodos(todos);
      console.log(JSON.stringify({ success: true }));
    } else {
      console.log(JSON.stringify({ success: false, error: 'Group not found' }));
    }
    break;
  }

  case 'group-remove': {
    if (params.deleteEntries) {
      todos.entries = todos.entries.filter(e => e.group !== params.group);
      todos.groups = todos.groups.filter(g => g !== params.group);
    } else {
      todos.entries.forEach(e => {
        if (e.group === params.group) e.group = 'Inbox';
      });
      todos.groups = todos.groups.filter(g => g !== params.group);
      if (!todos.groups.includes('Inbox')) {
        todos.groups.unshift('Inbox');
      }
    }
    writeTodos(todos);
    console.log(JSON.stringify({ success: true }));
    break;
  }

  case 'group-list': {
    console.log(JSON.stringify({ success: true, groups: todos.groups }));
    break;
  }

  default:
    console.log(JSON.stringify({ success: false, error: 'Unknown command' }));
}
