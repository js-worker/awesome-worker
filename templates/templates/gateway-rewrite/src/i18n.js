import parser from 'accept-language-parser';
import cldr from 'cldr-core/supplemental/territoryInfo.json';

function getOfficialLanguages(countryCodeAlpha2) {
  const territoryInfo = cldr.supplemental.territoryInfo?.[countryCodeAlpha2];
  if (territoryInfo) {
    const languages = territoryInfo.languagePopulation;
    const langs = Object.keys(languages)
      .filter(lang => languages[lang]._officialStatus === 'official')
      .map(lang => {
        const qValue = languages[lang]._populationPercent / 100;
        return `${lang};q=${qValue.toFixed(2)}`;
      });
    return langs;
  }
  return [];
}

export function generateAccLangByGeo(request) {
  const { countryCodeAlpha2 } = request?.eo?.geo || {};

  let acceptLanguage = null;
  if (countryCodeAlpha2) {
    const officialLangs = getOfficialLanguages(countryCodeAlpha2).join(',');
    acceptLanguage = officialLangs || '';
  }

  // 如果没有成功匹配（没有命中规则 / 没有 geo），则生成一个默认头部 en
  return acceptLanguage || 'en';
}

const langConfig = {
  origin: {
    title: 'CSR - REACT',
  },
  localization: [
    {
      lang: 'zh',
      title: '中文标题',
    },
  ],
};

async function handleEvent(event) {
  const { request } = event;

  if (new URL(request.url).pathname !== '/') {
    return;
  }

  const response = await fetch(request);
  if (response.status !== 200 || response.headers.get('Content-Type') !== 'text/html') {
    return event.respondWith(response);
  }

  const originRes = response.clone();
  const acceptLanguage = request.headers.get('Accept-Language') || generateAccLangByGeo(request);
  const parsedAccLang = parser.parse(acceptLanguage);

  let hit = null;
  for (const acclang of parsedAccLang) {
    const { code, region } = acclang;
    const rule = langConfig.localization.find(rule => {
      const parsedRule = rule.lang.split('-');
      if (parsedRule[1]) {
        return parsedRule[0] === code && parsedRule[1] === region;
      }
      return parsedRule[0] === code;
    });

    if (code && rule) {
      hit = rule;
      break;
    }
  }

  if (hit) {
    let retBody = await response.text();
    retBody = retBody.replaceAll(new RegExp(langConfig.origin.title, 'ig'), hit.title);

    return event.respondWith(new Response(retBody, originRes));
  }
  return;
}

addEventListener('fetch', handleEvent);
