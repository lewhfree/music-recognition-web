function blockingHttp(url, data = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (method === 'GET') {
      try {
        if (Object.keys(data).length > 0) {
          url += '?' + Object.entries(data)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        }
        xhr.open('GET', url);
      } catch (e) { reject(new Error(`URL construction failed: ${e.message}`)); return; }
    } else {
      try {
        xhr.open('POST', url, true);
        if (Object.keys(data).length > 0) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }

      } catch (e) { reject(new Error(`JSON.stringify failed: ${e.message}`)); return; }
    }

    xhr.onerror = () => {
      reject(new TypeError("Network error, maybe cors"));
      return;
    };

    xhr.onloadend = function() {
      if ((xhr.status >= 200 && xhr.status < 300)) {
        resolve(xhr.responseText || '');
      } else if (!Object.keys(data).length === false && method.toUpperCase() === 'POST') {
        reject(new Error(`Request failed with status ${xhr.status}`));
      } else {
        resolve(xhr.responseText || '');
      };

    };

    const isPost = method.toUpperCase() === 'POST';
    if (isPost && data !== undefined && Object.keys(data).length > 0) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    };
  });
};
