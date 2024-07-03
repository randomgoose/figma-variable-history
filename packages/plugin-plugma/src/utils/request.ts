export interface RequestError {
  status: number;
  message: string;
}

export async function request<T = any>({
  url,
  method = 'GET',
  data,
  headers,
}: {
  url: string;
  method?: 'POST' | 'GET' | 'PUT';
  data?: Record<string, any>;
  headers?: Record<string, string>;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    headers && Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          let message = '';
          if (xhr.response) {
            try {
              message = JSON.parse(xhr.response)?.message;
            } catch (err) {}
          }
          reject({
            status: xhr.status,
            message,
          });
        }
      }
    };

    xhr.send(data ? JSON.stringify(data) : null);
  });
}
