import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const sessions=[
 {name:'Προπόνηση Πέμπτης',date:'22 Οκτωβρίου 2026',mins:82,km:6.84,top:28.7,sprints:14,load:385,zones:[23,27,18,10,4],seed:4},
 {name:'Φιλικό 5×5',date:'19 Οκτωβρίου 2026',mins:58,km:4.72,top:25.4,sprints:9,load:291,zones:[16,20,12,8,2],seed:9},
 {name:'Ατομική προπόνηση',date:'15 Οκτωβρίου 2026',mins:46,km:3.95,top:27.1,sprints:11,load:243,zones:[11,15,11,6,3],seed:15}
];

function rand(seed){let x=Math.sin(seed*138.43)*10000;return x-Math.floor(x)}
function speeds(s){return Array.from({length:55},(_,i)=>{const r=rand(i*5.123+s.seed*8);let wave=Math.max(0,Math.sin(i*.64+s.seed)*.5+.5);return Math.min(s.top,Math.max(0.7,(r*12+wave*11)*(i%15===0?1.35:1)))}).map((v,i,a)=>i===32?s.top:v)}
function speedSvg(s){const values=speeds(s),w=760,h=234,l=39,r=13,t=18,b=30,cw=w-l-r,ch=h-t-b,step=cw/(values.length-1),p=values.map((v,i)=>[l+i*step,t+ch-(v/35)*ch]);const path=p.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');const area=path+` L${l+cw} ${t+ch} L${l} ${t+ch}Z`;let grid=[0,10,20,30].map(v=>{let y=t+ch-v/35*ch;return `<line x1="${l}" y1="${y}" x2="${l+cw}" y2="${y}" stroke="#31404b" stroke-dasharray="4 7"/><text x="${l-10}" y="${y+4}" fill="#8799a4" text-anchor="end" font-size="11">${v}</text>`}).join('');let ticks=[0,.25,.5,.75,1].map(r=>`<text x="${l+cw*r}" y="${h-6}" fill="#8799a4" text-anchor="middle" font-size="11">${Math.round(s.mins*r)}′</text>`).join('');return `<svg role="img" aria-label="Γράφημα ταχύτητας από 0 έως ${s.mins} λεπτά" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="speedfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8fa66" stop-opacity=".3"/><stop offset="1" stop-color="#c8fa66" stop-opacity=".01"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#speedfill)"/><path d="${path}" fill="none" stroke="#c8fa66" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${ticks}</svg>`}
function pitchSvg(s, view){let lines=`<rect x="0" y="0" width="680" height="420" fill="#1a4835"/>${Array.from({length:8},(_,i)=>`<rect x="${i*85}" width="85" height="420" fill="${i%2?'#1f4c39':'#1b4635'}"/>`).join('')}<rect x="18" y="17" width="644" height="386" stroke="#e0f1df" stroke-width="2" fill="none"/><path d="M340 17V403" stroke="#e0f1df" stroke-width="2"/><circle cx="340" cy="210" r="63" stroke="#e0f1df" stroke-width="2" fill="none"/><circle cx="340" cy="210" r="3" fill="#e0f1df"/><path d="M18 103H119V317H18 M662 103H561V317H662 M18 160H57V260H18 M662 160H623V260H662" stroke="#e0f1df" stroke-width="2" fill="none"/><circle cx="78" cy="210" r="3" fill="#e0f1df"/><circle cx="602" cy="210" r="3" fill="#e0f1df"/>`;
let points=Array.from({length:130},(_,i)=>{let x=340+Math.sin(i*.91+s.seed)*200+Math.sin(i*.13)*70;let y=210+Math.cos(i*1.41+s.seed)*125+Math.sin(i*.3)*30;return [Math.max(38,Math.min(642,x)),Math.max(40,Math.min(380,y))]});let overlay=view==='heat'?`<defs><radialGradient id="hot"><stop offset="0" stop-color="#fae36c" stop-opacity=".82"/><stop offset=".4" stop-color="#ee7e32" stop-opacity=".48"/><stop offset="1" stop-color="#ee7e32" stop-opacity="0"/></radialGradient></defs>${points.filter((_,i)=>i%2===0).map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%4===0?49:35}" fill="url(#hot)"/>`).join('')}`:`<polyline points="${points.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="none" stroke="#c8fa66" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" opacity=".83"/><circle cx="${points[0][0]}" cy="${points[0][1]}" r="8" fill="#6dd7e4"/><circle cx="${points[129][0]}" cy="${points[129][1]}" r="8" fill="#ffd284"/>`;return `<svg role="img" aria-label="${view==='heat'?'Ενδεικτικός θερμικός χάρτης γηπέδου':'Ενδεικτική διαδρομή στο γήπεδο'}" viewBox="0 0 680 420" preserveAspectRatio="xMidYMid meet">${lines}${overlay}</svg>`}


const pages = {
  overview: ['Το dashboard σου', 'Οι επιδόσεις σου μετά από κάθε προπόνηση.'],
  analysis: ['Ανάλυση προπόνησης', 'Ταχύτητα, εντάσεις και χρόνοι ανά ζώνη.'],
  map: ['Heatmap & διαδρομή', 'Δες πού κινήθηκες στον χώρο.'],
  history: ['Ιστορικό προπονήσεων', 'Σύγκρινε τις καταγραφές σου.'],
  device: ['Το GPS tracker σου', 'Η σύνδεση και η εισαγωγή προπονήσεων.'],
};

function Stats({ session }) {
  const items = [
    ['Απόσταση', session.km.toFixed(2), 'km', '⌖', 'Από τη διαδρομή GPS'],
    ['Μέγιστη ταχύτητα', session.top.toFixed(1), 'km/h', '↗', 'Από τα δείγματα GPS'],
    ['Σπριντ', String(session.sprints), '', 'ϟ', 'Ενδεικτική ανίχνευση'],
    ['Διάρκεια', String(session.mins), 'λεπτά', '◷', 'Διάρκεια καταγραφής'],
  ];
  return <div className="stat-grid">{items.map(([name, value, unit, icon, description]) => (
    <article className="stat" key={name}>
      <div className="stat-heading"><span>{name}</span><span aria-hidden="true">{icon}</span></div>
      <div className="stat-value">{value} <small>{unit}</small></div>
      <div className="stat-foot">{description}</div>
    </article>
  ))}</div>;
}

function SpeedChart({ session }) {
  return <div className="chart-wrap" dangerouslySetInnerHTML={{ __html: speedSvg(session) }} />;
}

function Pitch({ session, view, className = '' }) {
  return <div className={`pitch-wrap ${className}`} dangerouslySetInnerHTML={{ __html: pitchSvg(session, view) }} />;
}

function PitchControls({ view, onChange }) {
  return <div className="pitch-controls">
    <button className={view === 'heat' ? 'active' : ''} onClick={() => onChange('heat')}>Heatmap</button>
    <button className={view === 'route' ? 'active' : ''} onClick={() => onChange('route')}>Διαδρομή</button>
  </div>;
}

const PROFILE_NAME_KEY = 'pitchpulse.profile.name';
const normalizeName = value => (value || '').trim().replace(/\s+/g, ' ').slice(0, 40);

function readProfileName() {
  try {
    return normalizeName(window.localStorage.getItem(PROFILE_NAME_KEY));
  } catch {
    return '';
  }
}

function ProfileDialog({ name, onSave, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState(name);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    inputRef.current.focus();
    inputRef.current.select();
    return () => dialog.close();
  }, []);

  function submit(event) {
    event.preventDefault();
    const nextName = normalizeName(draft);
    if (!nextName) {
      inputRef.current.setCustomValidity('Γράψε το όνομά σου.');
      inputRef.current.reportValidity();
      return;
    }
    onSave(nextName);
  }

  return <dialog className="profile-dialog" ref={dialogRef} aria-labelledby="profile-title" aria-describedby="profile-description" onCancel={event => { if (!name) event.preventDefault(); else onClose(); }}>
    <form onSubmit={submit}>
      <div className="profile-wordmark">Pitch<b>Pulse</b></div>
      <h2 id="profile-title">{name ? 'Αλλαγή ονόματος' : 'Καλώς ήρθες.'}</h2>
      <p id="profile-description" className="profile-description">Γράψε το όνομά σου για το προσωπικό σου καλωσόρισμα.</p>
      <label className="profile-field" htmlFor="profile-name">Το όνομά σου</label>
      <input className="profile-input" id="profile-name" name="given-name" ref={inputRef} value={draft} onChange={event => { event.target.setCustomValidity(''); setDraft(event.target.value); }} autoComplete="given-name" autoCapitalize="words" spellCheck={false} maxLength={40} required placeholder="Το μικρό σου όνομα" dir="auto" />
      <div className="profile-actions">{name && <button className="profile-cancel" type="button" onClick={onClose}>Ακύρωση</button>}<button className="btn" type="submit">{name ? 'Αποθήκευση' : 'Συνέχεια'}</button></div>
    </form>
  </dialog>;
}

function App() {
  const [profileName, setProfileName] = useState(readProfileName);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedSession, setSelectedSession] = useState(0);
  const [page, setPage] = useState('overview');
  const [view, setView] = useState('heat');
  const [toast, setToast] = useState('');
  const session = sessions[selectedSession];

  function saveProfileName(name) {
    setProfileName(name);
    setEditingProfile(false);
    try {
      window.localStorage.setItem(PROFILE_NAME_KEY, name);
    } catch {
      // The greeting still works if browser storage is unavailable.
    }
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function go(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openSession(index) {
    setSelectedSession(index);
    go('overview');
    setToast(`Άνοιξε η δοκιμαστική προπόνηση: ${sessions[index].name}`);
  }

  function showSyncMessage() {
    setToast('Το Wi-Fi Sync είναι σχεδιασμένο για την επόμενη έκδοση. Δεν υπάρχει συνδεδεμένη συσκευή σε αυτή την προεπισκόπηση.');
  }

  function Navigation({ mobile = false }) {
    const items = [
      ['overview', '◫', mobile ? 'Αρχική' : 'Επισκόπηση'],
      ['analysis', '▥', 'Ανάλυση'],
      ['map', '⌖', mobile ? 'Χάρτης' : 'Heatmap'],
      ['history', '◷', 'Ιστορικό'],
      ['device', '⌁', 'Συσκευή'],
    ];
    return <nav className={mobile ? 'mobile-nav' : 'nav'} aria-label={mobile ? 'Πλοήγηση κινητού' : 'Κεντρική πλοήγηση'}>
      {items.map(([id, icon, label]) => <button key={id} className={`${mobile ? '' : 'nav-btn'} ${page === id ? 'active' : ''}`} onClick={() => go(id)}>
        {mobile ? <i>{icon}</i> : <span className="nav-ico">{icon}</span>}{label}
      </button>)}
    </nav>;
  }

  function PageTabs() {
    return <>
      <section className={`section-page ${page === 'overview' ? 'active' : ''}`} id="page-overview">
        <div className="hero">
          <div className="hero-copy"><span className="hero-tag">ΤΕΛΕΥΤΑΙΑ ΠΡΟΠΟΝΗΣΗ</span><h2>{session.name}</h2><p>{session.date} · {session.mins} λεπτά · Εξωτερικός χώρος</p></div>
          <div className="hero-art"><svg viewBox="0 0 120 128" fill="none" aria-hidden="true"><path d="M10 16H110V112H10z M60 16V112" stroke="#b2e8ae" strokeWidth="2" opacity=".7" /><circle cx="60" cy="64" r="18" stroke="#b2e8ae" strokeWidth="2" opacity=".7" /><path d="M10 44h20v40H10m100-40H90v40h20" stroke="#b2e8ae" strokeWidth="2" opacity=".7" /><path d="M27 93L37 72l21 7 16-27 24 13" stroke="#cbfa6e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="98" cy="65" r="6" fill="#cbfa6e" /></svg></div>
        </div>
        <Stats session={session} />
        <div className="two-col">
          <section className="panel">
            <div className="panel-head"><div><h3>Ταχύτητα κατά την προπόνηση</h3><p className="sub">Ενδεικτική εξέλιξη ταχύτητας (km/h)</p></div><span className="tiny-tag">GPS</span></div>
            <SpeedChart session={session} />
            <div className="legend"><span><i /> Ταχύτητα</span><span className="muted-line">Δείγμα απόδοσης · όχι live</span></div>
          </section>
          <section className="panel">
            <div className="panel-head"><div><h3>Πού κινήθηκες</h3><p className="sub">Παράδειγμα heatmap γηπέδου</p></div><PitchControls view={view} onChange={setView} /></div>
            <Pitch session={session} view={view} />
            <p className="below-pitch">Για πραγματικό heatmap θα χρειαστεί βαθμονόμηση των ορίων του γηπέδου.</p>
          </section>
        </div>
        <section className="panel">
          <div className="panel-head"><div><h3>Με μια ματιά</h3><p className="sub">Ενδεικτικοί δείκτες για το ποδόσφαιρο</p></div></div>
          <div className="insights">
            <div className="insight"><small>Μέση ταχύτητα</small><strong>{(session.km / session.mins * 60).toFixed(1)} <span>km/h</span></strong><p>Από απόσταση / διάρκεια</p></div>
            <div className="insight"><small>Δείκτης κίνησης (demo)</small><strong>{session.load} <span>AU</span></strong><p>Θα οριστεί από δεδομένα IMU</p></div>
            <div className="insight"><small>Χρόνος υψηλής έντασης</small><strong>{session.zones[3] + session.zones[4]} <span>λεπτά</span></strong><p>Πάνω από 18 km/h (demo)</p></div>
          </div>
          <div className="callout">Όλοι οι αριθμοί είναι <b>φανταστικά δεδομένα επίδειξης</b>. Όταν κατασκευάσουμε το tracker, το dashboard θα γεμίζει από τις πραγματικές καταγραφές του.</div>
        </section>
      </section>

      <section className={`section-page ${page === 'analysis' ? 'active' : ''}`} id="page-analysis">
        <p className="section-intro">Αναλυτικότερη εικόνα της έντασης: πόσο χρόνο πέρασες σε κάθε ζώνη ταχύτητας και πώς μεταβλήθηκε η ταχύτητά σου.</p>
        <Stats session={session} />
        <div className="panel"><div className="panel-head"><div><h3>Προφίλ ταχύτητας</h3><p className="sub">Ενδεικτικές μετρήσεις GPS στη διάρκεια της προπόνησης</p></div><span className="tiny-tag">km/h</span></div><SpeedChart session={session} /></div>
        <div className="panel">
          <div className="panel-head"><div><h3>Ζώνες ταχύτητας</h3><p className="sub">Χρόνος ανά ζώνη (ενδεικτική ταξινόμηση)</p></div></div>
          <div className="zone-grid">{session.zones.map((value, index) => {
            const names = ['0–6 km/h', '6–12 km/h', '12–18 km/h', '18–24 km/h', '24+ km/h'];
            return <div className="zone-row" key={names[index]}><span>{names[index]}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(value / session.mins * 100)}%` }} /></div><span className="zone-time">{value} λεπ.</span></div>;
          })}</div>
          <div className="callout">Τα «σπριντ» θα υπολογίζονται από κανόνα διάρκειας + ορίου ταχύτητας που θα ορίσουμε και θα ελέγξουμε. Η μέγιστη ταχύτητα και ο δείκτης κίνησης δεν είναι ακόμη εργαστηριακά επικυρωμένες μετρήσεις.</div>
        </div>
      </section>

      <section className={`section-page ${page === 'map' ? 'active' : ''}`} id="page-map">
        <p className="section-intro">Προεπισκόπηση διαδρομής ή θερμικού χάρτη των κινήσεών σου μέσα στο γήπεδο.</p>
        <div className="panel"><div className="panel-head"><div><h3>Κάλυψη χώρου</h3><p className="sub">Δοκιμαστικά δεδομένα σε προσαρμοσμένες συντεταγμένες γηπέδου</p></div><PitchControls view={view} onChange={setView} /></div><Pitch session={session} view={view} className="wide-pitch" /><p className="below-pitch metric-caption">GPS στίγματα → μετασχηματισμός στις γωνίες του γηπέδου → απεικόνιση. Η ακρίβεια εξαρτάται από την ποιότητα του GPS και τη βαθμονόμηση.</p></div>
      </section>

      <section className={`section-page ${page === 'history' ? 'active' : ''}`} id="page-history">
        <p className="section-intro">Άνοιξε μια παλιότερη προπόνηση για να δεις το dashboard να ενημερώνεται. Οι τρεις καταχωρίσεις είναι δείγματα.</p>
        <div className="panel"><div className="panel-head"><div><h3>Οι προπονήσεις σου</h3><p className="sub">3 δοκιμαστικές καταγραφές</p></div><span className="tiny-tag">DEMO</span></div>
          <div className="history-list">{sessions.map((item, index) => <button className="history-row" key={item.name} onClick={() => openSession(index)}><div><strong>{item.name} {selectedSession === index && <span className="selected-label">· Επιλεγμένη</span>}</strong><p>{item.date} · {item.mins} λεπτά · {item.sprints} σπριντ (demo)</p></div><b>{item.km.toFixed(2)} km ↗</b></button>)}</div>
        </div>
      </section>

      <section className={`section-page ${page === 'device' ? 'active' : ''}`} id="page-device">
        <p className="section-intro">Εδώ θα γίνεται η σύνδεση με το wearable μετά την προπόνηση.</p>
        <div className="panel">
          <div className="empty-device"><div className="device-icon">⌁</div><div><strong>Καμία συσκευή συνδεδεμένη</strong><p>Όταν κατασκευάσουμε το ESP32 + GPS + IMU, εδώ θα βλέπεις κατάσταση, μπαταρία, καταγραφές και κουμπί εισαγωγής δεδομένων.</p><button className="secondary-button" onClick={showSyncMessage}>Πώς θα γίνεται το sync;</button></div></div>
          <div className="steps"><div className="step"><span className="step-num">1</span><span>Τελειώνεις την προπόνηση και σταματάς την καταγραφή από το wearable.</span></div><div className="step"><span className="step-num">2</span><span>Ενεργοποιείς το Wi-Fi της συσκευής και συνδέεις το iPhone.</span></div><div className="step"><span className="step-num">3</span><span>Μεταφέρεις το αρχείο προπόνησης στη σελίδα συγχρονισμού και προβάλλεις τα στοιχεία.</span></div></div>
          <div className="callout">Ο συγχρονισμός Wi-Fi είναι χαρακτηριστικό που θα υλοποιηθεί αργότερα. Αυτή η προεπισκόπηση δεν συνδέεται με hardware.</div>
        </div>
      </section>
    </>;
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><span className="logo-mark">↗</span><span>Pitch<b>Pulse</b></span></div>
      <div className="sidebar-kicker">WORKSPACE</div><Navigation />
      <div className="sidebar-bottom"><strong><span className="dot" />Tracker εκτός σύνδεσης</strong><p>Αυτή είναι προεπισκόπηση UI. Δεν έχει συνδεθεί πραγματική συσκευή.</p></div>
    </aside>
    <main className="main">
      <header className="top"><div><div className="eyebrow">FOOTBALL PERFORMANCE</div><div className="welcome-title"><h1>{page === 'overview' && profileName ? `Γεια σου, ${profileName}` : pages[page][0]}</h1>{profileName && <button className="profile-edit" type="button" aria-label="Αλλαγή ονόματος" title="Αλλαγή ονόματος" onClick={() => setEditingProfile(true)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z" /></svg></button>}</div><p>{pages[page][1]}</p></div><div className="right-actions"><span className="pill">DEMO MODE</span><button className="btn" onClick={showSyncMessage}>↻ Sync tracker</button></div></header>
      <PageTabs />
      <footer className="footer">PitchPulse concept dashboard · MVP preview · Τα δείγματα δεν αποτελούν πραγματικές αθλητικές μετρήσεις.</footer>
    </main>
    <Navigation mobile /><div className={`notice ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    {(!profileName || editingProfile) && <ProfileDialog name={profileName} onSave={saveProfileName} onClose={() => setEditingProfile(false)} />}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
