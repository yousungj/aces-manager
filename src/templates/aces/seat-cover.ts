type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string; // page.tsx에서 넘겨줄 때를 대비해 추가
};

export function buildSeatCoverXml(rows: AcesRow[]) {
  // 1. 헤더 (ACES 3.2 버전)
  const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <Date>${new Date().toISOString().split("T")[0]}</Date>
  </Header>
  <Apps>`; // 여기가 <Apps>여야 합니다.

  // 2. 바디 (데이터 반복)
  const body = rows.map((row, index) => {
    return `    <App action="A" id="${index + 1}">
      <BaseVehicle id="${row.baseVehicleId || '0'}"/>
      <PartType id="${row.partTypeId}"/>
      <Position id="1"/>
      <Qty>1</Qty>
      <Part>${row.partNumber}</Part>
      <BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>
    </App>`;
  }).join('\n');

  // 3. 푸터 (닫는 태그)
  const footer = `  </Apps>
</ACES>`;

  // 합쳐서 리턴
  return header + '\n' + body + '\n' + footer;
}
