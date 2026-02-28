import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let realtimeSubscriptions = new Map();

export function initializeRealtime() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not configured for real-time');
      return false;
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase Real-time initialized');
    return true;
  } catch (error) {
    console.error('✗ Failed to initialize Supabase:', error.message);
    return false;
  }
}

// Subscribe to table changes
export function subscribeToTable(table, callback) {
  if (!supabase) {
    console.warn(`Real-time not initialized, cannot subscribe to ${table}`);
    return null;
  }

  try {
    const subscription = supabase
      .channel(`${table}:changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✓ Subscribed to ${table} changes`);
        } else if (status === 'CLOSED') {
          console.log(`✗ Unsubscribed from ${table} changes`);
        }
      });

    realtimeSubscriptions.set(table, subscription);
    return subscription;
  } catch (error) {
    console.error(`Error subscribing to ${table}:`, error.message);
    return null;
  }
}

// Unsubscribe from table
export function unsubscribeFromTable(table) {
  const subscription = realtimeSubscriptions.get(table);
  if (subscription) {
    supabase.removeChannel(subscription);
    realtimeSubscriptions.delete(table);
    console.log(`✗ Unsubscribed from ${table}`);
  }
}

// Get all subscriptions
export function getSubscriptions() {
  return Array.from(realtimeSubscriptions.keys());
}

// Broadcast changes to connected clients
export function broadcastChange(wsClients, table, payload) {
  const message = JSON.stringify({
    type: 'db_change',
    table,
    event: payload.eventType,
    new: payload.new,
    old: payload.old,
    timestamp: new Date().toISOString()
  });

  wsClients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
}

// Listen for specific events (INSERT, UPDATE, DELETE)
export function subscribeToTableEvent(table, event, callback) {
  if (!supabase) {
    console.warn(`Real-time not initialized, cannot subscribe to ${table}.${event}`);
    return null;
  }

  try {
    const subscription = supabase
      .channel(`${table}:${event}`)
      .on(
        'postgres_changes',
        {
          event: event.toUpperCase(),
          schema: 'public',
          table: table
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    realtimeSubscriptions.set(`${table}:${event}`, subscription);
    return subscription;
  } catch (error) {
    console.error(`Error subscribing to ${table}.${event}:`, error.message);
    return null;
  }
}

// Get current Supabase client
export function getSupabaseClient() {
  return supabase;
}

// Check real-time status
export function isRealtimeConnected() {
  return supabase !== null;
}
