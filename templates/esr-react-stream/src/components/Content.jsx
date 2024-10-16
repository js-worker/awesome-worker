import React from 'react';

async function sleep() {
  const sleepUrl = 'https://www.fastmock.site/mock/b1f6a818687c1766c39d271da1ca0442/ef/sleep';
  await fetch(sleepUrl, { eo: { cacheTtl: 0 } });
  data = 'Blog Content';
}

let data;
const getData = () => {
  if (!data) {
    data = sleep();
    throw data;
  }

  if (data?.then) {
    throw data;
  }

  const result = data;
  data = undefined;
  return result;
};

function Content() {
  const data = getData();
  return <div>{data}</div>;
}

export default Content;
