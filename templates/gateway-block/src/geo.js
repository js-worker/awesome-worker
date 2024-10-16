// 国家封禁列表 伊朗、古巴、朝鲜、叙利亚
const CLOSURE_COUNTRY_CODE_LIST = ['IR', 'CU', 'KP', 'SY'];
// 地区封禁列表 克里米亚地区 UA-43、顿巴斯地区 (顿涅茨克 UA-14、卢甘斯克 UA-09）
const CLOSURE_REGION_CODE_LIST = ['UA-14', 'UA-09', 'UA-43'];

function checkClosureGeo(request) {
  const { countryCodeAlpha2, regionCode } = request?.eo?.geo || {};

  // 优先判断 countryCode
  if (countryCodeAlpha2 && CLOSURE_COUNTRY_CODE_LIST.includes(countryCodeAlpha2)) {
    return true;
  }

  // 再判断 regionCode
  if (regionCode && CLOSURE_REGION_CODE_LIST.includes(regionCode)) {
    return true;
  }

  return false;
}

function handleEvent(event) {
  if (checkClosureGeo(event.request)) {
    event.respondWith(new Response('Forbidden', { status: 403 }));
  }
  return;
}

addEventListener('fetch', event => {
  event.passThroughOnException();
  handleEvent(event);
});
