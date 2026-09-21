import { useState } from 'react';
import { Camera, ExternalLink, ImageOff, RotateCcw } from 'lucide-react';
import { SUBSTANCE_PHOTOS } from '@/lib/substance-photos';

export function SubstancePhoto({ id, name }: { id: string; name: string }) {
  const photo = SUBSTANCE_PHOTOS[id];
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (!photo) return <section className="substance-photo photo-unavailable"><Camera size={19}/><div><h3>현실 속 모습</h3><p>이 물질의 출처가 확인된 실물 사진은 아직 준비 중이에요. 아래 설명도 함께 살펴보세요.</p></div></section>;
  return <figure className="substance-photo"><div className="photo-heading"><Camera size={16}/><h3>현실 속 모습</h3><span>실물 사진</span></div>{failed ? <div className="photo-load-error" role="status"><ImageOff size={27}/><p>사진을 불러오지 못했어요.</p><button onClick={() => { setFailed(false); setAttempt(v => v + 1); }}><RotateCcw size={13}/>다시 불러오기</button><a href={photo.source} target="_blank" rel="noreferrer">원본에서 보기 ↗</a></div> : <a className="photo-image-link" href={photo.source} target="_blank" rel="noreferrer" aria-label={`${name} 실물 사진 원본 열기`}><img key={`${id}:${attempt}`} src={photo.image} alt={`${name}의 실제 모습. ${photo.caption}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)}/></a>}<figcaption><p>{photo.caption}</p><small>개별 입자를 확대한 사진이 아니라, 물질이 모인 모습을 담은 사진이에요.</small><div className="photo-credit"><span>사진: {photo.author}</span><a href={photo.source} target="_blank" rel="noreferrer">Wikimedia Commons <ExternalLink size={11}/></a><a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a><span>추가 편집 없음 · 화면에 맞춰 표시</span></div></figcaption></figure>;
}
