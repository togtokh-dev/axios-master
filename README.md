# Auth Master

## Example

```bash
    import authMaster from "auth-master";
    authMaster.config.keys.adminToken = "123";
    async function name() {
      const token = await authMaster.create({
        data: { user_name: "" },
        expiresIn: "1D",
        keyName: "adminToken",
      });
      console.log(token);
    }
    name();


```
