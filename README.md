# Axios Master

## Example

```bash
  import axiosMaster from "axios-master";
    async function name() {
        try {
            const result = await axiosMaster("SMS", false, {
            method: "GET",
            url: encodeURI(`https://api2.togtokh.dev/main/user/`),
            headers: {
                "Content-Type": "application/json",
            },
            });
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }
    name();

```
