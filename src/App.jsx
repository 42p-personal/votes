import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL   = import.meta.env.VITE_API_URL ?? '';
const GUILD_KEY = 'dc_vote_guild';
const GAMES_URL = 'https://games.42p.uk';

const WHEEL_COLORS = ['#6366f1','#7c3aed','#a855f7','#8b5cf6','#4f46e5','#9333ea','#c026d3','#5b21b6'];

// ─── API ──────────────────────────────────────────────────────
async function apiFetch(method, path, body, guildId) {
  var headers = {};
  if (body)    headers['Content-Type'] = 'application/json';
  if (guildId) headers['X-Guild-ID']   = guildId;
  var res = await fetch(API_URL + path, {
    method, credentials: 'include', headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  var data = await res.json().catch(function() { return {}; });
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
  return data;
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, color, onDone }) {
  useEffect(function() {
    var t = setTimeout(onDone, 3200);
    return function() { clearTimeout(t); };
  }, []);
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: color || '#6366f1', color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'toastIn 0.25s ease', whiteSpace: 'nowrap' }}>
      <i className="ti ti-check" style={{ fontSize: 15 }} />
      {message}
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────
function Logo42p({ size }) {
  size = size || 40;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
      style={{ transform: 'rotate(-8deg)', filter: 'drop-shadow(0 2px 8px #7c3aed66)' }}>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#vl1)"/>
      <rect x="2" y="2" width="60" height="60" rx="18" stroke="url(#vl2)" strokeWidth="1.5" fill="none"/>
      <text x="4" y="44" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="34" fill="#fff" letterSpacing="-2">4</text>
      <text x="26" y="44" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="34" fill="url(#vl3)" letterSpacing="-2">2</text>
      <text x="46" y="52" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="20" fill="#c4b5fd">p</text>
      <defs>
        <linearGradient id="vl1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4c1d95"/><stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
        <linearGradient id="vl2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6"/><stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="vl3" x1="26" y1="10" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9d5ff"/><stop offset="100%" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Auth screen ──────────────────────────────────────────────
function AuthScreen() {
  var [busy, setBusy]   = useState(false);
  var [error, setError] = useState('');
  useEffect(function() {
    var p = new URLSearchParams(window.location.search);
    if (p.get('auth_error')) { window.history.replaceState({}, '', window.location.pathname); setError('Discord sign-in failed. Please try again.'); }
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 20%, #2e1065 0%, #0f1015 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', marginBottom: 20 }}><Logo42p size={64} /></div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f5f3ff', margin: '0 0 6px', letterSpacing: '-0.03em' }}>42p Votes</h1>
        <p style={{ fontSize: 13, color: '#a78bfa', margin: '0 0 32px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Game to Play</p>
        <div style={{ background: 'rgba(26,27,34,0.85)', border: '0.5px solid #3b1f6e', borderRadius: 20, padding: '2rem', backdropFilter: 'blur(12px)', boxShadow: '0 24px 64px rgba(124,58,237,0.2)' }}>
          <p style={{ fontSize: 13, color: '#8b8ca8', margin: '0 0 20px' }}>Sign in with Discord to nominate games and vote for what your server plays next.</p>
          <button onClick={function() { setBusy(true); window.location.href = API_URL + '/auth/discord'; }} disabled={busy}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: busy ? '#3a3d8a' : 'linear-gradient(135deg,#5865f2,#7c3aed)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: busy ? 'not-allowed' : 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            {busy ? 'Connecting…' : 'Continue with Discord'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#f87171', marginTop: 14 }}>{error}</p>}
        </div>
        <a href={GAMES_URL} style={{ display: 'inline-block', marginTop: 20, fontSize: 12, color: '#6b6b7a', textDecoration: 'none' }}>← Back to 42p Games</a>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ─── Guild picker ─────────────────────────────────────────────
function GuildPicker({ guilds, loading, error, onSelect }) {
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1015', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#8b8ca8' }}>
      <i className="ti ti-loader" style={{ fontSize: 20, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 60% 20%, #2e1065 0%, #0f1015 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', marginBottom: 16 }}><Logo42p size={56} /></div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e8e9f3', margin: '0 0 6px' }}>Select a server</h1>
          <p style={{ fontSize: 13, color: '#8b8ca8', margin: 0 }}>Vote on the next game to play together.</p>
        </div>
        {error && <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#ff000015', border: '0.5px solid #ff000044', fontSize: 13, color: '#f87171', textAlign: 'center' }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {guilds.map(function(g) {
            return (
              <button key={g.id} onClick={function() { onSelect(g); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: '0.5px solid #2a2b36', background: '#1a1b22', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = '#22232c'; e.currentTarget.style.borderColor = '#6366f1'; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = '#1a1b22'; e.currentTarget.style.borderColor = '#2a2b36'; }}>
                {g.iconUrl
                  ? <img src={g.iconUrl} alt={g.name} style={{ width: 46, height: 46, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 46, height: 46, borderRadius: 14, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{g.name[0].toUpperCase()}</div>}
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#e8e9f3', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                <i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#52536a' }} />
              </button>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ─── Spin Wheel ───────────────────────────────────────────────
function SpinWheel({ nominations, onWinner, onClose }) {
  var canvasRef    = useRef(null);
  var rafRef       = useRef(null);
  var angleRef     = useRef(0);
  var speedRef     = useRef(0);
  var [spinning,   setSpinning]   = useState(false);
  var [winner,     setWinner]     = useState(null);
  var noms         = nominations.slice();
  var total        = noms.length;
  var sliceAngle   = (2 * Math.PI) / total;

  function drawWheel(angle) {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx    = canvas.getContext('2d');
    var cx     = canvas.width / 2;
    var cy     = canvas.height / 2;
    var r      = cx - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < total; i++) {
      var start = angle + i * sliceAngle - Math.PI / 2;
      var end   = start + sliceAngle;

      // Slice
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#0f1015';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px system-ui,sans-serif';
      var label = noms[i].name.length > 18 ? noms[i].name.slice(0, 16) + '…' : noms[i].name;
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f1015';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer (top)
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx - 10, 22);
    ctx.lineTo(cx + 10, 22);
    ctx.closePath();
    ctx.fillStyle = '#f5f3ff';
    ctx.fill();
  }

  useEffect(function() {
    drawWheel(0);
  }, []);

  function spin() {
    if (spinning || winner) return;
    setSpinning(true);
    speedRef.current = 0.3 + Math.random() * 0.2;
    angleRef.current = 0;

    // Determine winner index from final angle
    var extraRotations = 6 + Math.random() * 4;
    var winnerIdx      = Math.floor(Math.random() * total);
    var targetAngle    = extraRotations * 2 * Math.PI + (2 * Math.PI - winnerIdx * sliceAngle - sliceAngle / 2);
    var duration       = 4000 + Math.random() * 1000;
    var start          = performance.now();

    function animate(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased    = 1 - Math.pow(1 - progress, 3);
      var angle    = eased * targetAngle;
      angleRef.current = angle;
      drawWheel(angle);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWinner(noms[winnerIdx]);
        onWinner(noms[winnerIdx]);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }

  useEffect(function() {
    return function() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1a1b22', border: '0.5px solid #3b1f6e', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 80px rgba(124,58,237,0.3)' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#f5f3ff' }}>Tie-Breaker!</h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8b8ca8' }}>{total} games tied — spin to decide</p>

        <canvas ref={canvasRef} width={340} height={340} style={{ display: 'block', margin: '0 auto 20px', borderRadius: '50%', boxShadow: '0 8px 40px rgba(99,102,241,0.3)' }} />

        {winner ? (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Winner!</p>
            <p style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 900, color: '#f5f3ff' }}>{winner.name}</p>
            <button onClick={onClose}
              style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={spin} disabled={spinning}
              style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: spinning ? '#3730a3' : '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: spinning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {spinning ? <><i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }} />Spinning…</> : <><i className="ti ti-rotate-clockwise-2" />Spin!</>}
            </button>
            <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '0.5px solid #2a2b36', background: 'transparent', color: '#8b8ca8', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Nomination card ─────────────────────────────────────────
function NomCard({ nom, myUserId, totalVotes, onVote, onRemove, votingId }) {
  var hasVoted  = nom.voters && nom.voters.includes(myUserId);
  var pct       = totalVotes > 0 ? Math.round((nom.voteCount / totalVotes) * 100) : 0;
  var isVoting  = votingId === nom.id;
  var canRemove = nom.nominatedBy === myUserId;
  var [imgErr,  setImgErr] = useState(false);

  return (
    <div style={{ background: '#1a1b22', border: '0.5px solid ' + (hasVoted ? '#6366f155' : '#2a2b36'), borderRadius: 14, overflow: 'hidden', display: 'flex', alignItems: 'stretch', gap: 0, transition: 'border-color 0.2s', animation: 'fadeIn 0.3s ease' }}>
      {/* Cover */}
      <div style={{ width: 88, flexShrink: 0, background: '#111116', position: 'relative', overflow: 'hidden' }}>
        {!imgErr && nom.coverUrl
          ? <img src={nom.coverUrl} alt={nom.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={function() { setImgErr(true); }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎮</div>}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#e8e9f3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nom.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#52536a' }}>
              by <span style={{ color: '#8b8ca8' }}>@{nom.nominatedByUsername || nom.nominatedByName || 'unknown'}</span>
            </p>
          </div>
          {canRemove && (
            <button onClick={function() { onRemove(nom.id); }}
              title="Remove nomination"
              style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 6, border: '0.5px solid #2a2b36', background: 'transparent', color: '#52536a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, transition: 'all 0.15s' }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = '#ff555544'; e.currentTarget.style.color = '#ff7070'; }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = '#2a2b36'; e.currentTarget.style.color = '#52536a'; }}>
              <i className="ti ti-x" />
            </button>
          )}
        </div>

        {/* Vote bar */}
        <div style={{ height: 4, background: '#0f1015', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct + '%', background: hasVoted ? '#6366f1' : '#3a3a52', borderRadius: 99, transition: 'width 0.4s ease, background 0.3s' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: hasVoted ? '#a5b4fc' : '#52536a', fontWeight: 600 }}>
            {nom.voteCount} {nom.voteCount === 1 ? 'vote' : 'votes'} {totalVotes > 0 && '· ' + pct + '%'}
          </span>
          <button onClick={function() { onVote(nom.id); }} disabled={isVoting}
            style={{ padding: '5px 14px', borderRadius: 8, border: hasVoted ? '0.5px solid #6366f1' : '0.5px solid #3a3a52', background: hasVoted ? '#6366f120' : 'transparent', color: hasVoted ? '#a5b4fc' : '#6b6b7a', cursor: isVoting ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
            {isVoting
              ? <i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }} />
              : hasVoted
                ? <><i className="ti ti-thumb-up-filled" />Voted</>
                : <><i className="ti ti-thumb-up" />Vote</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Nominate modal ───────────────────────────────────────────
function NominateModal({ guildId, nominatedIds, onNominate, onClose }) {
  var [term,        setTerm]        = useState('');
  var [results,     setResults]     = useState([]);
  var [searching,   setSearching]   = useState(false);
  var [nominatingId, setNominatingId] = useState(null);
  var debounceRef = useRef(null);

  useEffect(function() {
    var t = term.trim();
    clearTimeout(debounceRef.current);
    if (t.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async function() {
      setSearching(true);
      try {
        var data = await apiFetch('GET', '/api/steam/search?term=' + encodeURIComponent(t), null, guildId);
        setResults((data.items || []).filter(function(i) { return i.type === 'app'; }).slice(0, 12));
      } catch (e) { /* silent */ }
      finally { setSearching(false); }
    }, 500);
  }, [term]);

  async function handleNominate(item) {
    setNominatingId(String(item.id));
    try {
      await onNominate({
        steamId:   String(item.id),
        name:      item.name,
        coverUrl:  'https://cdn.cloudflare.steamstatic.com/steam/apps/' + item.id + '/header.jpg',
        steamUrl:  'https://store.steampowered.com/app/' + item.id,
        platforms: '',
      });
    } finally { setNominatingId(null); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1a1b22', border: '0.5px solid #2a2b36', borderRadius: 18, width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '0.5px solid #2a2b36', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#e8e9f3' }}>Nominate a Game</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52536a', cursor: 'pointer', fontSize: 20, display: 'flex', padding: 0 }}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #2a2b36', position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 30, top: '50%', transform: 'translateY(-50%)', color: '#52536a', fontSize: 16 }} />
          <input autoFocus value={term} onChange={function(e) { setTerm(e.target.value); }}
            placeholder="Search Steam for any game…"
            style={{ width: '100%', boxSizing: 'border-box', background: '#111116', border: '0.5px solid #3a3a42', borderRadius: 10, color: '#e8e9f3', padding: '10px 14px 10px 40px', fontSize: 14, outline: 'none' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searching && (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <i className="ti ti-loader" style={{ fontSize: 24, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {!searching && term.length >= 2 && results.length === 0 && (
            <p style={{ textAlign: 'center', padding: '30px', color: '#52536a', fontSize: 13 }}>No games found for "{term}"</p>
          )}
          {!searching && term.length < 2 && (
            <p style={{ textAlign: 'center', padding: '30px', color: '#52536a', fontSize: 13 }}>Type to search Steam…</p>
          )}
          {results.map(function(item) {
            var sid       = String(item.id);
            var alreadyIn = nominatedIds.has(sid);
            var isNom     = nominatingId === sid;
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '0.5px solid #1a1b22' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = '#22232c'; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = ''; }}>
                <img src={'https://cdn.cloudflare.steamstatic.com/steam/apps/' + item.id + '/header.jpg'} alt={item.name}
                  style={{ width: 60, height: 28, objectFit: 'cover', borderRadius: 5, flexShrink: 0, background: '#111' }}
                  onError={function(e) { e.target.style.display = 'none'; }} />
                <p style={{ flex: 1, margin: 0, fontSize: 14, color: '#e8e9f3', fontWeight: 500 }}>{item.name}</p>
                <button onClick={function() { if (!alreadyIn && !isNom) handleNominate(item); }}
                  disabled={alreadyIn || !!isNom}
                  style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 7, border: alreadyIn ? '0.5px solid #16a34a55' : '0.5px solid #6366f155', background: alreadyIn ? '#16a34a15' : '#6366f115', color: alreadyIn ? '#86efac' : '#a5b4fc', cursor: alreadyIn || isNom ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {isNom ? <i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }} />
                    : alreadyIn ? <><i className="ti ti-check" />Nominated</>
                    : <><i className="ti ti-plus" />Nominate</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
function EmptyNominations({ onNominate }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🗳️</div>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#e8e9f3', margin: '0 0 8px' }}>No nominations yet</p>
      <p style={{ fontSize: 14, color: '#8b8ca8', margin: '0 0 24px' }}>Be the first to nominate a game for your server to play!</p>
      <button onClick={onNominate}
        style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <i className="ti ti-plus" />Nominate a Game
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  var [screen,        setScreen]        = useState('loading');
  var [user,          setUser]          = useState(null);
  var [guilds,        setGuilds]        = useState([]);
  var [guildsLoading, setGuildsLoading] = useState(false);
  var [guildsError,   setGuildsError]   = useState('');
  var [currentGuild,  setCurrentGuild]  = useState(null);

  var [round,       setRound]       = useState(null);
  var [nominations, setNominations] = useState([]);
  var [loading,     setLoading]     = useState(false);
  var [votingId,    setVotingId]    = useState(null);
  var [toast,       setToast]       = useState(null);

  var [showNominate, setShowNominate] = useState(false);
  var [showWheel,    setShowWheel]    = useState(false);

  // Derived: find tied nominations (all with same max vote count, ≥1 vote)
  var sortedNoms  = nominations.slice().sort(function(a, b) { return b.voteCount - a.voteCount; });
  var maxVotes    = sortedNoms.length > 0 ? sortedNoms[0].voteCount : 0;
  var tiedNoms    = maxVotes > 0 ? sortedNoms.filter(function(n) { return n.voteCount === maxVotes; }) : [];
  var isTied      = tiedNoms.length >= 2;
  var totalVotes  = nominations.reduce(function(s, n) { return s + n.voteCount; }, 0);
  var nominatedIds = new Set(nominations.map(function(n) { return n.steamId; }).filter(Boolean));
  var myUserId     = user && (user.userId || user.id);

  // Bootstrap
  useEffect(function() {
    var p = new URLSearchParams(window.location.search);
    if (p.get('auth') === 'success') window.history.replaceState({}, '', window.location.pathname);
    apiFetch('GET', '/auth/me')
      .then(function(u) {
        setUser(u);
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem(GUILD_KEY)); } catch (e) {}
        if (saved) loadForGuild(saved); else loadGuilds();
      })
      .catch(function() { setScreen('auth'); });
  }, []);

  // Check if navigated here from games page with a game to nominate
  useEffect(function() {
    if (screen !== 'votes') return;
    var p = new URLSearchParams(window.location.search);
    var sid = p.get('nominate');
    if (!sid) return;
    window.history.replaceState({}, '', window.location.pathname);
    // Auto-open nominate modal
    setShowNominate(true);
  }, [screen]);

  async function loadGuilds() {
    setGuildsLoading(true); setGuildsError(''); setScreen('guild-pick');
    try { setGuilds(await apiFetch('GET', '/api/guilds')); }
    catch (err) { setGuildsError(err.message); }
    finally { setGuildsLoading(false); }
  }

  async function loadForGuild(guild) {
    setCurrentGuild(guild);
    localStorage.setItem(GUILD_KEY, JSON.stringify(guild));
    setScreen('votes');
    setLoading(true);
    try {
      var r    = await apiFetch('GET', '/api/votes/round', null, guild.id);
      setRound(r);
      var noms = await apiFetch('GET', '/api/votes/nominations', null, guild.id);
      setNominations(noms);
    } catch (err) { console.error('loadForGuild:', err.message); }
    finally { setLoading(false); }
  }

  async function handleVote(nomId) {
    setVotingId(nomId);
    try {
      var updated = await apiFetch('POST', '/api/votes/nominations/' + nomId + '/vote', null, currentGuild.id);
      setNominations(function(prev) {
        return prev.map(function(n) { return n.id === nomId ? updated : n; });
      });
    } catch (err) { setToast('Vote failed: ' + err.message); }
    finally { setVotingId(null); }
  }

  async function handleNominate(game) {
    try {
      var nom = await apiFetch('POST', '/api/votes/nominations', game, currentGuild.id);
      setNominations(function(prev) { return prev.concat(nom); });
      setToast(game.name + ' nominated!');
    } catch (err) {
      if (err.message === 'This game is already nominated.') {
        setToast(game.name + ' is already nominated');
      } else {
        setToast('Failed: ' + err.message);
      }
    }
  }

  async function handleRemoveNom(nomId) {
    try {
      await apiFetch('DELETE', '/api/votes/nominations/' + nomId, null, currentGuild.id);
      setNominations(function(prev) { return prev.filter(function(n) { return n.id !== nomId; }); });
    } catch (err) { setToast('Remove failed: ' + err.message); }
  }

  async function handleNewRound() {
    if (!confirm('Start a fresh voting round? This will clear all current nominations and votes.')) return;
    try {
      var r = await apiFetch('POST', '/api/votes/round/new', null, currentGuild.id);
      setRound(r);
      setNominations([]);
      setToast('New round started!');
    } catch (err) { setToast('Failed to start new round'); }
  }

  // ── Screen guards ────────────────────────────────────────────
  if (screen === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#0f1015', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#8b8ca8' }}>
      <i className="ti ti-loader" style={{ fontSize: 20, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
    </div>
  );
  if (screen === 'auth') return <AuthScreen />;
  if (screen === 'guild-pick') return (
    <GuildPicker guilds={guilds} loading={guildsLoading} error={guildsError}
      onSelect={function(g) { setNominations([]); setRound(null); loadForGuild(g); }} />
  );

  // ── Main votes page ──────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f1015', display: 'flex', flexDirection: 'column', color: '#e8e9f3', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <style>{`
        @keyframes spin    { from{transform:rotate(0deg);}  to{transform:rotate(360deg);} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(12px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }
      `}</style>

      {toast && <Toast message={toast} onDone={function() { setToast(null); }} />}
      {showWheel && <SpinWheel nominations={tiedNoms} onWinner={function(w) { setToast('🏆 ' + w.name + ' wins!'); }} onClose={function() { setShowWheel(false); }} />}
      {showNominate && (
        <NominateModal guildId={currentGuild.id} nominatedIds={nominatedIds}
          onNominate={async function(game) { await handleNominate(game); }}
          onClose={function() { setShowNominate(false); }} />
      )}

      {/* Header */}
      <header style={{ background: '#111116', borderBottom: '0.5px solid #2a2b36', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo42p size={34} />
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f5f3ff', letterSpacing: '-0.02em' }}>42p Votes</p>
            <p style={{ margin: 0, fontSize: 10, color: '#6b6b7a' }}>Next game to play</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={loadGuilds}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 9, border: '0.5px solid #2a2b36', background: 'transparent', cursor: 'pointer', color: '#8b8ca8', fontSize: 12 }}>
            {currentGuild && currentGuild.iconUrl
              ? <img src={currentGuild.iconUrl} alt="" style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover' }} />
              : <div style={{ width: 18, height: 18, borderRadius: 4, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{currentGuild && currentGuild.name[0].toUpperCase()}</div>}
            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentGuild && currentGuild.name}</span>
            <i className="ti ti-chevron-down" style={{ fontSize: 11 }} />
          </button>
          <a href={GAMES_URL} style={{ padding: '7px 14px', borderRadius: 9, border: '0.5px solid #2a2b36', background: 'transparent', color: '#8b8ca8', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-device-gamepad-2" style={{ fontSize: 14 }} />Games
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 9, background: '#6366f115', border: '0.5px solid #6366f133' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
              {user && (user.name && user.name[0].toUpperCase())}
            </div>
            <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>@{user && user.username}</span>
          </div>
        </div>
      </header>

      {/* Sub-header bar */}
      <div style={{ background: '#111116', borderBottom: '0.5px solid #2a2b36', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: round ? '#16a34a' : '#52536a' }} />
            <span style={{ fontSize: 13, color: '#8b8ca8', fontWeight: 600 }}>
              {round ? 'Round active' : 'No active round'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#52536a' }}>
            {nominations.length} nomination{nominations.length !== 1 ? 's' : ''} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isTied && (
            <button onClick={function() { setShowWheel(true); }}
              style={{ padding: '7px 14px', borderRadius: 9, border: '0.5px solid #a855f7', background: '#a855f715', color: '#c084fc', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, animation: 'fadeIn 0.3s ease' }}>
              <i className="ti ti-wheel" />Tie-Breaker!
            </button>
          )}
          <button onClick={function() { setShowNominate(true); }}
            style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-plus" />Nominate
          </button>
          <button onClick={handleNewRound}
            title="Start a fresh round"
            style={{ padding: '7px 12px', borderRadius: 9, border: '0.5px solid #2a2b36', background: 'transparent', color: '#52536a', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-refresh" />New round
          </button>
        </div>
      </div>

      {/* Nominations */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', maxWidth: 720, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="ti ti-loader" style={{ fontSize: 32, animation: 'spin 1s linear infinite', color: '#6366f1' }} />
          </div>
        ) : sortedNoms.length === 0 ? (
          <EmptyNominations onNominate={function() { setShowNominate(true); }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedNoms.map(function(nom, idx) {
              return (
                <div key={nom.id} style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
                  {/* Rank */}
                  <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: idx === 0 && nom.voteCount > 0 ? '#fbbf24' : '#2a2b36' }}>
                      #{idx + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <NomCard nom={nom} myUserId={myUserId} totalVotes={totalVotes}
                      onVote={handleVote} onRemove={handleRemoveNom} votingId={votingId} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
