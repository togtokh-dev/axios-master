# Axios Master

A powerful and flexible Axios wrapper that adds advanced features like:

- ✅ Retry on specific HTTP status codes
- 🔁 Automatic token refresh using a custom function
- 🪵 Rich logging with response metadata
- ⏱ Custom timeout
- 🌐 HTTPS Agent support

---

## 📦 Installation

```bash
npm install axios-master
```

---

## ✨ Features

- Easy-to-use Axios wrapper
- Retry mechanism with token refresh
- Customizable logger with timing, request, and response info
- Optional verbose logging
- Automatically handles `401` or any status you define

---

## 🚀 Basic Example

```ts
import axiosMaster from "axios-master";

async function fetchStatus(body: any) {
  try {
    const result = await axiosMaster(
      {
        method: "GET",
        url: `${config.host}/payment/status?value=${body.value}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
      },
      {
        name: "Payment Status",
        timeout: 20000,
        shouldRetry: true,
        shouldRetryStatus: [401],
        retryFunction: getNewToken,
        logger: (log) => {
          console.log("API LOG:", log);
        },
      },
    );

    console.log("Result:", result);
  } catch (error) {
    console.error("Request Failed:", error);
  }
}
```

---

## 🔄 Retry with Token Refresh (using axios-master itself)

```ts
import axiosMaster from "axios-master";

const getNewToken = async (): Promise<string> => {
  try {
    const tokenRes = await axiosMaster(
      {
        method: "POST",
        url: "https://api.example.com/auth/token",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          username: "your_username",
          password: "your_password",
        },
      },
      {
        name: "Get New Token",
        timeout: 10000,
        logger: (log) => {
          console.log("Token Fetch Log:", log);
        },
      },
    );

    config.token = tokenRes.accessToken;
    return config.token;
  } catch (error) {
    console.error("Token fetch failed:", error);
    return "";
  }
};
```

---

## 🧪 Function Signature

```ts
axiosMasterMain(
  default_config: AxiosRequestConfig,
  masterConfig: MasterConfig
): Promise<any>
```

---

## ⚙️ MasterConfig Options

| Option              | Type                     | Description                                    |
| ------------------- | ------------------------ | ---------------------------------------------- |
| `name`              | `string`                 | Name to display in logs                        |
| `log`               | `boolean`                | If true, logs raw Axios request/response       |
| `timeout`           | `number`                 | Request timeout in milliseconds                |
| `logger`            | `(log: LogData) => void` | Custom logger callback                         |
| `shouldRetry`       | `boolean`                | Whether to retry the request on failure        |
| `shouldRetryStatus` | `number[]`               | HTTP status codes to retry (e.g. `[401, 500]`) |
| `retryFunction`     | `() => Promise<string>`  | Token refresh function to call before retrying |

---

## 📊 Logger Payload Structure

```ts
{
  log_levels: "INFO" | "DEBUG" | "WARN" | "ERROR" | "CRITICAL" | "TRACE",
  message: string,
  json: {
    time: number, // in seconds
    request: AxiosRequestConfig,
    response: any,
    responseBody: any,
    statusCode: number
  }
}
```

---

## 🌐 Advanced Options

- Automatically retries failed requests if status code matches
- Supports retry only once (for safety)
- Useful for microservices, SDKs, or secure API clients

---

## 📃 License

MIT License © [Buyantogtokh](https://togtokh.dev)
