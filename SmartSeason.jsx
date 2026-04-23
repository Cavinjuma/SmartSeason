import { useState, useEffect, useRef } from "react";

// ─── INITIAL DATA ──────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: "Grace Okonkwo", email: "admin@smartseason.io", password: "admin123", role: "admin", avatar: "GO" },
  { id: 2, name: "James Mwangi",  email: "james@smartseason.io", password: "agent123", role: "agent", avatar: "JM" },
  { id: 3, name: "Aisha Diallo",  email: "aisha@smartseason.io", password: "agent123", role: "agent", avatar: "AD" },
  { id: 4, name: "Samuel Kipchoge", email: "samuel@smartseason.io", password: "agent123", role: "agent", avatar: "SK" },
];

const INITIAL_FIELDS = [
  {
    id: 1, name: "North Ridge Plot", crop: "Maize", plantingDate: "2025-11-01",
    stage: "Growing", agentId: 2, hectares: 12,
    notes: [{ id: 1, agentId: 2, text: "Good moisture levels, pest check done.", date: "2025-11-20" }],
    lastUpdated: "2025-11-20",
  },
  {
    id: 2, name: "Valley Green", crop: "Wheat", plantingDate: "2025-10-15",
    stage: "Ready", agentId: 2, hectares: 8,
    notes: [{ id: 2, agentId: 2, text: "Ready for harvest this week.", date: "2025-12-10" }],
    lastUpdated: "2025-12-10",
  },
  {
    id: 3, name: "Sunrise Acres", crop: "Sorghum", plantingDate: "2025-11-10",
    stage: "Planted", agentId: 3, hectares: 20,
    notes: [],
    lastUpdated: "2025-11-10",
  },
  {
    id: 4, name: "Lakeshore Farm", crop: "Rice", plantingDate: "2025-09-05",
    stage: "Harvested", agentId: 3, hectares: 15,
    notes: [{ id: 3, agentId: 3, text: "Excellent yield — 4.2T/ha.", date: "2025-12-01" }],
    lastUpdated: "2025-12-01",
  },
  {
    id: 5, name: "Dry Basin Plot", crop: "Millet", plantingDate: "2025-11-25",
    stage: "Planted", agentId: 4, hectares: 5,
    notes: [],
    lastUpdated: "2025-11-25",
  },
  {
    id: 6, name: "Eastern Slope", crop: "Cassava", plantingDate: "2025-08-01",
    stage: "Growing", agentId: 4, hectares: 18,
    notes: [{ id: 4, agentId: 4, text: "Slight yellowing on eastern edge, monitoring.", date: "2025-12-05" }],
    lastUpdated: "2025-12-05",
  },
];

const STAGES = ["Planted", "Growing", "Ready", "Harvested"];
const CROPS = ["Maize", "Wheat", "Sorghum", "Rice", "Millet", "Cassava", "Beans", "Cotton", "Sunflower", "Barley"];

// ─── STATUS LOGIC ──────────────────────────────────────────────────────────────
function computeStatus(field) {
  if (field.stage === "Harvested") return "Completed";
  const planted = new Date(field.plantingDate);
  const now = new Date("2026-04-21");
  const daysSincePlanting = Math.floor((now - planted) / 86400000);
  const expectedDays = { Planted: 14, Growing: 90, Ready: 110 };
  const maxDays = expectedDays[field.stage] || 90;
  if (daysSincePlanting > maxDays * 1.3) return "At Risk";
  if (field.notes.length === 0 && daysSincePlanting > 30) return "At Risk";
  return "Active";
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --soil: #1a1208;
  --earth: #2d1f0e;
  --bark: #4a3520;
  --clay: #7a5c38;
  --straw: #c9a96e;
  --cream: #f5ead8;
  --parchment: #fdf6ec;
  --leaf: #2e6b3e;
  --leaf-light: #4a9b5f;
  --leaf-dark: #1a4226;
  --sage: #7aab8a;
  --amber: #d4820a;
  --amber-light: #f0a830;
  --risk: #c0392b;
  --risk-light: #e74c3c;
  --sky: #3b7ca8;
  --mist: rgba(245, 234, 216, 0.08);
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,0.35);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
}

body { font-family: 'DM Sans', sans-serif; background: var(--soil); color: var(--cream); min-height: 100vh; overflow-x: hidden; }

/* scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--earth); }
::-webkit-scrollbar-thumb { background: var(--clay); border-radius: 3px; }

/* ── LOGIN ── */
.login-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 30% 50%, #2e6b3e22 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, #d4820a18 0%, transparent 50%),
              var(--soil);
  padding: 24px;
}
.login-card {
  width: 100%; max-width: 440px; background: var(--earth);
  border: 1px solid rgba(201,169,110,0.2); border-radius: 20px;
  padding: 48px 40px; box-shadow: 0 20px 80px rgba(0,0,0,0.6);
  animation: fadeUp 0.5s ease;
}
.login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; }
.login-logo-icon { width: 44px; height: 44px; background: var(--leaf); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.login-logo h1 { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--cream); }
.login-logo span { font-size: 13px; color: var(--straw); font-weight: 300; letter-spacing: 0.05em; display: block; margin-top: 2px; }
.login-title { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--cream); margin-bottom: 8px; }
.login-sub { font-size: 14px; color: var(--straw); margin-bottom: 32px; }
.field-group { margin-bottom: 20px; }
.field-group label { display: block; font-size: 12px; font-weight: 600; color: var(--straw); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
.field-group input {
  width: 100%; padding: 12px 16px; background: var(--bark);
  border: 1px solid rgba(201,169,110,0.2); border-radius: var(--radius);
  color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s; outline: none;
}
.field-group input:focus { border-color: var(--leaf-light); box-shadow: 0 0 0 3px rgba(74,155,95,0.2); }
.field-group input::placeholder { color: var(--clay); }
.btn-primary {
  width: 100%; padding: 14px; background: var(--leaf); border: none; border-radius: var(--radius);
  color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: background 0.2s, transform 0.1s; letter-spacing: 0.02em;
}
.btn-primary:hover { background: var(--leaf-light); }
.btn-primary:active { transform: scale(0.98); }
.login-creds {
  margin-top: 24px; padding: 16px; background: rgba(201,169,110,0.08);
  border: 1px solid rgba(201,169,110,0.15); border-radius: var(--radius);
}
.login-creds p { font-size: 12px; color: var(--straw); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.login-creds code { font-size: 12px; color: var(--cream); display: block; margin-bottom: 4px; opacity: 0.8; }
.login-error { background: rgba(192,57,43,0.2); border: 1px solid rgba(192,57,43,0.4); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #ff8a80; margin-bottom: 16px; }

/* ── LAYOUT ── */
.app { display: flex; min-height: 100vh; }

/* ── SIDEBAR ── */
.sidebar {
  width: 240px; background: var(--earth); border-right: 1px solid rgba(201,169,110,0.12);
  display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh;
  transition: transform 0.3s ease; z-index: 100;
}
.sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(201,169,110,0.12); display: flex; align-items: center; gap: 10px; }
.sidebar-logo-icon { width: 36px; height: 36px; background: var(--leaf); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.sidebar-logo h2 { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--cream); }
.sidebar-logo span { font-size: 10px; color: var(--sage); text-transform: uppercase; letter-spacing: 0.1em; display: block; }
.sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.nav-section-label { font-size: 10px; font-weight: 700; color: var(--clay); text-transform: uppercase; letter-spacing: 0.12em; padding: 12px 8px 6px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
  cursor: pointer; transition: background 0.15s, color 0.15s; color: var(--straw);
  font-size: 14px; font-weight: 500; margin-bottom: 2px; border: none; background: none;
  width: 100%; text-align: left;
}
.nav-item:hover { background: var(--mist); color: var(--cream); }
.nav-item.active { background: rgba(46,107,62,0.3); color: var(--sage); }
.nav-item .nav-icon { width: 20px; text-align: center; font-size: 16px; }
.nav-badge { margin-left: auto; background: var(--leaf); color: var(--cream); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
.sidebar-user { padding: 16px 20px; border-top: 1px solid rgba(201,169,110,0.12); }
.user-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; background: var(--leaf-dark); border: 2px solid var(--leaf); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--sage); flex-shrink: 0; }
.user-details p { font-size: 13px; font-weight: 600; color: var(--cream); }
.user-details span { font-size: 11px; color: var(--straw); text-transform: capitalize; }
.btn-logout { margin-top: 10px; width: 100%; padding: 8px; background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.3); border-radius: 8px; color: #ff8a80; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; letter-spacing: 0.04em; }
.btn-logout:hover { background: rgba(192,57,43,0.3); }

/* ── MAIN ── */
.main { flex: 1; margin-left: 240px; min-height: 100vh; background: var(--soil); }
.topbar {
  position: sticky; top: 0; z-index: 50; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between;
  background: rgba(26,18,8,0.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(201,169,110,0.1);
}
.topbar-title h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--cream); }
.topbar-title p { font-size: 13px; color: var(--straw); }
.topbar-actions { display: flex; align-items: center; gap: 12px; }
.page { padding: 32px; max-width: 1200px; }

/* ── HAMBURGER ── */
.hamburger { display: none; width: 36px; height: 36px; background: var(--bark); border: none; border-radius: 8px; cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.hamburger span { display: block; width: 18px; height: 2px; background: var(--cream); border-radius: 2px; }
.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }

/* ── CARDS ── */
.card { background: var(--earth); border: 1px solid rgba(201,169,110,0.12); border-radius: 16px; }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
.stat-card { padding: 20px 24px; position: relative; overflow: hidden; }
.stat-card::before { content:''; position: absolute; top: 0; right: 0; width: 80px; height: 80px; border-radius: 50%; opacity: 0.06; transform: translate(20px, -20px); }
.stat-card.green::before { background: var(--leaf-light); }
.stat-card.amber::before { background: var(--amber); }
.stat-card.red::before { background: var(--risk); }
.stat-card.blue::before { background: var(--sky); }
.stat-label { font-size: 11px; font-weight: 700; color: var(--clay); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.stat-value { font-family: 'Playfair Display', serif; font-size: 36px; color: var(--cream); margin-bottom: 4px; }
.stat-sub { font-size: 12px; color: var(--straw); }
.stat-icon { position: absolute; top: 20px; right: 20px; font-size: 24px; opacity: 0.5; }

/* ── FIELDS TABLE / GRID ── */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: gap; gap: 12px; }
.section-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--cream); }
.section-subtitle { font-size: 13px; color: var(--straw); margin-top: 2px; }

.fields-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.field-card {
  padding: 20px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; position: relative;
  border-left: 3px solid transparent;
}
.field-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.field-card.status-Active { border-left-color: var(--leaf-light); }
.field-card.status-At.Risk { border-left-color: var(--risk); }
.field-card.status-Completed { border-left-color: var(--straw); }
.field-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; gap: 8px; }
.field-name { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--cream); }
.field-crop { font-size: 12px; color: var(--straw); margin-top: 2px; }
.field-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.tag {
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.tag-stage { background: rgba(74,155,95,0.15); color: var(--sage); }
.tag-status-Active { background: rgba(74,155,95,0.2); color: var(--leaf-light); }
.tag-status-At { background: rgba(192,57,43,0.2); color: var(--risk-light); }
.tag-status-Completed { background: rgba(201,169,110,0.15); color: var(--straw); }
.tag-status-Risk { display: none; } /* combined above */
.field-progress { margin-bottom: 14px; }
.progress-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--straw); margin-bottom: 6px; }
.progress-bar { height: 4px; background: var(--bark); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; background: var(--leaf-light); transition: width 0.6s ease; }
.field-footer { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--clay); }
.agent-chip { display: flex; align-items: center; gap: 6px; }
.avatar-sm { width: 22px; height: 22px; background: var(--leaf-dark); border: 1px solid var(--leaf); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--sage); }

/* ── BUTTONS ── */
.btn { padding: 9px 18px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; letter-spacing: 0.02em; display: inline-flex; align-items: center; gap: 6px; }
.btn-green { background: var(--leaf); color: var(--cream); }
.btn-green:hover { background: var(--leaf-light); }
.btn-outline { background: transparent; color: var(--straw); border: 1px solid rgba(201,169,110,0.3); }
.btn-outline:hover { background: var(--mist); color: var(--cream); }
.btn-danger { background: rgba(192,57,43,0.2); color: var(--risk-light); border: 1px solid rgba(192,57,43,0.3); }
.btn-danger:hover { background: rgba(192,57,43,0.35); }
.btn-amber { background: var(--amber); color: white; }
.btn-amber:hover { background: var(--amber-light); }
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 8px; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: fadeIn 0.2s ease;
}
.modal {
  background: var(--earth); border: 1px solid rgba(201,169,110,0.2); border-radius: 20px;
  width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,0.7); animation: slideUp 0.25s ease;
}
.modal-header { padding: 24px 28px 0; display: flex; align-items: flex-start; justify-content: space-between; }
.modal-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--cream); }
.modal-sub { font-size: 13px; color: var(--straw); margin-top: 4px; }
.modal-close { width: 32px; height: 32px; background: var(--bark); border: none; border-radius: 8px; cursor: pointer; color: var(--straw); font-size: 18px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
.modal-close:hover { background: var(--clay); color: var(--cream); }
.modal-body { padding: 24px 28px; }
.modal-footer { padding: 0 28px 24px; display: flex; gap: 10px; justify-content: flex-end; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--straw); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 10px 14px; background: var(--bark);
  border: 1px solid rgba(201,169,110,0.2); border-radius: 10px;
  color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 14px;
  outline: none; transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--leaf-light); }
.form-group select option { background: var(--bark); }
.form-group textarea { resize: vertical; min-height: 80px; }
.form-group input::placeholder, .form-group textarea::placeholder { color: var(--clay); }

/* ── FIELD DETAIL ── */
.detail-modal { max-width: 640px; }
.detail-hero { background: linear-gradient(135deg, var(--leaf-dark), var(--bark)); padding: 24px 28px; margin: 0 -28px; }
.detail-stage-track { display: flex; align-items: center; margin-top: 16px; gap: 0; }
.stage-step { flex: 1; text-align: center; position: relative; }
.stage-step::before { content:''; position:absolute; top: 12px; left: -50%; width: 100%; height: 2px; background: var(--clay); z-index: 0; }
.stage-step:first-child::before { display: none; }
.stage-dot { width: 24px; height: 24px; border-radius: 50%; background: var(--bark); border: 2px solid var(--clay); display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 10px; position: relative; z-index: 1; transition: all 0.3s; }
.stage-dot.done { background: var(--leaf); border-color: var(--leaf-light); }
.stage-dot.current { background: var(--amber); border-color: var(--amber-light); box-shadow: 0 0 12px rgba(212,130,10,0.5); }
.stage-label { font-size: 10px; color: var(--straw); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

.notes-list { space-y: 12px; }
.note-item { padding: 12px 14px; background: var(--bark); border-radius: 10px; margin-bottom: 10px; border-left: 2px solid var(--leaf); }
.note-item p { font-size: 13px; color: var(--cream); line-height: 1.5; }
.note-meta { font-size: 11px; color: var(--clay); margin-top: 6px; display: flex; gap: 12px; }
.empty-state { text-align: center; padding: 32px; color: var(--clay); font-size: 14px; }
.empty-state .empty-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.4; }

/* ── FILTERS ── */
.filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
.filter-chip {
  padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
  cursor: pointer; border: 1px solid rgba(201,169,110,0.2); background: transparent;
  color: var(--straw); transition: all 0.15s; letter-spacing: 0.04em;
}
.filter-chip.active { background: var(--leaf); border-color: var(--leaf); color: var(--cream); }
.filter-chip:hover:not(.active) { background: var(--mist); color: var(--cream); }
.search-box {
  padding: 8px 14px; background: var(--earth); border: 1px solid rgba(201,169,110,0.2);
  border-radius: 10px; color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 13px;
  outline: none; width: 200px; transition: border-color 0.2s;
}
.search-box:focus { border-color: var(--leaf-light); }
.search-box::placeholder { color: var(--clay); }

/* ── AGENTS PAGE ── */
.agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.agent-card { padding: 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.agent-avatar { width: 52px; height: 52px; background: var(--leaf-dark); border: 2px solid var(--leaf); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: var(--sage); }
.agent-name { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--cream); }
.agent-email { font-size: 12px; color: var(--straw); }
.agent-stats { display: flex; gap: 16px; width: 100%; }
.agent-stat { flex: 1; background: var(--bark); border-radius: 8px; padding: 10px; text-align: center; }
.agent-stat-val { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--cream); }
.agent-stat-label { font-size: 10px; color: var(--straw); text-transform: uppercase; letter-spacing: 0.08em; }

/* ── ACTIVITY FEED ── */
.activity-item { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(201,169,110,0.08); }
.activity-item:last-child { border-bottom: none; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--leaf-light); flex-shrink: 0; margin-top: 6px; }
.activity-dot.risk { background: var(--risk-light); }
.activity-dot.amber { background: var(--amber-light); }
.activity-text { font-size: 13px; color: var(--cream); line-height: 1.5; }
.activity-time { font-size: 11px; color: var(--clay); margin-top: 3px; }

/* ── TOAST ── */
.toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; flex-direction: column; gap: 8px; }
.toast {
  background: var(--bark); border: 1px solid rgba(201,169,110,0.2); border-radius: 12px;
  padding: 12px 18px; font-size: 13px; color: var(--cream); max-width: 300px;
  box-shadow: var(--shadow); display: flex; align-items: center; gap: 10px;
  animation: slideInRight 0.3s ease;
}
.toast.success { border-left: 3px solid var(--leaf-light); }
.toast.error { border-left: 3px solid var(--risk-light); }

/* ── ANIMATIONS ── */
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
.fade-up { animation: fadeUp 0.4s ease both; }
.fade-up-delay { animation: fadeUp 0.4s ease 0.1s both; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay.open { display: block; }
  .main { margin-left: 0; }
  .hamburger { display: flex; }
  .topbar { padding: 14px 16px; }
  .page { padding: 20px 16px; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .fields-grid { grid-template-columns: 1fr; }
  .agents-grid { grid-template-columns: 1fr; }
  .filters { flex-direction: column; align-items: stretch; }
  .search-box { width: 100%; }
  .modal { border-radius: 16px; }
}
@media (max-width: 480px) {
  .stat-grid { grid-template-columns: 1fr; }
  .login-card { padding: 36px 24px; }
}

/* ── DIVIDER ── */
.divider { height: 1px; background: rgba(201,169,110,0.1); margin: 20px 0; }
.text-muted { color: var(--straw); font-size: 13px; }
.text-danger { color: var(--risk-light); }
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
`;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const stageIndex = s => STAGES.indexOf(s);
const stageProgress = s => ((stageIndex(s) + 1) / STAGES.length) * 100;

function getAgent(users, id) { return users.find(u => u.id === id); }

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── STATUS TAG ───────────────────────────────────────────────────────────────
function StatusTag({ status }) {
  const cls = status === "At Risk" ? "tag tag-status-At" : `tag tag-status-${status}`;
  return <span className={cls}>{status}</span>;
}

// ─── STAGE TRACK ─────────────────────────────────────────────────────────────
function StageTrack({ current }) {
  const ci = stageIndex(current);
  return (
    <div className="detail-stage-track">
      {STAGES.map((s, i) => (
        <div key={s} className="stage-step">
          <div className={`stage-dot ${i < ci ? "done" : i === ci ? "current" : ""}`}>
            {i < ci ? "✓" : i === ci ? "●" : ""}
          </div>
          <div className="stage-label">{s}</div>
        </div>
      ))}
    </div>
  );
}

// ─── FIELD CARD ───────────────────────────────────────────────────────────────
function FieldCard({ field, users, onClick }) {
  const status = computeStatus(field);
  const agent = getAgent(users, field.agentId);
  const prog = stageProgress(field.stage);
  return (
    <div className={`card field-card status-${status.replace(" ", ".")}`} onClick={onClick}>
      <div className="field-card-header">
        <div>
          <div className="field-name">{field.name}</div>
          <div className="field-crop">🌾 {field.crop} · {field.hectares} ha</div>
        </div>
        <StatusTag status={status} />
      </div>
      <div className="field-meta">
        <span className="tag tag-stage">{field.stage}</span>
      </div>
      <div className="field-progress">
        <div className="progress-label">
          <span>Progress</span>
          <span>{Math.round(prog)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${prog}%`, background: field.stage === "Harvested" ? "var(--straw)" : field.stage === "Ready" ? "var(--amber-light)" : "var(--leaf-light)" }} />
        </div>
      </div>
      <div className="field-footer">
        {agent ? (
          <div className="agent-chip">
            <div className="avatar-sm">{agent.avatar}</div>
            <span>{agent.name}</span>
          </div>
        ) : <span>Unassigned</span>}
        <span>📅 {fmtDate(field.lastUpdated)}</span>
      </div>
    </div>
  );
}

// ─── FIELD DETAIL MODAL ───────────────────────────────────────────────────────
function FieldDetailModal({ field, users, currentUser, onClose, onUpdate, onDelete }) {
  const [noteText, setNoteText] = useState("");
  const [newStage, setNewStage] = useState(field.stage);
  const status = computeStatus(field);
  const agent = getAgent(users, field.agentId);
  const isAdmin = currentUser.role === "admin";
  const isAssigned = currentUser.id === field.agentId;
  const canEdit = isAdmin || isAssigned;

  function submitNote() {
    if (!noteText.trim()) return;
    const note = { id: Date.now(), agentId: currentUser.id, text: noteText.trim(), date: new Date().toISOString().slice(0, 10) };
    onUpdate(field.id, { notes: [...field.notes, note], lastUpdated: note.date });
    setNoteText("");
  }

  function updateStage() {
    if (newStage !== field.stage) {
      onUpdate(field.id, { stage: newStage, lastUpdated: new Date().toISOString().slice(0, 10) });
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{field.name}</div>
            <div className="modal-sub">{field.crop} · {field.hectares} ha · <StatusTag status={status} /></div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Stage Track */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--straw)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Growth Stage</div>
            <StageTrack current={field.stage} />
          </div>
          <div className="divider" />

          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["🗓 Planting Date", fmtDate(field.plantingDate)],
              ["📅 Last Updated", fmtDate(field.lastUpdated)],
              ["👤 Field Agent", agent?.name || "Unassigned"],
              ["📍 Size", `${field.hectares} hectares`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "var(--bark)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--straw)", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 14, color: "var(--cream)", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Update Stage */}
          {canEdit && field.stage !== "Harvested" && (
            <>
              <div className="divider" />
              <div className="form-group">
                <label>Update Stage</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={newStage} onChange={e => setNewStage(e.target.value)} style={{ flex: 1 }}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-green btn-sm" onClick={updateStage} disabled={newStage === field.stage}>Save</button>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="divider" />
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--straw)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Field Notes ({field.notes.length})
          </div>
          {field.notes.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div>No notes yet</div></div>
          ) : (
            <div className="notes-list">
              {[...field.notes].reverse().map(n => {
                const na = getAgent(users, n.agentId);
                return (
                  <div key={n.id} className="note-item">
                    <p>{n.text}</p>
                    <div className="note-meta">
                      <span>by {na?.name || "Unknown"}</span>
                      <span>{fmtDate(n.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {canEdit && (
            <div style={{ marginTop: 14 }}>
              <textarea className="form-group" value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Add a field observation…"
                style={{ width: "100%", padding: "10px 14px", background: "var(--bark)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 10, color: "var(--cream)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, resize: "vertical", minHeight: 72, outline: "none" }} />
              <button className="btn btn-green btn-sm mt-4" onClick={submitNote} disabled={!noteText.trim()}>Add Note</button>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => { onDelete(field.id); onClose(); }}>Delete Field</button>}
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD/EDIT FIELD MODAL ─────────────────────────────────────────────────────
function FieldFormModal({ initial, users, onSave, onClose }) {
  const agents = users.filter(u => u.role === "agent");
  const [form, setForm] = useState(initial || {
    name: "", crop: CROPS[0], plantingDate: new Date().toISOString().slice(0, 10),
    stage: "Planted", agentId: agents[0]?.id || null, hectares: 10, notes: [],
    lastUpdated: new Date().toISOString().slice(0, 10),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.plantingDate;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{initial ? "Edit Field" : "Add New Field"}</div>
            <div className="modal-sub">Enter the field details below</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Field Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. North Ridge Plot" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Crop Type</label>
              <select value={form.crop} onChange={e => set("crop", e.target.value)}>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Hectares</label>
              <input type="number" min="0.1" value={form.hectares} onChange={e => set("hectares", parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Planting Date *</label>
              <input type="date" value={form.plantingDate} onChange={e => set("plantingDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Stage</label>
              <select value={form.stage} onChange={e => set("stage", e.target.value)}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Assign to Field Agent</label>
            <select value={form.agentId || ""} onChange={e => set("agentId", parseInt(e.target.value))}>
              <option value="">— Unassigned —</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-green" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>
            {initial ? "Save Changes" : "Create Field"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function Dashboard({ fields, users, currentUser, onFieldClick }) {
  const myFields = currentUser.role === "admin" ? fields : fields.filter(f => f.agentId === currentUser.id);
  const statuses = myFields.map(computeStatus);
  const active = statuses.filter(s => s === "Active").length;
  const atRisk = statuses.filter(s => s === "At Risk").length;
  const completed = statuses.filter(s => s === "Completed").length;
  const totalHa = myFields.reduce((a, f) => a + (f.hectares || 0), 0);

  const recentUpdates = [...myFields]
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 5);

  const readyFields = myFields.filter(f => f.stage === "Ready");

  return (
    <div className="page fade-up">
      {/* Stats */}
      <div className="stat-grid">
        <div className="card stat-card green">
          <div className="stat-icon">🌿</div>
          <div className="stat-label">Total Fields</div>
          <div className="stat-value">{myFields.length}</div>
          <div className="stat-sub">{totalHa} hectares total</div>
        </div>
        <div className="card stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Active</div>
          <div className="stat-value">{active}</div>
          <div className="stat-sub">On track</div>
        </div>
        <div className="card stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-label">At Risk</div>
          <div className="stat-value">{atRisk}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
        <div className="card stat-card amber">
          <div className="stat-icon">🌾</div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completed}</div>
          <div className="stat-sub">Harvested</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div>
          {/* Ready to harvest */}
          {readyFields.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>🌾</span>
                <div className="section-title" style={{ fontSize: 17 }}>Ready for Harvest</div>
                <span className="nav-badge" style={{ background: "var(--amber)" }}>{readyFields.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {readyFields.map(f => {
                  const agent = getAgent(users, f.agentId);
                  return (
                    <div key={f.id} className="card" style={{ padding: "14px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid var(--amber-light)" }}
                      onClick={() => onFieldClick(f)}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--cream)" }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: "var(--straw)" }}>{f.crop} · {agent?.name}</div>
                      </div>
                      <span className="tag" style={{ background: "rgba(212,130,10,0.2)", color: "var(--amber-light)" }}>Ready</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <div className="section-title" style={{ marginBottom: 16, fontSize: 17 }}>Recent Activity</div>
            {recentUpdates.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📭</div><div>No recent activity</div></div>
            ) : (
              recentUpdates.map((f, i) => {
                const agent = getAgent(users, f.agentId);
                const status = computeStatus(f);
                const lastNote = f.notes[f.notes.length - 1];
                return (
                  <div key={f.id} className="activity-item" style={{ cursor: "pointer" }} onClick={() => onFieldClick(f)}>
                    <div className={`activity-dot ${status === "At Risk" ? "risk" : status === "Completed" ? "amber" : ""}`} />
                    <div>
                      <div className="activity-text">
                        <strong>{f.name}</strong> — {lastNote ? `"${lastNote.text.slice(0, 60)}${lastNote.text.length > 60 ? "…" : ""}"` : `Stage: ${f.stage}`}
                      </div>
                      <div className="activity-time">{agent?.name} · {fmtDate(f.lastUpdated)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel: Stage breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "20px" }}>
            <div className="section-title" style={{ fontSize: 17, marginBottom: 16 }}>Stage Breakdown</div>
            {STAGES.map(s => {
              const count = myFields.filter(f => f.stage === s).length;
              const pct = myFields.length ? Math.round((count / myFields.length) * 100) : 0;
              const colors = { Planted: "#c9a96e", Growing: "#4a9b5f", Ready: "#f0a830", Harvested: "#7aab8a" };
              return (
                <div key={s} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--straw)", marginBottom: 5 }}>
                    <span>{s}</span><span>{count} field{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="progress-bar">
                    <div style={{ height: "100%", width: `${pct}%`, background: colors[s], borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {currentUser.role === "admin" && (
            <div className="card" style={{ padding: "20px" }}>
              <div className="section-title" style={{ fontSize: 17, marginBottom: 16 }}>Agents Summary</div>
              {users.filter(u => u.role === "agent").map(agent => {
                const aFields = fields.filter(f => f.agentId === agent.id);
                const aAtRisk = aFields.filter(f => computeStatus(f) === "At Risk").length;
                return (
                  <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div className="avatar-sm" style={{ width: 30, height: 30, fontSize: 11 }}>{agent.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--cream)", fontWeight: 500 }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: "var(--straw)" }}>{aFields.length} fields{aAtRisk > 0 ? ` · ${aAtRisk} at risk` : ""}</div>
                    </div>
                    {aAtRisk > 0 && <span style={{ fontSize: 11, color: "var(--risk-light)" }}>⚠ {aAtRisk}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FIELDS PAGE ──────────────────────────────────────────────────────────────
function FieldsPage({ fields, users, currentUser, onFieldClick, onAdd }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const myFields = currentUser.role === "admin" ? fields : fields.filter(f => f.agentId === currentUser.id);
  const filtered = myFields.filter(f => {
    const status = computeStatus(f);
    const matchFilter = filter === "All" || f.stage === filter || status === filter;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.crop.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = { All: myFields.length };
  STAGES.forEach(s => { counts[s] = myFields.filter(f => f.stage === s).length; });
  counts["At Risk"] = myFields.filter(f => computeStatus(f) === "At Risk").length;

  return (
    <div className="page fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">Fields</div>
          <div className="section-subtitle">{myFields.length} field{myFields.length !== 1 ? "s" : ""} total</div>
        </div>
        {currentUser.role === "admin" && (
          <button className="btn btn-green" onClick={onAdd}>+ Add Field</button>
        )}
      </div>
      <div className="filters">
        <input className="search-box" placeholder="Search fields or crops…" value={search} onChange={e => setSearch(e.target.value)} />
        {["All", ...STAGES, "At Risk"].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f} <span style={{ opacity: 0.6 }}>({counts[f] || 0})</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: 40 }}>
          <div className="empty-icon">🌱</div>
          <div>No fields found</div>
        </div>
      ) : (
        <div className="fields-grid">
          {filtered.map(f => <FieldCard key={f.id} field={f} users={users} onClick={() => onFieldClick(f)} />)}
        </div>
      )}
    </div>
  );
}

// ─── AGENTS PAGE (admin only) ─────────────────────────────────────────────────
function AgentsPage({ fields, users }) {
  const agents = users.filter(u => u.role === "agent");
  return (
    <div className="page fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">Field Agents</div>
          <div className="section-subtitle">{agents.length} active agents</div>
        </div>
      </div>
      <div className="agents-grid">
        {agents.map(agent => {
          const aFields = fields.filter(f => f.agentId === agent.id);
          const active = aFields.filter(f => computeStatus(f) === "Active").length;
          const atRisk = aFields.filter(f => computeStatus(f) === "At Risk").length;
          const notes = aFields.reduce((a, f) => a + f.notes.length, 0);
          return (
            <div key={agent.id} className="card agent-card">
              <div className="agent-avatar">{agent.avatar}</div>
              <div>
                <div className="agent-name">{agent.name}</div>
                <div className="agent-email">{agent.email}</div>
              </div>
              <div className="agent-stats">
                <div className="agent-stat">
                  <div className="agent-stat-val">{aFields.length}</div>
                  <div className="agent-stat-label">Fields</div>
                </div>
                <div className="agent-stat">
                  <div className="agent-stat-val" style={{ color: atRisk > 0 ? "var(--risk-light)" : "var(--leaf-light)" }}>{atRisk > 0 ? atRisk : active}</div>
                  <div className="agent-stat-label">{atRisk > 0 ? "At Risk" : "Active"}</div>
                </div>
                <div className="agent-stat">
                  <div className="agent-stat-val">{notes}</div>
                  <div className="agent-stat-label">Notes</div>
                </div>
              </div>
              {aFields.length > 0 && (
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: 11, color: "var(--straw)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Assigned Fields</div>
                  {aFields.map(f => (
                    <div key={f.id} style={{ fontSize: 12, color: "var(--cream)", padding: "4px 0", borderBottom: "1px solid rgba(201,169,110,0.08)", display: "flex", justifyContent: "space-between" }}>
                      <span>{f.name}</span>
                      <span style={{ color: "var(--straw)" }}>{f.stage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [page, setPage] = useState("dashboard");
  const [selectedField, setSelectedField] = useState(null);
  const [showAddField, setShowAddField] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  function toast(message, type = "success") {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  function login() {
    const u = USERS.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (!u) { setLoginError("Invalid credentials. Check the demo accounts below."); return; }
    setCurrentUser(u);
    setLoginError("");
  }

  function updateField(id, changes) {
    setFields(fs => fs.map(f => f.id === id ? { ...f, ...changes } : f));
    if (selectedField?.id === id) setSelectedField(f => ({ ...f, ...changes }));
    toast("Field updated successfully");
  }

  function addField(data) {
    const newField = { ...data, id: Date.now() };
    setFields(fs => [...fs, newField]);
    toast("Field created successfully");
  }

  function deleteField(id) {
    setFields(fs => fs.filter(f => f.id !== id));
    toast("Field deleted", "error");
  }

  if (!currentUser) {
    return (
      <>
        <style>{CSS}</style>
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">
              <div className="login-logo-icon">🌿</div>
              <div>
                <h1>SmartSeason</h1>
                <span>Field Monitoring System</span>
              </div>
            </div>
            <div className="login-title">Welcome back</div>
            <div className="login-sub">Sign in to your account to continue</div>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="field-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@smartseason.io" value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && login()} />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && login()} />
            </div>
            <button className="btn-primary" onClick={login}>Sign In</button>
            <div className="login-creds">
              <p>Demo Accounts</p>
              <code>admin@smartseason.io / admin123 (Coordinator)</code>
              <code>james@smartseason.io / agent123 (Field Agent)</code>
              <code>aisha@smartseason.io / agent123 (Field Agent)</code>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const myFields = isAdmin ? fields : fields.filter(f => f.agentId === currentUser.id);
  const atRiskCount = myFields.filter(f => computeStatus(f) === "At Risk").length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "fields", label: "Fields", icon: "🌾", badge: atRiskCount > 0 ? atRiskCount : null },
    ...(isAdmin ? [{ id: "agents", label: "Agents", icon: "👥" }] : []),
  ];

  const pageTitles = {
    dashboard: { title: isAdmin ? "Overview Dashboard" : "My Dashboard", sub: isAdmin ? "All fields & agent performance" : "Your assigned fields" },
    fields: { title: "Field Management", sub: isAdmin ? "All registered fields" : "Your assigned fields" },
    agents: { title: "Field Agents", sub: "Agent performance overview" },
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Sidebar Overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🌿</div>
            <div>
              <h2>SmartSeason</h2>
              <span>Field Monitor</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Navigation</div>
            {navItems.map(item => (
              <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge" style={{ background: "var(--risk)" }}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-user">
            <div className="user-info">
              <div className="avatar">{currentUser.avatar}</div>
              <div className="user-details">
                <p>{currentUser.name}</p>
                <span>{currentUser.role === "admin" ? "Coordinator" : "Field Agent"}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={() => { setCurrentUser(null); setPage("dashboard"); }}>Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
                <span /><span /><span />
              </button>
              <div className="topbar-title">
                <h2>{pageTitles[page]?.title}</h2>
                <p>{pageTitles[page]?.sub}</p>
              </div>
            </div>
            <div className="topbar-actions">
              {atRiskCount > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "var(--risk-light)" }}>
                  ⚠ {atRiskCount} at risk
                </div>
              )}
              <div className="avatar" style={{ cursor: "default" }}>{currentUser.avatar}</div>
            </div>
          </div>

          {page === "dashboard" && (
            <Dashboard fields={fields} users={USERS} currentUser={currentUser}
              onFieldClick={f => setSelectedField(f)} />
          )}
          {page === "fields" && (
            <FieldsPage fields={fields} users={USERS} currentUser={currentUser}
              onFieldClick={f => setSelectedField(f)}
              onAdd={() => setShowAddField(true)} />
          )}
          {page === "agents" && isAdmin && (
            <AgentsPage fields={fields} users={USERS} />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedField && (
        <FieldDetailModal
          field={selectedField} users={USERS} currentUser={currentUser}
          onClose={() => setSelectedField(null)}
          onUpdate={updateField}
          onDelete={deleteField}
        />
      )}
      {showAddField && (
        <FieldFormModal
          users={USERS}
          onSave={addField}
          onClose={() => setShowAddField(false)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}
