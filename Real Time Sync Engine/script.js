/**
 * =====================================================
 * Real-Time Event Synchronization Engine
 * script.js — Undergraduate Project
 *
 * Concepts demonstrated:
 *   1. Publisher-Subscriber (Pub/Sub) Pattern
 *   2. Event Queue with Priority Levels
 *   3. Real-Time Processing using setInterval
 *   4. DOM Manipulation
 *   5. JSON Payload Handling
 *   6. Live Statistics & Charting
 * =====================================================
 */

// =====================================================
// 1. ENGINE STATE
// =====================================================

let engineRunning = false;       // Is the engine on?
let processInterval = null;      // setInterval reference
let uptimeInterval  = null;      // Uptime counter reference
let uptimeSeconds   = 0;         // Seconds since engine started
let eventIdCounter  = 1000;      // Unique ID for each event

// Event Queue — stores pending events
let eventQueue = [];

// Subscribers — Map: topic -> [{ name, id }]
let subscribers = {};

// Statistics counters
let stats = {
  published:  0,
  delivered:  0,
  dropped:    0,
  byType:     {}
};

// Delivery log (last 30 entries)
let deliveryLog = [];

// =====================================================
// 2. ENGINE CONTROLS
// =====================================================

/**
 * startEngine()
 * Turns on the processing loop. Events in the queue
 * are dispatched to matching subscribers every 800ms.
 */
function startEngine() {
  if (engineRunning) return;
  engineRunning = true;

  // Update UI status
  document.getElementById('engineStatus').classList.add('online');
  document.getElementById('engineStatusText').textContent = 'Engine Running';
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled  = false;

  addLog('Engine started. Processing events every 800ms.', 'success');

  // Main processing loop
  processInterval = setInterval(processNextEvent, 800);

  // Uptime counter
  uptimeInterval = setInterval(() => {
    uptimeSeconds++;
    updateStat('statUptime', uptimeSeconds + 's');
  }, 1000);
}

/**
 * stopEngine()
 * Pauses the processing loop. Queue is preserved.
 */
function stopEngine() {
  if (!engineRunning) return;
  engineRunning = false;

  clearInterval(processInterval);
  clearInterval(uptimeInterval);
  processInterval = null;
  uptimeInterval  = null;

  document.getElementById('engineStatus').classList.remove('online');
  document.getElementById('engineStatusText').textContent = 'Engine Paused';
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled  = true;

  addLog('Engine stopped. Queue preserved.', 'warn');
}

/**
 * resetAll()
 * Clears everything: queue, subscribers, stats, logs.
 */
function resetAll() {
  stopEngine();

  eventQueue  = [];
  subscribers = {};
  deliveryLog = [];
  eventIdCounter = 1000;
  uptimeSeconds  = 0;

  stats = { published: 0, delivered: 0, dropped: 0, byType: {} };

  document.getElementById('engineStatusText').textContent = 'Engine Offline';
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled  = true;

  renderQueue();
  renderSubscribers();
  renderDeliveryLog();
  updateAllStats();
  renderChart();

  document.getElementById('eventLog').innerHTML =
    '<div class="log-entry log-info">[SYSTEM] Engine reset. All state cleared.</div>';

  addLog('All state cleared.', 'info');
}

// =====================================================
// 3. EVENT PUBLISHING
// =====================================================

/**
 * publishEvent()
 * Reads form inputs and pushes a new event onto the queue.
 */
function publishEvent() {
  if (!engineRunning) {
    addLog('Cannot publish — engine is not running. Start the engine first.', 'error');
    return;
  }

  const type     = document.getElementById('eventType').value;
  const payload  = document.getElementById('eventPayload').value.trim();
  const priority = document.getElementById('eventPriority').value;

  // Validate JSON payload
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch (e) {
    addLog('Invalid JSON payload. Please fix before publishing.', 'error');
    return;
  }

  // Build event object
  const event = {
    id:        'EVT-' + (++eventIdCounter),
    type:      type,
    payload:   parsedPayload,
    priority:  priority,
    timestamp: new Date().toLocaleTimeString(),
    status:    'PENDING'    // PENDING → PROCESSING → DELIVERED / DROPPED
  };

  // HIGH priority events go to the front of the queue
  if (priority === 'HIGH') {
    eventQueue.unshift(event);
  } else {
    eventQueue.push(event);
  }

  // Update stats
  stats.published++;
  stats.byType[type] = (stats.byType[type] || 0) + 1;

  addLog(`[PUBLISH] ${event.id} | ${type} | Priority: ${priority}`, 'event');
  updateAllStats();
  renderQueue();
  renderChart();
}

// =====================================================
// 4. EVENT PROCESSING (Core Sync Engine Logic)
// =====================================================

/**
 * processNextEvent()
 * Called by the processing loop every 800ms.
 * Picks the next event from the queue and dispatches it.
 */
function processNextEvent() {
  if (eventQueue.length === 0) return;

  // Pick the next pending event
  const eventIndex = eventQueue.findIndex(e => e.status === 'PENDING');
  if (eventIndex === -1) return;

  const event = eventQueue[eventIndex];
  event.status = 'PROCESSING';
  renderQueue();

  // Simulate async processing delay
  setTimeout(() => {
    dispatchEvent(event);
    // Remove from queue after processing
    eventQueue.splice(eventIndex, 1);
    renderQueue();
    updateAllStats();
  }, 400);
}

/**
 * dispatchEvent(event)
 * Delivers the event to all subscribers listening on that topic.
 * If no subscribers → event is DROPPED.
 */
function dispatchEvent(event) {
  const topicSubscribers = subscribers[event.type] || [];

  if (topicSubscribers.length === 0) {
    stats.dropped++;
    addLog(
      `[DROPPED] ${event.id} | ${event.type} — No subscribers for this topic.`,
      'warn'
    );
    document.getElementById('droppedCount').textContent =
      stats.dropped + ' Dropped';
    return;
  }

  // Deliver to each subscriber
  topicSubscribers.forEach(sub => {
    stats.delivered++;

    const deliveryEntry = {
      eventId:    event.id,
      type:       event.type,
      subscriber: sub.name,
      payload:    JSON.stringify(event.payload),
      time:       new Date().toLocaleTimeString()
    };

    deliveryLog.unshift(deliveryEntry);
    if (deliveryLog.length > 30) deliveryLog.pop(); // keep last 30

    addLog(
      `[DELIVER] ${event.id} → ${sub.name} | Topic: ${event.type}`,
      'deliver'
    );
  });

  renderDeliveryLog();
  updateAllStats();
}

// =====================================================
// 5. SUBSCRIBER MANAGEMENT
// =====================================================

/**
 * addSubscriber()
 * Registers a named subscriber for a given topic.
 */
function addSubscriber() {
  const nameInput = document.getElementById('subscriberName');
  const topic     = document.getElementById('subscriberTopic').value;
  const name      = nameInput.value.trim();

  if (!name) {
    addLog('Please enter a subscriber name.', 'error');
    return;
  }

  // Init topic array if needed
  if (!subscribers[topic]) subscribers[topic] = [];

  // Avoid duplicate subscriptions
  const alreadyExists = subscribers[topic].some(s => s.name === name);
  if (alreadyExists) {
    addLog(`[WARN] "${name}" is already subscribed to ${topic}.`, 'warn');
    return;
  }

  const sub = {
    id:    'SUB-' + Date.now(),
    name:  name,
    topic: topic
  };

  subscribers[topic].push(sub);
  nameInput.value = '';

  addLog(`[SUBSCRIBE] "${name}" subscribed to topic: ${topic}`, 'success');
  renderSubscribers();
  updateAllStats();
}

/**
 * removeSubscriber()
 * Removes a named subscriber from a topic.
 */
function removeSubscriber() {
  const nameInput = document.getElementById('subscriberName');
  const topic     = document.getElementById('subscriberTopic').value;
  const name      = nameInput.value.trim();

  if (!name) {
    addLog('Enter the subscriber name to unsubscribe.', 'error');
    return;
  }

  if (!subscribers[topic]) {
    addLog(`No subscribers found for topic: ${topic}`, 'warn');
    return;
  }

  const before = subscribers[topic].length;
  subscribers[topic] = subscribers[topic].filter(s => s.name !== name);

  if (subscribers[topic].length === before) {
    addLog(`"${name}" was not subscribed to ${topic}.`, 'warn');
  } else {
    addLog(`[UNSUBSCRIBE] "${name}" removed from topic: ${topic}`, 'info');
    renderSubscribers();
    updateAllStats();
  }

  nameInput.value = '';
}

// =====================================================
// 6. RENDERING FUNCTIONS (DOM Updates)
// =====================================================

/**
 * renderQueue() — Refreshes the event queue panel
 */
function renderQueue() {
  const container = document.getElementById('eventQueue');

  if (eventQueue.length === 0) {
    container.innerHTML = '<div class="empty-state">Queue is empty. Publish events to see them here!</div>';
    document.getElementById('queueCount').textContent = '0 Events';
    return;
  }

  document.getElementById('queueCount').textContent = eventQueue.length + ' Events';

  container.innerHTML = eventQueue.map(event => `
    <div class="queue-item priority-${event.priority} ${event.status === 'PROCESSING' ? 'processing' : ''}">
      <div>
        <div class="event-type">${event.type}</div>
        <div class="event-id">${event.id} &bull; ${event.timestamp}</div>
      </div>
      <span class="prio-tag prio-${event.priority}">${event.priority}</span>
    </div>
  `).join('');
}

/**
 * renderSubscribers() — Refreshes the subscriber list panel
 */
function renderSubscribers() {
  const container = document.getElementById('subscriberList');

  // Flatten all subscribers across topics
  const allSubs = [];
  for (const topic in subscribers) {
    subscribers[topic].forEach(sub => {
      allSubs.push({ ...sub, topic });
    });
  }

  if (allSubs.length === 0) {
    container.innerHTML = '<div class="empty-state">No subscribers yet.</div>';
    return;
  }

  container.innerHTML = allSubs.map(sub => `
    <div class="subscriber-item">
      <div class="sub-info">
        <span class="sub-name">${sub.name}</span>
        <span class="sub-topic">${sub.topic}</span>
      </div>
      <span class="sub-status"></span>
    </div>
  `).join('');
}

/**
 * renderDeliveryLog() — Refreshes the delivered events panel
 */
function renderDeliveryLog() {
  const container = document.getElementById('deliveryLog');

  if (deliveryLog.length === 0) {
    container.innerHTML = '<div class="empty-state">No deliveries yet.</div>';
    return;
  }

  container.innerHTML = deliveryLog.map(d => `
    <div class="delivery-item">
      <div class="d-header">${d.eventId} → ${d.subscriber}</div>
      <div>Topic: ${d.type} &bull; ${d.time}</div>
      <div>Payload: ${d.payload.length > 60 ? d.payload.slice(0, 60) + '…' : d.payload}</div>
    </div>
  `).join('');
}

/**
 * renderChart() — Draws event-type distribution bars
 */
function renderChart() {
  const container = document.getElementById('eventChart');
  const types = Object.keys(stats.byType);

  if (types.length === 0) {
    container.innerHTML = '<div class="empty-state">No event data yet.</div>';
    return;
  }

  const maxVal = Math.max(...Object.values(stats.byType), 1);

  container.innerHTML = types.map(type => {
    const val   = stats.byType[type];
    const pct   = Math.round((val / maxVal) * 100);
    return `
      <div class="chart-row">
        <div class="chart-label" title="${type}">${type}</div>
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="width:${pct}%"></div>
        </div>
        <div class="chart-val">${val}</div>
      </div>
    `;
  }).join('');
}

// =====================================================
// 7. STATISTICS HELPERS
// =====================================================

function updateAllStats() {
  updateStat('statPublished',  stats.published);
  updateStat('statDelivered',  stats.delivered);
  document.getElementById('droppedCount').textContent  = stats.dropped + ' Dropped';
  document.getElementById('processedCount').textContent = stats.delivered + ' Processed';

  // Count total subscribers
  let total = 0;
  for (const t in subscribers) total += subscribers[t].length;
  updateStat('statSubscribers', total);
}

function updateStat(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
    el.classList.remove('flash-green');
    void el.offsetWidth; // reflow trick to restart animation
    el.classList.add('flash-green');
  }
}

// =====================================================
// 8. EVENT LOG
// =====================================================

/**
 * addLog(message, type)
 * Appends a timestamped entry to the event log.
 * type: 'info' | 'success' | 'error' | 'warn' | 'event' | 'deliver'
 */
function addLog(message, type = 'info') {
  const logContainer = document.getElementById('eventLog');
  const time = new Date().toLocaleTimeString();

  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.textContent = `[${time}] ${message}`;

  // Prepend (newest first)
  logContainer.insertBefore(entry, logContainer.firstChild);

  // Keep max 100 entries
  while (logContainer.children.length > 100) {
    logContainer.removeChild(logContainer.lastChild);
  }
}

function clearLog() {
  document.getElementById('eventLog').innerHTML =
    '<div class="log-entry log-info">[SYSTEM] Log cleared.</div>';
}

function exportLog() {
  const entries = document.getElementById('eventLog').innerText;
  const blob    = new Blob([entries], { type: 'text/plain' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href     = url;
  a.download = 'sync-engine-log.txt';
  a.click();
  URL.revokeObjectURL(url);
  addLog('Log exported as sync-engine-log.txt', 'success');
}

// =====================================================
// 9. DEMO — Auto-load sample subscribers on page load
// =====================================================

window.addEventListener('DOMContentLoaded', () => {
  // Add a few default subscribers for demonstration
  const defaults = [
    { name: 'AuthService',     topic: 'USER_LOGIN' },
    { name: 'AnalyticsDB',     topic: 'DATA_UPDATE' },
    { name: 'PaymentGateway',  topic: 'PAYMENT_PROCESSED' },
    { name: 'PushNotifier',    topic: 'NOTIFICATION' },
    { name: 'ErrorMonitor',    topic: 'ERROR_ALERT' },
    { name: 'HealthChecker',   topic: 'SYSTEM_HEALTH' },
  ];

  defaults.forEach(d => {
    if (!subscribers[d.topic]) subscribers[d.topic] = [];
    subscribers[d.topic].push({ id: 'SUB-' + Date.now() + Math.random(), name: d.name, topic: d.topic });
  });

  addLog('Default subscribers loaded: AuthService, AnalyticsDB, PaymentGateway, PushNotifier, ErrorMonitor, HealthChecker', 'success');
  renderSubscribers();
  updateAllStats();
});
