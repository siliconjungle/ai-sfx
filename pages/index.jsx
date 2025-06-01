import React, { useState, useRef, useEffect } from 'react';
import { z }             from 'zod';
import { askZod, setApiKey } from '../lib/ai';
import { sfxr }          from '../jsfxr/_sfxr.js';
import styles            from './sfxr-demo.module.css';

/* ─── schema (unchanged) ──────────────────────────────────────────── */
const SoundSpec = z.object({
    oldParams:       z.boolean(),
  wave_type:       z.number(),
  p_env_attack:    z.number(),
  p_env_sustain:   z.number(),
  p_env_punch:     z.number(),
  p_env_decay:     z.number(),
  p_base_freq:     z.number(),
  p_freq_limit:    z.number(),
  p_freq_ramp:     z.number(),
  p_freq_dramp:    z.number(),
  p_vib_strength:  z.number(),
  p_vib_speed:     z.number(),
  p_arp_mod:       z.number(),
  p_arp_speed:     z.number(),
  p_duty:          z.number(),
  p_duty_ramp:     z.number(),
  p_repeat_speed:  z.number(),
  p_pha_offset:    z.number(),
  p_pha_ramp:      z.number(),
  p_lpf_freq:      z.number(),
  p_lpf_ramp:      z.number(),
  p_lpf_resonance: z.number(),
  p_hpf_freq:      z.number(),
  p_hpf_ramp:      z.number(),
  sound_vol:       z.number(),
  sample_rate:     z.number(),
  sample_size: z.literal(16),
}).strict();

/* ─── helpers ─────────────────────────────────────────────────────── */
const slug = (s) =>
  (s.toLowerCase().trim()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/^-+|-+$/g, '') || 'sound').slice(0, 60);

async function getSound(prompt) {
  const sys =
    'You are an expert retro-sound designer. Produce ONLY a jsfxr spec ' +
    'matching the schema and set sample_size to 16.';
  return askZod(SoundSpec, sys, prompt);
}

/* ─── component ───────────────────────────────────────────────────── */
export default function SfxrDemo() {
  const [text , setText ] = useState('');
  const [busy , setBusy ] = useState(false);
  const [wav  , setWav  ] = useState('');
  const [fname, setFname] = useState('');
  const [apiKey, setApiKeyInput] = useState('');      /* ← blank by default */

  const taRef  = useRef(null);
  const audioR = useRef(null);

  /* store key locally & tell the helper ----------------------------- */
  useEffect(() => {
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, [apiKey]);

  /* generate sound --------------------------------------------------- */
  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const spec = await getSound(text);
      const uri  = sfxr.toWave(spec).dataURI;
      setFname(slug(text));
      setWav(uri);
      setTimeout(() => audioR.current?.play(), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setText('');
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  /* ─── UI ────────────────────────────────────────────────────────── */
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>AI Retro FX</h1>
      <p className={styles.tagline}>
        Describe a sound effect and AI will create it.
      </p>

      {/* prompt */}
      <div className={styles.editor} onClick={() => taRef.current?.focus()}>
        <textarea
          ref={taRef}
          className={styles.textarea}
          rows={4}
          placeholder="e.g. coin pickup, laser zap, power-up chime, zombie moan…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          disabled={busy}
        />
        <button
          className={styles.send}
          onClick={submit}
          disabled={busy}
          aria-label="Generate"
        >
          {busy ? <span className={styles.spin}/> : '↥'}
        </button>
      </div>

      {/* result */}
      {wav && (
        <div className={styles.card}>
          <div className={styles.name}>{fname}.wav</div>
          <audio ref={audioR} src={wav} controls className={styles.player} />
          <div className={styles.dlRow}>
            <a className={styles.dl} href={wav} download={`${fname}.wav`}>
              Download wav
            </a>
          </div>
        </div>
      )}

      {/* api-key + warning */}
      <div className={styles.keyRow}>
        <input
          type="password"
          className={styles.keyInput}
          placeholder="OpenAI API key (not stored anywhere)"
          value={apiKey}
          onChange={(e) => setApiKeyInput(e.target.value)}
        />
        <small className={styles.warn}>
          ⚠️ Entering your key in a live webpage can expose it to others.
          For safety, clone & run locally →
          <a
            href="https://github.com/siliconjungle/ai-sfx"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repo
          </a>
        </small>
      </div>
    </main>
  );
}
