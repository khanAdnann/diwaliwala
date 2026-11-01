import { createClient } from '@supabase/supabase-js';
import { DEFAULT_GREETING_TEMPLATES } from '../config/festivalConfig';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY?.trim() || '';

const isValidSupabaseConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id');

export const supabase = isValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Sanitizes user text input to prevent HTML/script injection and enforces length limits
 */
export function sanitizeUserText(input, maxLength = 80) {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Fetches active greeting templates from Supabase with automatic fallback to local seed data
 */
export async function fetchGreetingTemplates() {
  if (!supabase) {
    return {
      templates: DEFAULT_GREETING_TEMPLATES,
      source: 'local',
    };
  }

  try {
    const { data, error } = await supabase
      .from('greeting_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        templates: DEFAULT_GREETING_TEMPLATES,
        source: 'local-fallback',
      };
    }

    return {
      templates: data,
      source: 'supabase',
    };
  } catch {
    return {
      templates: DEFAULT_GREETING_TEMPLATES,
      source: 'local-fallback',
    };
  }
}

/**
 * Saves generated wish metadata to Supabase `generated_wishes` table and local storage counter
 */
export async function saveGeneratedWish({ senderName, receiverName, templateId, language }) {
  const cleanSender = sanitizeUserText(senderName, 80);
  const cleanReceiver = sanitizeUserText(receiverName, 80) || null;
  const cleanTemplateId = sanitizeUserText(templateId, 100) || 'custom-template';
  const cleanLanguage = language === 'hi' ? 'hi' : 'en';

  if (!cleanSender) {
    throw new Error('Sender name is required to generate a wish.');
  }

  const record = {
    sender_name: cleanSender,
    receiver_name: cleanReceiver,
    template_id: cleanTemplateId,
    language: cleanLanguage,
    created_at: new Date().toISOString(),
  };

  // Store locally for offline resilience & instant stats update
  try {
    const existing = JSON.parse(localStorage.getItem('diwaliwala_wishes') || '[]');
    existing.unshift({ id: `local-${Date.now()}`, ...record });
    localStorage.setItem('diwaliwala_wishes', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // Ignore storage quota errors
  }

  if (!supabase) {
    return { saved: true, mode: 'local', record };
  }

  try {
    const { data, error } = await supabase
      .from('generated_wishes')
      .insert([
        {
          sender_name: cleanSender,
          receiver_name: cleanReceiver,
          template_id: cleanTemplateId,
          language: cleanLanguage,
        },
      ])
      .select()
      .single();

    if (error) {
      return { saved: true, mode: 'local-fallback', record };
    }

    return { saved: true, mode: 'supabase', record: data || record };
  } catch {
    return { saved: true, mode: 'local-fallback', record };
  }
}

/**
 * Logs analytics event to Supabase `website_analytics` table
 */
export async function trackAnalyticsEvent(eventName, pageName) {
  const cleanEvent = sanitizeUserText(eventName, 90);
  const cleanPage = sanitizeUserText(pageName, 90);
  if (!cleanEvent || !cleanPage) return;

  try {
    const count = Number(localStorage.getItem('diwaliwala_event_count') || '12840');
    localStorage.setItem('diwaliwala_event_count', String(count + 1));
  } catch {
    // Ignore
  }

  if (!supabase) return;

  try {
    await supabase.from('website_analytics').insert([
      {
        event_name: cleanEvent,
        page_name: cleanPage,
      },
    ]);
  } catch {
    // Analytics must never interrupt UX
  }
}

/**
 * Opt-in Cloud Save for Generated Creations (Never uploads private photos unless explicitly called)
 */
export async function uploadFestiveCreationOptIn(blob, prefix = 'diwali-creation') {
  if (!supabase) {
    throw new Error(
      'Supabase Cloud Storage is not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sharing links.'
    );
  }

  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const { error } = await supabase.storage
    .from('festive-creations')
    .upload(fileName, blob, {
      contentType: 'image/png',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || 'Could not upload to Supabase Storage.');
  }

  const { data: publicUrlData } = supabase.storage
    .from('festive-creations')
    .getPublicUrl(fileName);

  return publicUrlData?.publicUrl || null;
}

export function getSupabaseStatus() {
  return {
    configured: isValidSupabaseConfig,
    url: isValidSupabaseConfig ? supabaseUrl : null,
  };
}

