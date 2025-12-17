// src/templates/aces/seat-cover.ts

type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  // 나중에 차종 정보(BaseVehicleId) 등도 여기서 받으면 됩니다.
};

export function buildSeatCoverXml(rows: AcesRow[]) {
  // 1. 헤더 (고정된 내용)
  const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
  </Header>
  <App action="A" id="1">`;

  // 2. 바디 (데이터에 따라 반복되는 부분)
  const body = rows.map(row => {
    return `    <App>
      <BaseVehicle id="TODO_LATER"/>
      <PartType id="${row.partTypeId}"/>
      <Position id="1"/>
      <Qty>1</Qty>
      <Part>${row.partNumber}</Part>
      <BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>
    </App>`;
  }).join('\n');

  // 3. 푸터 (닫는 태그)
  const footer = `  </App>
</ACES>`;

  // 합쳐서 리턴
  return header + '\n' + body + '\n' + footer;
}
