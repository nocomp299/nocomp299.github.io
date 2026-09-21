export type SubstancePhotoInfo = {
  file: string; author: string; license: string; licenseUrl: string;
  caption: string; source: string; image: string;
};
function photo(file: string, author: string, caption: string, license = 'CC BY-SA 3.0', licenseUrl = 'https://creativecommons.org/licenses/by-sa/3.0/'): SubstancePhotoInfo {
  const filename = encodeURIComponent(file.replaceAll(' ', '_'));
  const source = `https://commons.wikimedia.org/wiki/File:${filename}`;
  return { file, author, caption, license, licenseUrl: licenseUrl || source, source, image: `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=800` };
}
// File descriptions, photographers and reuse terms checked on 2026-09-21.
// Each entry is a photograph of this substance. Never substitute another isomer's photograph.
export const SUBSTANCE_PHOTOS: Record<string, SubstancePhotoInfo> = {
  water: photo('Glass of Water.JPG', 'Jorge Barrios', '유리잔에 담긴 물의 모습입니다. 일상 시료 사진이며 분석용 순도를 뜻하지는 않아요.', 'Public domain', ''),
  ethanol: photo('Sample of Absolute Ethanol.jpg', 'LHcheM', '무수 에탄올 시료. 많은 에탄올 분자가 모인 투명한 액체의 모습입니다.'),
  methanol: photo('Methanol by Danny S. - 001.JPG', 'Danny S.', '메탄올 액체 시료. 에탄올과 겉모습이 비슷해도 서로 다른 물질입니다.'),
  benzene: photo('Benzene sample.jpg', 'Saint concrete', '벤젠 시료의 실제 모습. 고리 모양 분자 구조와 액체의 겉모습을 함께 살펴보세요.', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'),
  iodine: photo('Sample of iodine.jpg', 'LHcheM', '아이오딘 고체 시료. I₂ 분자가 모여 어두운 색의 결정을 이룹니다.'),
  bromine: photo('Bromine vial in acrylic cube.jpg', 'Alchemist-hp (www.pse-mendelejew.de)', '유리 앰풀에 밀봉하고 아크릴로 감싼 브로민 시료. 붉은 갈색을 띱니다.', 'CC BY-SA 3.0 DE', 'https://creativecommons.org/licenses/by-sa/3.0/de/'),
  acetone: photo('Sample of Acetone.jpg', 'LHcheM', '아세톤 시료. 프로판알과 분자식은 같지만 연결 구조가 다른 무색 액체입니다.'),
  glycerol: photo('Sample of Glycerine.jpg', 'LHcheM', '글리세롤(글리세린) 시료. 투명한 액체이며 점도가 높은 물질입니다.'),
  urea: photo('Sample of Urea.jpg', 'LHcheM', '알갱이 형태로 모인 요소 시료. 개별 분자가 아니라 다수의 분자로 이루어진 고체입니다.'),
  'diethyl-ether': photo('Diethyl ether by Danny S. - 001.JPG', 'Danny S.', '다이에틸 에터의 실제 시료. 뷰탄올류와 같은 C₄H₁₀O이지만 산소의 연결 방식이 다릅니다.'),
  'carbon-dioxide': photo('Dry Ice.jpg', 'APN MJM', '저온의 고체 이산화 탄소인 드라이아이스. 상온에서는 CO₂가 기체이며, 주변의 흰 안개는 주로 공기 중 수분이 응결한 것입니다.'),
  oxygen: photo('Liquid oxygen in a beaker 4.jpg', 'U.S. Air Force / Staff Sgt. Jim Araos', '극저온에서 액체로 만든 산소를 검사하는 사진입니다. 상온의 산소는 눈에 보이지 않는 기체입니다.', 'Public domain (US government)', ''),
  'ionic-nacl': photo('Petri dish containing Sodium Chloride.jpg', 'Roi.Frvr', '페트리 접시에 담긴 염화 나트륨 25 g. 흰 결정들이 모인 실제 고체 시료입니다.', 'CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/'),
  'ionic-kcl': photo('Potassium chloride.jpg', 'Walkerma', '염화 칼륨 고체 시료. 소금과 비슷한 흰색이어도 조성은 KCl로 다릅니다.', 'Public domain', ''),
  'ionic-mgo': photo('Magnesium oxide.jpg', 'Walkerma', '산화 마그네슘 시료. Mg²⁺와 O²⁻가 모인 흰색 고체입니다.', 'Public domain', ''),
};
