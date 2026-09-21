import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { Atom, ArrowRight, BookOpen, Check, CircleHelp, HardDrive, Lightbulb, Link2, LockKeyhole, Plus, Rotate3D, Search, Sparkles, Trash2, TriangleAlert, Unlink, X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { components, removeAtoms, removeComponent, type Graph } from '@/lib/chemistry';
import { ELEMENTS, elementBySymbol, categories } from '@/lib/elements';
import { ION_CHARGES, IONIC_COMPOUNDS, IONIC_SOURCES, canJoinIons, joinIons, matchIonicCompound, netCharge, chargeLabel, ionLabel, ionFormation, ionicHint, ionicTemplate, type IonicCompound } from '@/lib/ionic';
import { ionicCollectionKey, readIonicCollection, saveIonicDiscovery, type IonicCollection } from '@/lib/ionic-collection';
import { playPop, playDiscovery } from '@/lib/sounds';
import { claimFirstDiscovery } from '@/lib/discovery-feedback';
import { useCollectionFocus } from '@/components/use-collection-focus';
import { SubstancePhoto } from '@/components/substance-photo';
import { Fireworks } from '@/components/fireworks';
import { IonicViewer } from '@/components/ionic-viewer';
import '@/app/ionic.css';

const EMPTY: Graph = { atoms: [], bonds: [] };
const STORAGE_KEY = ionicCollectionKey(window.location.pathname);
const HINT_TITLES = ['이온의 총개수', '원소의 종류', '이온의 전하', '전하를 맞추는 비율'];
type Props = { active: boolean; collectionOpen: boolean; onCollectionOpenChange: (open: boolean) => void; onCountChange: (count: number) => void };

export function IonicLab({ active, collectionOpen, onCollectionOpenChange, onCountChange }: Props) {
  const [graph, setGraph] = useState<Graph>(EMPTY); const graphRef = useRef(EMPTY);
  const [selected, setSelected] = useState<string | null>(null); const [linkMode, setLinkMode] = useState(false);
  const [hoverSymbol, setHoverSymbol] = useState('Na'); const [near, setNear] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false); const [clearOpen, setClearOpen] = useState(false); const [helpOpen, setHelpOpen] = useState(false);
  const [saved, setSaved] = useState<IonicCollection>({}); const savedRef = useRef<IonicCollection>({});
  const [pending, setPending] = useState<Record<string, Graph>>({}); const pendingRef = useRef<Record<string, Graph>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<IonicCompound | null>(null); const seen = useRef(new Set<string>());
  const [detail, setDetail] = useState<IonicCompound | null>(null); const [model, setModel] = useState<IonicCompound | null>(null);
  const [search, setSearch] = useState(''); const [onlyFound, setOnlyFound] = useState(false);
  const [collectionTarget, setCollectionTarget] = useState<string | null>(null);
  const collectionGridRef = useCollectionFocus(collectionOpen && active, collectionTarget);
  function openDiscoveredCollection(id: string) { setCollectionTarget(id); setSearch(''); setOnlyFound(false); setCelebration(null); onCollectionOpenChange(true); }
  const [hint, setHint] = useState(IONIC_COMPOUNDS[0]); const [levels, setLevels] = useState<Record<string, number>>({});
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; x: number; y: number; origin: Graph; ids: Set<string>; moved: boolean } | null>(null);
  const level = levels[hint.id] || 0;
  const count = Object.keys(saved).length;
  useEffect(() => onCountChange(count), [count, onCountChange]);
  function update(next: Graph) { graphRef.current = next; setGraph(next); }
  function setCollection(values: IonicCollection) { savedRef.current = values; setSaved(values); }
  function saveGroup(group: Graph) {
    const match = matchIonicCompound(group); if (!match || savedRef.current[match.compound.id]) return;
    const id = match.compound.id;
    pendingRef.current = { ...pendingRef.current, [id]: group }; setPending(pendingRef.current);
    try {
      setCollection(saveIonicDiscovery(window.localStorage, STORAGE_KEY, group));
      const next = { ...pendingRef.current }; delete next[id]; pendingRef.current = next; setPending(next); setSaveError(null);
    } catch (error) { setSaveError(error instanceof Error ? error.message : '브라우저 저장 설정을 확인해 주세요.'); }
  }
  function loadAndRetry() {
    try { setCollection(readIonicCollection(window.localStorage, STORAGE_KEY)); setSaveError(null); }
    catch (error) { setSaveError(error instanceof Error ? error.message : '브라우저 저장 설정을 확인해 주세요.'); return; }
    for (const [id, group] of Object.entries(pendingRef.current)) {
      if (savedRef.current[id]) { const next = { ...pendingRef.current }; delete next[id]; pendingRef.current = next; setPending(next); }
      else saveGroup(group);
    }
  }
  useEffect(() => {
    loadAndRetry();
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) loadAndRetry(); };
    const warn = (event: BeforeUnloadEvent) => { if (Object.keys(pendingRef.current).length) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('storage', sync); window.addEventListener('beforeunload', warn);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('beforeunload', warn); };
  }, []);
  useEffect(() => { if (celebration) playDiscovery(); }, [celebration]);
  useEffect(() => { if (!active) { drag.current = null; setDragging(false); setNear(null); setLinkMode(false); } }, [active]);
  function inspect(next: Graph) {
    update(next);
    for (const group of components(next)) {
      const match = matchIonicCompound(group); if (!match) continue;
      const first = claimFirstDiscovery(match.compound.id, savedRef.current, pendingRef.current, seen.current);
      saveGroup(group);
      if (first) setCelebration(match.compound);
    }
  }
  function summon(symbol: string) {
    if (!ION_CHARGES[symbol]) return;
    const current = graphRef.current;
    if (current.atoms.length >= 40) { toast('이온은 작업대에 40개까지 놓을 수 있어요.'); return; }
    const index = current.atoms.length;
    const atom = { id: crypto.randomUUID(), symbol, x: 130 + (index % 6) * 98, y: 125 + (Math.floor(index / 6) % 4) * 90 };
    update({ ...current, atoms: [...current.atoms, atom] }); setSelected(atom.id); setHoverSymbol(symbol); setLinkMode(false); playPop();
  }
  function attach(a: string, b: string) {
    const next = joinIons(graphRef.current, a, b);
    if (!next) { toast('서로 다른 묶음의 양이온과 음이온을 선택해 주세요. 같은 전하끼리는 붙일 수 없어요.'); return; }
    inspect(next); setSelected(a); setLinkMode(false);
  }
  function erase(id: string, single = false) { inspect(single ? removeAtoms(graphRef.current, [id]) : removeComponent(graphRef.current, id)); setSelected(null); setLinkMode(false); }
  function point(event: ReactPointerEvent<SVGElement>) {
    const p = svg.current!.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    const converted = p.matrixTransform(svg.current!.getScreenCTM()!.inverse()); return { x: converted.x, y: converted.y };
  }
  function candidate(next: Graph, id: string) {
    const atom = next.atoms.find(a => a.id === id); if (!atom) return null;
    const other = next.atoms.filter(a => canJoinIons(next, id, a.id)).sort((a, b) => Math.hypot(a.x - atom.x, a.y - atom.y) - Math.hypot(b.x - atom.x, b.y - atom.y))[0];
    return other && Math.hypot(other.x - atom.x, other.y - atom.y) < 105 ? other : null;
  }
  function moveGroup(origin: Graph, ids: Set<string>, dx: number, dy: number) {
    const atoms = origin.atoms.filter(a => ids.has(a.id));
    dx = Math.max(38 - Math.min(...atoms.map(a => a.x)), Math.min(762 - Math.max(...atoms.map(a => a.x)), dx));
    dy = Math.max(45 - Math.min(...atoms.map(a => a.y)), Math.min(480 - Math.max(...atoms.map(a => a.y)), dy));
    return { ...origin, atoms: origin.atoms.map(a => ids.has(a.id) ? { ...a, x: a.x + dx, y: a.y + dy } : a) };
  }
  function startDrag(event: ReactPointerEvent<SVGGElement>, id: string) {
    if (event.button !== 0) return; event.stopPropagation();
    if (linkMode && selected && selected !== id) { attach(selected, id); return; }
    setSelected(id); const p = point(event); const origin = graphRef.current;
    const ids = new Set(components(origin).find(g => g.atoms.some(a => a.id === id))!.atoms.map(a => a.id));
    drag.current = { id, ...p, origin, ids, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true);
  }
  function moveDrag(event: ReactPointerEvent<SVGGElement>) {
    const d = drag.current; if (!d) return; const p = point(event);
    if (Math.hypot(p.x - d.x, p.y - d.y) > 3) d.moved = true;
    const next = moveGroup(d.origin, d.ids, p.x - d.x, p.y - d.y); update(next); setNear(candidate(next, d.id)?.id || null);
  }
  function endDrag(event: ReactPointerEvent<SVGGElement>, cancel = false) {
    const d = drag.current; if (!d) return; drag.current = null; setDragging(false); setNear(null);
    if (cancel) { update(d.origin); return; } if (!d.moved) return;
    const p = point(event); if (p.x > 690 && p.y > 425) { erase(d.id); return; }
    const other = candidate(graphRef.current, d.id); if (other) attach(d.id, other.id);
  }
  function resummon(entry: IonicCompound) {
    if (!savedRef.current[entry.id] && !pendingRef.current[entry.id]) return;
    const template = ionicTemplate(entry), current = graphRef.current;
    if (current.atoms.length + template.atoms.length > 40) { toast('작업대를 조금 비워 주세요.'); return; }
    const ids = new Map(template.atoms.map(a => [a.id, crypto.randomUUID()]));
    const group = { atoms: template.atoms.map(a => ({ ...a, id: ids.get(a.id)! })), bonds: template.bonds.map(b => ({ ...b, a: ids.get(b.a)!, b: ids.get(b.b)! })) };
    seen.current.add(entry.id);
    update({ atoms: [...current.atoms, ...group.atoms], bonds: [...current.bonds, ...group.bonds] });
    setSelected(group.atoms[0].id); setDetail(null); onCollectionOpenChange(false); playPop();
  }
  const group = selected ? components(graph).find(g => g.atoms.some(a => a.id === selected)) : undefined;
  const match = group ? matchIonicCompound(group) : null;
  const totalCharge = group ? netCharge(group) : 0;
  const selectedAtom = graph.atoms.find(a => a.id === selected);
  const hover = elementBySymbol[hoverSymbol];
  const known = (id: string) => !!saved[id] || !!pending[id];
  const visible = IONIC_COMPOUNDS.filter(entry => (!onlyFound || known(entry.id)) && (known(entry.id) ? `${entry.name} ${entry.formula} ${entry.english}` : `도전 ${IONIC_COMPOUNDS.indexOf(entry) + 1}`).toLowerCase().includes(search.toLowerCase()));
  const advance = (entry: IonicCompound) => setLevels(v => ({ ...v, [entry.id]: Math.min(4, (v[entry.id] || 0) + 1) }));
  return <div className="ionic-lab" hidden={!active}>
    <div className="ionic-intro-note"><Zap size={17} /><span>전자 이동으로 생긴 <strong>양이온(+)</strong>과 <strong>음이온(−)</strong>. 전하의 합을 0으로 맞춰 보세요.</span><Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)}><CircleHelp size={16} />이온 실험 안내</Button></div>
    <div className="lab-layout">
      <section className="panel workbench ionic-workbench" aria-label="이온 결합 작업대">
        <div className="panel-heading"><div className="panel-title"><Zap size={18} /><h2>이온 실험 공간</h2></div><div className="workbench-actions"><Button variant="ghost" size="sm" disabled={!match} onClick={() => match && setModel(match.compound)}><Rotate3D size={16} />3D 보기</Button><Button variant="outline" size="sm" disabled={!graph.atoms.length} onClick={() => setClearOpen(true)}><Trash2 size={15} />전체 비우기</Button></div></div>
        <div className={`ionic-canvas-wrap ${dragging ? 'dragging' : ''}`}>
          {!graph.atoms.length && <div className="empty-workspace"><div className="ionic-empty-pair"><span>Na<sup>+</sup></span><i>＋</i><span>Cl<sup>−</sup></span></div><h3>서로 다른 전하의 만남.</h3><p>오른쪽에서 Na⁺와 Cl⁻를 불러온 뒤<br />가까이 옮겨 첫 이온성 화합물을 발견해 보세요.</p></div>}
          <svg ref={svg} className="ionic-canvas" viewBox="0 0 800 525" role="group" aria-label="양이온과 음이온을 가까이 놓아 묶는 작업대" onPointerDown={() => { setSelected(null); setLinkMode(false); }}>
            {graph.bonds.map(b => { const a = graph.atoms.find(v => v.id === b.a)!, z = graph.atoms.find(v => v.id === b.b)!; return <g key={`${b.a}-${b.b}`} role="button" tabIndex={0} aria-label="이온 묶음 연결 해제" onPointerDown={e => e.stopPropagation()} onClick={() => inspect({ ...graphRef.current, bonds: graphRef.current.bonds.filter(v => !(v.a === b.a && v.b === b.b)) })} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspect({ ...graphRef.current, bonds: graphRef.current.bonds.filter(v => !(v.a === b.a && v.b === b.b)) }); } }}><line x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke="transparent" strokeWidth="23" /><line x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke="#b1bbce" strokeWidth="2.5" strokeDasharray="5 7" /></g>; })}
            {graph.atoms.map(atom => { const positive = ION_CHARGES[atom.symbol] > 0; return <g key={atom.id} transform={`translate(${atom.x} ${atom.y})`} className="ionic-ion" role="button" tabIndex={0} aria-label={`${ionLabel(atom.symbol)} 이온${atom.id === selected ? ', 선택됨' : ''}`}
              onPointerDown={e => startDrag(e, atom.id)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={e => endDrag(e, true)}
              onKeyDown={e => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); erase(atom.id, e.shiftKey); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (linkMode && selected && selected !== atom.id) attach(selected, atom.id); else setSelected(atom.id); } else if (e.key.startsWith('Arrow')) { e.preventDefault(); const ids = new Set(components(graphRef.current).find(g => g.atoms.some(a => a.id === atom.id))!.atoms.map(a => a.id)); update(moveGroup(graphRef.current, ids, e.key === 'ArrowLeft' ? -15 : e.key === 'ArrowRight' ? 15 : 0, e.key === 'ArrowUp' ? -15 : e.key === 'ArrowDown' ? 15 : 0)); } }}>
              <circle r="43" fill="transparent" /><circle r="38" fill="none" stroke={selected === atom.id || near === atom.id ? '#9d88da' : 'transparent'} strokeDasharray="4 5" strokeWidth="2" /><circle r="30" fill={positive ? '#ece3ff' : '#e0f2ed'} stroke={positive ? '#af91e3' : '#8ac5b5'} strokeWidth="1.8" /><text textAnchor="middle" dominantBaseline="central" fill={positive ? '#7046aa' : '#307761'} fontSize="23" fontWeight="600">{atom.symbol}</text><g transform="translate(22 -23)"><circle r="14" fill={positive ? '#8861c7' : '#498b77'} /><text fill="white" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700">{chargeLabel(ION_CHARGES[atom.symbol])}</text></g>
            </g>; })}
            <g transform="translate(709 434)" pointerEvents="none"><rect width="72" height="67" rx="13" fill={dragging ? '#fff0f3' : '#f0f1f8'} stroke="#d8d2e3" strokeDasharray="4 4" /><text x="36" y="30" textAnchor="middle" fontSize="20">×</text><text x="36" y="53" textAnchor="middle" fontSize="12" fill="#8b809c">묶음 삭제</text></g>
          </svg>
          {selectedAtom && <div className="selected-toolbar ionic-toolbar"><span className="selected-symbol">{ionLabel(selectedAtom.symbol)}</span><Button variant={linkMode ? 'secondary' : 'ghost'} size="icon-sm" aria-label="반대 전하의 이온 선택해 묶기" onClick={() => setLinkMode(v => !v)}><Link2 size={16} /></Button><Button variant="ghost" size="icon-sm" aria-label="선택한 이온의 묶음 연결 해제" onClick={() => { inspect({ ...graphRef.current, bonds: graphRef.current.bonds.filter(b => b.a !== selected && b.b !== selected) }); setLinkMode(false); }}><Unlink size={16} /></Button><Button variant="ghost" size="icon-sm" aria-label="이온 하나 삭제" onClick={() => erase(selectedAtom.id, true)}><X size={16} /></Button><Button variant="secondary" size="sm" onClick={() => erase(selectedAtom.id)}><Trash2 size={14} />묶음 삭제</Button></div>}
          {linkMode && <div className="connect-message">반대 전하의 이온을 클릭하세요.<button onClick={() => setLinkMode(false)}>취소</button></div>}
        </div>
        <div className="ionic-charge-panel" aria-live="polite">{group ? <><div className="ionic-charge-row"><span>{match ? match.compound.name : '선택한 묶음'}</span><strong className={totalCharge === 0 ? 'balanced' : ''}>총전하 {totalCharge > 0 ? '+' : ''}{totalCharge}</strong></div><p>{match ? `${match.compound.formula} · 화학식 단위 ${match.units}개 분량의 이온. 독립된 분자가 아니에요.` : group.atoms.length === 1 ? `${ionFormation(group.atoms[0].symbol)} · 반대 전하의 이온을 연결해 보세요.` : totalCharge ? '전하가 아직 맞지 않아요. 양전하와 음전하의 크기를 같게 맞춰 주세요.' : '전하의 합은 0이지만 현재 도감에 등록되지 않은 조합이에요. 중성이라는 이유만으로 발견 처리하지 않아요.'}</p></> : <p>이온을 선택하면 묶음의 전하 합계를 볼 수 있어요.</p>}</div>
        <div className="workbench-footer"><span>점선은 묶음 표시 · 공유 결합선이 아니에요</span><span>{graph.atoms.length} ions</span></div>
      </section>
      <section className="periodic-panel panel" aria-label="이온 소환 주기율표"><div className="panel-heading"><div className="panel-title"><Atom size={18} /><h2>이온을 불러오기</h2></div><span className="panel-caption">이번 실험은 기본 이온 9종</span></div>
        <div className="element-preview"><div className={`ionic-preview-tile ${ION_CHARGES[hoverSymbol] > 0 ? 'positive' : 'negative'}`}>{ionLabel(hoverSymbol)}</div><div><h3>{hover.name}<span>{ION_CHARGES[hoverSymbol] > 0 ? '양이온' : '음이온'}</span></h3><p>{ionFormation(hoverSymbol)} · 전자 {Math.abs(ION_CHARGES[hoverSymbol])}개를 {ION_CHARGES[hoverSymbol] > 0 ? '잃음' : '얻음'}</p></div></div>
        <div className="ionic-quick-palette">{Object.keys(ION_CHARGES).map(symbol => <button key={symbol} className={ION_CHARGES[symbol] > 0 ? 'positive' : 'negative'} aria-label={`${ionLabel(symbol)} 소환`} onClick={() => summon(symbol)} onMouseEnter={() => setHoverSymbol(symbol)} onFocus={() => setHoverSymbol(symbol)}>{ionLabel(symbol)}<Plus size={12} /></button>)}</div>
        <div className="periodic-scroll"><div className="periodic-table"><div className="table-note"><span>CHARGE BALANCE.</span><strong>작은 전하, 커다란 결정.</strong></div>{Array.from({ length: 18 }, (_, i) => <span key={i} className="group-number" style={{ gridColumn: i + 1, gridRow: 1 }}>{i + 1}</span>)}{ELEMENTS.map(element => <button key={element.symbol} disabled={!ION_CHARGES[element.symbol]} className={`element-cell ${ION_CHARGES[element.symbol] ? 'ionic-supported' : 'ionic-disabled'} ${level >= 2 && [hint.cation, hint.anion].includes(element.symbol) ? 'hint-element' : ''}`} style={{ gridColumn: element.col, gridRow: element.row + 1, background: categories[element.category].background, color: categories[element.category].ink } as CSSProperties} aria-label={`${element.name} ${ION_CHARGES[element.symbol] ? ionLabel(element.symbol) + ' 소환' : '이 모드에서 미지원'}`} title={ION_CHARGES[element.symbol] ? `${element.name} · ${ionLabel(element.symbol)}` : `${element.name} · 이 모드에서 미지원`} onClick={() => summon(element.symbol)} onMouseEnter={() => { if (ION_CHARGES[element.symbol]) setHoverSymbol(element.symbol); }} onFocus={() => setHoverSymbol(element.symbol)}><span>{element.number}</span><strong>{element.symbol}</strong></button>)}<span className="series-marker" style={{ gridColumn: 3, gridRow: 7 }}>57–71</span><span className="series-marker" style={{ gridColumn: 3, gridRow: 8 }}>89–103</span><span className="series-label" style={{ gridColumn: '1 / 3', gridRow: 10 }}>란타넘족</span><span className="series-label" style={{ gridColumn: '1 / 3', gridRow: 11 }}>악티늄족</span></div></div>
        <div className="ionic-palette-note"><span className="positive">● 양이온 +</span><span className="negative">● 음이온 −</span><p>이 모드에서는 중성 원자 대신 이온을 소환해요. 흐린 원소와 다원자 이온은 아직 지원하지 않아요.</p></div>
      </section>
    </div>
    <div className="below-lab"><section className="hint-strip staged-hint"><span className="hint-icon"><Lightbulb size={22} /></span><div className="staged-hint-copy"><span className="hint-eyebrow">이온 도전 No. {IONIC_COMPOUNDS.indexOf(hint) + 1} · 힌트 {level}/4</span><h3>{level ? HINT_TITLES[level - 1] : '전하를 맞추는 작은 퍼즐'}</h3><p>{ionicHint(hint, level)}</p></div><div className="staged-hint-actions"><Button size="sm" variant="secondary" disabled={level >= 4} onClick={() => advance(hint)}>{level ? '다음 힌트' : '첫 힌트'}<ArrowRight size={14} /></Button><Button size="sm" variant="ghost" onClick={() => setHint(IONIC_COMPOUNDS.find(entry => !known(entry.id) && entry.id !== hint.id) || IONIC_COMPOUNDS[(IONIC_COMPOUNDS.indexOf(hint) + 1) % IONIC_COMPOUNDS.length])}>다른 화합물</Button></div></section><section className="collection-strip"><div className="collection-strip-icon"><BookOpen size={22} /></div><div><h3>나만의 이온 화합물 도감</h3><p>{count} / {IONIC_COMPOUNDS.length}종 저장 · 기존 분자 도감과 함께 간직해요.</p></div><Button size="icon" variant="ghost" aria-label="이온 화합물 도감 열기" onClick={() => onCollectionOpenChange(true)}><ArrowRight size={18} /></Button></section></div>
    <footer className="page-footer"><span>이온의 비율을 찾는 교육용 퍼즐 · 실제 반응 조건을 재현하지 않아요.</span><button className={`sync-status ${saveError ? 'error' : ''}`} onClick={() => saveError ? loadAndRetry() : onCollectionOpenChange(true)}>{saveError ? <TriangleAlert size={14} /> : <HardDrive size={14} />}{saveError ? '저장 확인 · 다시 시도' : '이 브라우저에 저장'}</button></footer>
    {saveError && <div className="save-notice" role="status">{saveError}{Object.keys(pending).length > 0 && ' 저장 대기 중인 발견은 창을 닫으면 사라질 수 있어요.'}<Button size="sm" variant="outline" onClick={loadAndRetry}>다시 시도</Button></div>}
    <Dialog open={!!celebration && active} onOpenChange={open => { if (!open) setCelebration(null); }}><DialogContent className="discovery-dialog" showCloseButton={false}>{celebration && <><Fireworks /><DialogHeader><div className="discovery-kicker"><Sparkles size={16} />이온성 화합물을 발견했어요</div><DialogTitle className="discovery-name">{celebration.name}</DialogTitle><DialogDescription className="discovery-english">{celebration.english}</DialogDescription></DialogHeader><div className="discovery-formula">{celebration.formula}</div><p className="discovery-description">{celebration.description}</p><p className="ionic-formula-note">화학식은 이온의 가장 간단한 정수비를 나타내요.<br />하나의 독립된 분자가 아닙니다.</p><div className="discovery-saved">{saved[celebration.id] ? <><Check size={16} />이온 도감에 저장되었어요</> : <><TriangleAlert size={16} />저장 대기 중 · 저장 설정을 확인해 주세요</>}</div><DialogClose asChild><Button className="continue-button">계속 실험하기<ArrowRight size={16} /></Button></DialogClose><button className="discovery-collection-link" onClick={() => openDiscoveredCollection(celebration.id)}>이온 도감에서 보기</button><button className="discovery-collection-link" onClick={() => { setModel(celebration); setCelebration(null); }}>3D로 살펴보기</button></>}</DialogContent></Dialog>
    <Sheet open={collectionOpen && active} onOpenChange={open => { onCollectionOpenChange(open); if (!open) setCollectionTarget(null); }}><SheetContent onOpenAutoFocus={event => { if (collectionTarget) event.preventDefault(); }} className="collection-sheet" showCloseButton={false}><SheetHeader><div className="sheet-title-row"><BookOpen size={21} /><SheetTitle>나의 이온 화합물 도감</SheetTitle><SheetClose asChild><Button size="icon" variant="ghost" aria-label="이온 도감 닫기"><X size={19} /></Button></SheetClose></div><SheetDescription>전하가 맞는 발견을 모아요. 이 브라우저에 저장됩니다.</SheetDescription></SheetHeader><div className="collection-progress"><div><strong>{count}<span> / {IONIC_COMPOUNDS.length}</span></strong><span>저장한 이온성 화합물</span></div><div className="progress-track"><i style={{ width: `${count / IONIC_COMPOUNDS.length * 100}%` }} /></div></div><div className="collection-tools"><div className="collection-search"><Search size={16} /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="발견한 이름·화학식 또는 도전 번호" aria-label="이온 도감 검색" /></div><div className="collection-filters"><Button size="sm" variant={!onlyFound ? 'secondary' : 'ghost'} onClick={() => setOnlyFound(false)}>전체</Button><Button size="sm" variant={onlyFound ? 'secondary' : 'ghost'} onClick={() => setOnlyFound(true)}>발견한 화합물</Button></div></div><div ref={collectionGridRef} className="collection-grid">{visible.map(entry => <button key={entry.id} data-collection-id={entry.id} className={`molecule-card ${known(entry.id) ? 'found' : 'locked'} ${collectionTarget === entry.id ? 'collection-target' : ''}`} onClick={() => setDetail(entry)}><div className="molecule-card-top"><span>No. {String(IONIC_COMPOUNDS.indexOf(entry) + 1).padStart(2, '0')}</span>{known(entry.id) ? <Check size={15} /> : <LockKeyhole size={14} />}</div><div className="molecule-card-formula">{known(entry.id) ? entry.formula : '?'}</div><strong>{known(entry.id) ? entry.name : '아직 발견하지 못했어요'}</strong><span className="molecule-card-caption">{pending[entry.id] ? '저장 대기 중' : known(entry.id) ? '이온성 화합물' : '클릭해서 힌트 보기'}</span></button>)}{!visible.length && <p className="collection-empty">조건에 맞는 화합물이 없어요.</p>}</div></SheetContent></Sheet>
    <Dialog open={!!detail && active} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent className={`molecule-detail ${detail && known(detail.id) ? 'unlocked-detail' : ''}`}><DialogHeader><DialogTitle>{detail && known(detail.id) ? detail.name : `이온 도전 No. ${detail ? IONIC_COMPOUNDS.indexOf(detail) + 1 : ''}`}</DialogTitle><DialogDescription>{detail && known(detail.id) ? `${detail.english} · ${detail.formula}` : '필요한 만큼만 힌트를 열어 보세요.'}</DialogDescription></DialogHeader>{detail && (known(detail.id) ? <><IonicViewer key={detail.id} compound={detail} /><p>{detail.description}</p><SubstancePhoto key={detail.id} id={detail.id} name={detail.name}/><div className="molecule-facts"><section><h3>전하와 화학식</h3><p>{ionicHint(detail, 4)}. 양전하의 합은 +{detail.positiveCount * ION_CHARGES[detail.cation]}, 음전하의 합은 −{detail.positiveCount * ION_CHARGES[detail.cation]}입니다.</p><div className="ionic-electron-ledger"><span>{ionFormation(detail.cation)}</span><span>{ionFormation(detail.anion)}</span></div><p>위 식은 중성 원자 한 개의 전자 출입을 나타내요. 작업대는 이미 형성된 이온을 조합합니다.</p></section><section><h3>이온성 고체의 특징</h3><p>이온들은 결정 전체에서 서로 영향을 줍니다. 고체에서는 이온이 자유롭게 이동하기 어려워요. 녹은 상태나 물에 용해되어 이동 가능한 이온이 있는 상태에서는 전류를 운반할 수 있습니다. 녹는점과 용해도는 물질마다 달라요.</p></section><div className="fact-sources">{IONIC_SOURCES.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div></div>{saved[detail.id] && <p className="discovery-date">발견한 날 · {new Date(saved[detail.id].discoveredAt).toLocaleDateString('ko-KR')}</p>}<Button onClick={() => resummon(detail)}><Plus size={16} />화학식 단위 1개 분량 소환</Button></> : <><ol className="ionic-hint-list">{HINT_TITLES.map((title, i) => <li key={title}><strong>{i + 1}. {title}</strong>{(levels[detail.id] || 0) > i ? <p>{ionicHint(detail, i + 1)}</p> : <LockKeyhole size={14} />}</li>)}</ol><Button variant="secondary" disabled={(levels[detail.id] || 0) >= 4} onClick={() => advance(detail)}>다음 단계 힌트</Button><Button onClick={() => { setHint(detail); setDetail(null); onCollectionOpenChange(false); }}>이 도전 계속하기<ArrowRight size={16} /></Button></>)}</DialogContent></Dialog>
    <Dialog open={!!model && active} onOpenChange={open => { if (!open) setModel(null); }}><DialogContent className="model-dialog"><DialogHeader><DialogTitle>{model?.name} · 3D 보기</DialogTitle><DialogDescription>이온성 화합물은 독립된 분자로 이루어져 있지 않아요.</DialogDescription></DialogHeader>{model && <IonicViewer key={model.id} compound={model} />}</DialogContent></Dialog>
    <Dialog open={helpOpen && active} onOpenChange={setHelpOpen}><DialogContent className="help-dialog"><DialogHeader><DialogTitle>전하를 맞추고, 결정을 이해하기</DialogTitle><DialogDescription>이온성 화합물의 화학식은 이온의 비율을 나타냅니다.</DialogDescription></DialogHeader><ol className="help-steps"><li><span>01</span><div><h3>이온으로 소환하기</h3><p>양이온은 전자를 잃어 +, 음이온은 전자를 얻어 − 전하를 가집니다. 이 모드의 주기율표는 이미 형성된 기본 이온 9종을 불러옵니다.</p></div></li><li><span>02</span><div><h3>반대 전하의 이온을 묶기</h3><p>가까이 끌어 놓거나, 하나를 선택하고 연결 버튼을 누른 뒤 반대 전하의 이온을 선택하세요. 같은 전하끼리는 직접 연결되지 않아요. 점선은 작업대의 묶음 표시로, 공유 결합이나 실제 결정의 모든 이웃 관계가 아닙니다.</p></div></li><li><span>03</span><div><h3>전하의 합을 0으로</h3><p>Na⁺ 1개와 Cl⁻ 1개, Ca²⁺ 1개와 Cl⁻ 2개처럼 양전하와 음전하를 맞춥니다. 같은 비율의 여러 화학식 단위도 인식하지만, 전하만 중성인 미등록 조합은 발견 처리하지 않아요.</p></div></li><li><span>04</span><div><h3>도감과 3D로 살펴보기</h3><p>NaCl은 반복 격자의 일부를, 나머지 화합물은 이온의 조성 비율 모형을 보여줍니다. 묶음 삭제나 Delete는 연결된 이온 전체, × 또는 Shift+Delete는 하나를 지웁니다. 전체 비우기를 눌러도 도감은 남아요.</p></div></li></ol><div className="science-note"><strong>이번 버전의 범위</strong><p>기본 단원자 이온 9종과 화합물 10종의 전하·조성 퍼즐입니다. 다원자 이온, 여러 산화수, 혼합 결합, 반응 조건과 에너지 계산은 아직 지원하지 않습니다. 이온/공유 결합 구분은 교육용 모델이며 실제 결합 성격은 연속적일 수 있습니다.</p><p>모드를 바꿔도 각 작업대는 유지됩니다. 새로고침하면 작업대는 비워지고 도감은 남습니다. 사이트 데이터 삭제·시크릿 모드 종료 시 도감이 사라질 수 있으며 다른 기기와 동기화되지 않습니다.</p>{IONIC_SOURCES.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div></DialogContent></Dialog>
    <AlertDialog open={clearOpen && active} onOpenChange={setClearOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>이온 작업대를 비울까요?</AlertDialogTitle><AlertDialogDescription>소환한 이온과 묶음을 모두 지웁니다. 이온 도감과 공유 결합 작업대는 그대로 남아요.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>돌아가기</AlertDialogCancel><AlertDialogAction onClick={() => { update(EMPTY); setSelected(null); setLinkMode(false); }}>전체 비우기</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
