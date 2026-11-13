$ErrorActionPreference = "Stop"

$slide7Xml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <!-- Background -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Bg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="07090E"/></a:solidFill>
        </p:spPr>
      </p:sp>
      <!-- Tag Pill -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="TagBg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="420000"/><a:ext cx="3400000" cy="340000"/></a:xfrm>
          <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2800"/></a:avLst></a:prstGeom>
          <a:solidFill><a:srgbClr val="200508"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="D00000"/></a:solidFill></a:ln>
        </p:spPr>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="TagTxt"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="820000" y="430000"/><a:ext cx="3360000" cy="320000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="ctr" wrap="square"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="ru-RU" sz="1100" b="1"><a:solidFill><a:srgbClr val="FF5A5A"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>РАЗДЕЛ 4 • МАТЕМАТИКА АУДИТА</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Title & Subtitle -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="830000"/><a:ext cx="10592000" cy="650000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="ru-RU" sz="2500" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>Методология расчетов: честная стоимость владения (TCO)</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="6" name="Sub"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="1480000"/><a:ext cx="10592000" cy="380000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="ru-RU" sz="1350" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>Сравнение по ценнику «первого месяца» — главная ловушка маркетинга. «ТарифДетокс» считает полную стоимость за 12 месяцев.</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Formula Box -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="210" name="FormBg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="800000" y="1900000"/><a:ext cx="10592000" cy="1100000"/></a:xfrm>
          <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2800"/></a:avLst></a:prstGeom>
          <a:solidFill><a:srgbClr val="18090C"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="D00000"/></a:solidFill></a:ln>
        </p:spPr>
      </p:sp>
      <!-- Formula Left Text -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="211" name="FormTxt"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="1050000" y="2020000"/><a:ext cx="7350000" cy="860000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="ru-RU" sz="950" b="1"><a:solidFill><a:srgbClr val="FF5A5A"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>ФОРМУЛА РАСЧЕТА ГОДОВОГО БЮДЖЕТА (TCO):</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr><a:spcBfr><a:spcPts val="400"/></a:spcBfr></a:pPr>
            <a:r>
              <a:rPr lang="ru-RU" sz="1350" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>TCO(12) = (P_promo × M_promo) + (P_base × M_base) + C_setup + C_equip + C_hidden</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr><a:spcBfr><a:spcPts val="350"/></a:spcBfr></a:pPr>
            <a:r>
              <a:rPr lang="ru-RU" sz="950" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>где P — ежемесячный тариф, M — число месяцев, C — разовые и сопутствующие расходы (подключение, роутер, доп. опции)</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Formula Divider Line -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="212" name="FormDiv"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="8500000" y="2020000"/><a:ext cx="12700" cy="860000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="3D151E"/></a:solidFill>
        </p:spPr>
      </p:sp>
      <!-- Formula Right Stats -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="213" name="FormStat"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="8650000" y="2020000"/><a:ext cx="2500000" cy="860000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="ctr" wrap="square"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="ru-RU" sz="950" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>Занижение в рекламе:</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr algn="ctr"><a:spcBfr><a:spcPts val="200"/></a:spcBfr></a:pPr>
            <a:r>
              <a:rPr lang="ru-RU" sz="2200" b="1"><a:solidFill><a:srgbClr val="FF5A5A"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>+42% к чеку</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:pPr algn="ctr"><a:spcBfr><a:spcPts val="200"/></a:spcBfr></a:pPr>
            <a:r>
              <a:rPr lang="ru-RU" sz="950" b="0"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr>
              <a:t>Переплата: ~5 200 ₽/год</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Factor 1 -->
      <p:sp><p:nvSpPr><p:cNvPr id="220" name="Fact1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="800000" y="3150000"/><a:ext cx="2470000" cy="2900000"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2800"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="10141F"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="252D3D"/></a:solidFill></a:ln></p:spPr></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="221" name="FactTxt1"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="960000" y="3300000"/><a:ext cx="2150000" cy="2600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/><a:lstStyle/>
        <a:p><a:pPr><a:spcAft><a:spcPts val="600"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="950" b="1"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>ФАКТОР 1</a:t></a:r></a:p>
        <a:p><a:pPr><a:spcAft><a:spcPts val="800"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="1450" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Промо-периоды</a:t></a:r></a:p>
        <a:p><a:r><a:rPr lang="ru-RU" sz="1150" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Учет скачка тарифа: 199 ₽ первые 3 мес. и 750 ₽ далее дают среднюю цену 612 ₽/мес., а не 199 ₽ из рекламы.</a:t></a:r></a:p>
      </p:txBody></p:sp>
      <!-- Factor 2 -->
      <p:sp><p:nvSpPr><p:cNvPr id="224" name="Fact2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="3507000" y="3150000"/><a:ext cx="2470000" cy="2900000"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2800"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="10141F"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="252D3D"/></a:solidFill></a:ln></p:spPr></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="225" name="FactTxt2"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="3667000" y="3300000"/><a:ext cx="2150000" cy="2600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/><a:lstStyle/>
        <a:p><a:pPr><a:spcAft><a:spcPts val="600"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="950" b="1"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>ФАКТОР 2</a:t></a:r></a:p>
        <a:p><a:pPr><a:spcAft><a:spcPts val="800"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="1450" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Плата за подключение</a:t></a:r></a:p>
        <a:p><a:r><a:rPr lang="ru-RU" sz="1150" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Стоимость прокладки кабеля, оптического патч-корда и настройки (от 0 до 2 500 ₽), распределенная на 12 месяцев.</a:t></a:r></a:p>
      </p:txBody></p:sp>
      <!-- Factor 3 -->
      <p:sp><p:nvSpPr><p:cNvPr id="228" name="Fact3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="6214000" y="3150000"/><a:ext cx="2470000" cy="2900000"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2800"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="10141F"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="252D3D"/></a:solidFill></a:ln></p:spPr></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="229" name="FactTxt3"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="6374000" y="3300000"/><a:ext cx="2150000" cy="2600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/><a:lstStyle/>
        <a:p><a:pPr><a:spcAft><a:spcPts val="600"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="950" b="1"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>ФАКТОР 3</a:t></a:r></a:p>
        <a:p><a:pPr><a:spcAft><a:spcPts val="800"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="1450" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Аренда роутера</a:t></a:r></a:p>
        <a:p><a:r><a:rPr lang="ru-RU" sz="1150" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Аренда за 150 ₽/мес. обходится в 1 800 ₽/год. Алгоритм показывает срок окупаемости собственного роутера (11–13 мес.).</a:t></a:r></a:p>
      </p:txBody></p:sp>
      <!-- Factor 4 -->
      <p:sp><p:nvSpPr><p:cNvPr id="232" name="Fact4"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="8921000" y="3150000"/><a:ext cx="2470000" cy="2900000"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 2800"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="10141F"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="D00000"/></a:solidFill></a:ln></p:spPr></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="233" name="FactTxt4"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="9081000" y="3300000"/><a:ext cx="2150000" cy="2600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/><a:lstStyle/>
        <a:p><a:pPr><a:spcAft><a:spcPts val="600"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="950" b="1"><a:solidFill><a:srgbClr val="FF5A5A"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>ФАКТОР 4</a:t></a:r></a:p>
        <a:p><a:pPr><a:spcAft><a:spcPts val="800"/></a:spcAft></a:pPr><a:r><a:rPr lang="ru-RU" sz="1450" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Скрытые подписки</a:t></a:r></a:p>
        <a:p><a:r><a:rPr lang="ru-RU" sz="1150" b="0"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Платные ТВ-приставки, страхование линии и платные СМС-пакеты, навязываемые по умолчанию (+150...300 ₽/мес.).</a:t></a:r></a:p>
      </p:txBody></p:sp>
      <!-- Footer -->
      <p:sp><p:nvSpPr><p:cNvPr id="235" name="FooterLine"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="800000" y="6250000"/><a:ext cx="10592000" cy="12000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="1F293D"/></a:solidFill></p:spPr></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="236" name="FooterText"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="800000" y="6330000"/><a:ext cx="7000000" cy="300000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr lang="ru-RU" sz="1100" b="0"><a:solidFill><a:srgbClr val="64748B"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>«ТарифДетокс» © 2026. Честный аудит расходов в ЛНР. Privacy by Design.</a:t></a:r></a:p></p:txBody></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="237" name="FooterPage"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="10000000" y="6330000"/><a:ext cx="1392000" cy="300000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr lIns="72000" tIns="72000" rIns="72000" bIns="72000" anchor="t" wrap="square"/><a:lstStyle/><a:p><a:pPr algn="r"/><a:r><a:rPr lang="ru-RU" sz="1100" b="0"><a:solidFill><a:srgbClr val="64748B"/></a:solidFill><a:latin typeface="Arial"/><a:ea typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>Слайд 7 из 12</a:t></a:r></a:p></p:txBody></p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>
'@

# Unzip presentation.pptx, replace slide7.xml, re-zip with forward slashes
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$tempDir = "temp_pptx_edit"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
[System.IO.Compression.ZipFile]::ExtractToDirectory("presentation.pptx", $tempDir)

# Write updated slide7.xml
[System.IO.File]::WriteAllText("$tempDir\ppt\slides\slide7.xml", $slide7Xml, [System.Text.Encoding]::UTF8)

# Re-package presentation.pptx
$outPptx = (Join-Path (Get-Location) "presentation.pptx")
if (Test-Path $outPptx) { Remove-Item $outPptx -Force }

$zipFile = [System.IO.File]::Create($outPptx)
$archive = New-Object System.IO.Compression.ZipArchive($zipFile, [System.IO.Compression.ZipArchiveMode]::Create)

$allFiles = Get-ChildItem -Path $tempDir -Recurse | Where-Object { -not $_.PSIsContainer }
foreach ($file in $allFiles) {
    $relPath = $file.FullName.Substring((Resolve-Path $tempDir).Path.Length + 1).Replace('\', '/')
    $entry = $archive.CreateEntry($relPath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = [System.IO.File]::OpenRead($file.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
}

$archive.Dispose()
$zipFile.Dispose()
Remove-Item $tempDir -Recurse -Force
Write-Host "Rebuilt presentation.pptx with updated Slide 7."

# Export new Slide 7 PNG via PowerPoint COM
Add-Type -AssemblyName System.Runtime.InteropServices
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $full = (Resolve-Path "presentation.pptx").Path
    $pres = $ppt.Presentations.Open($full, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    $slide7 = $pres.Slides.Item(7)
    $outPng = (Join-Path (Get-Location) "slide7_actual.png")
    if (Test-Path $outPng) { Remove-Item $outPng -Force }
    $slide7.Export($outPng, "PNG", 1920, 1080)
    Write-Host "New Slide 7 exported to slide7_actual.png"
    $pres.Close()
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
